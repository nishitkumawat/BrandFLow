import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../Components/Sidebar";
import ScrollBar from "../Components/ScrollBar";
import {
  Users,
  Briefcase,
  Mail,
  ClipboardCheck,
  BarChart3,
  Wallet,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    employees_count: 0,
    clients_count: 0,
    tasks_count: 0,
    teams_count: 0,
    completed_tasks_count: 0,
    budget: "₹0",
  });

  const [activityData, setActivityData] = useState([]);
  const [latestTasks, setLatestTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // if (!token) {
    //   navigate("/login");
    //   return;
    // }

    const fetchDashboardData = async () => {
      try {
        const [summaryRes, tasksRes] = await Promise.all([
          axios.get("http://localhost:8000/dashboard/dashboard/", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          axios.get("http://localhost:8000/dashboard/completed-tasks/", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        // Update stats with backend data
        setStats({
          employees_count: summaryRes.data.employees || 0,
          clients_count: summaryRes.data.clients || 0,
          tasks_count: summaryRes.data.tasks || 0,
          teams_count: summaryRes.data.teams || 0,
          completed_tasks_count: summaryRes.data.completed_tasks || 0,
          budget: summaryRes.data.budget || "₹0",
        });

        // Process tasks data
        if (Array.isArray(tasksRes.data)) {
          setLatestTasks(tasksRes.data.slice(0, 5));
        } else if (tasksRes.data) {
          setLatestTasks([tasksRes.data]);
        }

        // Generate sample activity data
        const sampleActivityData = [
          { month: "Jan", tasks: 15, emails: 25 },
          { month: "Feb", tasks: 18, emails: 30 },
          { month: "Mar", tasks: 12, emails: 22 },
          { month: "Apr", tasks: 20, emails: 35 },
          { month: "May", tasks: 16, emails: 28 },
          { month: "Jun", tasks: 22, emails: 40 },
        ];
        setActivityData(sampleActivityData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data");
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex ml-64 w-[calc(100%-16rem)] min-h-screen bg-[#00031c] pt-24 px-4 text-white">
        <div className="w-full flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex ml-64 w-[calc(100%-16rem)] min-h-screen bg-[#00031c] pt-24 px-4 text-white">
        <div className="w-full flex justify-center items-center">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </div>
    );
  }

  // Calculate completion percentage safely
  const completionPercentage = Math.min(
    (stats.completed_tasks_count / Math.max(stats.tasks_count, 1)) * 100,
    100
  );

  return (
    <div className="flex overflow-hidden">
      <Sidebar />
      <ScrollBar />
      <div className="ml-64 w-[calc(100%-16rem)] min-h-screen bg-[#00031c] pt-24 px-4 text-white">
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          {/* Header */}
          <div className="mb-8 pt-2">
            <h1 className="text-2xl md:text-3xl font-bold">
              📊 BrandFlow Dashboard
            </h1>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard
              icon={<Users className="h-6 w-6 text-blue-400" />}
              title="Employees"
              value={stats.employees_count}
            />
            <StatCard
              icon={<Briefcase className="h-6 w-6 text-green-400" />}
              title="Clients"
              value={stats.clients_count}
            />
            <StatCard
              icon={<Mail className="h-6 w-6 text-purple-400" />}
              title="Emails"
              value={stats.teams_count * 3}
            />
            <StatCard
              icon={<ClipboardCheck className="h-6 w-6 text-yellow-400" />}
              title="Tasks"
              value={stats.tasks_count}
            />
            <StatCard
              icon={<BarChart3 className="h-6 w-6 text-pink-400" />}
              title="Campaigns"
              value={stats.teams_count}
            />
            <StatCard
              icon={<Wallet className="h-6 w-6 text-red-400" />}
              title="Budget"
              value={stats.budget}
            />
          </div>

          {/* Activity Graph */}
          <div className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">📈 Team Activity</h2>
            <div className="w-full overflow-x-auto">
              <div className="min-w-[500px] h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activityData}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0a0f2b",
                        borderColor: "#333",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke="#1e90ff"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="emails"
                      stroke="#ff69b4"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">✅ Latest Tasks</h2>
              <ul className="space-y-2 text-gray-300 text-sm">
                {latestTasks.length > 0 ? (
                  latestTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between p-2 hover:bg-[#1a1f3b] rounded"
                    >
                      <span className="truncate max-w-[180px]">
                        {task.title || "Untitled Task"}
                      </span>
                      {task.completed ? (
                        <span className="text-green-400 text-xs whitespace-nowrap">
                          Completed
                        </span>
                      ) : (
                        <span className="text-yellow-400 text-xs whitespace-nowrap">
                          In Progress
                        </span>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">
                    No recent tasks available
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">📊 Quick Stats</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm text-gray-400">Completion Rate</h3>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${completionPercentage}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-400">
                    {stats.completed_tasks_count} of {stats.tasks_count} tasks
                    completed
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Team Distribution</h3>
                  <div className="flex space-x-1 mt-1">
                    <div className="h-2 rounded-full bg-green-500 flex-1"></div>
                    <div className="h-2 rounded-full bg-blue-500 flex-1"></div>
                    <div className="h-2 rounded-full bg-purple-500 flex-1"></div>
                    <div className="h-2 rounded-full bg-yellow-500 flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  <div className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-3 flex items-center hover:border-blue-500 transition-colors">
    <div className="mr-2 p-1.5 bg-opacity-20 bg-white rounded-lg">{icon}</div>
    <div className="overflow-hidden">
      <p className="text-xs text-gray-400 truncate">{title}</p>
      <h2 className="text-lg font-bold truncate">
        {typeof value === "number" ? value.toLocaleString() : value}
      </h2>
    </div>
  </div>
);

export default Dashboard;
