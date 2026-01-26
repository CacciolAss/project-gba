/* =========================
   GOVERNANCE UI (Persona)
   - Banner BLOCKED / PARTIAL / READY
   - Decision Graph (L6)
   - Playbook azioni guidate (L5)
   - Lettura robusta decisionGraph + audit log
   - Nessuna logica di governance core
========================= */

/* =========================
   GOVERNANCE BANNER
========================= */
window.renderGovernanceBannerPersona = function renderGovernanceBannerPersona(governance) {
  const host = document.getElementById("governanceBannerPersona");
  if (!host) return;

  const g = governance && typeof governance === "object" ? governance : null;
  const readiness = String(g?.readiness || "").toUpperCase();

  if (!g || !readiness || readiness === "READY") {
    host.style.display = "none";
    host.innerHTML = "";
    return;
  }

  const blocks = Array.isArray(g.blocks) ? g.blocks : [];
  const warnings = Array.isArray(g.warnings) ? g.warnings : [];

  const isBlocked = readiness === "BLOCKED";
  const title = isBlocked
    ? "RISULTATI NON DIFENDIBILI (BLOCKED)"
    : "RISULTATI PARZIALI (PARTIAL)";

  const bg = isBlocked ? "#FEF2F2" : "#FFFBEB";
  const border = isBlocked ? "#DC2626" : "#EAB308";
  const text = isBlocked ? "#7F1D1D" : "#78350F";

  const items = (isBlocked ? blocks : warnings)
    .map(x => ({
      codice: x?.codice ? String(x.codice) : "UNKNOWN",
      descrizione: x?.descrizione ? String(x.descrizione) : ""
    }))
    .filter(x => x.codice || x.descrizione);

  const listHtml = items.length
    ? `<ul style="margin:8px 0 0 18px; font-size:12px; color:${text};">
        ${items.slice(0, 6).map(it =>
          `<li><strong>${it.codice}</strong>${it.descrizione ? " — " + it.descrizione : ""}</li>`
        ).join("")}
       </ul>`
    : `<div style="font-size:12px; color:${text}; margin-top:6px;">Nessun dettaglio disponibile.</div>`;

  host.style.display = "block";
  host.innerHTML = `
    <div style="
      padding: 10px 12px;
      border-radius: 12px;
      background: ${bg};
      border: 1px solid ${border};
    ">
      <div style="font-weight:800; font-size:13px; color:${text};">
        ${title}
      </div>
      <div style="font-size:12px; color:${text}; margin-top:4px;">
        ${isBlocked
          ? "Completa i dati minimi richiesti prima di usare questi risultati."
          : "Risultati utilizzabili, ma con confidenza degradata."}
      </div>
      ${listHtml}
    </div>
  `;
};

/* =========================
   ACTION BLOCK (opzionale)
========================= */
window.applyGovernanceActionsPersona = function applyGovernanceActionsPersona(governance) {
  const readiness = String(governance?.readiness || "").toUpperCase();
  const isBlocked = readiness === "BLOCKED";

  const idsToBlock = ["btnRiepilogoPersona", "btnStampaPersona", "btnSalvaAnalisiPersona"];
  idsToBlock.forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    b.disabled = !!isBlocked;
    b.style.opacity = isBlocked ? "0.55" : "";
    b.style.cursor = isBlocked ? "not-allowed" : "";
    b.title = isBlocked
      ? "Bloccato: risultati non difendibili (governance BLOCKED). Completa i dati richiesti."
      : "";
  });
};

console.log("✅ persona_governance_ui.js caricato");

/* =========================
   UTIL
========================= */
function _dgEscapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function _normSev(v) {
  const s = String(v ?? "").toLowerCase();
  if (s === "critico" || s === "critical") return "critico";
  if (s === "alto" || s === "high") return "alto";
  if (s === "medio" || s === "medium") return "medio";
  if (s === "basso" || s === "low") return "basso";
  return "info";
}

