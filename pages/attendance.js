"use client";
import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import useAuthGuard from "../hooks/useAuthGuard";
import API from "../utils/api";

export default function Attendance() {
  const isReady = useAuthGuard();
  const [records, setRecords] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!isReady) return;
    const fetchAttendance = async () => {
      setLoading(true);
      setError("");
      try {
        const [attendanceRes, projectsRes, usersRes] = await Promise.all([
          API.get("/attendance"),
          API.get("/projects"),
          API.get("/users"),
        ]);
        setRecords(attendanceRes.data || []);
        setProjects(projectsRes.data || []);
        setUsers(usersRes.data || []);
      } catch (err) {
        setError("Unable to load attendance records.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [isReady]);

  const filteredRecords = useMemo(() => {
    return records.filter((entry) => {
      const matchesProject =
        projectFilter === "all" ||
        String(entry.project_id) === String(projectFilter);
      const matchesUser =
        userFilter === "all" ||
        String(entry.user_id) === String(userFilter);
      const matchesStatus =
        statusFilter === "all" ||
        String(entry.status).toLowerCase() === statusFilter.toLowerCase();
      return matchesProject && matchesUser && matchesStatus;
    });
  }, [records, projectFilter, userFilter, statusFilter]);

  const formatTimestamp = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      return value;
    }
  };

  if (!isReady) return null;

  return (
    <Layout>
      <div className="space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-matteGold">
              Attendance
            </h1>
            <p className="mt-2 text-lightText/70">
              Review field check-ins, approvals, and activity details.
            </p>
          </div>
          <div className="rounded-xl bg-[#1A1A1A] px-4 py-3 text-sm text-lightText/70">
            Total records:{" "}
            <span className="text-lightText font-semibold">
              {filteredRecords.length}
            </span>
          </div>
        </header>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <section className="rounded-2xl border border-[#1F1F1F] bg-[#121212] p-4 shadow-lg">
          <h2 className="text-lg font-semibold text-matteGold">
            Filters
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-lightText/60">
                Project
              </label>
              <select
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
              >
                <option value="all">All projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name || `Project #${project.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-lightText/60">
                Staff member
              </label>
              <select
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
              >
                <option value="all">All members</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wide text-lightText/60">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
              >
                <option value="all">All statuses</option>
                {["pending", "approved", "rejected"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <p className="text-lightText/70">Loading attendance records...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="text-lightText/70">
            No attendance entries match the current filters.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1F1F1F] bg-[#121212] shadow-lg">
            <table className="min-w-full divide-y divide-[#1F1F1F]">
              <thead className="bg-[#181818]">
                <tr>
                  {[
                    "Employee",
                    "Project",
                    "Type",
                    "Status",
                    "Location",
                    "Timestamp",
                    "Evidence",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lightText/60"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {filteredRecords.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3 text-sm font-semibold text-lightText">
                      {entry.user_name || `User #${entry.user_id}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80">
                      {entry.project_name || `Project #${entry.project_id}`}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-lightText/80">
                      {entry.check_type || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-lightText/80">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          entry.status === "approved"
                            ? "bg-royalGreen/20 text-royalGreen"
                            : entry.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-matteGold/10 text-matteGold"
                        }`}
                      >
                        {entry.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80">
                      {entry.latitude && entry.longitude
                        ? `${entry.latitude}, ${entry.longitude}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80">
                      {entry.image_url ? (
                        <a
                          href={entry.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-matteGold underline"
                        >
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

