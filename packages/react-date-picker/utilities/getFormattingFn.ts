import { format } from "date-fns";

export function getFormattingFn(
  outputFormat: string,
  locale?: Locale | null,
): (date: Date) => string {
  return locale
    ? (date: Date) => format(date, outputFormat, { locale })
    : (date: Date) => format(date, outputFormat);
}
