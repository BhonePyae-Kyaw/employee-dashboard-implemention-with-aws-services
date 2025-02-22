import React from "react";

export default function EmployeeTable({ employees }) {
  return (
    <div className="w-full h-full">
      <div className=" shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Employee No</th>
                <th className="py-3 px-6 text-left">First Name</th>
                <th className="py-3 px-6 text-left">Last Name</th>
                <th className="py-3 px-6 text-left">Department</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
