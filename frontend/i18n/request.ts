import { getRequestConfig } from 'next-intl/server';
import { locale as getRootLocale } from 'next/root-params';

import { routing } from './routing';

export default getRequestConfig(async () => {
  const locale = await getRootLocale();

  if (
    !locale ||
    !routing.locales.includes(locale as (typeof routing.locales)[number])
  ) {
    return {
      locale: routing.defaultLocale,
      messages: (await import(`../messages/${routing.defaultLocale}.json`))
        .default,
    };
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
