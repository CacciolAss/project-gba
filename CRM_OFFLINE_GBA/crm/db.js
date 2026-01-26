// crm/db.js
// SIGNATURE: DBJS_FULL_2025-12-29

const DB_NAME = "crm_offline_v1";
const DB_VERSION = 4;

// ---------- Open / Upgrade ----------
export function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      // --- clients ---
      if (!db.objectStoreNames.contains("clients")) {
        const store = db.createObjectStore("clients", { keyPath: "id" });
        store.createIndex("by_code", "code", { unique: true });
        store.createIndex("by_externalKey", "externalKey", { unique: true });
      } else {
        const store = req.transaction.objectStore("clients");
        if (!store.indexNames.contains("by_code")) store.createIndex("by_code", "code", { unique: true });
        if (!store.indexNames.contains("by_externalKey")) store.createIndex("by_externalKey", "externalKey", { unique: true });
      }

      // --- alerts ---
      if (!db.objectStoreNames.contains("alerts")) {
        const a = db.createObjectStore("alerts", { keyPath: "id" });
        a.createIndex("by_key", "key", { unique: true });
        a.createIndex("by_status", "status", { unique: false });
        a.createIndex("by_clientId", "clientId", { unique: false });
      } else {
        const a = req.transaction.objectStore("alerts");
        if (!a.indexNames.contains("by_key")) a.createIndex("by_key", "key", { unique: true });
        if (!a.indexNames.contains("by_status")) a.createIndex("by_status", "status", { unique: false });
        if (!a.indexNames.contains("by_clientId")) a.createIndex("by_clientId", "clientId", { unique: false });
      }

      // --- audit (append-only) ---
      if (!db.objectStoreNames.contains("audit")) {
        db.createObjectStore("audit", { keyPath: "id" });
      }
      // --- tasks (appuntamenti / task / caring plan) ---
      if (!db.objectStoreNames.contains("tasks")) {
        const t = db.createObjectStore("tasks", { keyPath: "id" });
        t.createIndex("by_ownerId", "ownerId", { unique: false });
        t.createIndex("by_clientId", "clientId", { unique: false });
        t.createIndex("by_status", "status", { unique: false });
        t.createIndex("by_dueAt", "dueAt", { unique: false });
        t.createIndex("by_key", "key", { unique: true }); // chiave logica anti-duplicati
      } else {
        const t = req.transaction.objectStore("tasks");
        if (!t.indexNames.contains("by_ownerId")) t.createIndex("by_ownerId", "ownerId", { unique: false });
        if (!t.indexNames.contains("by_clientId")) t.createIndex("by_clientId", "clientId", { unique: false });
        if (!t.indexNames.contains("by_status")) t.createIndex("by_status", "status", { unique: false });
        if (!t.indexNames.contains("by_dueAt")) t.createIndex("by_dueAt", "dueAt", { unique: false });
        if (!t.indexNames.contains("by_key")) t.createIndex("by_key", "key", { unique: true });
      }

    };

    req.onsuccess = async () => {
      const db = req.result;

      // 📥 Import task da Persona (localStorage → IndexedDB tasks)
      // Eseguito all’avvio CRM, con dedup tramite indice by_key
      try {
        const raw = localStorage.getItem("persona_playbook_tasks_v1");
        if (raw) {
          const imported = JSON.parse(raw);
          if (Array.isArray(imported) && imported.length > 0) {
            const tx = db.transaction("tasks", "readwrite");
            const store = tx.objectStore("tasks");
            let inserted = 0, skipped = 0;

            // ownerId corretto: se Persona non lo sa, lo ricaviamo dalla sessione CRM
            let sessionOwnerId = "UNKNOWN";
            try {
              // session_global.js espone GBA_SESSION nel CRM
              const s = window.GBA_SESSION && typeof window.GBA_SESSION.get === "function" ? window.GBA_SESSION.get() : null;
              sessionOwnerId = String(s?.userId || s?.displayName || "UNKNOWN");
            } catch (e) { }

            for (const t of imported) {
              try {
                // normalizza ownerId se mancante/UNKNOWN
                if (!t.ownerId || t.ownerId === "UNKNOWN") t.ownerId = sessionOwnerId;

                // chiave logica anti-duplicati (se non c’è, la creiamo)
                if (!t.key) {
                  const k = `${t.nodeId || ""}|${t.title || ""}|${t.clientId || ""}|${t.ownerId || ""}`;
                  t.key = k;
                }
                store.put(t);
                inserted++;
              } catch (e) {
                skipped++;
              }
            }

            await txDone(tx);

            // Pulisce localStorage solo dopo commit
            localStorage.removeItem("persona_playbook_tasks_v1");

            console.log(`📥 Import task Persona → CRM: inseriti=${inserted} saltati=${skipped}`);
          }
        }
      } catch (e) {
        console.warn("Errore import task Persona → CRM:", e);
      }

      resolve(db);
    };

    req.onerror = () => reject(req.error);
  });
}

