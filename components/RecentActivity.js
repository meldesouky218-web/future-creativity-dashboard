import { useEffect, useState } from "react";
import Link from "next/link";
import API from "../utils/api";
import {
  PlusCircleIcon,
  TrashIcon,
  PencilIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";

const RANGE_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "This Month" },
];

const getColorAndIcon = (action = "") => {
  const normalized = action.toLowerCase();
  if (normalized.includes("create") || normalized.includes("register"))
    return { color: "text-green-400", Icon: PlusCircleIcon };
  if (normalized.includes("update") || normalized.includes("reset"))
    return { color: "text-blue-400", Icon: PencilIcon };
  if (normalized.includes("delete") || normalized.includes("remove"))
    return { color: "text-red-400", Icon: TrashIcon };
  if (normalized.includes("otp") || normalized.includes("email"))
    return { color: "text-yellow-400", Icon: MailIcon };
  return { color: "text-gray-400", Icon: UserIcon };
};

const formatDetails = (log) => {
  if (log.details) return log.details;
  if (log.entity_type && log.entity_id)
    return `${log.entity_type.toUpperCase()} #${log.entity_id}`;
  return "No details";
};

export default function RecentActivity({ range = "7d", onRangeChange }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    API.get("/logs", { params: { range } })
      .then((res) => {
        if (mounted) {
          setLogs(res.data.slice(0, 5));
        }
      })
      .catch((err) => {
        console.error("Failed to load recent activity:", err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [range]);

  return (
    <div className="bg-[#111] p-6 rounded-2xl shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-matteGold font-semibold">
          Recent Activity
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={range}
            onChange={(event) => onRangeChange?.(event.target.value)}
            className="bg-[#1A1A1A] border border-[#333] text-sm text-lightText rounded-lg px-3 py-2 focus:border-matteGold focus:outline-none"
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Link
            href="/logs"
            className="text-sm text-[#C2A14A] hover:underline hover:text-[#e0bf6a]"
          >
            View All →
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500 text-sm">No activity yet.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {logs.map((log) => {
            const { color, Icon } = getColorAndIcon(log.action || "");
            return (
              <li key={log.id} className="border-b border-[#222] pb-2">
                <div className="flex items-start gap-2">
                  <Icon className={`w-4 h-4 ${color} mt-1`} />
                  <div className="flex-1">
                    <span className="text-gray-300">
                      <strong className={`${color}`}>
                        {log.action || "Event"}
                      </strong>{" "}
                      – {formatDetails(log)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {log.user_name ? `${log.user_name} · ` : ""}
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}