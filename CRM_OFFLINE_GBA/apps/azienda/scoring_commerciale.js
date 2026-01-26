// ============================
// MOTORE DI SCORING COMMERCIALE
// ============================

window.SCORTEX = {
    calcolaScore: function (datiAzienda, risposte, incongruenze, polizzeAttive) {
        const score = inizializzaAssi();

        // 1) ANALISI PERSONE (KEYMAN + TCM + INFORTUNI + SANITARIA)
        applicaScorePersone(score, datiAzienda, risposte);

        // 2) ANALISI PATRIMONIO & BENI (DANNI + INCENDIO + BI)
        applicaScorePatrimonio(score, datiAzienda, risposte);

        // 3) ANALISI RESPONSABILITÀ (RC + TUTELA LEGALE)
        applicaScoreResponsabilita(score, datiAzienda, risposte);

        // 4) ANALISI CONTINUITÀ & DIGITAL (CYBER + INTERRUZIONE OPERATIVA)
        applicaScoreContinuita(score, datiAzienda, risposte);

        // 5) CONSIDERIAMO INCONGRUENZE E POLIZZE
        applicaBoostDaIncongruenze(score, incongruenze);
        penalizzaPolizzePresenti(score, polizzeAttive);

        // 6) CALCOLO INDICE GLOBALE
        score.GLOBALE = Math.round((score.PERSONE + score.PATRIMONIO + score.RESP + score.CONTINUITA) / 4);

        return score;
    }
};

// ============================
// FUNZIONI BASE
// ============================

function inizializzaAssi() {
    return { PERSONE: 0, PATRIMONIO: 0, RESP: 0, CONTINUITA: 0, GLOBALE: 0 };
}

// ============================
// 1) PERSONE
// ============================
function applicaScorePersone(score, d, r) {
    // Soci/dipendenza da persone
    if (d.soci > 0) score.PERSONE += 15;
    if (d.dipendenti <= 5 && d.soci === 1) score.PERSONE += 10;

    // Età soci > 55 (serve la birth date)
    if (d.etaMediaSoci && d.etaMediaSoci >= 55) score.PERSONE += 15;

    // Risposte questionario HR/Key Man
    if (r?.HRW_01 <= 2) score.PERSONE += 10;
}

// ============================
// 2) PATRIMONIO
// ============================
function applicaScorePatrimonio(score, d, r) {
    if (d.fabbricatoProprieta === "si") score.PATRIMONIO += 15;
    if (d.fatturato > 1500000) score.PATRIMONIO += 10;
}

// ============================
// 3) RESPONSABILITÀ
// ============================
function applicaScoreResponsabilita(score, d, r) {
    if (d.settore && ["servizi", "commercio"].includes(d.settore)) score.RESP += 15;
    if (r?.COM_02 <= 2) score.RESP += 10; // esempio: procedure scarse
}

// ============================
// 4) CONTINUITÀ & DIGITAL
// ============================
function applicaScoreContinuita(score, d, r) {
    if (r?.CYB_02 <= 2) score.CONTINUITA += 10;
    if (r?.CYB_01 <= 2) score.CONTINUITA += 10;
    if (d.tipoStruttura === "produzione") score.CONTINUITA += 10;
}

// ============================
// 5) INCONGRUENZE & POLIZZE ESISTENTI
// ============================
function applicaBoostDaIncongruenze(score, incong) {
    if (!Array.isArray(incong)) return;
    if (incong.some(i => i.area === "Persone")) score.PERSONE += 10;
}

function penalizzaPolizzePresenti(score, polizze) {
    if (!Array.isArray(polizze)) return;
    // Se hai già cyber → riduco un po'
    if (polizze.includes("CYBER")) score.CONTINUITA -= 8;
}