/* =========================
   L6 — DecisionGraph ViewModel
========================= */
function buildDecisionGraphViewModel(decisionGraph) {
  const list = Array.isArray(decisionGraph) ? decisionGraph : [];
  const sevRank = { critico: 1, alto: 2, medio: 3, basso: 4, info: 5 };

  const nodes = list.map((n, i) => {
    const nodeId = n?.nodeId ?? n?.id ?? `node_${i + 1}`;
    const type = String(n?.type ?? "node");
    const severity = _normSev(n?.severity ?? n?.level ?? n?.severita);
    const title = String(n?.title ?? n?.nome ?? nodeId);
    const description = String(n?.description ?? n?.descrizione ?? "");
    const evidenceRefs = Array.isArray(n?.evidenceRefs) ? n.evidenceRefs : (Array.isArray(n?.evidenze) ? n.evidenze : []);
    const next = Array.isArray(n?.next) ? n.next : (Array.isArray(n?.nextIds) ? n.nextIds : []);

    return {
      nodeId,
      type,
      severity,
      title,
      description,
      evidenceRefs,
      next,
      _rank: sevRank[severity] ?? 99,
      _i: i
    };
  });

  nodes.sort((a, b) => {
    if (a._rank !== b._rank) return a._rank - b._rank;
    const ta = a.type.localeCompare(b.type);
    if (ta !== 0) return ta;
    const ti = a.title.localeCompare(b.title);
    if (ti !== 0) return ti;
    return a._i - b._i;
  });

  const groupsOrder = ["critico", "alto", "medio", "basso", "info"];
  const groupsMap = new Map(groupsOrder.map((k) => [k, []]));
  for (const n of nodes) groupsMap.get(n.severity)?.push(n);

  const groups = groupsOrder
    .map((k) => ({
      key: k,
      label:
        k === "critico" ? "Critici" :
        k === "alto" ? "Alti" :
        k === "medio" ? "Medi" :
        k === "basso" ? "Bassi" : "Info",
      count: groupsMap.get(k)?.length ?? 0,
      nodes: groupsMap.get(k) ?? []
    }))
    .filter((g) => g.count > 0);

  return {
    totals: {
      total: nodes.length,
      critico: groupsMap.get("critico")?.length ?? 0,
      alto: groupsMap.get("alto")?.length ?? 0,
      medio: groupsMap.get("medio")?.length ?? 0,
      basso: groupsMap.get("basso")?.length ?? 0,
      info: groupsMap.get("info")?.length ?? 0
    },
    groups,
    nodes
  };
}

/* =========================
   L5 — Playbook (UI only)
========================= */
function buildPlaybookStepsFromDecisionGraph(vm) {
  const nodes = Array.isArray(vm?.nodes) ? vm.nodes : [];

  const mk = (n, actionType, title, checklist, script, riskIfSkipped) => ({
    stepId: `step_${n.nodeId}`,
    nodeId: n.nodeId,
    severity: n.severity,
    type: n.type,
    title,
    actionType,
    checklist,
    script,
    riskIfSkipped
  });

  return nodes
    .filter(n => String(n.type || "").toUpperCase() !== "META")
    .map(n => {
      const sev = String(n.severity || "").toLowerCase();
      const t = String(n.title || "").toLowerCase();
      const desc = String(n.description || "");

      const nodeType = String(n.type || "").toUpperCase();

// HARD solo se è davvero un BLOCK (non basta "alto")
if (nodeType === "BLOCK") {
  if (t.includes("reddito")) {
    return mk(
      n,
      "DATA_REQUIRED",
      "Raccogli reddito annuo (obbligatorio)",
      [
        "Chiedi reddito annuo lordo (range accettabile se non vuole dettaglio)",
        "Chiedi fonte (busta paga, CU, dichiarazione, stima)",
        "Se rifiuta: marca 'dato non disponibile' + motivazione",
        "Ricalcola analisi"
      ],
      "Per completare l’analisi in modo difendibile mi serve il reddito annuo. Senza, adeguatezza e gap non sono solidi.",
      "Rischio alto: conclusioni su gap/adeguatezza attaccabili."
    );
  }

  return mk(
    n,
    "DATA_REQUIRED",
    "Completa il dato bloccante",
    [
      "Identifica il dato mancante indicato dal nodo",
      "Raccoglilo o registra 'non disponibile' con motivazione",
      "Ricalcola analisi"
    ],
    `Prima di proseguire devo completare un dato bloccante. ${desc}`,
    "Rischio alto: risultati non difendibili."
  );
}

// WARNING (anche se 'alto') = qualità, non blocco
return mk(
  n,
  "QUALITY_IMPROVEMENT",
  "Migliora qualità analisi (consigliato)",
  [
    "Completa il dato mancante indicato",
    "Se non disponibile: registra motivazione",
    "Ricalcola se cambia le inferenze"
  ],
  `Per rendere l’analisi più precisa faccio una domanda di completamento. ${desc}`,
  "Rischio medio: inferenze meno attendibili."
);

    });
}

