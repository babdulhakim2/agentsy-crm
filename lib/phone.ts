export function normalizePhoneNumber(raw?: string): string {
  const input = raw?.trim() ?? "";
  if (!input) return "";
  const hasLeadingPlus = input.startsWith("+");
  let digits = input.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("00")) digits = digits.slice(2);

  if (hasLeadingPlus) {
    if (digits.startsWith("44")) return `+${digits}`;
    return `+${digits}`;
  }

  if (digits.startsWith("44")) return `+${digits}`;
  if (digits.startsWith("0")) return `+44${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith("7")) return `+44${digits}`;
  return digits;
}

export function phoneIdentityKey(raw?: string): string {
  return normalizePhoneNumber(raw).replace(/^\+/, "");
}
