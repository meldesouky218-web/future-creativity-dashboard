import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import API from "../utils/api";

export default function VerifyOtp() {
  const router = useRouter();
  const { email } = router.query;
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || !newPassword || !confirmPassword)
      return setError("جميع الحقول مطلوبة.");
    if (newPassword !== confirmPassword)
      return setError("كلمتا المرور غير متطابقتين.");

    setLoading(true);
    try {
      const res = await API.post("/users/reset-password", {
        email,
        otp,
        newPassword,
      });
      setMessage("تم تحديث كلمة المرور بنجاح! سيتم تحويلك لتسجيل الدخول...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "فشل تحديث كلمة المرور. تأكد من الكود وحاول مجددًا."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    try {
      const res = await API.post("/auth/otp/request", {
        email,
        purpose: "reset_password",
      });
      setMessage(
        `تم إرسال كود تحقق جديد. (رمز الاختبار: ${
          res.data.demoCode || "******"
        })`
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "حدث خطأ أثناء إعادة إرسال الكود."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#05070F] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#0B101C] border border-[#1F2837] rounded-3xl p-8 shadow-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-matteGold text-center">
          Verify OTP
        </h1>
        <p className="text-sm text-lightText/70 text-center">
          Enter the 6-digit OTP sent to your email{" "}
          <span className="text-matteGold font-medium">{email}</span> and set a
          new password.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs text-lightText/60 uppercase mb-1">
              OTP Code
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText focus:border-matteGold focus:outline-none"
              placeholder="6 digits"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-lightText/60 uppercase mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText focus:border-matteGold focus:outline-none"
              placeholder="********"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-lightText/60 uppercase mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText focus:border-matteGold focus:outline-none"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-royalGreen">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-matteGold py-3 text-sm font-semibold text-[#121212] hover:bg-[#D6B65C] disabled:opacity-80"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>

        <p className="text-xs text-center text-lightText/60 mt-2">
          Didn’t receive OTP?{" "}
          <button
            onClick={handleResend}
            className="text-matteGold hover:text-[#E9C86C]"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}