function renderPlaybookUI(steps) {
  const safe = (s) => _dgEscapeHtml(s);

  if (!Array.isArray(steps) || steps.length === 0) {
    return `<div class="pb-empty">Nessuna azione suggerita.</div>`;
  }

  const pill = (sev) => `<span class="pb-pill pb-${safe(sev)}">${safe(String(sev).toUpperCase())}</span>`;

  return `
    <div class="pb-wrap">
      <div class="pb-head" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
        <strong>Prossime azioni (Playbook)</strong>
        <button id="pbCreateAllTasksBtn" type="button" class="pb-btn">Crea task (tutte)</button>
      </div>

      ${steps.map(st => `
        <div class="pb-step" data-stepid="${safe(st.stepId)}">
          <div class="pb-top">
            ${pill(st.severity)}
            <div class="pb-title">${safe(st.title)}</div>
            <div class="pb-type"><code>${safe(st.actionType)}</code></div>
          </div>

          <div class="pb-script">${safe(st.script)}</div>

          <ul class="pb-check">
            ${st.checklist.map(x => `<li>${safe(x)}</li>`).join("")}
          </ul>

          <div class="pb-risk"><strong>Rischio se ignorata:</strong> ${safe(st.riskIfSkipped)}</div>

          <div class="pb-actions" style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="pb-btn pb-create-task" data-stepid="${safe(st.stepId)}">Crea task</button>
            <button type="button" class="pb-btn pb-copy-script" data-stepid="${safe(st.stepId)}">Copia script</button>
          </div>
        </div>
      `).join("")}

      <div id="pbTasksToast" style="margin-top:10px;font-size:12px;opacity:.8;"></div>
    </div>
  `;
}

/* =========================
   TASK PERSISTENCE (v1)
   - prova IndexedDB store "tasks"
   - fallback su localStorage
========================= */

function _pbNowIso() { return new Date().toISOString(); }

function _pbGetActiveUserId() {
  const u = window.appStatePersona?.user;
  return String(u?.consulente?.id || u?.consulente?.codice || u?.id || "UNKNOWN");
}

function _pbGuessClient() {
  const a = window.appStatePersona?.user?.anagrafica || {};
  const clientId = a.id || a.clientId || a.codice || "";
  const clientName = [a.nome, a.cognome].filter(Boolean).join(" ").trim();
  return { clientId: String(clientId || ""), clientName: String(clientName || "") };
}

function _pbDueAtForStep(step) {
  // regola semplice: DATA_REQUIRED = 1 giorno, QUALITY_IMPROVEMENT = 7 giorni
  const now = Date.now();
  const t = String(step?.actionType || "");
  const delta = (t === "DATA_REQUIRED") ? (24 * 60 * 60 * 1000) : (7 * 24 * 60 * 60 * 1000);
  return new Date(now + delta).toISOString();
}

function _pbBuildTaskFromStep(step) {
  const { clientId, clientName } = _pbGuessClient();
  return {
    id: `pb_${step.stepId}_${Date.now()}`,
    source: "persona_playbook",
    createdAt: _pbNowIso(),
    dueAt: _pbDueAtForStep(step),
    status: "OPEN",
    ownerId: _pbGetActiveUserId(),
    clientId,
    clientName,
    severity: String(step.severity || ""),
    actionType: String(step.actionType || ""),
    title: String(step.title || ""),
    script: String(step.script || ""),
    checklist: Array.isArray(step.checklist) ? step.checklist.slice(0) : [],
    riskIfSkipped: String(step.riskIfSkipped || ""),
    nodeId: String(step.nodeId || "")
  };
}

