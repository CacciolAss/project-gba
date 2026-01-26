/* shared/session_global.js
   Sessione unica offline (localStorage) condivisa tra CRM / Persona / Azienda
*/
(function () {
  const KEY = "gba_session_v1";

  function canonName(v) {
    return (v ?? "").toString().trim().toUpperCase().replace(/\s+/g, " ");
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function readRaw() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function isValidSession(s) {
    if (!s || typeof s !== "object") return false;
    const userId = canonName(s.userId);
    const role = (s.role || "").toString().trim().toUpperCase();
    return !!userId && !!role;
  }

  function getSession() {
    const s = readRaw();
    return isValidSession(s) ? s : null;
  }

  function setSession({ userId, displayName, role }) {
    const session = {
      userId: canonName(userId),
      displayName: (displayName ?? "").toString().trim() || canonName(userId),
      role: (role ?? "CONSULENTE").toString().trim().toUpperCase(),
      issuedAt: nowIso()
    };
    localStorage.setItem(KEY, JSON.stringify(session));
    return session;
  }

  function clearSession() {
    localStorage.removeItem(KEY);
  }

  // Gate: se non sei loggato, o ritorna null o redirige
  function requireSession({ redirectTo } = {}) {
    const s = getSession();
    if (s) return s;
    if (redirectTo) {
      // evita loop inutili: segno dove volevo andare
      try { localStorage.setItem("gba_last_target", location.href); } catch {}
      location.href = redirectTo;
      return null;
    }
    return null;
  }

  // Espongo API globale
  window.GBA_SESSION = {
    KEY,
    canonName,
    get: getSession,
    set: setSession,
    clear: clearSession,
    require: requireSession
  };
})();
