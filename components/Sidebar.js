import Link from "next/link";
import { useRouter } from "next/router";
import { useI18n } from "../i18n/I18nProvider";

export const NAV_LINKS = [
  { key: "nav.dashboard", href: "/dashboard" },
  { key: "nav.projects", href: "/projects" },
  { key: "nav.staff", href: "/staff" },
  { key: "nav.payroll", href: "/payroll" },
  { key: "nav.attendance", href: "/attendance" },
  { key: "nav.settings", href: "/settings" },
];

export default function Sidebar() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <aside className="hidden w-64 bg-[#111] text-lightText p-6 space-y-4 md:block">
      <h2 className="text-lg font-semibold text-matteGold">{t("app.navigation")}</h2>
      <nav className="flex flex-col gap-3 text-lightText/70">
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors ${
              router.pathname === item.href ? "text-matteGold" : "hover:text-matteGold"
            }`}
          >
            {t(item.key)}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
