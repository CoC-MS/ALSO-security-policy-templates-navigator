import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getLocaleFromPath, getLocalePath, type Locale } from "./i18n";

const LanguageContext = createContext<{
  locale: Locale;
  changeLocale: (locale: Locale) => void;
}>({ locale: "en", changeLocale: () => {} });

export function LocaleProvider({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(() =>
    initialLocale ?? getLocaleFromPath(window.location.pathname, import.meta.env.BASE_URL),
  );

  useEffect(() => {
    function syncLocale() {
      setLocale(getLocaleFromPath(window.location.pathname, import.meta.env.BASE_URL));
    }
    window.addEventListener("popstate", syncLocale);
    return () => window.removeEventListener("popstate", syncLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function changeLocale(nextLocale: Locale) {
    window.history.pushState(null, "", getLocalePath(nextLocale, import.meta.env.BASE_URL));
    setLocale(nextLocale);
  }

  return (
    <LanguageContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export const useLocale = () => useLanguage().locale;
