import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./fr.json";
import en from "./en.json";
import ar from "./ar.json";

/**
 * Interface language is FR (default) or EN. AR is used only for
 * guest-facing wedding invitation content on /invite/:slug, applied
 * separately via wedding_invitations.locale — see README § Interface languages.
 */
i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
