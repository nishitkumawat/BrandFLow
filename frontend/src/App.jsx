import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import EmployeeManagement from "./Components/EmployeeManagement";
import CompanyDetials from "./Components/CompanyDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeeManagement />} />
        <Route path="/companyDetails" element={<CompanyDetials />} />
      </Routes>
    </Router>
  );
}

export default App;
