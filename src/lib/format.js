// Persian display helpers. All pages using these render in the browser only, so the
// output never differs between server and client render.

const numberFormatter = new Intl.NumberFormat("fa-IR");

export function faNumber(value) {
  const num = Number(value) || 0;
  return numberFormatter.format(num);
}

export function money(value) {
  return `${faNumber(Math.round(Number(value) || 0))} تومان`;
}

export function faDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Tehran",
    ...options,
  }).format(date);
}

export function faDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tehran",
  }).format(date);
}

export function shortDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", timeZone: "Asia/Tehran" }).format(date);
}

export function percent(value, digits = 1) {
  return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: digits }).format(Number(value) || 0)}٪`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}