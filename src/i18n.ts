import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// @ts-expect-error - next-intl types don't match runtime API
export default getRequestConfig(async (opts: { requestLocale: Promise<string> }) => {
  const locale = await opts.requestLocale;

  // Validate locale
  const validLocale = routing.locales.includes(locale as (typeof routing.locales)[number]) ? locale : routing.defaultLocale;
  
  return {
    locale: validLocale,
    messages: (await import(`../../public/locales/${validLocale}/common.json`)).default
  };
});