import { useState, useEffect } from "react";
import Link from "next/link";
import API from "../utils/api";
import Layout from "../components/Layout";
import StaffFormModal from "../components/StaffFormModal";

export default function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadUsers = () =>
    API.get("/staff")
      .then((res) => setUsers(res.data))
      .catch(() => setError("Failed to fetch staff list"));

  // ✅ تحميل قائمة المستخدمين
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <Layout title="User Management">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-matteGold">Staff</h2>
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-matteGold px-4 py-2 text-sm font-semibold text-black hover:bg-[#E6C869]"
          >
            + Add User
          </button>
        </div>
        <p className="text-lightText/70 mb-6">
          Browse users, then open a profile to edit role or reset password.
        </p>

        {/* ✅ قائمة المستخدمين */}
        <div>
          <h3 className="text-lg text-matteGold mb-3 font-semibold">
            Existing users
          </h3>
          <ul className="space-y-2 text-sm text-lightText/80">
            {users.map((user) => (
              <li
                key={user.id}
                className="border-b border-[#1F2837] pb-2 flex justify-between items-center hover:bg-[#151A28] transition rounded-md px-3 py-1"
              >
                <div>
                  <Link
                    href={`/staff/${user.id}`}
                    className="text-matteGold hover:underline"
                  >
                    {user.name || "Unnamed"}{" "}
                    <span className="text-lightText/50">#{user.id}</span>
                  </Link>
                  <span className="ml-2 text-lightText/70">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`/staff/${user.id}`}
                    className="text-xs rounded-full px-3 py-1 border border-matteGold text-matteGold hover:bg-matteGold hover:text-black"
                  >
                    View
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <StaffFormModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={loadUsers}
      />
    </Layout>
  );
}
