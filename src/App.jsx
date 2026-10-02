import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import { listEmployees } from "./api";
import CreateEmployeeForm from "./components/CreateEmployeeForm";
import EmployeeTable from "./components/EmployeeTable";

function App() {
  // State for storing data from API
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetches the top 10 highest salary employees from the API Gateway endpoint.
  const getHighestSalaryEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      setEmployees(await listEmployees());
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
      <CreateEmployeeForm onEmployeeCreated={getHighestSalaryEmployees} />
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
      ) : error ? (
        <p className="text-red-500">Failed to load employees: {error}</p>
      ) : (
        <div>
          <EmployeeTable
            employees={employees}
            onChanged={getHighestSalaryEmployees}
          />
        </div>
      )}
    </>
  );
}

export default App;
