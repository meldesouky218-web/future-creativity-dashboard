import { useState } from "react";
import { useRouter } from "next/router";
import API from "../utils/api";

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!email) return setError("Please enter your email address");

    setLoading(true);
    try {
      const res = await API.post("/auth/otp/request", {
        email,
        purpose: "reset_password",
      });
      setMessage(
        `OTP has been sent to your email. (Demo code: ${
          res.data.demoCode || "******"
        })`
      );
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send OTP. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070F] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-[#0B101C] border border-[#1F2837] rounded-3xl p-8 shadow-2xl space-y-6">
        <h1 className="text-2xl font-semibold text-matteGold text-center">
          Forgot Password
        </h1>
        <p className="text-sm text-lightText/70 text-center">
          Enter your account email to receive a verification code.
        </p>

        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs text-lightText/60 uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-[#1F2837] bg-[#101624] px-3 py-2 text-sm text-lightText focus:border-matteGold focus:outline-none"
              placeholder="you@future.creativity"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <p className="text-xs text-center text-lightText/60">
          Remember your password?{" "}
          <a
            href="/login"
            className="text-matteGold hover:text-[#E9C86C] font-medium"
          >
            Back to login
          </a>
        </p>
      </div>
    </div>
  );
}