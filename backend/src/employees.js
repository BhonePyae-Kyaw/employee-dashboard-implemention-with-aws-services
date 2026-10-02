import { getPool } from "./lib/db.js";
import { cacheDelete, cacheGet, cacheSet } from "./lib/cache.js";
import { response } from "./lib/response.js";

const CACHE_KEY = "highest-salary-employees";
const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS || 300);
const CURRENT = "9999-01-01";

const TOP_SALARIES_QUERY = `
  SELECT e.emp_no, e.first_name, e.last_name, d.dept_name, s.salary
  FROM salaries s
  JOIN employees e ON e.emp_no = s.emp_no
  JOIN dept_emp de ON de.emp_no = e.emp_no AND de.to_date = '${CURRENT}'
  JOIN departments d ON d.dept_no = de.dept_no
  WHERE s.to_date = '${CURRENT}'
  ORDER BY s.salary DESC
  LIMIT 10`;

class BadRequest extends Error {}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function text(input, field, maxLength) {
  const value = typeof input[field] === "string" ? input[field].trim() : "";
  if (!value || value.length > maxLength) throw new BadRequest(`${field} is required (max ${maxLength} characters)`);
  return value;
}

function salary(input) {
  const value = Number(input.salary);
  if (!Number.isInteger(value) || value <= 0) throw new BadRequest("salary must be a positive whole number");
  return value;
}

function empNo(event) {
  const value = Number(event.pathParameters?.emp_no);
  if (!Number.isInteger(value)) throw new BadRequest("emp_no must be a number");
  return value;
}

function parseBody(event) {
  try {
    return JSON.parse(event.body || "{}");
  } catch {
    throw new BadRequest("Body must be JSON");
  }
}

async function inTransaction(work) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function listTopSalaries() {
  const cached = await cacheGet(CACHE_KEY);
  if (cached) return response(200, cached, { "X-Cache": "HIT" });

  const [rows] = await getPool().query(TOP_SALARIES_QUERY);
  await cacheSet(CACHE_KEY, rows, CACHE_TTL);
  return response(200, rows, { "X-Cache": "MISS" });
}

async function createEmployee(event) {
  const input = parseBody(event);
  const employee = {
    first_name: text(input, "first_name", 14),
    last_name: text(input, "last_name", 16),
    dept_no: text(input, "dept_no", 4),
    title: text(input, "title", 50),
    salary: salary(input),
  };
  if (!["M", "F"].includes(input.gender)) throw new BadRequest("gender must be M or F");
  if (!isDate(input.birth_date)) throw new BadRequest("birth_date must be YYYY-MM-DD");
  if (!isDate(input.hire_date)) throw new BadRequest("hire_date must be YYYY-MM-DD");
  if (input.hire_date <= input.birth_date) throw new BadRequest("hire_date must be after birth_date");

  const emp_no = await inTransaction(async (conn) => {
    const [departments] = await conn.query("SELECT 1 FROM departments WHERE dept_no = ?", [employee.dept_no]);
    if (departments.length === 0) throw new BadRequest("Unknown department");

    // The sample schema has no AUTO_INCREMENT, so lock the highest row while picking the next number.
    const [[{ next }]] = await conn.query("SELECT COALESCE(MAX(emp_no), 10000) + 1 AS next FROM employees FOR UPDATE");
    await conn.query(
      "INSERT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date) VALUES (?, ?, ?, ?, ?, ?)",
      [next, input.birth_date, employee.first_name, employee.last_name, input.gender, input.hire_date],
    );
    await conn.query("INSERT INTO dept_emp (emp_no, dept_no, from_date, to_date) VALUES (?, ?, ?, ?)", [next, employee.dept_no, input.hire_date, CURRENT]);
    await conn.query("INSERT INTO salaries (emp_no, salary, from_date, to_date) VALUES (?, ?, ?, ?)", [next, employee.salary, input.hire_date, CURRENT]);
    await conn.query("INSERT INTO titles (emp_no, title, from_date, to_date) VALUES (?, ?, ?, ?)", [next, employee.title, input.hire_date, CURRENT]);
    return next;
  });

  await cacheDelete(CACHE_KEY);
  return response(201, { emp_no, ...employee });
}

async function updateEmployee(event) {
  const id = empNo(event);
  const input = parseBody(event);
  const changes = {
    first_name: text(input, "first_name", 14),
    last_name: text(input, "last_name", 16),
    salary: salary(input),
  };

  const found = await inTransaction(async (conn) => {
    const [result] = await conn.query("UPDATE employees SET first_name = ?, last_name = ? WHERE emp_no = ?", [changes.first_name, changes.last_name, id]);
    if (result.affectedRows === 0) return false;
    await conn.query("UPDATE salaries SET salary = ? WHERE emp_no = ? AND to_date = ?", [changes.salary, id, CURRENT]);
    return true;
  });
  if (!found) return response(404, { message: "Employee not found" });

  await cacheDelete(CACHE_KEY);
  return response(200, { emp_no: id, ...changes });
}

async function deleteEmployee(event) {
  const id = empNo(event);
  // dept_emp, salaries and titles rows are removed by ON DELETE CASCADE.
  const [result] = await getPool().query("DELETE FROM employees WHERE emp_no = ?", [id]);
  if (result.affectedRows === 0) return response(404, { message: "Employee not found" });

  await cacheDelete(CACHE_KEY);
  return response(200, { message: "Employee deleted" });
}

const routes = {
  "GET /employees": listTopSalaries,
  "POST /employees": createEmployee,
  "PUT /employees/{emp_no}": updateEmployee,
  "DELETE /employees/{emp_no}": deleteEmployee,
};

export async function handler(event) {
  const route = routes[event.routeKey];
  if (!route) return response(404, { message: "Not found" });

  try {
    return await route(event);
  } catch (err) {
    if (err instanceof BadRequest) return response(400, { message: err.message });
    console.error(`${event.routeKey} failed:`, err);
    return response(500, { message: "Something went wrong" });
  }
}
