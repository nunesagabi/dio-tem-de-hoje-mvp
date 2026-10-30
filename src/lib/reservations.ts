const KEY = "tdh_reservas";

export type LocalReservation = { id: string; token: string; kit: string; at: string };

export function saveReservationLocally(id: string, token: string, kit: string) {
  try {
    const list: LocalReservation[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!list.some((r) => r.id === id)) list.unshift({ id, token, kit, at: new Date().toISOString() });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    /* ignore */
  }
}

export function getLocalToken(id: string) {
  try {
    const list: LocalReservation[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return list.find((r) => r.id === id)?.token ?? null;
  } catch {
    return null;
  }
}
