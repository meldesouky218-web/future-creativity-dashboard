// components/AttendanceTrendPanel.js
import { useEffect, useState } from "react";
import API from "../utils/api";
import Sparkline from "./Sparkline";

export default function AttendanceTrendPanel() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, days: [] });

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // محاولة جلب حركة الحضور آخر 7 أيام
    API.get("/attendance", { params: { range: "7d" } })
      .then((res) => {
        if (!mounted) return;
        // نحاول استنتاج أرقام بسيطة: عدد سجلات لكل يوم
        const rows = Array.isArray(res.data) ? res.data : [];
        const byDay = new Map();
        rows.forEach((r) => {
          const d = new Date(r.timestamp || r.created_at || r.date || r.check_in).toISOString().slice(0, 10);
          byDay.set(d, (byDay.get(d) || 0) + 1);
        });
        // بناء سلسلة 7 أيام أخيرة
        const days = [...Array(7)]
          .map((_, i) => {
            const dt = new Date();
            dt.setDate(dt.getDate() - (6 - i));
            return dt.toISOString().slice(0, 10);
          });

        const data = days.map((d) => byDay.get(d) || 0);
        setSeries(data);
        setMeta({ total: rows.length, days });
      })
      .catch(() => {
        // Fallback بيانات ثابتة لو الـ API مش جاهز
        setSeries([6, 8, 7, 10, 11, 9, 12]);
        setMeta({ total: 63, days: [] });
      })
      .finally(() => setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-[#1F2837] bg-[#0F1524] p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-lightText/60">Attendance (Last 7 days)</div>
        <div className="text-xs text-lightText/50">
          Total: <span className="text-matteGold font-semibold">{meta.total}</span>
        </div>
      </div>
      {loading ? (
        <div className="h-[60px] animate-pulse rounded bg-[#101624]" />
      ) : (
        <Sparkline data={series} />
      )}
      <div className="mt-3 text-xs text-lightText/50">
        {meta.days?.length
          ? `From ${meta.days[0]} to ${meta.days[meta.days.length - 1]}`
          : "Synthetic preview"}
      </div>
    </div>
  );
}
