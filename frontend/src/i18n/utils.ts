import { defaultLang, ui } from './ui';

export function getLangFromUrl(url: URL): 'en' | 'ur' {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as 'en' | 'ur';
  return defaultLang;
}

export function useTranslations(lang: 'en' | 'ur') {
  return function t(key: keyof typeof ui[typeof defaultLang]): string {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
