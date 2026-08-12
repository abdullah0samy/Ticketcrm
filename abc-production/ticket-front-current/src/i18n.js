import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import ar_lang from "./lang/ar.json"
import en_lang from "./lang/en.json"


const resources = {
    en: {
        translation: en_lang
    },
    ar: {
        translation: ar_lang
    }
};

const lang = localStorage.i18nextLng

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: lang,
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: true
        }
    });