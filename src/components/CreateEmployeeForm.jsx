import { useState } from "react";
import { createEmployee } from "../api";

const DEPARTMENTS = [
  { dept_no: "d009", dept_name: "Customer Service" },
  { dept_no: "d005", dept_name: "Development" },
  { dept_no: "d002", dept_name: "Finance" },
  { dept_no: "d003", dept_name: "Human Resources" },
  { dept_no: "d001", dept_name: "Marketing" },
  { dept_no: "d004", dept_name: "Production" },
  { dept_no: "d006", dept_name: "Quality Management" },
  { dept_no: "d008", dept_name: "Research" },
  { dept_no: "d007", dept_name: "Sales" },
];

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  birth_date: "",
  gender: "M",
  hire_date: "",
  dept_no: "",
  salary: "",
  title: "",
};

const inputClass = "p-2 rounded bg-gray-700 text-white";

export default function CreateEmployeeForm({ onEmployeeCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess("");
    try {
      await createEmployee({ ...form, salary: Number(form.salary) });
      setSuccess("Employee created successfully!");
      setForm(EMPTY_FORM);
      onEmployeeCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg w-full flex items-center justify-center flex-col">
      <h2 className="text-xl font-bold mb-4">Create Employee</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {success && <p className="text-green-500 mb-2">{success}</p>}
      <form
        onSubmit={handleSubmit}
        className="flex items-center justify-center gap-4 w-full flex-col"
      >
        <div className="w-full flex gap-4">
          <div className="flex flex-col w-1/2 gap-4">
            <input type="text" name="first_name" placeholder="First Name" maxLength={14} value={form.first_name} onChange={handleChange} className={inputClass} required />
            <input type="text" name="last_name" placeholder="Last Name" maxLength={16} value={form.last_name} onChange={handleChange} className={inputClass} required />
            <select name="gender" value={form.gender} onChange={handleChange} className={inputClass} required>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            <div>
              <label>Birth Date: </label>
              <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className={`${inputClass} w-full`} required />
            </div>
          </div>
          <div className="flex flex-col w-1/2 gap-4">
            <input type="number" name="salary" placeholder="Salary" min={1} step={1} value={form.salary} onChange={handleChange} className={inputClass} required />
            <select name="dept_no" value={form.dept_no} onChange={handleChange} className={inputClass} required>
              <option value="">Select a Department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept.dept_no} value={dept.dept_no}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
            <input type="text" name="title" placeholder="Job Title" maxLength={50} value={form.title} onChange={handleChange} className={inputClass} required />
            <div>
              <label>Hired Date: </label>
              <input type="date" name="hire_date" value={form.hire_date} onChange={handleChange} className={`${inputClass} w-full`} required />
            </div>
          </div>
        </div>
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-blue-600 p-2 rounded text-white font-bold hover:bg-blue-700"
          >
            {submitting ? "Submitting..." : "Create Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}
