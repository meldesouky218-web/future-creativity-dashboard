import "@/styles/globals.css";
import { ToastProvider } from "../hooks/useToast"; // ✅ استيراد المزود الأساسي
import { I18nProvider } from "../i18n/I18nProvider";

export default function App({ Component, pageProps }) {
  return (
    <I18nProvider>
      <ToastProvider>
        <Component {...pageProps} />
      </ToastProvider>
    </I18nProvider>
  );
}
