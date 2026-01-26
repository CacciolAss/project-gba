// Archivio analisi Persona - versione completa
// Usa localStorage con chiave dedicata

const ARCHIVIO_PERSONA_KEY = "generali_archivio_persona";

/**
 * Carica l'archivio persona da localStorage.
 * Ritorna SEMPRE un array.
 */
function caricaArchivioPersona() {
    try {
        const raw = localStorage.getItem(ARCHIVIO_PERSONA_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        // ✅ Normalizzazione record (backward compat + robustezza UI)
        const normalized = parsed
            .filter(r => r && typeof r === "object")
            .map(r => {
                const rec = { ...r };

                // schemaVersion (record vecchi -> 0)
                rec.schemaVersion = (typeof rec.schemaVersion === "number")
                    ? rec.schemaVersion
                    : 0;

                // Strutture base
                rec.cliente = (rec.cliente && typeof rec.cliente === "object") ? rec.cliente : {};
                rec.consulente = (rec.consulente && typeof rec.consulente === "object") ? rec.consulente : {};
                rec.risposte = (rec.risposte && typeof rec.risposte === "object") ? rec.risposte : {};
                rec.caring = (rec.caring && typeof rec.caring === "object") ? rec.caring : {};

                rec.polizze = Array.isArray(rec.polizze) ? rec.polizze : [];

                // risultati: oggetto + array sempre coerenti
                rec.risultati = (rec.risultati && typeof rec.risultati === "object") ? rec.risultati : {};
                rec.risultati.aree = (rec.risultati.aree && typeof rec.risultati.aree === "object")
                    ? rec.risultati.aree
                    : {};
                rec.risultati.incongruenze = Array.isArray(rec.risultati.incongruenze) ? rec.risultati.incongruenze : [];
                rec.risultati.prioritaProdotti = Array.isArray(rec.risultati.prioritaProdotti) ? rec.risultati.prioritaProdotti : [];
                rec.risultati.sintesiOperativa = Array.isArray(rec.risultati.sintesiOperativa) ? rec.risultati.sintesiOperativa : [];

                // ID / timestamp difensivi (non invento valori nuovi, metto null se mancano)
                rec.id = (typeof rec.id === "string" && rec.id.trim()) ? rec.id : null;
                rec.timestamp = (typeof rec.timestamp === "string" && rec.timestamp.trim()) ? rec.timestamp : null;

                return rec;
            });

        return normalized;
    } catch (e) {
        console.error("Errore nel caricamento archivio persona:", e);
        return [];
    }
}


/**
 * Salva l'array archivio completo in localStorage.
 */
function salvaArchivioPersona(archivioArray) {
    try {
        localStorage.setItem(ARCHIVIO_PERSONA_KEY, JSON.stringify(archivioArray));
    } catch (e) {
        console.error("Errore nel salvataggio archivio persona:", e);
    }
}

/**
 * Crea un record analisi persona a partire dall'appStatePersona.
 */
function creaRecordAnalisiPersona() {
    if (typeof appStatePersona === "undefined") {
        console.error("appStatePersona non definito. Impossibile creare record analisi persona.");
        return null;
    }

    const ana = appStatePersona.user.anagrafica || {};
    const res = appStatePersona.risultati || {};
    const ans = appStatePersona.questionnaire.answers || {};
    const car = appStatePersona.caring || {};

    // Snapshot polizze in essere al momento dell'analisi
    const polizze = (appStatePersona.user && Array.isArray(appStatePersona.user.polizze))
        ? appStatePersona.user.polizze.map(p => ({ ...p }))
        : [];

    const now = new Date().toISOString();

// ✅ Snapshot V2 (audit trail): profilo/segmenti/domande effettivamente attive al momento del salvataggio
let v2Snapshot = {
    profilo: null,
    segmenti: [],
    cluster: null,
    domandeIds: []
};

try {
    const contesto =
        (appStatePersona.dynamic && appStatePersona.dynamic.contestoPersona) ||
        (appStatePersona.questionnaire && appStatePersona.questionnaire.contestoPersona) ||
        null;

    const domandeIds =
        (appStatePersona.dynamic && Array.isArray(appStatePersona.dynamic.domandeVisibili))
            ? appStatePersona.dynamic.domandeVisibili.map(d => d && d.id).filter(Boolean)
            : [];

    const profilo =
        (contesto && typeof resolveProfiloOperativoPersonaV2 === "function")
            ? resolveProfiloOperativoPersonaV2(contesto)
            : null;

    v2Snapshot = {
        profilo: profilo || null,
        segmenti: (contesto && Array.isArray(contesto.segmenti)) ? contesto.segmenti : [],
        cluster: (contesto && typeof contesto.cluster === "object") ? contesto.cluster : null,
        domandeIds
    };
} catch (e) {
    // no-op: se qualcosa va storto, salvo comunque il record senza rompere il flusso
}



    const nomeFull = [ana.nome, ana.cognome].filter(Boolean).join(" ");
    const cf = (ana.codiceFiscale || "").toUpperCase();

        return {
    schemaVersion: 1,
    v2Snapshot,
    id: `${cf || "NC"}_${now}`,
    timestamp: now,

    cliente: {
        nomeCompleto: nomeFull || null,
        codiceFiscale: cf || null,
        eta: ana.eta ?? null,
        luogoNascita: ana.luogoNascita || null,
        professione: ana.professione || null,
        situazioneLavorativa: ana.situazioneLavorativa || null,
        redditoAnnuo: ana.redditoAnnuo ?? null,
        nucleoComponenti: ana.nucleoComponenti ?? null,
        figliMinorenni: ana.figliMinorenni ?? null,
        patrimonioFinanziario: ana.patrimonioFinanziario ?? null,
        citta: ana.citta || null,
        provincia: ana.provincia || null,
        cap: ana.cap || null,
        emailCliente: ana.emailCliente || null,
        telefonoCliente: ana.telefonoCliente || null
    },
    consulente: {
        email: ana.consulenteEmail || null,
        emailVisibile: ana.consulenteEmailVisibile || null
    },
    polizze: polizze,
    risultati: {
        indiceGlobale: res.indiceGlobale ?? null,
        aree: res.aree || {},
        gapStatale: res.gapStatale || null,
        normotipo: res.normotipo || null,
        semaforo: res.semaforo || null,
        incongruenze: Array.isArray(res.incongruenze) ? res.incongruenze : [],
        coerenzaAvanzata: res.coerenzaAvanzata || null,
        prioritaProdotti: Array.isArray(res.prioritaProdotti) ? res.prioritaProdotti : [],
        sintesiOperativa: Array.isArray(res.sintesiOperativa) ? res.sintesiOperativa : []
    },
    caring: {
        dataAppuntamento: car.dataAppuntamento || null,
        oraAppuntamento: car.oraAppuntamento || null,
        modalita: car.modalita || null,
        valutazione: car.valutazione || null,
        note: car.note || null
    },
    risposte: ans
};


}


/**
 * Aggiunge un nuovo record analisi all'archivio e salva.
 */
function aggiungiAnalisiPersonaInArchivio(record) {
    if (!record) {
        console.warn("Record analisi persona nullo, non aggiunto.");
        return;
    }
    const archivio = caricaArchivioPersona();
    archivio.push(record);
    salvaArchivioPersona(archivio);
}

/**
 * Render base dell'archivio nella sezione #archivioPersonaContainer
 */
function renderArchivioPersona() {
    const container = document.getElementById("archivioPersonaContainer");
    if (!container) {
        console.error("archivioPersonaContainer non trovato nell'HTML.");
        return;
    }

    const archivio = caricaArchivioPersona();
    const searchCFInput = document.getElementById("searchCF");
    const searchConsulenteSelect = document.getElementById("searchConsulente");

    // Nessuna analisi salvata
    if (!Array.isArray(archivio) || !archivio.length) {
        container.innerHTML = `
            <p style="font-size:13px; color:#9ca3af;">
                Nessuna analisi salvata al momento.
            </p>
        `;
        if (searchConsulenteSelect) {
            searchConsulenteSelect.innerHTML = `<option value="">Tutti</option>`;
        }
        return;
    }

    // Leggo filtri
    const filtroCF = searchCFInput
        ? (searchCFInput.value || "").toUpperCase().trim()
        : "";

    const filtroConsulente = searchConsulenteSelect
        ? (searchConsulenteSelect.value || "").toLowerCase().trim()
        : "";

    // Popolo la tendina consulenti a partire dall'archivio
    if (searchConsulenteSelect) {
        const valoreCorrente = filtroConsulente;
        const mappaConsulenti = new Map(); // email -> label

        archivio.forEach(rec => {
            if (!rec || !rec.consulente) return;
            const email = (rec.consulente.email || "").toLowerCase().trim();
            if (!email) return;
            const labelVisibile =
                rec.consulente.emailVisibile ||
                rec.consulente.email ||
                email;
            if (!mappaConsulenti.has(email)) {
                mappaConsulenti.set(email, labelVisibile);
            }
        });

        let optionsHtml = `<option value="">Tutti</option>`;
        mappaConsulenti.forEach((label, email) => {
            const selected = (email === valoreCorrente) ? 'selected' : '';
            optionsHtml += `<option value="${email}" ${selected}>${label}</option>`;
        });
        searchConsulenteSelect.innerHTML = optionsHtml;
    }

    // ✅ NUOVA LOGICA: se NON ci sono filtri, NON mostrare la tabella
    if (!filtroCF && !filtroConsulente) {
        container.innerHTML = `
            <p style="font-size:13px; color:#6b7280;">
                Ci sono <strong>${archivio.length}</strong> analisi archiviate.
                Usa i filtri (Codice Fiscale o Consulente) per visualizzare i dettagli.
            </p>
        `;
        return;
    }

    // Applico i filtri SOLO se impostati
    const filtrati = archivio.filter(rec => {
        if (!rec || !rec.cliente) return false;

        let match = true;

        if (filtroCF) {
            const cf = (rec.cliente.codiceFiscale || "").toUpperCase().trim();
            match = match && cf.includes(filtroCF);
        }

        if (filtroConsulente) {
            const emailCons = (rec.consulente?.email || "").toLowerCase().trim();
            match = match && emailCons === filtroConsulente;
        }

        return match;
    });

    if (!filtrati.length) {
        container.innerHTML = `
            <p style="font-size:13px; color:#9ca3af;">
                Nessuna analisi trovata con i filtri impostati.
            </p>
        `;
        return;
    }

    // Ordino per data (decrescente)
    const sorted = filtrati.slice().sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    let html = `
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
                <tr>
                    <th style="text-align:left; padding:6px; border-bottom:1px solid #e5e7eb;">Data/Ora</th>
                    <th style="text-align:left; padding:6px; border-bottom:1px solid #e5e7eb;">Cliente</th>
                    <th style="text-align:left; padding:6px; border-bottom:1px solid #e5e7eb;">Codice Fiscale</th>
                    <th style="text-align:left; padding:6px; border-bottom:1px solid #e5e7eb;">Indice equilibrio</th>
                    <th style="text-align:left; padding:6px; border-bottom:1px solid #e5e7eb;">Copertura statale</th>
                </tr>
            </thead>
            <tbody>
    `;

        sorted.forEach(rec => {
        const dataOra = rec.timestamp
            ? new Date(rec.timestamp).toLocaleString("it-IT")
            : "-";
        const nome = rec.cliente?.nomeCompleto || "(senza nome)";
        const cf = rec.cliente?.codiceFiscale || "-";
        const indice = rec.risultati?.indiceGlobale != null
            ? `${rec.risultati.indiceGlobale}/100`
            : "-";
        const gap = rec.risultati?.gapStatale?.indiceComplessivo != null
            ? `${rec.risultati.gapStatale.indiceComplessivo}/100`
            : "-";

        html += `
            <tr class="riga-archivio-persona" data-id="${rec.id || ""}" data-cf="${cf}">
                <td style="padding:6px; border-bottom:1px solid #f3f4f6;">${dataOra}</td>
                <td style="padding:6px; border-bottom:1px solid #f3f4f6;">${nome}</td>
                <td style="padding:6px; border-bottom:1px solid #f3f4f6;">${cf}</td>
                <td style="padding:6px; border-bottom:1px solid #f3f4f6;">${indice}</td>
                <td style="padding:6px; border-bottom:1px solid #f3f4f6;">${gap}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;

    // Click su riga per richiamo analisi (ID preferito, fallback CF)
    const rows = container.querySelectorAll(".riga-archivio-persona");
    rows.forEach(row => {
        row.addEventListener("click", () => {
            const idRiga = (row.getAttribute("data-id") || "").trim();
            const cfRiga = (row.getAttribute("data-cf") || "").trim();
            const key = idRiga || cfRiga;
            if (!key) return;

            if (typeof caricaAnalisiPersonaDaArchivio === "function") {
                caricaAnalisiPersonaDaArchivio(key);
            } else {
                console.warn("Funzione caricaAnalisiPersonaDaArchivio non definita.");
            }
        });
    });
}

