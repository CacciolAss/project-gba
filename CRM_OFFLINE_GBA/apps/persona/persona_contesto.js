// persona_contesto.js
// Costruzione del contestoPersona a partire dall'anagrafica
// Nessun side effect: funzioni PURE, riutilizzabili, offline friendly.

(function () {
    "use strict";
/**
 * =========================
 * CONTRATTI DATI (V1) — CONTEXTO PERSONA
 * Single source of truth per shape/semantica del contesto.
 * =========================
 */

/**
 * @typedef {Object} ContestoPersonaCluster
 * @property {string} etaCluster            - es: "eta_under30" | "eta_30-45" | "eta_45-60" | ...
 * @property {string} statoFamiliare        - es: "stato_single" | "stato_coppia" | "stato_famiglia" | ...
 * @property {string} lavoroCluster         - es: "lavoro_dipendente" | "lavoro_autonomo" | "lavoro_pensionato" | "lavoro_altro"
 */

/**
 * @typedef {Object.<string, boolean>} ContestoPersonaFlag
 * - flag derivati (true/false) usati come segnali per segmentazione
 */

/**
 * @typedef {Object} ContestoPersona
 * @property {Object} anagrafica            - snapshot anagrafica input (non “verità assoluta”, ma input utente)
 * @property {ContestoPersonaCluster} cluster
 * @property {ContestoPersonaFlag} flag
 * @property {string[]} segmenti            - tassonomia “low/high level” (es: eta_*, stato_*, lavoro_*, profilo_*)
 * @property {string[]} warnings            - warning di costruzione contesto (non incongruenze questionario)
 */

/**
 * ESEMPIO (V1):
 * const contestoPersona = {
 *   anagrafica: {...},
 *   cluster: { etaCluster:"eta_under30", statoFamiliare:"stato_single", lavoroCluster:"lavoro_altro" },
 *   flag: { figliMinorenni:false, ... },
 *   segmenti: ["eta_under30","stato_single","lavoro_altro","profilo_S1_single_under30"],
 *   warnings: []
 * }
 */


    /**
     * Deriva il cluster età a partire da un numero (anni).
     * Possibili valori:
     *  - "under30"
     *  - "30-45"
     *  - "46-60"
     *  - "over60"
     *  - null (se età non valida)
     */
    function deriveEtaCluster(eta) {
        if (eta == null || !isFinite(Number(eta))) return null;
        const age = Number(eta);

        if (age < 30) return "under30";
        if (age >= 30 && age <= 45) return "30-45";
        if (age >= 46 && age <= 60) return "46-60";
        if (age > 60) return "over60";

        return null;
    }

    /**
     * Deriva lo stato familiare macro a partire da:
     *  - nucleoComponenti
     *  - figliMinorenni
     *  - eta (per intercettare il "bamboccione")
     *
     * Possibili valori:
     *  - "single"
     *  - "coppia_senza_figli"
     *  - "famiglia_con_figli"
     *  - "bamboccione"
     */
    function deriveStatoFamiliare(ana) {
        if (!ana || typeof ana !== "object") return null;

        const nucleo = ana.nucleoComponenti != null ? Number(ana.nucleoComponenti) : null;
        const figli = ana.figliMinorenni != null ? Number(ana.figliMinorenni) : 0;
        const eta = ana.eta != null ? Number(ana.eta) : null;

        // default prudenziale
        let stato = "single";

        if (nucleo != null && nucleo > 1 && figli > 0) {
            stato = "famiglia_con_figli";
        } else if (nucleo != null && nucleo > 1 && figli === 0) {
            stato = "coppia_senza_figli";
        }

        // Euristica "bamboccione":
        // - vive in un nucleo > 1
        // - nessun figlio a carico
        // - età adulta ma non avanzata
        if (
            nucleo != null &&
            nucleo > 1 &&
            figli === 0 &&
            eta != null &&
            eta >= 25 &&
            eta <= 40
        ) {
            stato = "bamboccione";
        }

        return stato;
    }

    /**
     * Deriva il cluster lavoro a partire da "situazioneLavorativa".
     * Allineato alla logica già usata in buildUserDataPersona.
     *
     * Possibili valori:
     *  - "dipendente"
     *  - "autonomo"
     *  - "imprenditore"
     *  - "pensionato"
     *  - "altro" (fallback)
     */
    function deriveLavoroCluster(ana) {
        if (!ana || typeof ana !== "object") return null;
        const sit = (ana.situazioneLavorativa || "").toString().toLowerCase().trim();

        switch (sit) {
            case "dipendente":
            case "dirigente":
                return "dipendente";
            case "autonomo":
                return "autonomo";
            case "imprenditore":
                return "imprenditore";
            case "pensionato":
                return "pensionato";
            default:
                return "altro";
        }
    }

    /**
     * Costruisce i flag booleani e di stato semplice a partire dall'anagrafica.
     * I flag sono pensati per filtrare domande e suggerimenti.
     */
    function buildFlagContestoPersona(ana) {
        if (!ana || typeof ana !== "object") {
            return {
                haFigli: false,
                haNipoti: false,
                haRedditoStabile: false,
                haMutuo: null,
                indebitato: null,
                haPatrimonioFinanziario: false
            };
        }

        const figli = ana.figliMinorenni != null ? Number(ana.figliMinorenni) : 0;
        const reddito = ana.redditoAnnuo != null ? Number(ana.redditoAnnuo) : null;
        const sit = (ana.situazioneLavorativa || "").toString().toLowerCase().trim();
        const patrimonio = ana.patrimonioFinanziario != null
            ? Number(ana.patrimonioFinanziario)
            : null;

        // Reddito "stabile" = dipendente/dirigente/pensionato con reddito > 0
        const haRedditoStabile =
            !!reddito &&
            reddito > 0 &&
            (sit === "dipendente" || sit === "dirigente" || sit === "pensionato");

        // Al momento non hai campo esplicito per mutuo/debiti nell'anagrafica:
        // lasciamo null (sconosciuto) per evitare assunzioni sbagliate.
        return {
            haFigli: figli > 0,
            haNipoti: false,              // richiederà in futuro un campo dedicato / domanda
            haRedditoStabile: haRedditoStabile,
            haMutuo: null,                // placeholder per future estensioni
            indebitato: null,             // placeholder per future estensioni
            haPatrimonioFinanziario: !!patrimonio && patrimonio > 0
        };
    }

        /**
     * Costruisce il contestoPersona a partire dall'anagrafica grezza.
     * Nessun accesso diretto a DOM o appStatePersona: è una pura funzione di trasformazione (pura).
     *
     * Struttura output standardizzata:
     * {
     *   anagrafica: { ...copia pulita... },
     *   cluster: {
     *     etaCluster,        // under30 | 30-45 | 46-60 | over60 | null
     *     statoFamiliare,    // single | coppia_senza_figli | famiglia_con_figli | bamboccione | null
     *     lavoroCluster      // dipendente | autonomo | imprenditore | pensionato | altro
     *   },
     *   flag: {
     *     haFigli,
     *     haNipoti,
     *     haRedditoStabile,
     *     haMutuo,
     *     indebitato,
     *     haPatrimonioFinanziario
     *   },
     *   segmenti: [ ... ],    // lista di tag per motore domande / Metodo Rosso
     *   warnings: [ ... ]     // avvisi su qualità / completezza dati anagrafici
     * }
     */
    function buildContestoPersonaFromAnagrafica(anagrafica) {
        // 1) Copia "pulita" dell'anagrafica per evitare side-effect
        const ana =
            anagrafica && typeof anagrafica === "object"
                ? { ...anagrafica }
                : {};

        // 2) Cluster principali
        const etaCluster = deriveEtaCluster(ana.eta);
        const statoFamiliare = deriveStatoFamiliare(ana);
        const lavoroCluster = deriveLavoroCluster(ana);

        // 3) Flag booleani (figli, reddito, patrimonio, ecc.)
        const flag = buildFlagContestoPersona(ana);

        // 4) Segmenti per il motore dinamico (domande, domande potenti, ecc.)
        const segmenti = [];

        // Cluster di base
        if (etaCluster) {
            segmenti.push(`eta_${etaCluster}`);
            // es.: eta_under30, eta_30-45, eta_46-60, eta_over60
        }

        if (statoFamiliare) {
            segmenti.push(`stato_${statoFamiliare}`);
            // es.: stato_single, stato_coppia_senza_figli, stato_famiglia_con_figli, stato_bamboccione
        }

        if (lavoroCluster) {
            segmenti.push(`lavoro_${lavoroCluster}`);
            // es.: lavoro_dipendente, lavoro_autonomo, lavoro_imprenditore, lavoro_pensionato, lavoro_altro
        }

        // Flag comportamentali / economici
        if (flag.haFigli) segmenti.push("ha_figli");
        if (flag.haNipoti) segmenti.push("ha_nipoti");
        if (flag.haRedditoStabile) segmenti.push("reddito_stabile");
        if (flag.haPatrimonioFinanziario) segmenti.push("patrimonio_finanziario");
        if (flag.haMutuo === true) segmenti.push("ha_mutuo");
        if (flag.indebitato === true) segmenti.push("indebitato");

        // ================================
        // MACRO-PROFILI COMBINATI
        // ================================

        // Single giovane
        if (statoFamiliare === "single" && etaCluster === "under30") {
            segmenti.push("profilo_S1_single_under30");
        }

        // Single lavoratore stabile 30–60
        if (
            statoFamiliare === "single" &&
            (etaCluster === "30-45" || etaCluster === "46-60") &&
            flag.haRedditoStabile
        ) {
            segmenti.push("profilo_S2_single_worker");
        }

        // Coppia senza figli con reddito stabile
        if (
            statoFamiliare === "coppia_senza_figli" &&
            flag.haRedditoStabile
        ) {
            segmenti.push("profilo_C1_coppia_doppio_reddito");
        }

        // Famiglia con figli in età lavorativa
        if (
            statoFamiliare === "famiglia_con_figli" &&
            (etaCluster === "30-45" || etaCluster === "46-60")
        ) {
            segmenti.push("profilo_F1_famiglia_figli_attivi");
        }

        // Famiglia con figli grandi / cliente maturo
        if (statoFamiliare === "famiglia_con_figli" && etaCluster === "over60") {
            segmenti.push("profilo_F2_famiglia_figli_grandi");
        }

        // Pensionato
        if (lavoroCluster === "pensionato") {
            segmenti.push("profilo_P_pensionato");
        }

        // Autonomo / imprenditore con rischio reddito
        if (
            (lavoroCluster === "autonomo" || lavoroCluster === "imprenditore") &&
            (
                !flag.haRedditoStabile ||       // reddito ballerino
                flag.indebitato === true        // oppure presenza di debiti rilevanti
            )
        ) {
            segmenti.push("profilo_L1_autonomo_rischio");
        }

        // 5) Warnings su qualità / completezza dati anagrafici
        const warnings = [];

        const etaNum = ana.eta != null ? Number(ana.eta) : null;
        if (etaCluster == null || !etaNum || !isFinite(etaNum)) {
            warnings.push("eta_non_affidabile_o_mancante");
        }

        const redditoNum = ana.redditoAnnuo != null ? Number(ana.redditoAnnuo) : null;
        if (!redditoNum || !isFinite(redditoNum) || redditoNum <= 0) {
            warnings.push("reddito_non_dichiarato_o_zero");
        }

        const sitLav = (ana.situazioneLavorativa || "").toString().trim();
        if (!sitLav) {
            warnings.push("situazione_lavorativa_non_dichiarata");
        }

        const nucleo = ana.nucleoComponenti != null ? Number(ana.nucleoComponenti) : null;
        if (!nucleo || !isFinite(nucleo) || nucleo <= 0) {
            warnings.push("nucleo_familiare_non_chiaro");
        }

        // 6) Output consolidato
        return {
            anagrafica: ana,
            cluster: {
                etaCluster,
                statoFamiliare,
                lavoroCluster
            },
            flag,
            segmenti,
            warnings
        };
    }



    // Espone le funzioni a livello globale per uso da persona_app.js
    if (typeof window !== "undefined") {
        window.buildContestoPersonaFromAnagrafica = buildContestoPersonaFromAnagrafica;
        window.ContestoPersonaUtils = {
            deriveEtaCluster,
            deriveStatoFamiliare,
            deriveLavoroCluster,
            buildFlagContestoPersona
        };
    }

})();
