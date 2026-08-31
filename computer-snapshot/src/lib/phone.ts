/** Normalize env phone for tel: links (digits and leading +) */
export function getTelHref(raw: string | undefined): string {
  const fallback = "+18005550199";
  const v = (raw || fallback).trim();
  const digits = v.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  return `tel:${digits}`;
}

/** Human-readable US-style display when possible */
export function formatPhoneDisplay(raw: string | undefined): string {
  const v = raw?.trim() || "";
  const digits = v.replace(/\D/g, "");
  const core = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (core.length === 10) {
    return `(${core.slice(0, 3)}) ${core.slice(3, 6)}-${core.slice(6)}`;
  }
  return v || "Call us";
}

export function envPhone(): string {
  return import.meta.env.VITE_BUSINESS_PHONE?.trim() || "+18005550199";
}
