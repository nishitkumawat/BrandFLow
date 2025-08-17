import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import EmployeeManagement from "./Components/EmployeeManagement";
import CompanyDetials from "./Components/CompanyDetails";
import Notification from "./Components/Notification";
import TeamandTask from "./Components/TeamandTask";
import ClientManagement from "./Components/ClientManagement";
import Documents from "./Components/Documents";
import Budget from "./Components/Budget";
import Marketing from "./Components/Marketing";

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
        <Route path="/notification" element={<Notification />} />
        <Route path="/teams" element={<TeamandTask />} />
        <Route path="/clients" element={<ClientManagement />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/budgeting" element={<Budget />} />
        <Route path="/company" element={<CompanyDetials />} />
        <Route path="/marketing" element={<Marketing />} />
        {/*
        <Route path="/calendar" element={<CalendarPage />} />
        
         */}
      </Routes>
    </Router>
  );
}

export default App;
