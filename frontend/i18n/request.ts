import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

/**
 * Locales supported by the application.
 * Add new locales here and create a matching JSON file under /messages.
 */
export const locales = ["fa" , "en"] as const;
export type Locale = (typeof locales)[number];

/**
 * Default locale used when no locale can be determined
 * from the URL or user preferences.
 */
export const defaultLocale: Locale = "fa";

/**
 * Type guard to ensure a string is a supported locale.
 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

/**
 * next-intl request configuration.
 *
 * For each incoming request, load the translation messages
 * matching the resolved locale.
 */
export default getRequestConfig(async ({ locale }) => {
  // If the locale is not one of the supported ones, return 404.
  if (!isLocale(locale)) {
    notFound();
  }

  return {
    locale, 
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});