// ---------- Helpers ----------
function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onabort = () => reject(tx.error || new Error("TX aborted"));
    tx.onerror = () => reject(tx.error || new Error("TX error"));
  });
}

function reqDone(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Request error"));
  });
}

// ---------- Clients ----------
export async function addClient(client) {
  const db = await openDb();
  const tx = db.transaction("clients", "readwrite");
  const store = tx.objectStore("clients");
  await reqDone(store.add(client)); // add = fail se dup su keyPath
  await txDone(tx);
  return true;
}

export async function putClient(client) {
  const db = await openDb();
  const tx = db.transaction("clients", "readwrite");
  const store = tx.objectStore("clients");
  await reqDone(store.put(client)); // put = upsert
  await txDone(tx);
  return true;
}

export async function getAllClients() {
  const db = await openDb();
  const tx = db.transaction("clients", "readonly");
  const store = tx.objectStore("clients");
  const res = await reqDone(store.getAll());
  await txDone(tx);
  return res || [];
}

export async function getClientByExternalKey(externalKey) {
  const db = await openDb();
  const tx = db.transaction("clients", "readonly");
  const store = tx.objectStore("clients");

  // usa l'indice se c'è
  if (store.indexNames.contains("by_externalKey")) {
    const idx = store.index("by_externalKey");
    const res = await reqDone(idx.get(externalKey));
    await txDone(tx);
    return res || null;
  }

  // fallback
  const all = await reqDone(store.getAll());
  await txDone(tx);
  return (all || []).find(c => c && c.externalKey === externalKey) || null;
}

// ---------- Alerts ----------
/**
 * Upsert su chiave logica alert.key (unique).
 * alert: { id, key, clientId, type, status, title, payload, createdAt, updatedAt }
 */
