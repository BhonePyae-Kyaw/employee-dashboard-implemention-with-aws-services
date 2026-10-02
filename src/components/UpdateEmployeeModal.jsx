import { useState } from "react";
import { updateEmployee } from "../api";

const inputClass = "p-2 rounded bg-gray-700 text-white";

export default function UpdateEmployeeModal({ employee, onUpdated, onClose }) {
  const [form, setForm] = useState({
    first_name: employee.first_name,
    last_name: employee.last_name,
    salary: employee.salary,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await updateEmployee(employee.emp_no, { ...form, salary: Number(form.salary) });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Update Employee</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <input type="text" name="first_name" placeholder="First Name" maxLength={14} value={form.first_name} onChange={handleChange} className={inputClass} required />
          <input type="text" name="last_name" placeholder="Last Name" maxLength={16} value={form.last_name} onChange={handleChange} className={inputClass} required />
          <input type="number" name="salary" placeholder="Salary" min={1} step={1} value={form.salary} onChange={handleChange} className={inputClass} required />
          <button type="submit" disabled={submitting} className="bg-blue-600 p-2 rounded text-white font-bold hover:bg-blue-700">
            {submitting ? "Updating..." : "Update Employee"}
          </button>
          <button type="button" onClick={onClose} className="bg-gray-500 p-2 rounded text-white font-bold hover:bg-gray-600">
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
