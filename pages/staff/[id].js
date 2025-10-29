import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import API from "../../utils/api";
import useToast from "../../hooks/useToast";

export default function StaffProfile() {
  const router = useRouter();
  const { id } = router.query;
  const { addToast } = useToast();

  const [user, setUser] = useState(null);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [pageError, setPageError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [formData, setFormData] = useState({ name: "", role: "", phone: "", job_title: "", status: "active" });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        const res = await API.get(`/staff/${id}`);
        const payload = res.data?.user ? res.data : { user: res.data };
        setUser(payload.user);
        setFormData({
          name: payload.user.name || "",
          role: payload.user.role || "staff",
          phone: payload.user.phone || "",
          job_title: payload.user.job_title || "",
          status: payload.user.status || "active",
        });
        setRecentAssignments(payload.recentAssignments || []);
        setRecentAttendance(payload.recentAttendance || []);
        try {
          const [c, p] = await Promise.all([
            API.get(`/staff/${id}/contracts`),
            API.get(`/staff/${id}/payroll`),
          ]);
          setContracts(Array.isArray(c.data) ? c.data : []);
          setPayroll(Array.isArray(p.data) ? p.data : []);
        } catch (e) {
          // ignore if not authorized to see
        }
        addToast("✅ User data loaded successfully", "success");
      } catch (err) {
        setPageError("Failed to fetch user data");
        addToast("❌ Failed to load user data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSave = async () => {
    // keep page content; errors handled by toast
    try {
      await API.put(`/staff/${id}`, formData);
      // refetch snapshot to ensure data fresh
      try {
        const refreshed = await API.get(`/staff/${id}`);
        const payload = refreshed.data?.user ? refreshed.data : { user: refreshed.data };
        setUser(payload.user);
      } catch {}
      setEditing(false);
      addToast("✅ User info updated successfully!", "success");
    } catch (err) {
      addToast("❌ Failed to update user", "error");
    }
  };

  const handleAdminReset = async () => {
    setResetError("");
    if (!newPassword) {
      setResetError("New password is required");
      addToast("❌ Enter a new password", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetError("Passwords do not match");
      addToast("❌ Passwords do not match", "error");
      return;
    }
    setResetting(true);
    try {
      await API.post(`/staff/admin-reset`, { email: user.email, newPassword });
      setNewPassword("");
      setConfirmPassword("");
      addToast("✅ Password updated successfully (admin reset)", "success");
    } catch (err) {
      setResetError(err.response?.data?.message || "Failed to reset password");
      addToast("❌ Failed to reset password", "error");
    } finally {
      setResetting(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <div className="p-8 text-lightText/70">Loading profile...</div>
      </Layout>
    );

  if (pageError)
    return (
      <Layout>
        <div className="p-8 text-red-400">{pageError}</div>
      </Layout>
    );

  if (!user)
    return (
      <Layout>
        <div className="p-8 text-lightText/70">No user data found.</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="p-8 text-lightText">
        {/* العنوان */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl text-matteGold font-semibold">
              {user.name}
            </h1>
            <p className="text-lightText/70">{user.email}</p>
          </div>
          <button
            onClick={() => router.push("/staff")}
            className="px-4 py-2 rounded-full border border-matteGold text-matteGold text-sm hover:bg-matteGold hover:text-black"
          >
            ← Back to list
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-[#1F2837] mb-6">
          {[
            { k: "profile", label: "Profile" },
            { k: "attendance", label: "Attendance" },
            { k: "assignments", label: "Assignments" },
            { k: "contracts", label: "Contracts" },
            { k: "payroll", label: "Payroll" },
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

        {/* ✅ بيانات الموظف + الصلاحيات */}
        <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-6 shadow-lg space-y-4">
          <div>
            <label className="text-sm text-lightText/70">Name</label>
            <input
              type="text"
              value={formData.name}
              disabled={!editing}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full mt-1 rounded-lg px-3 py-2 text-sm ${
                editing
                  ? "bg-[#101624] border border-matteGold"
                  : "bg-[#1A1F2E] border border-[#2A3144]"
              } text-lightText`}
            />
          </div>

          <div>
            <label className="text-sm text-lightText/70">Email</label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full mt-1 bg-[#1A1F2E] border border-[#2A3144] rounded-lg px-3 py-2 text-sm text-lightText/70"
            />
          </div>

          <div>
            <label className="text-sm text-lightText/70">Role</label>
            <select
              value={formData.role}
              disabled={!editing}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              className={`w-full mt-1 rounded-lg px-3 py-2 text-sm ${
                editing
                  ? "bg-[#101624] border border-matteGold"
                  : "bg-[#1A1F2E] border border-[#2A3144]"
              } text-lightText`}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="staff">Staff</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-lightText/70">Created At</label>
            <p className="text-lightText/50 text-sm mt-1">
              {new Date(user.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 rounded-lg bg-matteGold text-black text-sm font-semibold hover:bg-[#E5C46B]"
              >
                Edit Info
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-lg border border-[#333] text-sm text-lightText/70 hover:text-matteGold hover:border-matteGold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-lg bg-royalGreen text-white text-sm font-semibold hover:bg-[#0D745D]"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {/* ✅ Reset password (Admin only) */}
        <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-6 shadow-lg space-y-4 mt-8">
          <h3 className="text-matteGold font-semibold">Reset Password</h3>
          <p className="text-lightText/60 text-sm">
            Set a new password for this user. This action requires admin/manager privileges.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-lightText/70">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 bg-[#101624] border border-[#2A3144] rounded-lg px-3 py-2 text-sm text-lightText"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="text-sm text-lightText/70">Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-1 bg-[#101624] border border-[#2A3144] rounded-lg px-3 py-2 text-sm text-lightText"
                placeholder="••••••••"
              />
            </div>
          </div>
          {resetError && (
            <div className="text-red-400 text-sm">{resetError}</div>
          )}
          <div className="flex justify-end">
            <button
              onClick={handleAdminReset}
              disabled={resetting}
              className="px-4 py-2 rounded-lg bg-royalGreen text-white text-sm font-semibold hover:bg-[#0D745D] disabled:opacity-60"
            >
              {resetting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Tabs content */}
        {activeTab === "attendance" && (
          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-6 mt-6">
            {Array.isArray(recentAttendance) && recentAttendance.length ? (
              <ul className="space-y-2 text-sm">
                {recentAttendance.map((r) => (
                  <li key={r.id} className="border-b border-[#1F2837] pb-2">
                    <div className="flex justify-between">
                      <span>{r.check_type?.toUpperCase()} • {r.status} {r.project_id ? `(Project #${r.project_id})` : ""}</span>
                      <span className="text-lightText/60">{new Date(r.created_at).toLocaleString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lightText/60 text-sm">No attendance yet.</p>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-6 mt-6">
            {Array.isArray(recentAssignments) && recentAssignments.length ? (
              <ul className="space-y-2 text-sm">
                {recentAssignments.map((a) => (
                  <li key={a.id} className="border-b border-[#1F2837] pb-2">
                    <div className="flex justify-between">
                      <span>{a.project_name} — {a.role_in_project || "Member"}</span>
                      <span className="text-lightText/60">{a.start_date || "-"}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lightText/60 text-sm">No assignments yet.</p>
            )}
          </div>
        )}

        {activeTab === "contracts" && (
          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-6 mt-6">
            {contracts.length ? (
              <ul className="space-y-2 text-sm">
                {contracts.map((c) => (
                  <li key={c.id} className="border-b border-[#1F2837] pb-2">
                    <div className="flex items-center justify-between">
                      <div>Project #{c.project_id}</div>
                      <div className="flex items-center gap-3 text-xs">
                        {c.file_url ? (
                          <a href={c.file_url.startsWith("http") ? c.file_url : `http://localhost:5000${c.file_url}`} target="_blank" rel="noreferrer" className="text-matteGold underline">Open</a>
                        ) : null}
                        <span className="text-lightText/60">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lightText/60 text-sm">No contracts yet.</p>
            )}
          </div>
        )}

        {activeTab === "payroll" && (
          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-6 mt-6">
            {payroll.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-lightText/60">
                    <th className="py-2">Project</th>
                    <th className="py-2">Days</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Approved</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((row) => (
                    <tr key={row.id} className="border-t border-[#1F2837]">
                      <td className="py-2">#{row.project_id}</td>
                      <td className="py-2">{row.total_days ?? "-"}</td>
                      <td className="py-2">{row.total_amount}</td>
                      <td className="py-2">{row.approved ? "Yes" : "No"}</td>
                      <td className="py-2">{new Date(row.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-lightText/60 text-sm">No payroll records.</p>
            )}
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-[#101624] border border-[#1F2837] rounded-2xl p-5">
            <h3 className="text-matteGold font-semibold mb-3">Attendance</h3>
            <p className="text-lightText/60 text-sm">
              Attendance tracking integration coming soon...
            </p>
          </div>
          <div className="bg-[#101624] border border-[#1F2837] rounded-2xl p-5">
            <h3 className="text-matteGold font-semibold mb-3">Contracts</h3>
            <p className="text-lightText/60 text-sm">
              Contract management will appear here...
            </p>
          </div>
          <div className="bg-[#101624] border border-[#1F2837] rounded-2xl p-5">
            <h3 className="text-matteGold font-semibold mb-3">Payroll</h3>
            <p className="text-lightText/60 text-sm">
              Payroll calculations will be integrated soon...
            </p>
          </div>
        </div>

        {/* Contracts and Payroll */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
            <h3 className="text-matteGold font-semibold mb-3">Contracts</h3>
            {contracts.length ? (
              <ul className="space-y-2 text-sm">
                {contracts.map((c) => (
                  <li key={c.id} className="border-b border-[#1F2837] pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        Project #{c.project_id}
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {c.file_url ? (
                          <a
                            href={c.file_url.startsWith("http") ? c.file_url : `http://localhost:5000${c.file_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-matteGold underline"
                          >
                            Open
                          </a>
                        ) : null}
                        <span className="text-lightText/60">
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lightText/60 text-sm">No contracts yet.</p>
            )}
          </div>
          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
            <h3 className="text-matteGold font-semibold mb-3">Payroll</h3>
            {payroll.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-lightText/60">
                    <th className="py-2">Project</th>
                    <th className="py-2">Days</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Approved</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll.map((row) => (
                    <tr key={row.id} className="border-t border-[#1F2837]">
                      <td className="py-2">#{row.project_id}</td>
                      <td className="py-2">{row.total_days ?? "-"}</td>
                      <td className="py-2">{row.total_amount}</td>
                      <td className="py-2">{row.approved ? "Yes" : "No"}</td>
                      <td className="py-2">{new Date(row.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-lightText/60 text-sm">No payroll records.</p>
            )}
          </div>
        </div>

        {/* Recent Assignments + Attendance */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
            <h3 className="text-matteGold font-semibold mb-3">Recent Assignments</h3>
            {Array.isArray(recentAssignments) && recentAssignments.length ? (
              <ul className="space-y-2 text-sm">
                {recentAssignments.map((a) => (
                  <li key={a.id} className="border-b border-[#1F2837] pb-2">
                    <div className="flex justify-between">
                      <span>
                        {a.project_name} — {a.role_in_project || "Member"}
                      </span>
                      <span className="text-lightText/60">
                        {a.start_date || "-"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lightText/60 text-sm">No assignments yet.</p>
            )}
          </div>

          <div className="bg-[#0F1524] border border-[#1F2837] rounded-2xl p-5">
            <h3 className="text-matteGold font-semibold mb-3">Recent Attendance</h3>
            {Array.isArray(recentAttendance) && recentAttendance.length ? (
              <ul className="space-y-2 text-sm">
                {recentAttendance.map((r) => (
                  <li key={r.id} className="border-b border-[#1F2837] pb-2">
                    <div className="flex justify-between">
                      <span>
                        {r.status} {r.project_id ? `(Project #${r.project_id})` : ""}
                      </span>
                      <span className="text-lightText/60">
                        {new Date(r.created_at).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lightText/60 text-sm">No attendance yet.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
