import { useEffect, useMemo, useState } from "react";
import API from "../utils/api";
import {
  PlusCircleIcon,
  MailIcon,
  PencilIcon,
  TrashIcon,
  PieChartIcon,
} from "lucide-react";

const SUMMARY_CONFIG = {
  create: {
    label: "Created",
    icon: PlusCircleIcon,
    color: "bg-emerald-500/15 text-emerald-300",
  },
  otp: {
    label: "OTP",
    icon: MailIcon,
    color: "bg-amber-500/15 text-amber-300",
  },
  update: {
    label: "Updated",
    icon: PencilIcon,
    color: "bg-blue-500/15 text-blue-300",
  },
  delete: {
    label: "Deleted",
    icon: TrashIcon,
    color: "bg-red-500/15 text-red-300",
  },
  other: {
    label: "Other",
    icon: PieChartIcon,
    color: "bg-gray-500/15 text-gray-300",
  },
};

export default function ActivitySummary({ range = "7d" }) {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    API.get("/logs/summary", { params: { range } })
      .then((res) => {
        if (!mounted) return;
        const data = (res.data || []).reduce((acc, row) => {
          acc[row.type] = Number(row.count) || 0;
          return acc;
        }, {});
        setSummary(data);
      })
      .catch((err) => {
        console.error("Failed to load log summary:", err.message);
        if (mounted) setSummary({});
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [range]);

  const cards = useMemo(() => Object.entries(SUMMARY_CONFIG), []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(([type, config]) => {
        const Icon = config.icon;
        const value = summary[type] ?? 0;
        return (
          <div
            key={type}
            className="bg-[#111] rounded-2xl p-5 shadow-lg flex items-center gap-4"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-400 uppercase tracking-wide">
                {config.label}
              </span>
              <span className="text-2xl font-semibold text-lightText">
                {loading ? "-" : value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

