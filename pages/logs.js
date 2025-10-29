import { useEffect, useState } from "react";
import API from "../utils/api";
import useAuthGuard from "../hooks/useAuthGuard";
import Layout from "../components/Layout";

export default function LogsPage() {
  const isReady = useAuthGuard();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    const fetchLogs = async () => {
      try {
        const res = await API.get("/logs");
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to load logs:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-darkBg text-lightText">
        <h1 className="text-3xl text-matteGold font-semibold mb-6">
          System Activity Log
        </h1>
        {loading ? (
          <p>Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-400">No activity recorded yet.</p>
        ) : (
          <div className="bg-[#111] rounded-2xl p-6 shadow-lg overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="border-b border-[#333] text-matteGold">
                <tr>
                  <th className="py-2 px-4">Time</th>
                  <th className="py-2 px-4">User</th>
                  <th className="py-2 px-4">Action</th>
                  <th className="py-2 px-4">Entity</th>
                  <th className="py-2 px-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[#222] hover:bg-[#1A1A1A]"
                  >
                    <td className="py-2 px-4 text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">{log.user_name || "System"}</td>
                    <td className="py-2 px-4">{log.action}</td>
                    <td className="py-2 px-4">{log.entity_type}</td>
                    <td className="py-2 px-4">{log.details || "—"}</td>
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

