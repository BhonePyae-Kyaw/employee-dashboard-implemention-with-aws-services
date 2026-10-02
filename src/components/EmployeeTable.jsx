import { useState } from "react";
import { deleteEmployee } from "../api";
import UpdateEmployeeModal from "./UpdateEmployeeModal";

export default function EmployeeTable({ employees, onChanged }) {
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const handleDelete = async (empNo) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    setError(null);
    try {
      await deleteEmployee(empNo);
      onChanged();
    } catch (err) {
      setError(`Failed to delete employee: ${err.message}`);
    }
  };

  return (
    <div className="w-full h-full">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className=" shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Employee No</th>
                <th className="py-3 px-6 text-left">First Name</th>
                <th className="py-3 px-6 text-left">Last Name</th>
                <th className="py-3 px-6 text-left">Department</th>
                <th className="py-3 px-6 text-left">Salary</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {employees.map((emp) => (
                <tr
                  key={emp.emp_no}
                  className="border-b border-gray-200 hover:bg-gray-100"
                >
                  <td className="py-3 px-6 text-left">{emp.emp_no}</td>
                  <td className="py-3 px-6 text-left">{emp.first_name}</td>
                  <td className="py-3 px-6 text-left">{emp.last_name}</td>
                  <td className="py-3 px-6 text-left">{emp.dept_name}</td>
                  <td className="py-3 px-6 text-left">{emp.salary}</td>
                  <td className="py-3 px-6 text-center whitespace-nowrap">
                    <button
                      onClick={() => setEditing(emp)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition duration-200 mr-2"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDelete(emp.emp_no)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition duration-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editing && (
        <UpdateEmployeeModal
          employee={editing}
          onUpdated={onChanged}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
