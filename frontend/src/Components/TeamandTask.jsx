import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { ListTodo, Users, PlusCircle, X } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TeamTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    team_id: "",
  });
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    lead_id: "",
    member_ids: [],
  });

  // Side panel state
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await axios.get("http://localhost:8000/dashboard/data/");
    setTasks(res.data.tasks);
    setTeams(res.data.teams);
    setEmployees(res.data.employees);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:8000/dashboard/tasks/create/", newTask);
    setNewTask({ title: "", description: "", team_id: "" });
    fetchData();
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:8000/dashboard/teams/create/", newTeam);
    setNewTeam({ name: "", description: "", lead_id: "", member_ids: [] });
    fetchData();
  };

  const handleMemberSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setNewTeam({ ...newTeam, member_ids: selected });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          {/* ===== Tasks Section ===== */}
          <div className="flex items-center gap-3 mb-8">
            <ListTodo size={28} className="text-blue-400" />
            <h1 className="text-3xl font-bold">Tasks</h1>
          </div>

          <ul className="mb-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-medium">{task.title}</h3>
                <p className="text-sm text-gray-400">{task.description}</p>
                <p className="text-sm">
                  Status:{" "}
                  {task.completed ? (
                    <span className="text-green-400">Done</span>
                  ) : (
                    <span className="text-red-400">Pending</span>
                  )}
                </p>
                <p className="text-sm text-gray-400">
                  Team: {task.team__name || "Unassigned"}
                </p>
              </div>
            ))}
          </ul>

          <form
            onSubmit={handleTaskSubmit}
            className="mb-12 p-4 bg-[#0a0f2b] border border-gray-700 rounded-xl grid sm:grid-cols-3 gap-4"
          >
            <input
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />
            <input
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              placeholder="Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
            />
            <select
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              value={newTask.team_id}
              onChange={(e) =>
                setNewTask({ ...newTask, team_id: e.target.value })
              }
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="col-span-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> Add Task
            </button>
          </form>

          {/* ===== Teams Section ===== */}
          <div className="flex items-center gap-3 mb-8">
            <Users size={28} className="text-green-400" />
            <h1 className="text-3xl font-bold">Teams</h1>
          </div>

          <ul className="mb-6 grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4"
              >
                <h3 className="text-lg font-medium">{team.name}</h3>
                <p className="text-sm text-gray-400">{team.description}</p>
                <p className="text-sm text-gray-400">
                  Lead:{" "}
                  <span
                    className="cursor-pointer text-blue-400 hover:underline"
                    onClick={() =>
                      setSelectedEmployee(
                        employees.find((e) => e.name === team.lead__name)
                      )
                    }
                  >
                    {team.lead__name || "None"}
                  </span>
                </p>
              </div>
            ))}
          </ul>

          <form
            onSubmit={handleTeamSubmit}
            className="p-4 bg-[#0a0f2b] border border-gray-700 rounded-xl grid sm:grid-cols-3 gap-4"
          >
            <input
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              placeholder="Team Name"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            />
            <input
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              placeholder="Description"
              value={newTeam.description}
              onChange={(e) =>
                setNewTeam({ ...newTeam, description: e.target.value })
              }
            />
            <select
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              value={newTeam.lead_id}
              onChange={(e) =>
                setNewTeam({ ...newTeam, lead_id: e.target.value })
              }
            >
              <option value="">Select Team Lead</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <select
              multiple
              className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
              value={newTeam.member_ids}
              onChange={handleMemberSelect}
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="col-span-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> Add Team
            </button>
          </form>
        </motion.div>
      </div>

      {/* ===== Side Panel for Employee Details ===== */}
      {selectedEmployee && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 w-80 h-full bg-[#0a0f2b] border-l border-gray-700 text-white p-6 shadow-lg z-50"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{selectedEmployee.name}</h2>
            <X
              size={24}
              className="cursor-pointer hover:text-red-400"
              onClick={() => setSelectedEmployee(null)}
            />
          </div>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {selectedEmployee.email}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {selectedEmployee.role}
          </p>
        </motion.div>
      )}
    </div>
  );
}
