import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import KpiCard from "../../components/KpiCard";
import API from "../../utils/api";
import useAuthGuard from "../../hooks/useAuthGuard";
import useToast from "../../hooks/useToast";

export default function ProjectDetails() {
  useAuthGuard();
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState({ team_count: 0, attendance_last7: 0, payroll_month_total: 0, docs_count: 0 });
  const [assignments, setAssignments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [finance, setFinance] = useState({ total_expenses: 0, payroll_month_total: 0, month: "" });

  // Log form
  const [logContent, setLogContent] = useState("");
  const [logPhotos, setLogPhotos] = useState("");
  const fmt = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "SAR" }).format(Number(n || 0));

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [p, s, a, l, d] = await Promise.all([
          API.get(`/projects/${id}`),
          API.get(`/projects/${id}/summary`),
          API.get(`/projects/${id}/assignments`),
          API.get(`/projects/${id}/logs`, { params: { range: "7d", limit: 50 } }),
          API.get(`/projects/${id}/docs`),
        ]);
        if (!mounted) return;
        setProject(p.data || null);
        setSummary(s.data || {});
        setAssignments(a.data || []);
        setLogs(l.data || []);
        setDocs(d.data || []);
        // load expenses and finance summary (current month)
        try {
          const [ex, fs] = await Promise.all([
            API.get(`/projects/${id}/expenses`),
            API.get(`/projects/${id}/finance/summary`),
          ]);
          setExpenses(Array.isArray(ex.data) ? ex.data : []);
          setFinance(fs.data || {});
        } catch {}
        // load staff list for assignment (admin/manager only; ignore errors)
        try {
          const st = await API.get(`/staff`);
          setStaffList(Array.isArray(st.data) ? st.data : []);
        } catch {}
      } catch (err) {
        addToast("Failed to load project", "error");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      const filesInput = document.getElementById("log-photos-files");
      const hasFiles = filesInput && filesInput.files && filesInput.files.length > 0;
      if (hasFiles) {
        const form = new FormData();
        form.append("content", logContent);
        for (const f of filesInput.files) form.append("photos", f);
        const res = await API.post(`/projects/${id}/logs/upload`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setLogs((prev) => [res.data, ...prev]);
        filesInput.value = "";
      } else {
        const photos = logPhotos
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const res = await API.post(`/projects/${id}/logs`, { content: logContent, photos });
        setLogs((prev) => [res.data, ...prev]);
      }
      setLogContent("");
      setLogPhotos("");
      addToast("Log added", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add log", "error");
    }
  };

  const apiOrigin = (() => {
    try {
      return new URL(API.defaults.baseURL).origin;
    } catch (e) {
      return "http://localhost:5000";
    }
  })();

  const isImage = (u) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test((u || "").split('?')[0]);

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    const input = document.getElementById("doc-file");
    if (!input || !input.files || !input.files[0]) {
      addToast("Select a file first", "error");
      return;
    }
    const file = input.files[0];
    const form = new FormData();
    form.append("file", file);
    form.append("file_name", file.name);
    try {
      const res = await API.post(`/projects/${id}/docs`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocs((prev) => [res.data, ...prev]);
      input.value = "";
      addToast("File uploaded", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to upload", "error");
    }
  };

  const handleDeleteDoc = async (docId) => {
    try {
      await API.delete(`/projects/docs/${docId}`);
      setDocs((prev) => prev.filter((d) => d.id !== docId));
      addToast("Deleted", "success");
    } catch (err) {
      addToast("Failed to delete", "error");
    }
  };

  const projectStatus = useMemo(() => project?.status || "Active", [project]);
  const ROLE_OPTIONS = [
    { label: "Supervisor", value: "Supervisor" },
    { label: "Hostess", value: "Hostess" },
    { label: "Cleaner", value: "Cleaner" },
    { label: "Security", value: "Security" },
  ];

  // assignment form state
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRole, setAssignRole] = useState(ROLE_OPTIONS[0].value);
  const [assignStart, setAssignStart] = useState("");
  const [assignEnd, setAssignEnd] = useState("");
  const [assignNotes, setAssignNotes] = useState("");

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignUserId) {
      addToast("Select a user", "error");
      return;
    }
    try {
      await API.post(`/staff/${assignUserId}/assign`, {
        project_id: Number(id),
        role_in_project: assignRole,
        start_date: assignStart || null,
        end_date: assignEnd || null,
        notes: assignNotes || null,
      });
      addToast("Assigned successfully", "success");
      setAssignUserId("");
      setAssignRole(ROLE_OPTIONS[0].value);
      setAssignStart("");
      setAssignEnd("");
      setAssignNotes("");
      // refresh assignments
      const a = await API.get(`/projects/${id}/assignments`);
      setAssignments(a.data || []);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to assign", "error");
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="p-8 text-lightText/70">Loading project...</div>
      </Layout>
    );

  if (!project)
    return (
      <Layout>
        <div className="p-8 text-red-400">Project not found</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-8 text-lightText space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-matteGold font-semibold">{project.name}</h1>
            <div className="text-lightText/70 text-sm">
              {project.start_date || "?"} → {project.end_date || "?"} · Status: {projectStatus}
            </div>
          </div>
          <button
            onClick={() => router.push("/projects")}
            className="px-4 py-2 rounded-full border border-matteGold text-matteGold text-sm hover:bg-matteGold hover:text-black"
          >
            ← Back to projects
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-[#1F2837]">
          {[
            { k: "overview", label: "Overview" },
            { k: "team", label: "Team" },
            { k: "logs", label: "Logs" },
            { k: "docs", label: "Docs" },
            { k: "finance", label: "Finance" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k)}
              className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 ${
                activeTab === t.k ? "border-matteGold text-matteGold" : "border-transparent text-lightText/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <KpiCard title="Team Members" value={String(summary.team_count ?? 0)} />
              <KpiCard title="Attendance (7d)" value={String(summary.attendance_last7 ?? 0)} />
              <KpiCard title="Docs" value={String(summary.docs_count ?? 0)} />
              <KpiCard title="Payroll (month)" value={fmt(summary.payroll_month_total ?? 0)} />
            </div>
            <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
              <h3 className="text-matteGold font-semibold mb-2">Location</h3>
              <div className="text-sm text-lightText/70">
                Lat: {project.location_lat ?? "-"}, Lng: {project.location_lng ?? "-"}, Radius: {project.radius ?? 200}
              </div>
            </div>
          </div>
        )}

        {/* Finance */}
        {activeTab === "finance" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
              <h3 className="text-matteGold font-semibold mb-3">Add Expense</h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target);
                  try {
                    const res = await API.post(`/projects/${id}/expenses`, fd, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    setExpenses((prev) => [res.data, ...prev]);
                    e.target.reset();
                    addToast("Expense added", "success");
                  } catch (err) {
                    addToast(err.response?.data?.message || "Failed to add expense", "error");
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-xs text-lightText/60">Category</label>
                  <input name="category" type="text" className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText" />
                </div>
                <div>
                  <label className="text-xs text-lightText/60">Amount</label>
                  <input name="amount" type="number" step="0.01" required className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText" />
                </div>
                <div>
                  <label className="text-xs text-lightText/60">Notes</label>
                  <input name="notes" type="text" className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText" />
                </div>
                <div>
                  <label className="text-xs text-lightText/60">Receipt (optional)</label>
                  <input name="receipt" type="file" className="block w-full text-sm" />
                </div>
                <button type="submit" className="px-4 py-2 rounded-lg bg-royalGreen text-white text-sm font-semibold hover:bg-[#0D745D]">Add</button>
              </form>
              <div className="mt-6 text-sm text-lightText/70">
                <div>Month: <span className="text-lightText">{finance.month || "current"}</span></div>
                <div>Total expenses: <span className="text-matteGold">{fmt(finance.total_expenses)}</span></div>
                <div>Payroll (month): <span className="text-matteGold">{fmt(finance.payroll_month_total)}</span></div>
              </div>
            </div>
            <div className="md:col-span-2 bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
              <h3 className="text-matteGold font-semibold mb-3">Expenses</h3>
              {expenses.length ? (
                <ul className="space-y-2 text-sm">
                  {expenses.map((ex) => (
                    <li key={ex.id} className="border-b border-[#1F2837] pb-2 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-lightText/90">{ex.category || 'Expense'} — {fmt(ex.amount)}</div>
                        {ex.notes ? <div className="text-xs text-lightText/60">{ex.notes}</div> : null}
                        <div className="text-xs text-lightText/50">{new Date(ex.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        {ex.receipt_url ? (
                          <a href={`${apiOrigin}${ex.receipt_url}`} target="_blank" rel="noreferrer" className="text-xs text-matteGold underline">Receipt</a>
                        ) : null}
                        <button
                          onClick={async () => {
                            try { await API.delete(`/projects/expenses/${ex.id}`); setExpenses((prev) => prev.filter((i) => i.id !== ex.id)); addToast('Deleted','success'); }
                            catch { addToast('Failed','error'); }
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lightText/60 text-sm">No expenses yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Team */}
        {activeTab === "team" && (
          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5 space-y-6">
            <h3 className="text-matteGold font-semibold">Team</h3>
            {/* Assign staff to project */}
            <form onSubmit={handleAssign} className="grid md:grid-cols-5 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="text-xs text-lightText/60">User</label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText"
                >
                  <option value="">Select user...</option>
                  {staffList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email} — {u.role}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-lightText/60">Role in project</label>
                <select
                  value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)}
                  className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-lightText/60">Start</label>
                <input
                  type="date"
                  value={assignStart}
                  onChange={(e) => setAssignStart(e.target.value)}
                  className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText"
                />
              </div>
              <div>
                <label className="text-xs text-lightText/60">End</label>
                <input
                  type="date"
                  value={assignEnd}
                  onChange={(e) => setAssignEnd(e.target.value)}
                  className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText"
                />
              </div>
              <div className="md:col-span-5">
                <label className="text-xs text-lightText/60">Notes</label>
                <input
                  type="text"
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText"
                />
              </div>
              <div className="md:col-span-5 flex justify-end">
                <button type="submit" className="px-4 py-2 rounded-lg bg-royalGreen text-white text-sm font-semibold hover:bg-[#0D745D]">
                  Assign
                </button>
              </div>
            </form>
            {assignments.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-lightText/60">
                    <th className="py-2">User</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Start</th>
                    <th className="py-2">End</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-t border-[#1F2837]">
                      <td className="py-2">{a.name || a.email}</td>
                      <td className="py-2">{a.role_in_project || "Member"}</td>
                      <td className="py-2">{a.start_date || "-"}</td>
                      <td className="py-2">{a.end_date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-lightText/60 text-sm">No team assigned yet.</p>
            )}
          </div>
        )}

        {/* Logs */}
        {activeTab === "logs" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
              <h3 className="text-matteGold font-semibold mb-3">Add Log</h3>
              <form onSubmit={handleAddLog} className="space-y-3">
                <textarea
                  rows={5}
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  placeholder="What happened today?"
                  className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText"
                />
                <div>
                  <label className="text-xs text-lightText/60">Photo URLs (optional)</label>
                  <input
                    type="text"
                    value={logPhotos}
                    onChange={(e) => setLogPhotos(e.target.value)}
                    placeholder="Comma separated"
                    className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText"
                  />
                </div>
                <div>
                  <label className="text-xs text-lightText/60">Upload photos (optional)</label>
                  <input id="log-photos-files" type="file" multiple className="block w-full text-sm" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-royalGreen text-white text-sm font-semibold hover:bg-[#0D745D]"
                >
                  Save Log
                </button>
              </form>
            </div>
            <div className="md:col-span-2 bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
              <h3 className="text-matteGold font-semibold mb-3">Recent Logs</h3>
              {logs.length ? (
                <ul className="space-y-3 text-sm">
                  {logs.map((lg) => (
                    <li key={lg.id} className="border-b border-[#1F2837] pb-2">
                      <div className="text-lightText">{lg.content}</div>
                      <div className="text-lightText/60 text-xs mt-1">
                        {new Date(lg.created_at).toLocaleString()}
                      </div>
                      {Array.isArray(lg.photos) && lg.photos.length ? (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {lg.photos.map((u, i) => {
                            const href = u?.startsWith("http") ? u : `${apiOrigin}${u}`;
                            return (
                              <a key={i} href={href} target="_blank" rel="noreferrer" className="block group">
                                {isImage(href) ? (
                                  <img src={href} alt={`photo-${i+1}`} className="h-20 w-full object-cover rounded-md border border-[#1F2837] group-hover:opacity-90" />
                                ) : (
                                  <span className="text-xs underline text-matteGold">Photo {i + 1}</span>
                                )}
                              </a>
                            );
                          })}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-lightText/60 text-sm">No logs yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Docs */}
        {activeTab === "docs" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
              <h3 className="text-matteGold font-semibold mb-3">Upload Document</h3>
              <form onSubmit={handleUploadDoc} className="space-y-3">
                <input id="doc-file" type="file" className="block w-full text-sm" />
                <button type="submit" className="px-4 py-2 rounded-lg bg-matteGold text-black text-sm font-semibold hover:bg-[#E5C46B]">
                  Upload
                </button>
              </form>
            </div>
            <div className="md:col-span-2 bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
              <h3 className="text-matteGold font-semibold mb-3">Project Documents</h3>
              {docs.length ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((d) => (
                    <div key={d.id} className="border border-[#1F2837] rounded-xl p-4 text-sm">
                      {isImage(d.file_url) ? (
                        <a href={`${apiOrigin}${d.file_url}`} target="_blank" rel="noreferrer">
                          <img src={`${apiOrigin}${d.file_url}`} alt={d.file_name || 'doc'} className="h-28 w-full object-cover rounded-md border border-[#1F2837] mb-3" />
                        </a>
                      ) : null}
                      <div className="font-semibold text-lightText/90 truncate">{d.file_name || "Document"}</div>
                      <div className="text-xs text-lightText/50 mt-1">
                        {d.uploader ? `by ${d.uploader} • ` : ""}
                        {new Date(d.created_at).toLocaleString()}
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <a
                          href={`${apiOrigin}${d.file_url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-matteGold underline"
                        >
                          Open
                        </a>
                        <button
                          onClick={() => handleDeleteDoc(d.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-lightText/60 text-sm">No documents yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