/* ---------- localStorage fallback ---------- */
function _pbReadTasksLS() {
  try {
    const raw = localStorage.getItem("persona_playbook_tasks_v1");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function _pbWriteTasksLS(tasks) {
  try {
    localStorage.setItem("persona_playbook_tasks_v1", JSON.stringify(tasks || []));
    return true;
  } catch (e) { return false; }
}
function _pbDedupKey(step) {
  const a = window.appStatePersona?.user?.anagrafica || {};
  const clientId = a.id || a.clientId || a.codice || "";
  return `${step.nodeId}|${step.title}|${clientId}|${_pbGetActiveUserId()}`;
}

/* ---------- IndexedDB attempt ---------- */
function _pbOpenDb(name, version) {
  return new Promise((resolve) => {
    try {
      const req = (version ? indexedDB.open(name, version) : indexedDB.open(name));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch (e) { resolve(null); }
  });
}

async function _pbOpenCrmDbBestEffort() {
  // tentativi conservativi: non facciamo upgrade qui.
  const candidates = [
    { name: "crm_offline_v1" },
    { name: "crm_offline_v2" },
    { name: "crm_offline" }
  ];

  // se avete esposto un nome DB da qualche parte, lo usiamo
  const hinted = window.CRM_DB_NAME ? [{ name: String(window.CRM_DB_NAME) }] : [];
  const list = hinted.concat(candidates);

  for (const c of list) {
    const db = await _pbOpenDb(c.name);
    if (db) return db;
  }
  return null;
}

function _pbIdbPut(db, storeName, obj) {
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const req = store.put(obj);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) { resolve(false); }
  });
}

async function _pbTrySaveTaskIndexedDB(task) {
  const db = await _pbOpenCrmDbBestEffort();
  if (!db) return { ok: false, reason: "db_not_found" };

  // serve store "tasks"
  if (!db.objectStoreNames || !db.objectStoreNames.contains("tasks")) {
    try { db.close(); } catch (e) {}
    return { ok: false, reason: "store_tasks_missing" };
  }

  const ok = await _pbIdbPut(db, "tasks", task);
  try { db.close(); } catch (e) {}
  return { ok, reason: ok ? "" : "put_failed" };
}

async function pbPersistTask(step) {
  // dedup logico (prima)
  const tasks = _pbReadTasksLS();
  const key = _pbDedupKey(step);
  const exists = tasks.some(t => `${t.nodeId}|${t.title}|${t.clientId}|${t.ownerId}` === key);
  if (exists) return { ok: true, created: 0, dedup: 1, storage: "dedup" };

  const task = _pbBuildTaskFromStep(step);

  // 1) prova IndexedDB CRM
  const idb = await _pbTrySaveTaskIndexedDB(task);
  if (idb.ok) {
    // metto comunque una traccia leggera in LS per diagnosi/dedup futuro
    tasks.push(task);
    _pbWriteTasksLS(tasks);
    return { ok: true, created: 1, dedup: 0, storage: "indexeddb" };
  }

  // 2) fallback localStorage (non perdiamo l’azione)
  tasks.push(task);
  const okLS = _pbWriteTasksLS(tasks);
  return { ok: okLS, created: okLS ? 1 : 0, dedup: 0, storage: "localstorage", reason: idb.reason };
}

async function pbPersistAllTasks(steps) {
  let created = 0, dedup = 0;
  let lastStorage = "";
  for (const s of (steps || [])) {
    const r = await pbPersistTask(s);
    if (!r.ok) return { ok: false, created, dedup, storage: r.storage, reason: r.reason };
    created += r.created || 0;
    dedup += r.dedup || 0;
    lastStorage = r.storage || lastStorage;
  }
  return { ok: true, created, dedup, storage: lastStorage };
}

async function _pbCopyToClipboard(text) {
  try { await navigator.clipboard.writeText(String(text || "")); return true; }
  catch (e) { return false; }
}

function _pbBindPlaybookHandlers(steps) {
  const toast = document.getElementById("pbTasksToast");
  const say = (msg) => { if (toast) toast.textContent = msg; };

  const allBtn = document.getElementById("pbCreateAllTasksBtn");
  if (allBtn) {
    allBtn.onclick = async () => {
      const res = await pbPersistAllTasks(steps);
      if (!res.ok) return say(`❌ Task non salvati. motivo=${res.reason || "unknown"}`);
      const via = res.storage === "indexeddb" ? "CRM (IndexedDB)" : (res.storage === "localstorage" ? "localStorage" : res.storage);
      say(`✅ Task creati: ${res.created} · già presenti: ${res.dedup} · salvati su: ${via}`);
    };
  }

  document.querySelectorAll(".pb-create-task").forEach(btn => {
    btn.onclick = async () => {
      const stepId = btn.getAttribute("data-stepid");
      const step = (steps || []).find(x => x.stepId === stepId);
      if (!step) return say("❌ Step non trovato.");
      const res = await pbPersistTask(step);
      if (!res.ok) return say(`❌ Task non salvato. motivo=${res.reason || "unknown"}`);
      if (res.dedup) return say("ℹ️ Task già presente (dedup).");
      const via = res.storage === "indexeddb" ? "CRM (IndexedDB)" : "localStorage";
      say(`✅ Task creato · salvato su: ${via}`);
    };
  });

  document.querySelectorAll(".pb-copy-script").forEach(btn => {
    btn.onclick = async () => {
      const stepId = btn.getAttribute("data-stepid");
      const step = (steps || []).find(x => x.stepId === stepId);
      if (!step) return say("❌ Step non trovato.");
      const ok = await _pbCopyToClipboard(step.script || "");
      say(ok ? "✅ Script copiato." : "❌ Clipboard non disponibile.");
    };
  });
}


