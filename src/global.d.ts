declare module 'next-intl' {
  export function useTranslations(namespace?: string): (key: string, values?: Record<string, string | number>) => string;
  export function useLocale(): string;
  export function useFormatter(): {
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
    formatDate: (value: Date | string, options?: Intl.DateTimeFormatOptions) => string;
    formatRelativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  };
  export function useMessages(): Record<string, unknown>;
  export function getMessages(locale: string): Promise<Record<string, unknown>>;
  export function getRequestConfig(): Promise<{ locale: string; messages: Record<string, unknown> }>;
  export const unstable_setRequestLocale: (locale: string) => void;
}

declare module 'next-intl/server' {
  export function getRequestConfig(): Promise<{ locale: string; messages: Record<string, unknown> }>;
  export function unstable_setRequestLocale(locale: string): void;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

interface ImportMetaEnv {
  readonly NEXT_PUBLIC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}