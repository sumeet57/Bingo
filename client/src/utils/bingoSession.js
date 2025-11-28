const KEY = "bingoSession";

export function saveBingoSession(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadBingoSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearBingoSession() {
  localStorage.removeItem(KEY);
}