/* =========================
   RENDER DecisionGraph + Playbook
========================= */
function renderDecisionGraphUI(containerEl, vm) {
  if (!containerEl) return;

  if (!vm || !vm.nodes || vm.nodes.length === 0) {
    containerEl.innerHTML = `<div class="dg-empty">Nessun decisionGraph disponibile.</div>`;
    return;
  }

  const steps = buildPlaybookStepsFromDecisionGraph(vm);

  const badge = (sev) => {
    const s = _dgEscapeHtml(sev);
    return `<span class="dg-badge dg-${s}">${s.toUpperCase()}</span>`;
  };

  const nodeCard = (n) => {
    const evid = Array.isArray(n.evidenceRefs) ? n.evidenceRefs : [];
    const next = Array.isArray(n.next) ? n.next : [];
    return `
      <div class="dg-card" data-nodeid="${_dgEscapeHtml(n.nodeId)}">
        <div class="dg-card-head">
          ${badge(n.severity)}
          <div class="dg-title">${_dgEscapeHtml(n.title)}</div>
          <div class="dg-meta">type: <code>${_dgEscapeHtml(n.type)}</code> · id: <code>${_dgEscapeHtml(n.nodeId)}</code></div>
        </div>
        ${n.description ? `<div class="dg-desc">${_dgEscapeHtml(n.description)}</div>` : ``}
        <div class="dg-foot">
          <div class="dg-evidence">evidenze: <strong>${evid.length}</strong></div>
          <div class="dg-next">next: <strong>${next.length}</strong></div>
        </div>
      </div>
    `;
  };

  const groupBlock = (g) => `
    <div class="dg-group">
      <div class="dg-group-head">
        <div class="dg-group-title">${_dgEscapeHtml(g.label)} <span class="dg-count">(${g.count})</span></div>
      </div>
      <div class="dg-grid">
        ${g.nodes.map(nodeCard).join("")}
      </div>
    </div>
  `;

  containerEl.innerHTML = `
    <div class="dg-wrap">
      <div class="dg-summary">
        <div><strong>DecisionGraph</strong> nodi: ${vm.totals.total}</div>
        <div class="dg-summary-badges">
          <span class="dg-pill dg-critico">critico: ${vm.totals.critico}</span>
          <span class="dg-pill dg-alto">alto: ${vm.totals.alto}</span>
          <span class="dg-pill dg-medio">medio: ${vm.totals.medio}</span>
          <span class="dg-pill dg-basso">basso: ${vm.totals.basso}</span>
          <span class="dg-pill dg-info">info: ${vm.totals.info}</span>
        </div>
      </div>

      ${vm.groups.map(groupBlock).join("")}

      ${renderPlaybookUI(steps)}
    </div>
  `;
  // Bind handlers Playbook (task + clipboard)
  try {
    _pbBindPlaybookHandlers(steps);
  } catch (e) {
    console.warn("Playbook handlers non agganciati:", e);
  }
}
/* =========================
   TASK BRIDGE (v0) — localStorage
   - Non rompe nulla
   - Audit minimale
   - Prossimo step: sostituzione con IndexedDB tasks store
========================= */
function _pbNowIso() {
  return new Date().toISOString();
}

function _pbGetActiveUserId() {
  // best-effort: usa consulente id se esiste
  const u = window.appStatePersona?.user;
  return String(u?.consulente?.id || u?.consulente?.codice || u?.id || "UNKNOWN");
}

