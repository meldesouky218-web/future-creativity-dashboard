import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import API from "../utils/api";
import useToast from "../hooks/useToast";

export default function StaffFormModal({ open, onClose, editUser, onSuccess }) {
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff",
    phone: "",
    job_title: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name || "",
        email: editUser.email || "",
        role: editUser.role || "staff",
        phone: editUser.phone || "",
        job_title: editUser.job_title || "",
        status: editUser.status || "active",
      });
    } else {
      setForm({ name: "", email: "", role: "staff", phone: "", job_title: "", status: "active" });
    }
  }, [editUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      addToast("Please fill all required fields.", "error");
      return;
    }

    setLoading(true);
    try {
      if (editUser) {
        await API.put(`/staff/${editUser.id}`, form);
        addToast("✅ User updated successfully!", "success");
      } else {
        const payload = { name: form.name, email: form.email, role: form.role, phone: form.phone, job_title: form.job_title, status: form.status };
        await API.post("/staff", payload);
        addToast("✅ New user added successfully!", "success");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || "❌ Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <Dialog.Panel className="bg-[#0B101C] border border-[#1F2837] rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-lightText/60 hover:text-matteGold"
        >
          <X size={20} />
        </button>

        <Dialog.Title className="text-xl font-semibold text-matteGold mb-4">
          {editUser ? "Edit User" : "Add New User"}
        </Dialog.Title>

        <div className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (optional)" className="w-full bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText" />
            <input name="job_title" value={form.job_title} onChange={handleChange} placeholder="Job title (optional)" className="w-full bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText" />
          </div>

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText"
          >
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
            <option value="supervisor">Supervisor</option>
            <option value="viewer">Viewer</option>
          </select>

          <select name="status" value={form.status} onChange={handleChange} className="w-full bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText">
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="offboarded">Offboarded</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#1F2837] text-lightText/70 hover:border-matteGold hover:text-matteGold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-matteGold text-black font-semibold hover:bg-[#E9C86C]"
          >
            {loading ? "Saving..." : editUser ? "Update" : "Add User"}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
