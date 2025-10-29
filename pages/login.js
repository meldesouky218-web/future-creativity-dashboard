import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import API from "../utils/api";
import { useI18n } from "../i18n/I18nProvider";

export default function Login() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset password (OTP)
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSendingOtp, setResetSendingOtp] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (token) router.replace("/dashboard");
  }, [router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError("");
    setServiceError("");
    setIsSubmitting(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err) {
      if (!err.response) setServiceError("Service unavailable. Try again.");
      else if (err.response?.status === 401) setAuthError("Invalid credentials.");
      else setServiceError(err.response?.data?.message || "Unable to complete the request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openResetModal = (prefillEmail) => {
    setResetEmail(prefillEmail || email || "");
    setResetPassword("");
    setResetConfirm("");
    setResetOtp("");
    setResetMessage("");
    setResetError("");
    setShowResetPassword(false);
    setShowResetConfirm(false);
    setIsResetOpen(true);
  };
  const closeResetModal = () => setIsResetOpen(false);

  const handleSendResetOtp = async () => {
    const trimmedEmail = resetEmail.trim().toLowerCase();
    if (!trimmedEmail) { setResetError("Enter your account email first."); return; }
    setResetEmail(trimmedEmail);
    setResetError("");
    setResetMessage("");
    setResetSendingOtp(true);
    try {
      const res = await API.post("/auth/otp/request", { email: trimmedEmail, purpose: "reset_password" });
      setResetMessage(`OTP sent (expires in ${res.data.expiresInMinutes} min)`);
    } catch (err) {
      setResetError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setResetSendingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetMessage("");
    if (!resetEmail || !resetPassword || !resetConfirm || !resetOtp) {
      setResetError("All fields are required.");
      return;
    }
    if (resetPassword !== resetConfirm) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetSubmitting(true);
    try {
      await API.post("/users/reset-password", { email: resetEmail, otp: resetOtp, newPassword: resetPassword });
      setResetMessage("Password updated successfully.");
    } catch (err) {
      setResetError(err.response?.data?.message || "Failed to update password");
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0F17] text-lightText flex items-center justify-center p-6">
      {/* Reset password modal */}
      <Transition show={isResetOpen} as={Fragment}>
        <Dialog onClose={closeResetModal} className="relative z-50">
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Transition.Child
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-[#0F1524] border border-[#1F2837] p-6">
                <Dialog.Title className="text-lg font-semibold text-matteGold">Reset password</Dialog.Title>
                <form onSubmit={handleResetPassword} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-lightText/60">Email</label>
                    <input type="email" value={resetEmail} onChange={(e)=>setResetEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs uppercase tracking-wide text-lightText/60">New password</label>
                      <div className="mt-1 flex rounded-lg border border-[#1F2837] bg-[#101624]">
                        <input type={showResetPassword?"text":"password"} value={resetPassword} onChange={(e)=>setResetPassword(e.target.value)} required className="flex-1 rounded-l-lg bg-transparent px-3 py-2 text-sm text-lightText" />
                        <button type="button" onClick={()=>setShowResetPassword(v=>!v)} className="rounded-r-lg border-l border-[#1F2837] px-3 text-xs uppercase tracking-wide text-lightText/60 hover:text-matteGold">{showResetPassword?"Hide":"Show"}</button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-wide text-lightText/60">Confirm</label>
                      <div className="mt-1 flex rounded-lg border border-[#1F2837] bg-[#101624]">
                        <input type={showResetConfirm?"text":"password"} value={resetConfirm} onChange={(e)=>setResetConfirm(e.target.value)} required className="flex-1 rounded-l-lg bg-transparent px-3 py-2 text-sm text-lightText" />
                        <button type="button" onClick={()=>setShowResetConfirm(v=>!v)} className="rounded-r-lg border-l border-[#1F2837] px-3 text-xs uppercase tracking-wide text-lightText/60 hover:text-matteGold">{showResetConfirm?"Hide":"Show"}</button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-lightText/60">OTP code</label>
                    <div className="flex gap-2">
                      <input type="text" value={resetOtp} onChange={(e)=>setResetOtp(e.target.value)} required className="flex-1 rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText" />
                      <button type="button" onClick={handleSendResetOtp} disabled={resetSendingOtp} className="rounded-lg border border-matteGold px-3 py-2 text-xs font-semibold uppercase tracking-wide text-matteGold hover:bg-matteGold hover:text-[#0C0C0C]">{resetSendingOtp?"Sending...":"Send OTP"}</button>
                    </div>
                  </div>
                  {resetError && <p className="text-sm text-red-400">{resetError}</p>}
                  {resetMessage && <p className="text-sm text-royalGreen">{resetMessage}</p>}
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={closeResetModal} className="rounded-lg border border-[#1F2837] px-4 py-2 text-sm text-lightText/70 hover:border-matteGold hover:text-matteGold">Cancel</button>
                    <button type="submit" disabled={resetSubmitting} className="rounded-lg bg-royalGreen px-4 py-2 text-sm font-semibold text-white hover:bg-[#0D745D] disabled:opacity-70">{resetSubmitting?"Updating...":"Update password"}</button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Sign in card */}
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <img src="/logo.png" alt="Future of Creativity" className="mx-auto h-16 w-16 object-contain" />
          <h1 className="text-2xl font-semibold text-matteGold">{t("login.signIn")}</h1>
          <p className="text-sm text-lightText/60">{t("login.welcomeBack")}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-lightText/60">{t("login.email")}</label>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText" placeholder="you@company.com"/>
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase tracking-wide text-lightText/60">{t("login.password")}</label>
            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText" placeholder="••••••••"/>
          </div>
          {authError && <div className="text-sm text-red-400">{authError}</div>}
          {serviceError && <div className="text-sm text-red-400">{serviceError}</div>}
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={()=>openResetModal(email)} className="text-matteGold hover:underline">{t("login.forgot")}</button>
            <Link href="/" className="text-lightText/60 hover:text-lightText">{t("login.home")}</Link>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-royalGreen px-4 py-2 text-sm font-semibold text-white hover:bg-[#0D745D] disabled:opacity-60">{isSubmitting? t("login.signing"): t("login.signIn")}</button>
        </form>
      </div>
    </div>
  );
}
