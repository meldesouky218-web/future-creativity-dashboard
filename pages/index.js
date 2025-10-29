import Link from "next/link";
import { useI18n } from "../i18n/I18nProvider";

export default function Home() {
  const { t, lang, setLang } = useI18n();
  return (
    <main className="min-h-screen bg-[#0C0F17] flex flex-col items-center justify-center text-lightText">
      <div className="w-full max-w-4xl mx-auto px-6 text-center">
        <div className="flex flex-col items-center gap-6">
          <img src="/logo.png" alt="Future of Creativity" className="w-40 h-40 object-contain" />
          <h1 className="text-4xl md:text-5xl font-semibold text-matteGold">{t("app.welcome")}</h1>
          <p className="text-lightText/70 max-w-2xl">{t("home.subtitle")}</p>
          <div className="flex items-center gap-4 mt-2">
            <Link
              href="/login"
              className="rounded-full bg-matteGold px-6 py-3 font-semibold text-black hover:bg-[#E6C869]"
            >
              {t("app.enterPanel")}
            </Link>
            <a
              href="#learn"
              className="rounded-full border border-[#335] px-6 py-3 font-semibold text-lightText/80 hover:text-matteGold hover:border-matteGold"
            >
              {t("app.learnMore")}
            </a>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="rounded-full border border-[#2A2A2A] px-4 py-3 text-lightText/80 hover:text-matteGold">
              {lang === "ar" ? "EN" : "ع"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