function _pbReadTasksLS() {
  try {
    const raw = localStorage.getItem("persona_playbook_tasks_v1");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function _pbWriteTasksLS(tasks) {
  try {
    localStorage.setItem("persona_playbook_tasks_v1", JSON.stringify(tasks || []));
    return true;
  } catch (e) {
    return false;
  }
}

function pbCreateTask(step) {
  const tasks = _pbReadTasksLS();
  // dedup semplice: nodeId + title + clientId + ownerId
  const key = `${step.nodeId}|${step.title}|${window.appStatePersona?.user?.anagrafica?.id || ""}|${_pbGetActiveUserId()}`;
  const exists = tasks.some(t => `${t.nodeId}|${t.title}|${t.clientId}|${t.ownerId}` === key);
  if (exists) return { ok: true, created: 0, dedup: 1 };

  const task = _pbBuildTaskFromStep(step);
  tasks.push(task);
  const ok = _pbWriteTasksLS(tasks);
  return { ok, created: ok ? 1 : 0, dedup: 0 };
}

function pbCreateAllTasks(steps) {
  let created = 0, dedup = 0;
  for (const s of (steps || [])) {
    const r = pbCreateTask(s);
    if (r.created) created += 1;
    if (r.dedup) dedup += 1;
    if (!r.ok) return { ok: false, created, dedup };
  }
  return { ok: true, created, dedup };
}

async function _pbCopyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(String(text || ""));
    return true;
  } catch (e) {
    return false;
  }
}

function _pbBindPlaybookHandlers(steps) {
  const toast = document.getElementById("pbTasksToast");
  const say = (msg) => { if (toast) toast.textContent = msg; };

  // crea tutte
  const allBtn = document.getElementById("pbCreateAllTasksBtn");
  if (allBtn) {
    allBtn.onclick = () => {
      const res = pbCreateAllTasks(steps);
      if (!res.ok) return say("❌ Salvataggio task fallito (localStorage).");
      say(`✅ Task creati: ${res.created} · già presenti: ${res.dedup}`);
    };
  }

  // per-step
  document.querySelectorAll(".pb-create-task").forEach(btn => {
    btn.onclick = () => {
      const stepId = btn.getAttribute("data-stepid");
      const step = (steps || []).find(x => x.stepId === stepId);
      if (!step) return say("❌ Step non trovato.");
      const res = pbCreateTask(step);
      if (!res.ok) return say("❌ Salvataggio task fallito (localStorage).");
      say(res.created ? "✅ Task creato." : "ℹ️ Task già presente (dedup).");
    };
  });

  document.querySelectorAll(".pb-copy-script").forEach(btn => {
    btn.onclick = async () => {
      const stepId = btn.getAttribute("data-stepid");
      const step = (steps || []).find(x => x.stepId === stepId);
      if (!step) return say("❌ Step non trovato.");
      const ok = await _pbCopyToClipboard(step.script || "");
      say(ok ? "✅ Script copiato." : "❌ Clipboard non disponibile.");
    };
  });
}

/* =========================
   MOUNT (ROBUSTO + AUDIT)
========================= */
function mountDecisionGraphUI(opts = {}) {
  const { retries = 12, delayMs = 300, force = false } = opts;

  const ids = ["decisionGraphContainer", "personaDecisionGraph", "decisionGraph", "dgContainer"];
  const containerEl = ids.map((id) => document.getElementById(id)).find(Boolean);
  if (!containerEl) return;

  const r0 = window.appStatePersona?.risultati || window.__PERSONA_LAST_RESULTS__ || {};
  const dg =
  (Array.isArray(r0.decisionGraph) ? r0.decisionGraph : null) ||
  (Array.isArray(r0?.inferenze?.decisionGraph) ? r0.inferenze.decisionGraph : null) ||
  (Array.isArray(r0?.governance?.decisionGraph) ? r0.governance.decisionGraph : null) ||
  (Array.isArray(window.__PERSONA_GOVERNANCE__?.decisionGraph) ? window.__PERSONA_GOVERNANCE__.decisionGraph : null) ||
  (Array.isArray(window.__PERSONA_GOVERNANCE__?.inferenze?.decisionGraph) ? window.__PERSONA_GOVERNANCE__.inferenze.decisionGraph : null) ||
  (Array.isArray(window.__PERSONA_GOVERNANCE__?.governance?.decisionGraph) ? window.__PERSONA_GOVERNANCE__.governance.decisionGraph : null) ||
  [];


  // Audit: path decisionGraph effettivo
  try {
  if (!window.__DG_AUDIT_LOGGED__) {
    window.__DG_AUDIT_LOGGED__ = true;
    console.log("🧾 DG path audit:", {
      root: Array.isArray(r0.decisionGraph) ? r0.decisionGraph.length : 0,
      inferenze: Array.isArray(r0?.inferenze?.decisionGraph) ? r0.inferenze.decisionGraph.length : 0,
      governance: Array.isArray(r0?.governance?.decisionGraph) ? r0.governance.decisionGraph.length : 0,
      globalGov: Array.isArray(window.__PERSONA_GOVERNANCE__?.decisionGraph) ? window.__PERSONA_GOVERNANCE__.decisionGraph.length : 0
    });
  }
} catch (e) {}


  const hasGraph = Array.isArray(dg) && dg.length > 0;

  if (hasGraph || force) {
    const vm = buildDecisionGraphViewModel(dg);
    renderDecisionGraphUI(containerEl, vm);
    return;
  }

  if (retries <= 0) {
    renderDecisionGraphUI(containerEl, { nodes: [] });
    return;
  }

  setTimeout(() => {
    mountDecisionGraphUI({ retries: retries - 1, delayMs, force: false });
  }, delayMs);
}

