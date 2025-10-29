import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import useAuthGuard from "../hooks/useAuthGuard";
import useToast from "../hooks/useToast";
import API from "../utils/api";
import KpiCard from "../components/KpiCard";

function monthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function PayrollPage() {
  const isReady = useAuthGuard();
  const { addToast } = useToast();

  const [month, setMonth] = useState(monthKey());
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);

  const [preview, setPreview] = useState({ month: monthKey(), records: [] });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Load projects once for filter
  useEffect(() => {
    if (!isReady) return;
    API.get("/projects").then((res) => setProjects(res.data || [])).catch(() => setProjects([]));
  }, [isReady]);

  const loadData = async () => {
    if (!isReady) return;
    setLoading(true);
    try {
      const params = projectId ? { month, project_id: projectId } : { month };
      const [prevRes, recRes] = await Promise.all([
        API.get("/payroll/compute", { params }),
        API.get("/payroll/records", { params }),
      ]);
      setPreview(prevRes.data || { month, records: [] });
      setRecords(Array.isArray(recRes.data) ? recRes.data : []);
    } catch (err) {
      addToast("Failed to load payroll data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, projectId, isReady]);

  const totals = useMemo(() => {
    const sumPrev = (preview.records || []).reduce((a, r) => a + Number(r.total_amount || 0), 0);
    const sumRec = (records || []).reduce((a, r) => a + Number(r.total_amount || 0), 0);
    return { preview: sumPrev, saved: sumRec };
  }, [preview, records]);

  const fmt = (n) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "SAR" }).format(
      Number(n || 0)
    );

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await API.post("/payroll/generate", { month, project_id: projectId || undefined });
      addToast("Payroll records generated", "success");
      await loadData();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to generate records", "error");
    } finally {
      setGenerating(false);
    }
  };

  const approveRecord = async (id) => {
    try {
      await API.put(`/payroll/records/${id}/approve`);
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)));
      addToast("Approved", "success");
    } catch (err) {
      addToast("Failed to approve", "error");
    }
  };

  const rejectRecord = async (id) => {
    try {
      await API.put(`/payroll/records/${id}/reject`);
      setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, approved: false } : r)));
      addToast("Rejected", "success");
    } catch (err) {
      addToast("Failed to reject", "error");
    }
  };

  return (
    <Layout>
      <div className="p-8 text-lightText space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-3xl text-matteGold font-semibold">Payroll</h1>
          <div className="flex items-center gap-3">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText"
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || `#${p.id}`}
                </option>
              ))}
            </select>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 rounded-lg bg-matteGold text-black text-sm font-semibold hover:bg-[#E5C46B] disabled:opacity-60"
            >
              {generating ? "Generating..." : "Generate Records"}
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title="Preview Total" value={fmt(totals.preview)} hint={month} />
          <KpiCard title="Saved Total" value={fmt(totals.saved)} hint={month} />
          <KpiCard title="Records" value={String(records.length)} />
        </div>

        {/* Preview table */}
        <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-matteGold font-semibold">Preview (not saved)</h3>
            <div className="text-xs text-lightText/60">Month: {preview.month || month}</div>
          </div>
          {loading ? (
            <p className="text-sm text-lightText/60">Loading...</p>
          ) : (preview.records || []).length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-lightText/60">
                    <th className="py-2">User</th>
                    <th className="py-2">Project</th>
                    <th className="py-2">Days</th>
                    <th className="py-2">Base/day</th>
                    <th className="py-2">Allowances</th>
                    <th className="py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.records.map((r, idx) => (
                    <tr key={idx} className="border-t border-[#1F2837]">
                      <td className="py-2">{r.user_name || r.email}</td>
                      <td className="py-2">{r.project_name || `#${r.project_id}`}</td>
                      <td className="py-2">{r.days_present}</td>
                      <td className="py-2">{fmt(r.base_rate)}</td>
                      <td className="py-2">{fmt(r.allowances_total)}</td>
                      <td className="py-2">{fmt(r.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-lightText/60">No preview data.</p>
          )}
        </div>

        {/* Saved records table */}
        <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-matteGold font-semibold">Saved Records</h3>
            <div className="text-xs text-lightText/60">Month filter: {month}</div>
          </div>
          {loading ? (
            <p className="text-sm text-lightText/60">Loading...</p>
          ) : records.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-lightText/60">
                    <th className="py-2">User</th>
                    <th className="py-2">Project</th>
                    <th className="py-2">Days</th>
                    <th className="py-2">Base/day</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Approved</th>
                    <th className="py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-t border-[#1F2837]">
                      <td className="py-2">{r.user_name}</td>
                      <td className="py-2">{r.project_name}</td>
                      <td className="py-2">{r.days_present}</td>
                      <td className="py-2">{fmt(r.base_rate)}</td>
                      <td className="py-2">{fmt(r.total_amount)}</td>
                      <td className="py-2">{r.approved ? "Yes" : "No"}</td>
                      <td className="py-2 flex items-center gap-2">
                        {!r.approved && (
                          <button
                            onClick={() => approveRecord(r.id)}
                            className="px-3 py-1 rounded-md bg-royalGreen text-white text-xs font-semibold hover:bg-[#0D745D]"
                          >
                            Approve
                          </button>
                        )}
                        {r.approved && (
                          <button
                            onClick={() => rejectRecord(r.id)}
                            className="px-3 py-1 rounded-md border border-red-400 text-red-300 text-xs font-semibold hover:bg-red-500/10"
                          >
                            Reject
                          </button>
                        )}
                        {!r.approved && (
                          <button
                            onClick={() => rejectRecord(r.id)}
                            className="px-3 py-1 rounded-md border border-red-400 text-red-300 text-xs font-semibold hover:bg-red-500/10"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-lightText/60">No saved records yet.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
