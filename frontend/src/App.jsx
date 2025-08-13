import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import Dashboard from "./Pages/Dashboard";
import EmployeeManagement from "./Components/EmployeeManagement";
import CompanyDetials from "./Components/CompanyDetails";
import Notification from "./Components/Notification";
import TeamandTask from "./Components/TeamandTask";

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
        {/*<Route path="/documents" element={<Documents />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/budgeting" element={<Budgeting />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
