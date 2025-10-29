import Link from "next/link";
import { useRouter } from "next/router";
import Navbar from "./Navbar";
import Sidebar, { NAV_LINKS } from "./Sidebar";
import { ToastProvider } from "./Toast"; // ✅ استدعاء مكوّن التوست
import { useI18n } from "../i18n/I18nProvider";

export default function Layout({ children }) {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <ToastProvider>
      <div className="min-h-screen bg-darkBg text-lightText">
        <Navbar />
        <div className="flex min-h-[calc(100vh-72px)]">
          <Sidebar />
          <div className="flex flex-1 flex-col">
            <main className="flex-1 px-4 py-8 sm:px-6 lg:px-12">{children}</main>

            {/* ✅ شريط التنقل السفلي للموبايل */}
            <nav className="sticky bottom-0 left-0 right-0 z-10 flex justify-around border-t border-[#1F1F1F] bg-[#0D0D0D]/95 py-3 text-xs text-lightText/70 backdrop-blur md:hidden">
              {NAV_LINKS.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-semibold transition-colors ${
                      isActive ? "text-matteGold" : "hover:text-matteGold"
                    }`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
