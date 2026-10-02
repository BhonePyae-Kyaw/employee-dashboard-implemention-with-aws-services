import { getPool } from "./lib/db.js";

// Same table layout as the MySQL "employees" sample database
// (github.com/datacharmer/test_db), trimmed to the tables the API reads.
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS employees (
    emp_no INT NOT NULL,
    birth_date DATE NOT NULL,
    first_name VARCHAR(14) NOT NULL,
    last_name VARCHAR(16) NOT NULL,
    gender ENUM('M','F') NOT NULL,
    hire_date DATE NOT NULL,
    PRIMARY KEY (emp_no)
  )`,
  `CREATE TABLE IF NOT EXISTS departments (
    dept_no CHAR(4) NOT NULL,
    dept_name VARCHAR(40) NOT NULL,
    PRIMARY KEY (dept_no),
    UNIQUE KEY (dept_name)
  )`,
  `CREATE TABLE IF NOT EXISTS dept_emp (
    emp_no INT NOT NULL,
    dept_no CHAR(4) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    FOREIGN KEY (emp_no) REFERENCES employees (emp_no) ON DELETE CASCADE,
    FOREIGN KEY (dept_no) REFERENCES departments (dept_no) ON DELETE CASCADE,
    PRIMARY KEY (emp_no, dept_no)
  )`,
  `CREATE TABLE IF NOT EXISTS salaries (
    emp_no INT NOT NULL,
    salary INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    FOREIGN KEY (emp_no) REFERENCES employees (emp_no) ON DELETE CASCADE,
    PRIMARY KEY (emp_no, from_date),
    KEY idx_current_salary (to_date, salary)
  )`,
  `CREATE TABLE IF NOT EXISTS titles (
    emp_no INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE,
    FOREIGN KEY (emp_no) REFERENCES employees (emp_no) ON DELETE CASCADE,
    PRIMARY KEY (emp_no, title, from_date)
  )`,
];

const DEPARTMENTS = [
  ["d001", "Marketing"],
  ["d002", "Finance"],
  ["d003", "Human Resources"],
  ["d004", "Production"],
  ["d005", "Development"],
  ["d006", "Quality Management"],
  ["d007", "Sales"],
  ["d008", "Research"],
  ["d009", "Customer Service"],
];

const FIRST_NAMES = ["Georgi", "Bezalel", "Parto", "Chirstian", "Kyoichi", "Anneke", "Tzvetan", "Saniya", "Sumant", "Duangkaew", "Mary", "Patricio", "Eberhardt", "Berni", "Guoxiang", "Kazuhito", "Cristinel", "Kazuhide", "Lillian", "Mayuko"];
const LAST_NAMES = ["Facello", "Simmel", "Bamford", "Koblick", "Maliniak", "Preusig", "Zielinski", "Kalloufi", "Peac", "Piveteau", "Sluis", "Bridgland", "Terkki", "Genin", "Nooteboom", "Cappelletti", "Bouloucos", "Peha", "Haddadi", "Warwick"];

const TITLES = ["Engineer", "Senior Engineer", "Assistant Engineer", "Technique Leader", "Staff", "Senior Staff", "Manager"];

const EMPLOYEE_COUNT = 500;
const CURRENT = "9999-01-01";

// Deterministic pseudo-random numbers so every seed produces the same data.
function rng(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

function buildRows() {
  const rand = rng(42);
  const pick = (list) => list[Math.floor(rand() * list.length)];
  const date = (fromYear, span) => {
    const d = new Date(Date.UTC(fromYear + Math.floor(rand() * span), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)));
    return d.toISOString().slice(0, 10);
  };

  const employees = [];
  const deptEmp = [];
  const salaries = [];
  const titles = [];
  for (let i = 0; i < EMPLOYEE_COUNT; i++) {
    const empNo = 10001 + i;
    const hireDate = date(1990, 30);
    employees.push([empNo, date(1955, 30), pick(FIRST_NAMES), pick(LAST_NAMES), rand() < 0.5 ? "M" : "F", hireDate]);
    deptEmp.push([empNo, pick(DEPARTMENTS)[0], hireDate, CURRENT]);
    salaries.push([empNo, 40000 + Math.floor(rand() * 120000), hireDate, CURRENT]);
    titles.push([empNo, pick(TITLES), hireDate, CURRENT]);
  }
  return { employees, deptEmp, salaries, titles };
}

// Invoke manually after deploying; skips if data already exists unless { "force": true }.
export async function handler(event = {}) {
  const pool = getPool();
  for (const statement of SCHEMA) await pool.query(statement);

  const [[{ count }]] = await pool.query("SELECT COUNT(*) AS count FROM employees");
  if (count > 0 && !event.force) {
    return { seeded: false, message: `employees already has ${count} rows` };
  }

  const { employees, deptEmp, salaries, titles } = buildRows();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM employees");
    await conn.query("DELETE FROM departments");
    await conn.query("INSERT INTO departments (dept_no, dept_name) VALUES ?", [DEPARTMENTS]);
    await conn.query("INSERT INTO employees (emp_no, birth_date, first_name, last_name, gender, hire_date) VALUES ?", [employees]);
    await conn.query("INSERT INTO dept_emp (emp_no, dept_no, from_date, to_date) VALUES ?", [deptEmp]);
    await conn.query("INSERT INTO salaries (emp_no, salary, from_date, to_date) VALUES ?", [salaries]);
    await conn.query("INSERT INTO titles (emp_no, title, from_date, to_date) VALUES ?", [titles]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return { seeded: true, employees: employees.length };
}
