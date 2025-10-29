import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./translations/en.json";
import ar from "./translations/ar.json";

const langs = { en, ar };

function get(obj, path, fallback) {
  return path.split(".").reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj) ?? fallback ?? path;
}

const I18nContext = createContext({ lang: "en", t: (k, f) => f ?? k, setLang: () => {} });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
      if (saved && langs[saved]) setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  const setLang = useCallback((l) => {
    if (!langs[l]) return;
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  }, []);

  const dict = langs[lang] || langs.en;
  const t = useCallback((key, fallback) => get(dict, key, fallback), [dict]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

