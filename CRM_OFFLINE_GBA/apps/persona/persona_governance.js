// persona_governance.js
// Governance centrale (Persona) — deterministica, auditabile, anti-“furbetti”.
// Non fa DOM, non fa toast. Produce solo un verdict strutturato.

(function () {
  "use strict";

  function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
  }

  function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function normSeverita(raw) {
    const s = (raw || "").toString().toLowerCase().trim();
    if (s === "critico" || s === "critical") return "critico";
    if (s === "alto" || s === "high") return "alto";
    if (s === "medio" || s === "medium") return "medio";
    if (s === "basso" || s === "low") return "basso";
    return "basso";
  }

  function severitaRank(sev) {
    switch (sev) {
      case "critico": return 4;
      case "alto": return 3;
      case "medio": return 2;
      case "basso": return 1;
      default: return 1;
    }
  }

  function penaltyBySev(sev) {
    switch (sev) {
      case "critico": return 30;
      case "alto": return 18;
      case "medio": return 10;
      case "basso": return 4;
      default: return 4;
    }
  }

  /**
   * Crea un “decision graph” auditabile: elenco cause → impatto → azione consigliata.
   * NON inventa contenuto: traduce blocks/warnings/readiness/confidence in nodi leggibili.
   */
  function buildPersonaDecisionGraph({ blocks, warnings, readiness, confidence, meta }) {
    const out = [];

    const push = (type, code, severity, title, action, impact) => {
      out.push({
        type,               // "BLOCK" | "WARNING" | "META"
        code,
        severity,           // critico|alto|medio|basso
        title,
        action,
        impact,             // breve spiegazione “perché pesa”
        readiness,
        confidence
      });
    };

    const b = Array.isArray(blocks) ? blocks : [];
    const w = Array.isArray(warnings) ? warnings : [];

    // Blocchi
    for (const x of b) {
      const sev = normSeverita(x && x.severita);
      const code = (x && x.codice) ? String(x.codice) : "BLOCK_GENERIC";
      const desc = (x && x.descrizione) ? String(x.descrizione) : "Blocco governance.";
      let action = "Completa/correggi il dato mancante prima di usare i risultati.";

      // Azioni più specifiche per codici noti (solo mapping, zero invenzioni)
      if (code.includes("REDDITO")) action = "Inserisci reddito annuo lordo (valore > 0).";
      else if (code.includes("ETA")) action = "Inserisci età o data di nascita.";
      else if (code.includes("CF")) action = "Correggi codice fiscale (16 caratteri alfanumerici).";
      else if (code.includes("FIGLI_GT_NUCLEO")) action = "Correggi nucleo/figli: figli non può superare nucleo.";

      push(
        "BLOCK",
        code,
        sev,
        desc,
        action,
        "Senza questo input l’output non è difendibile."
      );
    }

    // Warning
    for (const x of w) {
      const sev = normSeverita(x && x.severita);
      const code = (x && x.codice) ? String(x.codice) : "WARN_GENERIC";
      const desc = (x && x.descrizione) ? String(x.descrizione) : "Warning governance.";
      let action = "Completa il dato per aumentare l’affidabilità.";

      if (code.includes("SITLAV")) action = "Seleziona situazione lavorativa.";
      else if (code.includes("NUCLEO")) action = "Inserisci componenti nucleo (>= 1).";
      else if (code.includes("GAP")) action = "Completa i dati minimi per il calcolo gap statale.";

      push(
        "WARNING",
        code,
        sev,
        desc,
        action,
        "Output utilizzabile ma con disclaimer."
      );
    }

    // Meta (sempre utile per audit)
    push(
      "META",
      "GOV_META",
      "basso",
      "Metadati governance",
      "Nessuna azione.",
      `Incongruenze=${meta?.incongruenzeCount ?? null}, coerenza=${meta?.coerenza ?? null}, maxRank=${meta?.maxIncongruenzaRank ?? null}`
    );

    return out;
  }

  /**
   * Valuta la “readiness” decisionale e la confidenza, separando:
   * - blocchi HARD (non si dovrebbe produrre output “difendibile”)
   * - warning SOFT (output ok ma con disclaimer)
   */
  function evaluatePersonaGovernance(input) {
    const ana = (input && input.anagrafica) || {};
    const userData = (input && input.userData) || null;
    const answers = (input && input.answers) || {};
    const incongruenze = Array.isArray(input && input.incongruenze) ? input.incongruenze : [];
    const coerenza = (input && input.coerenzaAvanzata) || { indice: null, dettagli: [] };
    const gapStatale = (input && input.gapStatale) || null;

    const blocks = [];
    const warnings = [];
    const notes = [];

    // =========================
    // A) DATA MINIMA (HARD)
    // =========================
    const cf = (ana.codiceFiscale || "").toString().trim().toUpperCase();
    if (cf && (cf.length !== 16 || !/^[A-Z0-9]+$/.test(cf))) {
      blocks.push({
        codice: "DATA_CF_FORMAT",
        severita: "critico",
        descrizione: "Codice fiscale presente ma con formato non valido (lunghezza/caratteri)."
      });
    }

    const eta = toNum(ana.eta != null ? ana.eta : null);
    const reddito = toNum(ana.redditoAnnuo != null ? ana.redditoAnnuo : null);
    const nucleo = toNum(ana.nucleoComponenti != null ? ana.nucleoComponenti : null);
    const figli = toNum(ana.figliMinorenni != null ? ana.figliMinorenni : null);

    if (!Number.isFinite(eta) && !isNonEmptyString(ana.dataNascita)) {
      blocks.push({
        codice: "DATA_ETA_MISSING",
        severita: "alto",
        descrizione: "Manca età e data di nascita: impossibile modellare correttamente tutele/gap."
      });
    }

    if (!Number.isFinite(reddito) || reddito == null || reddito <= 0) {
      blocks.push({
        codice: "DATA_REDDITO_MISSING",
        severita: "alto",
        descrizione: "Reddito annuo mancante o <= 0: i risultati su gap e adeguatezza diventano non difendibili."
      });
    }

    if (nucleo == null || nucleo <= 0) {
      warnings.push({
        codice: "DATA_NUCLEO_MISSING",
        severita: "medio",
        descrizione: "Componenti nucleo non valorizzati o <= 0: alcune inferenze (famiglia/coppia) degradano."
      });
    }

    if (nucleo != null && figli != null && figli > nucleo) {
      blocks.push({
        codice: "DATA_FIGLI_GT_NUCLEO",
        severita: "critico",
        descrizione: "Figli minorenni > componenti nucleo: dato impossibile. Serve correzione prima di qualunque output serio."
      });
    }

    const sitLav = (ana.situazioneLavorativa || "").toString().trim().toLowerCase();
    if (!sitLav) {
      warnings.push({
        codice: "DATA_SITLAV_MISSING",
        severita: "medio",
        descrizione: "Situazione lavorativa mancante: i proxy previdenziali/statali sono meno attendibili."
      });
    }

    // =========================
    // B) MODEL READINESS (HARD/SOFT)
    // =========================
    if (userData == null) {
      blocks.push({
        codice: "MODEL_USERDATA_NULL",
        severita: "alto",
        descrizione: "UserData nullo: il modello non ha input minimi (eta/reddito)."
      });
    }

    if (gapStatale == null) {
      warnings.push({
        codice: "MODEL_GAP_NULL",
        severita: "medio",
        descrizione: "Gap statale non disponibile: i risultati su tutele pubbliche sono incompleti o degradati."
      });
    }

    // =========================
    // C) INCONGRUENZE (engine) → governance vera
    // =========================
    let maxRank = 0;
    let penInc = 0;

    for (const inc of incongruenze) {
      const sev = normSeverita(inc && (inc.severita || inc.livello));
      const r = severitaRank(sev);
      if (r > maxRank) maxRank = r;
      penInc += penaltyBySev(sev);
    }
    if (penInc > 55) penInc = 55;

    // =========================
    // D) COERENZA (influenza confidenza)
    // =========================
    const coe = toNum(coerenza.indice);
    if (coe != null && coe < 60) {
      warnings.push({
        codice: "COERENZA_BASSA",
        severita: "alto",
        descrizione: "Indice coerenza basso: il cliente sta dando segnali contraddittori o dati instabili."
      });
    }

    // =========================
    // E) CONFIDENCE SCORE (0..100)
    // =========================
    let confidence = 100;

    for (const b of blocks) {
      const sev = normSeverita(b.severita);
      confidence -= (sev === "critico") ? 35 : (sev === "alto") ? 22 : 12;
    }

    for (const w of warnings) {
      const sev = normSeverita(w.severita);
      confidence -= (sev === "alto") ? 10 : (sev === "medio") ? 6 : 3;
    }

    confidence -= penInc;

    if (coe != null) {
      if (coe < 60) confidence -= 15;
      else if (coe < 75) confidence -= 8;
      else if (coe < 90) confidence -= 3;
    }

    if (confidence < 0) confidence = 0;
    if (confidence > 100) confidence = 100;

    // =========================
    // F) READINESS VERDICT
    // =========================
    const hasCriticalBlock = blocks.some(b => normSeverita(b.severita) === "critico");
    const hasAnyBlock = blocks.length > 0;

    let readiness = "READY";
    if (hasCriticalBlock) readiness = "BLOCKED";
    else if (hasAnyBlock) readiness = "PARTIAL";

    // =========================
    // G) OUTPUT (auditabile)
    // =========================
    notes.push({
      codice: "GOV_VERSION",
      descrizione: "persona_governance v1.1 — readiness/confidence + decisionGraph"
    });

    const meta = {
      incongruenzeCount: incongruenze.length,
      coerenza: coe,
      maxIncongruenzaRank: maxRank
    };

    // ✅ ECCO IL PEZZO CHE TI MANCAVA: decisionGraph calcolato prima del return
    const decisionGraph = buildPersonaDecisionGraph({
      blocks, warnings, readiness, confidence, meta
    });

    return {
      readiness,             // READY | PARTIAL | BLOCKED
      confidence,            // 0..100
      blocks,                // HARD
      warnings,              // SOFT
      meta,
      notes,
      decisionGraph          // ✅ AGGIUNTO
    };
  }

  // Export globale (offline, no bundler)
  if (typeof window !== "undefined") {
    window.evaluatePersonaGovernance = evaluatePersonaGovernance;
    window.buildPersonaDecisionGraph = buildPersonaDecisionGraph;
  }
})();
