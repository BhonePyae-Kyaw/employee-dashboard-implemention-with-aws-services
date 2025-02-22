import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import React from "react";
import EmployeeTable from "./components/EmployeeTable";

function App() {
  // State for storing data from API
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  {
    /* 
   This function fetches the highest salary employees - using the API Gateway endpoint.
  */
  }
  const getHighestSalaryEmployees = async () => {
    setLoading(true);
    const apiUrl =
      "https://ccwyucha75.execute-api.us-east-1.amazonaws.com/test/highest-salary-employees";
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const employees = JSON.parse(data.body);
      setEmployees(employees);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    getHighestSalaryEmployees();
  }, []);

  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-slate-100">
          Employee Management Dashboard
        </h1>
      </header>
      <h2 className="text-lg font-semibold text-slate-100 mt-4 mb-2">
        Top 10 Highest Salary Employees
      </h2>
      {loading ? (
        <div className="flex flex-col items-start justify-start h-screen">
          <img
            src={reactLogo}
            alt="React Logo"
            className="h-8 w-8 animate-spin"
          />
          <p>Fetching data ...</p>
        </div>
      ) : (
        <div>
          <EmployeeTable employees={employees} />
        </div>
      )}
    </>
  );
}

export default App;