export async function upsertAlert(alert) {
  const db = await openDb();
  const tx = db.transaction("alerts", "readwrite");
  const store = tx.objectStore("alerts");

  let existing = null;

  if (store.indexNames.contains("by_key")) {
    const idx = store.index("by_key");
    existing = await reqDone(idx.get(alert.key));
  } else {
    const all = await reqDone(store.getAll());
    existing = (all || []).find(a => a && a.key === alert.key) || null;
  }

  if (existing && existing.id) {
    const merged = {
      ...existing,
      ...alert,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };
    await reqDone(store.put(merged));
  } else {
    const fresh = {
      ...alert,
      createdAt: alert.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await reqDone(store.add(fresh));
  }

  await txDone(tx);
  return true;
}

export async function getAlertsByStatus(status = "active") {
  const db = await openDb();
  const tx = db.transaction("alerts", "readonly");
  const store = tx.objectStore("alerts");

  if (store.indexNames.contains("by_status")) {
    const idx = store.index("by_status");
    const res = await reqDone(idx.getAll(IDBKeyRange.only(status)));
    await txDone(tx);
    return res || [];
  }

  const all = await reqDone(store.getAll());
  await txDone(tx);
  return (all || []).filter(a => a && a.status === status);
}

export async function dismissAlertByKey(key) {
  const db = await openDb();
  const tx = db.transaction("alerts", "readwrite");
  const store = tx.objectStore("alerts");

  let existing = null;

  if (store.indexNames.contains("by_key")) {
    const idx = store.index("by_key");
    existing = await reqDone(idx.get(key));
  } else {
    const all = await reqDone(store.getAll());
    existing = (all || []).find(a => a && a.key === key) || null;
  }

  if (!existing) {
    await txDone(tx);
    return false;
  }

  existing.status = "dismissed";
  existing.updatedAt = new Date().toISOString();
  await reqDone(store.put(existing));

  await txDone(tx);
  return true;
}
// ---------- Tasks / Appuntamenti ----------
/**
 * task: {
 *  id, key, clientId, ownerId,
 *  type: "APPOINTMENT" | "TASK",
 *  title, notes,
 *  dueAt: ISO string,
 *  status: "open" | "done" | "dismissed",
 *  createdAt, updatedAt
 * }
 */
export async function upsertTask(task) {
  const db = await openDb();
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  let existing = null;

  if (store.indexNames.contains("by_key") && task?.key) {
    existing = await reqDone(store.index("by_key").get(task.key));
  }

  if (existing && existing.id) {
    const merged = {
      ...existing,
      ...task,
      id: existing.id,
      updatedAt: new Date().toISOString()
    };
    await reqDone(store.put(merged));
  } else {
    const fresh = {
      ...task,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: task?.status || "open"
    };
    await reqDone(store.add(fresh));
  }

  await txDone(tx);
  return true;
}

export async function getOpenTasksByOwner(ownerId) {
  const db = await openDb();

  // 1) Normalizzazione automatica dei task importati da Persona
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  const all = (await reqDone(store.getAll())) || [];
  let touched = 0;

  for (const t of all) {
    if (!t || typeof t !== "object") continue;

    // Agiamo SOLO sui task Persona
    if (t.source !== "persona_playbook") continue;

    let changed = false;

    // (A) status coerente
    if (typeof t.status === "string") {
      const norm = t.status.trim().toLowerCase();
      if (norm !== t.status) { t.status = norm; changed = true; }
    } else {
      t.status = "open";
      changed = true;
    }

    // (B) auto-claim ownership
    if (!t.ownerId || t.ownerId === "UNKNOWN") {
      t.ownerId = (ownerId || "UNKNOWN").toString().trim() || "UNKNOWN";
      changed = true;
    }

    // (C) chiave logica anti-duplicati
    if (!t.key) {
      t.key = `${t.nodeId || ""}|${t.title || ""}|${t.clientId || ""}|${t.ownerId || ""}`;
      changed = true;
    }

    if (changed) {
      try { await reqDone(store.put(t)); touched++; } catch (e) {}
    }
  }

  await txDone(tx);

  // 2) Ritorna solo i task OPEN del proprietario
  const uid = (ownerId || "").toString().trim();
  return all.filter(t =>
    t &&
    (t.ownerId || "") === uid &&
    ((t.status || "open").toString().trim().toLowerCase() === "open")
  );
}

export async function getTasksDueWithin(days = 3, ownerId = null) {
  const db = await openDb();
  const tx = db.transaction("tasks", "readonly");
  const store = tx.objectStore("tasks");

  const all = await reqDone(store.getAll());
  await txDone(tx);

  const now = Date.now();
  const horizon = now + (Number(days) * 24 * 60 * 60 * 1000);

  return (all || []).filter(t => {
    if (!t || (t.status || "open") !== "open") return false;
    if (ownerId && (t.ownerId || "") !== ownerId) return false;
    const due = t.dueAt ? Date.parse(t.dueAt) : NaN;
    if (!Number.isFinite(due)) return false;
    return due <= horizon;
  }).sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}

export async function markTaskDoneByKey(key) {
  const db = await openDb();
  const tx = db.transaction("tasks", "readwrite");
  const store = tx.objectStore("tasks");

  let existing = null;
  if (store.indexNames.contains("by_key")) {
    existing = await reqDone(store.index("by_key").get(key));
  }

  if (!existing) {
    await txDone(tx);
    return false;
  }

  existing.status = "done";
  existing.updatedAt = new Date().toISOString();
  await reqDone(store.put(existing));

  await txDone(tx);
  return true;
}

// ---------- Audit (append-only) ----------
/**
 * event: { id, ts, type, actor, entityType, entityId, data }
 */
export async function appendAudit(event) {
  const db = await openDb();
  const tx = db.transaction("audit", "readwrite");
  const store = tx.objectStore("audit");

  const e = {
    ...event,
    ts: event.ts || new Date().toISOString()
  };

  await reqDone(store.add(e));
  await txDone(tx);
  return true;
}

// ---------- Access control (Aligned roles, robust normalization) ----------
export async function getVisibleClients(user) {
  const all = await getAllClients();

  // normalizza ruoli sporchi: "General_Manager", "general manager ", "General-Manager", ecc.
  const raw = (user?.role || "").toString();
  const role = raw
    .trim()
    .toUpperCase()
    .replace(/[_-]+/g, " ")     // _ e - diventano spazi
    .replace(/\s+/g, " ");     // spazi multipli -> singolo

  // helper "match by intent" (perché i ruoli in agenzia arrivano sempre fantasiosi)
  const isFullRole =
    role === "ADMIN" ||
    role === "AGENTE" ||
    role === "AGENT" ||
    role === "MANAGER" ||
    role === "GM" ||
    role === "HR" ||
    role.includes("HUMAN RESOURCES") ||
    role.includes("RISORSE UMANE") ||
    role.includes("DIRETTORE") ||               // direttore agenzia / direttore / ecc.
    role.includes("GENERAL MANAGER") ||         // forma canonica
    (role.includes("GENERAL") && role.includes("MANAGER")); // catch-all

  // Team leader: lato DB lo trattiamo come full (lo scope gerarchico resta nel livello app/org.js)
  if (role === "TEAM LEADER" || role === "TEAM_LEADER") return all;

  if (isFullRole) return all;

  // fallback: tutti gli altri vedono solo i propri
  const uid = (user?.id || "").toString().trim();
  return all.filter(c => (c?.ownerId || "") === uid);
}



// ---------- Backup (EXPORT) ----------
export async function exportAllData() {
  const db = await openDb();

  const dump = (storeName) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

  return {
    schema: "crm_offline_v1_backup",
    exportedAt: new Date().toISOString(),
    data: {
      clients: await dump("clients"),
      alerts: await dump("alerts"),
      audit: await dump("audit"),
      tasks: await dump("tasks"),
    }
  };
}

// ---------- Restore (IMPORT) ----------
/**
 * Importa un backup generato da exportAllData().
 *
 * options:
 * - mode: "overwrite" | "merge"   (default: "merge")
 *   overwrite = svuota store e ricarica dal backup
 *   merge     = prova a inserire/aggiornare senza cancellare tutto
 * - includeAudit: boolean (default: true)  // audit è append-only, ma in overwrite lo ricrea
 */
export async function importAllData(backup, options = {}) {
  const mode = (options.mode || "merge").toString().toLowerCase();
  const includeAudit = options.includeAudit !== false;

  // 1) Validazione minima (contratto di restore)
  if (!backup || typeof backup !== "object") throw new Error("Backup non valido: oggetto mancante");
  const supportedSchemas = new Set([
    "crm_offline_v1_backup",
    "TEST_BACKUP_V0"
  ]);

  if (!supportedSchemas.has(backup.schema)) {
    throw new Error(`Schema backup non supportato: ${backup.schema || "(manca)"}`);
  }

  if (!backup.data || typeof backup.data !== "object") throw new Error("Backup non valido: data mancante");

  const clients = Array.isArray(backup.data.clients) ? backup.data.clients : [];
  const alerts = Array.isArray(backup.data.alerts) ? backup.data.alerts : [];
  const audit = Array.isArray(backup.data.audit) ? backup.data.audit : [];
  const tasks = Array.isArray(backup.data.tasks) ? backup.data.tasks : [];

  // 2) Garantisco schema DB (openDb fa upgrade/migrazione)
  const db = await openDb();

  const report = {
    mode,
    importedAt: new Date().toISOString(),
    counts: {
      clients: { processed: 0, upserted: 0, mergedOnUnique: 0, skipped: 0, errors: 0 },
      alerts: { processed: 0, upserted: 0, mergedOnUnique: 0, skipped: 0, errors: 0 },
      audit: { processed: 0, added: 0, skipped: 0, errors: 0 },
    },
    errors: []
  };

  // helper: clear store (solo overwrite)
  async function clearStore(storeName) {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    await reqDone(store.clear());
    await txDone(tx);
  }

  // helper: merge deterministico (preferisce existing.id, poi overlay incoming)
  function mergeExisting(existing, incoming) {
    return {
      ...existing,
      ...incoming,
      id: existing?.id ?? incoming?.id
    };
  }

  // --------- CLIENTS ----------
  if (mode === "overwrite") {
    await clearStore("clients");
  }

  {
    const tx = db.transaction("clients", "readwrite");
    const store = tx.objectStore("clients");

    const idxExternal = store.indexNames.contains("by_externalKey") ? store.index("by_externalKey") : null;
    const idxCode = store.indexNames.contains("by_code") ? store.index("by_code") : null;

    for (const c of clients) {
      report.counts.clients.processed++;

      // requisito minimo: deve esserci id
      if (!c || typeof c !== "object" || !c.id) {
        report.counts.clients.skipped++;
        continue;
      }

      try {
        await reqDone(store.put(c));
        report.counts.clients.upserted++;
      } catch (err) {
        // gestione collisioni su unique index (externalKey / code)
        const name = (err && err.name) ? err.name : "";
        if (name === "ConstraintError") {
          try {
            let existing = null;

            // 1) prova per externalKey
            if (!existing && idxExternal && c.externalKey) {
              existing = await reqDone(idxExternal.get(c.externalKey));
            }
            // 2) prova per code
            if (!existing && idxCode && c.code) {
              existing = await reqDone(idxCode.get(c.code));
            }

            if (existing && existing.id) {
              const merged = mergeExisting(existing, c);
              await reqDone(store.put(merged));
              report.counts.clients.mergedOnUnique++;
            } else {
              report.counts.clients.errors++;
              report.errors.push({ store: "clients", id: c.id, reason: "ConstraintError senza existing risolvibile" });
            }
          } catch (e2) {
            report.counts.clients.errors++;
            report.errors.push({ store: "clients", id: c.id, reason: "Errore merge su ConstraintError", error: String(e2) });
          }
        } else {
          report.counts.clients.errors++;
          report.errors.push({ store: "clients", id: c.id, reason: "Errore put", error: String(err) });
        }
      }
    }

    await txDone(tx);
  }

  // --------- ALERTS ----------
  if (mode === "overwrite") {
    await clearStore("alerts");
  }

  {
    const tx = db.transaction("alerts", "readwrite");
    const store = tx.objectStore("alerts");
    const idxKey = store.indexNames.contains("by_key") ? store.index("by_key") : null;

    for (const a of alerts) {
      report.counts.alerts.processed++;

      if (!a || typeof a !== "object" || !a.id) {
        report.counts.alerts.skipped++;
        continue;
      }

      try {
        await reqDone(store.put(a));
        report.counts.alerts.upserted++;
      } catch (err) {
        const name = (err && err.name) ? err.name : "";
        if (name === "ConstraintError") {
          try {
            let existing = null;
            if (idxKey && a.key) existing = await reqDone(idxKey.get(a.key));

            if (existing && existing.id) {
              const merged = mergeExisting(existing, a);
              merged.updatedAt = new Date().toISOString();
              await reqDone(store.put(merged));
              report.counts.alerts.mergedOnUnique++;
            } else {
              report.counts.alerts.errors++;
              report.errors.push({ store: "alerts", id: a.id, reason: "ConstraintError senza existing risolvibile" });
            }
          } catch (e2) {
            report.counts.alerts.errors++;
            report.errors.push({ store: "alerts", id: a.id, reason: "Errore merge su ConstraintError", error: String(e2) });
          }
        } else {
          report.counts.alerts.errors++;
          report.errors.push({ store: "alerts", id: a.id, reason: "Errore put", error: String(err) });
        }
      }
    }

    await txDone(tx);
  }

  // --------- TASKS ----------
  if (mode === "overwrite") {
    await clearStore("tasks");
  }

  {
    const tx = db.transaction("tasks", "readwrite");
    const store = tx.objectStore("tasks");
    const idxKey = store.indexNames.contains("by_key") ? store.index("by_key") : null;

    // inizializzo contatore tasks nel report (una sola volta)
    report.counts.tasks = report.counts.tasks || { processed: 0, upserted: 0, mergedOnUnique: 0, skipped: 0, errors: 0 };

    for (const t of tasks) {
      report.counts.tasks.processed++;

      if (!t || typeof t !== "object" || !t.id) {
        report.counts.tasks.skipped++;
        continue;
      }

      try {
        await reqDone(store.put(t));
        report.counts.tasks.upserted++;
      } catch (err) {
        const name = (err && err.name) ? err.name : "";
        if (name === "ConstraintError") {
          try {
            let existing = null;
            if (idxKey && t.key) existing = await reqDone(idxKey.get(t.key));

            if (existing && existing.id) {
              const merged = mergeExisting(existing, t);
              merged.updatedAt = new Date().toISOString();
              await reqDone(store.put(merged));
              report.counts.tasks.mergedOnUnique++;
            } else {
              report.counts.tasks.errors++;
              report.errors.push({ store: "tasks", id: t.id, reason: "ConstraintError senza existing risolvibile" });
            }
          } catch (e2) {
            report.counts.tasks.errors++;
            report.errors.push({ store: "tasks", id: t.id, reason: "Errore merge su ConstraintError", error: String(e2) });
          }
        } else {
          report.counts.tasks.errors++;
          report.errors.push({ store: "tasks", id: t.id, reason: "Errore put", error: String(err) });
        }
      }
    }

    await txDone(tx);
  }

  // --------- AUDIT (append-only) ----------
  if (includeAudit) {
    if (mode === "overwrite") {
      await clearStore("audit");
    }

    const tx = db.transaction("audit", "readwrite");
    const store = tx.objectStore("audit");

    for (const e of audit) {
      report.counts.audit.processed++;

      if (!e || typeof e !== "object" || !e.id) {
        report.counts.audit.skipped++;
        continue;
      }

      try {
        // append-only: in merge non sovrascrivo, salto se id già esiste
        if (mode === "merge") {
          const existing = await reqDone(store.get(e.id));
          if (existing) {
            report.counts.audit.skipped++;
            continue;
          }
          await reqDone(store.add(e));
          report.counts.audit.added++;
        } else {
          // overwrite: db pulito, add basta
          await reqDone(store.add(e));
          report.counts.audit.added++;
        }
      } catch (err) {
        report.counts.audit.errors++;
        report.errors.push({ store: "audit", id: e.id, reason: "Errore add", error: String(err) });
      }
    }

    await txDone(tx);
  }

  return report;
}
