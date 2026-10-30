const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatBRL(v: number | string | null | undefined) {
  if (v === null || v === undefined || v === "") return "";
  return brl.format(Number(v));
}

export function formatTime(t: string | null | undefined) {
  if (!t) return "";
  return t.slice(0, 5).replace(":", "h");
}

export function formatDate(d: string | null | undefined) {
  if (!d) return "";
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function formatShortDate(d: string | null | undefined) {
  if (!d) return "";
  const [y, m, day] = d.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("pt-BR");
}

export function formatDateTime(ts: string | null | undefined) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPhone(p: string | null | undefined) {
  const d = (p ?? "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return p ?? "";
}

export const tipoLabel: Record<string, string> = {
  padaria: "Padaria",
  cafeteria: "Cafeteria",
  confeitaria: "Confeitaria",
};

/** Turn backend error messages into friendly text. */
export function errMsg(e: unknown) {
  const m = (e as { message?: string })?.message ?? String(e);
  return m || "Algo deu errado. Tente novamente.";
}

/** Units still available = stock − committed. Pure helper used by tests. */
export function available(estoqueTotal: number, committed: number) {
  return Math.max(estoqueTotal - committed, 0);
}
