import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import EmployeeList from "./pages/EmployeeList.jsx";
import EmployeeForm from "./pages/EmployeeForm.jsx";
import EmployeeDetails from "./pages/EmployeeDetails.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
      </Route>
    </Routes>
  );
}