import { Fragment, useEffect, useMemo, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Layout from "../components/Layout";
import useAuthGuard from "../hooks/useAuthGuard";
import API from "../utils/api";

const INITIAL_FORM = {
  name: "",
  description: "",
  location_lat: "",
  location_lng: "",
  radius: 200,
  start_date: "",
  end_date: "",
  pay_type: "monthly",
  pay_rate: "",
  allowances: "",
  supervisor_id: "",
};

const PAY_TYPES = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Daily", value: "daily" },
  { label: "Hourly", value: "hourly" },
];

export default function Projects() {
  const isReady = useAuthGuard();
  const [projects, setProjects] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewProjectId, setViewProjectId] = useState("");

  useEffect(() => {
    if (!isReady) return;
    const bootstrap = async () => {
      setLoading(true);
      setPageError("");
      try {
        // اجلب المشاريع أولاً — متاحة لكل المستخدمين الموثقين
        const projectsRes = await API.get("/projects");
        setProjects(projectsRes.data || []);

        // اجلب قائمة المشرفين من مسار staff (مسموح لـ admin/manager)
        // لو فشل الطلب (403 لغير المصرح لهم)، استمر بعرض المشاريع بدون قائمة مشرفين
        try {
          const staffRes = await API.get("/staff");
          const filtered =
            staffRes.data?.filter((user) =>
              ["supervisor", "manager", "admin"].includes(user.role)
            ) ?? [];
          setSupervisors(filtered);
        } catch (e) {
          setSupervisors([]);
        }
      } catch (err) {
        setPageError("Unable to load projects. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [isReady]);

  const supervisorOptions = useMemo(() => {
    return supervisors.length ? (
      supervisors.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name || user.email} — {user.role}
        </option>
      ))
    ) : (
      <option value="">No supervisors available</option>
    );
  }, [supervisors]);

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(INITIAL_FORM);
    setFeedback("");
    setFormError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback("");
    setFormError("");
    try {
      let allowances = null;
      if (formData.allowances) {
        try {
          allowances = JSON.parse(formData.allowances);
        } catch (parseError) {
          setFormError(
            'Allowances must be valid JSON (example: {"housing":200}).'
          );
          setIsSubmitting(false);
          return;
        }
      }

      const payload = {
        ...formData,
        location_lat: formData.location_lat
          ? Number(formData.location_lat)
          : null,
        location_lng: formData.location_lng
          ? Number(formData.location_lng)
          : null,
        radius: formData.radius ? Number(formData.radius) : 200,
        pay_rate: formData.pay_rate ? Number(formData.pay_rate) : null,
        allowances,
        supervisor_id: formData.supervisor_id
          ? Number(formData.supervisor_id)
          : null,
      };

      const response = await API.post("/projects", payload);
      setProjects((prev) => [response.data, ...prev]);
      setFeedback("Project created successfully.");
      setFormData(INITIAL_FORM);
      setTimeout(() => {
        closeModal();
      }, 600);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to create project. Please review the details.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) return null;

  return (
    <Layout>
      {/* Quick View to open the new project page */}
      <div className="px-6 pt-6">
        <div className="flex items-center justify-end gap-3">
          <select
            value={viewProjectId}
            onChange={(e) => setViewProjectId(e.target.value)}
            className="bg-[#101624] border border-[#1F2837] rounded-lg px-3 py-2 text-sm text-lightText"
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || `#${p.id}`}
              </option>
            ))}
          </select>
          <a
            href={viewProjectId ? `/projects/${viewProjectId}` : `#`}
            className={`text-xs rounded-full px-3 py-2 border border-matteGold ${
              viewProjectId
                ? "text-matteGold hover:bg-matteGold hover:text-black"
                : "text-lightText/40 cursor-not-allowed pointer-events-none"
            }`}
          >
            View
          </a>
        </div>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl text-matteGold font-semibold">Projects</h1>
          <p className="text-lightText/70 mt-2">
            Manage active projects and assign supervisors.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-royalGreen px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0D745D]"
        >
          + New Project
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-lightText/70">Loading projects...</p>
        ) : pageError ? (
          <p className="text-red-400">{pageError}</p>
        ) : projects.length === 0 ? (
          <p className="text-lightText/70">
            No projects yet. Create one to get started.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#1F1F1F] bg-[#121212] shadow-lg">
            <table className="min-w-full divide-y divide-[#1F1F1F]">
              <thead className="bg-[#181818]">
                <tr>
                  {[
                    "Name",
                    "Supervisor",
                    "Pay Type",
                    "Rate",
                    "Dates",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-lightText/60"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-[#1A1A1A]">
                    <td className="px-4 py-3 text-sm font-semibold text-lightText">
                      <p>{project.name}</p>
                      <p className="text-xs text-lightText/50">
                        {project.description}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80">
                      {project.supervisor_id || project.supervisor
                        ? project.supervisor?.name || `#${project.supervisor_id}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80 capitalize">
                      {project.pay_type || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80">
                      {project.pay_rate ? `${project.pay_rate}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80">
                      <span>
                        {project.start_date
                          ? new Date(project.start_date).toLocaleDateString()
                          : "—"}
                      </span>
                      {" • "}
                      <span>
                        {project.end_date
                          ? new Date(project.end_date).toLocaleDateString()
                          : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-lightText/80">
                      {project.status || "Active"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-20" onClose={closeModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/60" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-[#141414] p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title className="text-xl font-semibold text-matteGold">
                      Create Project
                    </Dialog.Title>
                    <p className="text-sm text-lightText/60 mt-1">
                      Define the project details and assign a supervisor.
                    </p>

                    <form
                      className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
                      onSubmit={handleCreateProject}
                    >
                      <div className="md:col-span-2">
                        <label className="text-sm text-lightText/70">
                          Project Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm text-lightText/70">
                          Description
                        </label>
                        <textarea
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                          placeholder="Overview, scope, or notes..."
                        />
                      </div>

                      <div>
                        <label className="text-sm text-lightText/70">
                          Start Date
                        </label>
                        <input
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-lightText/70">
                          End Date
                        </label>
                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-lightText/70">
                          Pay Type
                        </label>
                        <select
                          name="pay_type"
                          value={formData.pay_type}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        >
                          {PAY_TYPES.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm text-lightText/70">
                          Pay Rate
                        </label>
                        <input
                          type="number"
                          name="pay_rate"
                          min="0"
                          step="0.01"
                          value={formData.pay_rate}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-lightText/70">
                          Latitude
                        </label>
                        <input
                          type="number"
                          name="location_lat"
                          value={formData.location_lat}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-lightText/70">
                          Longitude
                        </label>
                        <input
                          type="number"
                          name="location_lng"
                          value={formData.location_lng}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-lightText/70">
                          Radius (meters)
                        </label>
                        <input
                          type="number"
                          name="radius"
                          min="50"
                          step="10"
                          value={formData.radius}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-lightText/70">
                          Supervisor
                        </label>
                        <select
                          name="supervisor_id"
                          value={formData.supervisor_id}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        >
                          <option value="">Select supervisor</option>
                          {supervisorOptions}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-sm text-lightText/70">
                          Allowances (JSON)
                        </label>
                        <textarea
                          name="allowances"
                          rows={2}
                          placeholder='مثال: {"housing": 200, "transport": 150}'
                          value={formData.allowances}
                          onChange={handleInputChange}
                          className="mt-1 w-full rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2 text-sm text-lightText focus:border-royalGreen focus:outline-none"
                        />
                      </div>

                      {formError && (
                        <p className="md:col-span-2 text-sm text-red-400">
                          {formError}
                        </p>
                      )}
                      {feedback && (
                        <p className="md:col-span-2 text-sm text-royalGreen">
                          {feedback}
                        </p>
                      )}

                      <div className="md:col-span-2 mt-4 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-sm text-lightText/80 transition-colors hover:border-lightText/40"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-lg bg-royalGreen px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0D745D] disabled:cursor-not-allowed disabled:bg-royalGreen/50"
                        >
                          {isSubmitting ? "Saving..." : "Create Project"}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
    </Layout>
  );
}