/* =========================
   STILE MINIMO (incl. Playbook)
========================= */
(function _dgInjectStyleOnce() {
  if (document.getElementById("dgStyleV1")) return;
  const st = document.createElement("style");
  st.id = "dgStyleV1";
  st.textContent = `
    .dg-wrap{padding:10px}
    .dg-summary{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px}
    .dg-summary-badges{display:flex;gap:8px;flex-wrap:wrap}
    .dg-pill{padding:4px 8px;border-radius:999px;background:#eee;font-size:12px}
    .dg-group{margin:12px 0}
    .dg-group-head{margin:6px 0}
    .dg-group-title{font-weight:700}
    .dg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:10px}
    .dg-card{border:1px solid rgba(0,0,0,.12);border-radius:12px;padding:10px;background:#fff}
    .dg-card-head{display:flex;flex-direction:column;gap:6px}
    .dg-title{font-weight:800;font-size:14px}
    .dg-meta{font-size:12px;opacity:.75}
    .dg-desc{margin-top:8px;font-size:13px;line-height:1.35}
    .dg-foot{display:flex;gap:12px;margin-top:10px;font-size:12px;opacity:.85}
    .dg-badge{display:inline-block;width:max-content;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:800}
    .dg-critico{background:#ffe5e5}
    .dg-alto{background:#fff1d6}
    .dg-medio{background:#fff8cc}
    .dg-basso{background:#e8f5ff}
    .dg-info{background:#efefef}
    .dg-empty{padding:10px;opacity:.75}

    .pb-wrap{margin-top:14px;padding:10px;border:1px dashed rgba(0,0,0,.18);border-radius:12px;background:rgba(0,0,0,.02)}
    .pb-head{margin-bottom:8px}
    .pb-step{border:1px solid rgba(0,0,0,.10);border-radius:12px;padding:10px;background:#fff;margin:8px 0}
    .pb-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .pb-title{font-weight:800}
    .pb-type{opacity:.8;font-size:12px}
    .pb-script{margin-top:8px;font-size:13px}
    .pb-check{margin:8px 0 0 18px}
    .pb-risk{margin-top:8px;font-size:12px;opacity:.9}
    .pb-pill{padding:3px 8px;border-radius:999px;background:#eee;font-size:11px;font-weight:800}
    .pb-critico{background:#ffe5e5}
    .pb-alto{background:#fff1d6}
    .pb-medio{background:#fff8cc}
    .pb-basso{background:#e8f5ff}
    .pb-info{background:#efefef}
    .pb-empty{opacity:.7;padding:8px}
    .pb-btn{border:1px solid rgba(0,0,0,.15);background:#fff;border-radius:10px;padding:6px 10px;font-size:12px;cursor:pointer}
    .pb-btn:hover{background:rgba(0,0,0,.03)}
  `;
  document.head.appendChild(st);
})();

/* =========================
   EXPORT
========================= */
window.buildDecisionGraphViewModel = buildDecisionGraphViewModel;
window.mountDecisionGraphUI = mountDecisionGraphUI;
