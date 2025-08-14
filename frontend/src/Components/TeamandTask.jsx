import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../Components/Sidebar";
import { ListTodo, Users, PlusCircle, X } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function TeamandTask() {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
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
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showCheckpointModal, setShowCheckpointModal] = useState(false);
  const [manualCheckpoints, setManualCheckpoints] = useState([{ title: "" }]);
  const [isGeneratingCheckpoints, setIsGeneratingCheckpoints] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchCheckpoints = async (taskId) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/dashboard/tasks/${taskId}/checkpoints/`
      );
      return res.data.checkpoints || [];
    } catch (err) {
      console.error(`Error fetching checkpoints for task ${taskId}:`, err);
      return [];
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:8000/dashboard/data/");

      const tasksWithCheckpoints = await Promise.all(
        res.data.tasks.map(async (task) => {
          const checkpoints = await fetchCheckpoints(task.id);
          const doneCount = checkpoints.filter((cp) => cp.completed).length;
          const percentage = checkpoints.length
            ? Math.round((doneCount / checkpoints.length) * 100)
            : 0;
          return {
            ...task,
            checkpoints,
            completion_percentage: percentage,
            completed: percentage === 100,
          };
        })
      );

      setTasks(tasksWithCheckpoints);
      setTeams(res.data.teams);
      setEmployees(res.data.employees);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load data. Please try again.");
    }
  };

  const validateTask = () => {
    if (!newTask.title.trim()) {
      return "Task title is required";
    }
    if (!newTask.team_id) {
      return "Please select a team";
    }
    return null;
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateTask();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCreatingTask(true);
    try {
      // Filter out empty checkpoints
      const validCheckpoints = manualCheckpoints.filter(
        (cp) => cp.title.trim() !== ""
      );

      const res = await axios.post(
        "http://localhost:8000/dashboard/tasks/create/",
        {
          ...newTask,
          checkpoints: validCheckpoints,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setTasks((prev) => [
        ...prev,
        {
          ...res.data.task,
          team__name: teams.find((t) => t.id == newTask.team_id)?.name,
          checkpoints: res.data.checkpoints || [],
          completion_percentage: 0,
        },
      ]);

      // Reset form
      setNewTask({ title: "", description: "", team_id: "" });
      setManualCheckpoints([{ title: "" }]);
      setShowCheckpointModal(false);
    } catch (err) {
      console.error("Error creating task:", err.response?.data || err.message);
      setError(
        err.response?.data?.error || "Failed to create task. Please try again."
      );
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    const teamData = { ...newTeam, member_ids: selectedMemberIds };
    try {
      const res = await axios.post(
        "http://localhost:8000/dashboard/teams/create/",
        teamData
      );
      const lead = employees.find((e) => e.id == newTeam.lead_id);
      const members = employees.filter((e) => selectedMemberIds.includes(e.id));
      setTeams((prev) => [
        ...prev,
        { id: res.data.id, ...newTeam, lead, members },
      ]);
      setNewTeam({ name: "", description: "", lead_id: "", member_ids: [] });
      setSelectedMemberIds([]);
    } catch (err) {
      console.error(err);
      setError("Failed to create team. Please try again.");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleCheckpoint = async (taskId, checkpointId, completed) => {
    try {
      await axios.post(
        `http://localhost:8000/dashboard/tasks/checkpoints/${checkpointId}/update/`,
        { completed: !completed }
      );

      // Get updated task data
      const updatedTask = await axios.get(
        `http://localhost:8000/dashboard/tasks/${taskId}/`
      );

      // Check if task is now 100% complete
      if (updatedTask.data.completion_percentage === 100) {
        try {
          await axios.post(
            `http://localhost:8000/dashboard/tasks/${taskId}/mark_completed/`
          );
          // Remove from active tasks list
          setTasks((prev) => prev.filter((task) => task.id !== taskId));
        } catch (err) {
          console.error("Error marking task completed:", err);
        }
      } else {
        // Normal update if not 100% complete
        setTasks((prev) =>
          prev.map((task) => {
            if (task.id === taskId) {
              const updatedCheckpoints = task.checkpoints.map((cp) =>
                cp.id === checkpointId ? { ...cp, completed: !completed } : cp
              );
              const doneCount = updatedCheckpoints.filter(
                (cp) => cp.completed
              ).length;
              const percentage = updatedCheckpoints.length
                ? Math.round((doneCount / updatedCheckpoints.length) * 100)
                : 0;
              return {
                ...task,
                checkpoints: updatedCheckpoints,
                completion_percentage: percentage,
                completed: percentage === 100,
              };
            }
            return task;
          })
        );
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update checkpoint. Please try again.");
    }
  };

  const generateAICheckpoints = async () => {
    setIsGeneratingCheckpoints(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/dashboard/generate_ai_checkpoints_preview/",
        {
          title: newTask.title,
          description: newTask.description,
        }
      );
      setManualCheckpoints(res.data.checkpoints);
    } catch (err) {
      console.error("Error generating checkpoints:", err);
      setError("Failed to generate checkpoints. Please try again.");
    } finally {
      setIsGeneratingCheckpoints(false);
    }
  };

  const addManualCheckpoint = () => {
    setManualCheckpoints([...manualCheckpoints, { title: "" }]);
  };

  const removeManualCheckpoint = (index) => {
    const newCheckpoints = [...manualCheckpoints];
    newCheckpoints.splice(index, 1);
    setManualCheckpoints(newCheckpoints);
  };

  const updateManualCheckpoint = (index, value) => {
    const newCheckpoints = [...manualCheckpoints];
    newCheckpoints[index].title = value;
    setManualCheckpoints(newCheckpoints);
  };

  const [completedTasks, setCompletedTasks] = useState([]);

  // Add to your fetchData function
  const fetchCompletedTasks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/dashboard/completed_tasks/"
      );
      setCompletedTasks(res.data.completed_tasks);
    } catch (err) {
      console.error("Error fetching completed tasks:", err);
    }
  };

  // Call it in useEffect
  useEffect(() => {
    fetchData();
    fetchCompletedTasks();
  }, []);

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 w-full min-h-screen bg-[#00031c] pt-24 p-6 text-white">
        <motion.div initial="hidden" animate="show" variants={fadeInUp}>
          {error && (
            <div className="bg-red-600 text-white p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-8 mb-12">
            {/* ===== Tasks Section ===== */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-8">
                <ListTodo size={28} className="text-blue-400" />
                <h1 className="text-3xl font-bold">Tasks</h1>
              </div>

              {/* Task Form */}
              <form
                onSubmit={handleTaskSubmit}
                className="p-4 bg-[#0a0f2b] border border-gray-700 rounded-xl grid gap-4"
              >
                <input
                  className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
                  placeholder="Task Title *"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  required
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
                  required
                >
                  <option value="">Select Team *</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setShowCheckpointModal(true)}
                  className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  Add/Generate Checkpoints
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  disabled={isCreatingTask}
                >
                  {isCreatingTask ? (
                    "Creating..."
                  ) : (
                    <>
                      <PlusCircle size={18} /> Add Task
                    </>
                  )}
                </button>
              </form>

              <ul className="mb-6 grid sm:grid-cols-1 gap-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="text-lg font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-400">{task.description}</p>
                    <p className="text-sm">
                      Completion:{" "}
                      <span
                        className={
                          task.completion_percentage === 100
                            ? "text-green-400"
                            : "text-yellow-400"
                        }
                      >
                        {task.completion_percentage || 0}%
                      </span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Team: {task.team__name || "Unassigned"}
                    </p>

                    {/* ===== Always Show Checkpoints ===== */}
                    <ul className="mt-2 pl-4">
                      {task.checkpoints?.map((cp, idx) => (
                        <li
                          key={cp.id || idx}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={cp.completed || false}
                            onChange={() =>
                              toggleCheckpoint(task.id, cp.id, cp.completed)
                            }
                          />
                          <span
                            className={
                              cp.completed ? "line-through text-green-400" : ""
                            }
                          >
                            {cp.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ul>
              {/* Add this somewhere in your JSX */}
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4 text-green-400">
                  Completed Tasks
                </h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#0a0f2b] text-left">
                      <th className="p-3 border border-gray-700">Title</th>
                      <th className="p-3 border border-gray-700">Team</th>
                      <th className="p-3 border border-gray-700">
                        Completed On
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedTasks.map((task) => (
                      <tr key={task.id} className="border-b border-gray-700">
                        <td className="p-3">{task.title}</td>
                        <td className="p-3">
                          {task.team__name || "Unassigned"}
                        </td>
                        <td className="p-3">
                          {new Date(task.completion_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== Teams Section ===== */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-8">
                <Users size={28} className="text-green-400" />
                <h1 className="text-3xl font-bold">Teams</h1>
              </div>

              {/* Employee Checkbox Selection */}
              <div className="p-4 mb-4 bg-[#0a0f2b] border border-gray-700 rounded-xl">
                <h3 className="mb-2 font-semibold">Select Team Members</h3>
                {employees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-2 text-sm mb-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.includes(emp.id)}
                      onChange={() => handleCheckboxChange(emp.id)}
                    />
                    {emp.name}
                  </label>
                ))}
              </div>

              {/* Team Form */}
              <form
                onSubmit={handleTeamSubmit}
                className="p-4 bg-[#0a0f2b] border border-gray-700 rounded-xl grid gap-4"
              >
                <input
                  className="bg-[#1a1f3c] p-2 rounded text-white border border-gray-600 focus:outline-none"
                  placeholder="Team Name"
                  value={newTeam.name}
                  onChange={(e) =>
                    setNewTeam({ ...newTeam, name: e.target.value })
                  }
                  required
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
                  {employees
                    .filter((emp) => selectedMemberIds.includes(emp.id))
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                </select>
                <button
                  type="submit"
                  className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <PlusCircle size={18} /> Add Team
                </button>
              </form>

              {/* List of Teams */}
              <ul className="mt-6 grid sm:grid-cols-1 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-[#0a0f2b] border border-gray-700 rounded-lg p-4"
                  >
                    <h3 className="text-lg font-medium">{team.name}</h3>
                    <p className="text-sm text-gray-400">{team.description}</p>
                    <p className="text-sm">
                      Lead:{" "}
                      <span
                        className="cursor-pointer text-yellow-400 font-bold hover:underline"
                        onClick={() => setSelectedEmployee(team.lead)}
                      >
                        {team.lead?.name || "None"}
                      </span>
                    </p>
                    <p className="text-sm">
                      Members:{" "}
                      {team.members?.length
                        ? team.members.map((m) => m.name).join(", ")
                        : "No Members"}
                    </p>
                  </div>
                ))}
              </ul>
            </div>
          </div>
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

      {/* ===== Checkpoint Modal ===== */}
      {showCheckpointModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-[#0a0f2b] p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Checkpoints</h2>
              <X
                size={24}
                className="cursor-pointer hover:text-red-400"
                onClick={() => setShowCheckpointModal(false)}
              />
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Choose an option:</h3>
              <div className="flex gap-4">
                <button
                  onClick={addManualCheckpoint}
                  className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
                >
                  Add Manually
                </button>
                <button
                  onClick={generateAICheckpoints}
                  disabled={isGeneratingCheckpoints || !newTask.title}
                  className="bg-purple-600 text-white px-4 py-2 rounded flex-1 disabled:opacity-50"
                >
                  {isGeneratingCheckpoints
                    ? "Generating..."
                    : "Generate with AI"}
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <h3 className="font-medium mb-2">
                Checkpoints ({manualCheckpoints.length})
              </h3>
              {manualCheckpoints.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  No checkpoints added yet
                </div>
              ) : (
                <ul className="space-y-2">
                  {manualCheckpoints.map((cp, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-2 items-center group"
                    >
                      <span className="text-sm text-gray-400 w-6">
                        {idx + 1}.
                      </span>
                      <input
                        className="flex-1 bg-[#1a1f3c] p-2 rounded border border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        value={cp.title}
                        onChange={(e) =>
                          updateManualCheckpoint(idx, e.target.value)
                        }
                        placeholder={`Enter checkpoint ${idx + 1}`}
                      />
                      <button
                        className="text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeManualCheckpoint(idx)}
                        aria-label="Remove checkpoint"
                        title="Remove checkpoint"
                      >
                        <X size={18} />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded"
                onClick={() => setShowCheckpointModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={() => setShowCheckpointModal(false)}
              >
                Save Checkpoints
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
