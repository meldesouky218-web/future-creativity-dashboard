import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import RecentActivity from "../components/RecentActivity";
import ActivitySummary from "../components/ActivitySummary";
import AttendanceTrendPanel from "../components/AttendanceTrendPanel";
import ChartPanel from "../components/ChartPanel";
import BarPanel from "../components/BarPanel";
import DonutPanel from "../components/DonutPanel";
import KpiCard from "../components/KpiCard";
import useAuthGuard from "../hooks/useAuthGuard";
import useToast from "../hooks/useToast";
import { useI18n } from "../i18n/I18nProvider";
import API from "../utils/api";

const fmt = (n) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "SAR" }).format(
    Number(n || 0)
  );

function monthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function Dashboard() {
  useAuthGuard();
  const { addToast } = useToast();
  const router = useRouter();
  const { t } = useI18n();

  const [stats, setStats] = useState({ users: 0, projects: 0, attendance: 0 });
  const [me, setMe] = useState(null);
  const [month, setMonth] = useState(monthKey());
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [hr, setHr] = useState({ totals: { total: 0, approved_total: 0, pending_total: 0 }, daily: [], byProject: [] });
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [ops, setOps] = useState({ runningProjects: 0, totalStaffAssigned: 0, pendingTasks: 0 });

  // sync state with URL query (month, project)
  useEffect(() => {
    const q = router.query || {};
    if (typeof q.month === "string") setMonth(q.month);
    if (typeof q.project === "string") setProjectId(q.project);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.month, router.query.project]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params = projectId ? { month, project_id: projectId } : { month };
    Promise.all([
      API.get("/dashboard/stats"),
      API.get("/dashboard/hr/monthly", { params }),
      API.get("/dashboard/users/roles"),
      API.get("/projects/active/summary"),
    ])
      .then(([s, h, r, o]) => {
        if (!mounted) return;
        setStats(s.data || {});
        setHr(h.data || hr);
        setRoles(Array.isArray(r.data) ? r.data : []);
        setOps(o.data || ops);
      })
      .catch(() => {
        // Silently ignore errors on background refresh to avoid noisy toasts
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [month, projectId, addToast]);

  // load projects list for filter (once)
  useEffect(() => {
    API.get("/projects").then((res) => setProjects(res.data || [])).catch(() => setProjects([]));
  }, []);

  // load current user
  useEffect(() => {
    let mounted = true;
    API.get("/auth/me")
      .then((res) => {
        if (mounted) setMe(res.data || null);
      })
      .catch(() => {})
      .finally(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const dailyLine = useMemo(() => {
    const labels = (hr.daily || []).map((d) => d.day.slice(5));
    const data = (hr.daily || []).map((d) => d.total);
    return {
      labels,
      datasets: [
        {
          label: "Daily Payroll",
          data,
          borderColor: "#E5C46B",
          backgroundColor: "rgba(229,196,107,0.15)",
          tension: 0.3,
        },
      ],
    };
  }, [hr.daily]);

  const byProjectBar = useMemo(() => {
    const labels = (hr.byProject || []).map((d) => d.name);
    const data = (hr.byProject || []).map((d) => d.total);
    return {
      labels,
      datasets: [
        {
          label: "By Project",
          data,
          backgroundColor: "rgba(54,202,164,0.35)",
          borderColor: "#36caa4",
          borderWidth: 1,
        },
      ],
    };
  }, [hr.byProject]);

  const approvalDonut = useMemo(() => {
    const approved = hr.totals?.approved_total || 0;
    const pending = hr.totals?.pending_total || 0;
    return {
      labels: ["Approved", "Pending"],
      datasets: [
        {
          data: [approved, pending],
          backgroundColor: ["#36caa4", "#ef4444"],
          borderColor: ["#36caa4", "#ef4444"],
        },
      ],
    };
  }, [hr.totals]);

  const roleDonut = useMemo(() => {
    const labels = roles.map((r) => (r.role || "unknown").toUpperCase());
    const data = roles.map((r) => Number(r.count || 0));
    const palette = ["#E5C46B", "#36caa4", "#60a5fa", "#f97316", "#ef4444", "#a78bfa"];
    const bg = labels.map((_, i) => palette[i % palette.length]);
    return { labels, datasets: [{ data, backgroundColor: bg, borderColor: bg }] };
  }, [roles]);

  return (
    <Layout>
      <div className="p-8 text-lightText space-y-8">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl text-matteGold font-semibold">{t("nav.dashboard")}</h1>
            {me && (
              <div className="text-sm text-lightText/60 mt-1">
                {t("dashboard.welcome")} <span className="text-lightText font-semibold">{me.name || me.email}</span>{" "}
                {me.role ? <span className="text-lightText/50">· {me.role}</span> : null}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={projectId}
              onChange={(e) => {
                const v = e.target.value;
                setProjectId(v);
                router.replace({ pathname: router.pathname, query: { ...router.query, project: v || undefined, month } }, undefined, { shallow: true });
              }}
              className="bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText"
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name || `#${p.id}`}</option>
              ))}
            </select>
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                router.replace({ pathname: router.pathname, query: { ...router.query, month: e.target.value, project: projectId || undefined } }, undefined, { shallow: true });
              }}
              className="bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText"
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard title={t("dashboard.monthlyPayroll")} value={fmt(hr.totals?.total)} hint={month} />
          <KpiCard title={t("dashboard.approved")} value={fmt(hr.totals?.approved_total)} />
          <KpiCard title={t("dashboard.pending")} value={fmt(hr.totals?.pending_total)} />
          <KpiCard title={t("dashboard.projects")} value={String(stats.projects ?? "-")} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartPanel data={dailyLine} />
          <BarPanel data={byProjectBar} />
          <DonutPanel data={approvalDonut} />
        </div>

        {/* Attendance trend + role distribution + activity summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AttendanceTrendPanel />
          <DonutPanel data={roleDonut} />
          <div className="space-y-6">
            <ActivitySummary range="7d" />
            <RecentActivity />
          </div>
        </div>

        {/* Active projects widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard title={t("dashboard.runningProjects")} value={String(ops.runningProjects || 0)} />
          <KpiCard title={t("dashboard.totalStaffAssigned")} value={String(ops.totalStaffAssigned || 0)} />
          <KpiCard title={t("dashboard.pendingTasks")} value={String(ops.pendingTasks || 0)} />
        </div>
      </div>
    </Layout>
  );
}
