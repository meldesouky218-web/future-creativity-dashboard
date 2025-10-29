import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import API from "../utils/api";
import { useI18n } from "../i18n/I18nProvider";

export default function Navbar() {
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadMe = async () => {
      try {
        const res = await API.get("/auth/me");
        if (mounted) setMe(res.data || null);
      } catch (e) {
        // ignore; useAuthGuard on pages handles redirects
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadMe();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/login");
  };

  return (
    <header className="w-full bg-[#121212] text-lightText px-6 py-4 flex items-center justify-between shadow-lg">
      <h1 className="text-xl font-semibold text-matteGold">{t("app.title")}</h1>
      <nav className="flex items-center gap-4 text-sm text-lightText/80">
        <button
          type="button"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="rounded-full border border-[#2A2A2A] px-3 py-1 text-lightText/80 hover:text-matteGold"
          title="Language"
        >
          {lang === "ar" ? "EN" : "ع"}
        </button>
        {!loading && (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#2A2A2A] px-3 py-1">
            <div className="h-6 w-6 rounded-full bg-royalGreen/20 border border-royalGreen/40" />
            <span className="font-semibold text-lightText">
              {me?.name || me?.email || "User"}
            </span>
            {me?.role && (
              <span className="text-xs text-lightText/60">· {me.role}</span>
            )}
          </div>
        )}
        <button
          type="button"
          className="rounded-full border border-royalGreen px-3 py-1 text-royalGreen transition-colors hover:bg-royalGreen hover:text-white"
          onClick={handleSignOut}
        >
          {t("app.signOut")}
        </button>
      </nav>
    </header>
  );
}
