console.log("persona_app.js caricato correttamente");

/* =========================
   STATE APP PERSONA
========================= */
const appStatePersona = {
    user: {
        anagrafica: {},
        polizze: []
    },
    questionnaire: {
        currentIndex: 0,
        answers: {} // es: { A1: 3, A2: 5, . }
    },
    risultati: {
        aree: {},
        indiceGlobale: null,
        gapStatale: null,
        normotipo: null,
        semaforo: null,
        incongruenze: [],
        prioritaProdotti: [],
        sintesiOperativa: [],
        coerenzaAvanzata: null
    },
    caring: {
        dataAppuntamento: "",
        oraAppuntamento: "",
        modalita: "",
        valutazione: "",
        note: ""
    },
    charts: {
        radar: null,
        timeline: null
    },
    // Slice dedicato al motore dinamico V2
    dynamic: {
        contestoPersona: null,      // verrà valorizzato da buildContestoPersonaFromAnagrafica / getDomandePersona
        domandeVisibili: [],        // lista calcolata dal motore di visibilità
        indiceCorrente: 0           // puntatore nella lista domandeVisibili
    }
};



/* =========================
   AUTOSAVE ANALISI PERSONA
   - Salva/restore bozza locale
========================= */

const AUTOSAVE_PERSONA_KEY = "generali_partner_persona_draft_v1";
const AUTOSAVE_PERSONA_TTL_HOURS = 24;

/**
 * Riporta i valori di appStatePersona.user.anagrafica nei campi del form anagrafica.
 */
function popolaFormAnagraficaDaStatePersona() {
    if (!appStatePersona.user) return;
    const ana = appStatePersona.user.anagrafica || {};

    const setVal = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value != null ? String(value) : "";
    };

    setVal("nome", ana.nome);
    setVal("cognome", ana.cognome);
    setVal("codiceFiscale", ana.codiceFiscale);
    setVal("dataNascita", ana.dataNascita);
    setVal("luogoNascita", ana.luogoNascita);
    setVal("eta", ana.eta);

    setVal("professione", ana.professione);
    setVal("situazioneLavorativa", ana.situazioneLavorativa);
    setVal("redditoAnnuo", ana.redditoAnnuo);
    setVal("nucleoComponenti", ana.nucleoComponenti);
    setVal("figliMinorenni", ana.figliMinorenni);
    setVal("patrimonioFinanziario", ana.patrimonioFinanziario);

    setVal("emailCliente", ana.emailCliente);
    setVal("telefonoCliente", ana.telefonoCliente);
    setVal("citta", ana.citta);
    setVal("provincia", ana.provincia);
    setVal("cap", ana.cap);

    const consulenteSelect = document.getElementById("consulenteSelect");
    if (consulenteSelect && ana.consulenteEmail) {
        consulenteSelect.value = ana.consulenteEmail;
    }
    const emailConsulenteInput = document.getElementById("emailConsulente");
    if (emailConsulenteInput && ana.consulenteEmailVisibile) {
        emailConsulenteInput.value = ana.consulenteEmailVisibile;
    }
}

/**
 * Salva una bozza dell'analisi persona in localStorage.
 * Salva:
 *  - user (anagrafica + polizze)
 *  - questionnaire (answers + currentIndex)
 */
function salvaBozzaAnalisiPersona() {
    try {
        if (typeof localStorage === "undefined") {
            console.warn("localStorage non disponibile: autosave persona disattivato.");
            return;
        }

        const ana =
            (appStatePersona.user && appStatePersona.user.anagrafica) || {};
        const answers =
            (appStatePersona.questionnaire &&
                appStatePersona.questionnaire.answers) ||
            {};
        const caring = appStatePersona.caring || {};

        const haAnagrafica = Object.keys(ana).length > 0;
        const haRisposte = Object.keys(answers).length > 0;

        // Se non c'è nulla di significativo, pulisco eventuale bozza
        if (!haAnagrafica && !haRisposte) {
            localStorage.removeItem(AUTOSAVE_PERSONA_KEY);
            return;
        }

        const draft = {
    timestamp: new Date().toISOString(),
    user: {
        // copia difensiva dell’anagrafica
        anagrafica: { ...(ana || {}) },

        polizze: Array.isArray(appStatePersona.user.polizze)
            ? appStatePersona.user.polizze.map((p) => ({ ...p }))
            : [],

        // ✅ Coperture attive V2 (clone difensivo 1 livello)
        copertureAttive: (() => {
            const src = (appStatePersona.user && appStatePersona.user.copertureAttive) || {};
            if (!src || typeof src !== "object") return {};
            const out = {};
            for (const k of Object.keys(src)) {
                const v = src[k] || {};
                out[k] = { ...v };
            }
            return out;
        })()
    },

    questionnaire: {
        currentIndex: appStatePersona.questionnaire.currentIndex || 0,
        answers: { ...answers }
    },

    caring: {
        dataAppuntamento: caring.dataAppuntamento || "",
        oraAppuntamento: caring.oraAppuntamento || "",
        modalita: caring.modalita || "",
        valutazione: caring.valutazione || "",
        note: caring.note || ""
    }
};



        localStorage.setItem(
            AUTOSAVE_PERSONA_KEY,
            JSON.stringify(draft)
        );
        // console.log("💾 Bozza analisi persona salvata.", draft);
    } catch (err) {
        console.error(
            "Errore nel salvataggio bozza analisi persona:",
            err
        );
    }
}


/**
 * Cancella la bozza salvata.
 */
function cancellaBozzaAnalisiPersona() {
    try {
        if (typeof localStorage === "undefined") return;
        localStorage.removeItem(AUTOSAVE_PERSONA_KEY);
        console.log("🧹 Bozza analisi persona rimossa da localStorage.");
    } catch (err) {
        console.error("Errore nella cancellazione bozza analisi persona:", err);
    }
}

/**
 * Se esiste una bozza recente, chiede se ripristinarla.
 * Ritorna true se è stata ripristinata, false altrimenti.
 */
function caricaBozzaAnalisiPersonaSeEsiste() {
    try {
        if (typeof localStorage === "undefined") {
            return false;
        }

        const raw = localStorage.getItem(AUTOSAVE_PERSONA_KEY);
        if (!raw) return false;

        let draft = null;
        try {
            draft = JSON.parse(raw);
        } catch (e) {
            console.error("Bozza analisi persona corrotta, viene rimossa.", e);
            localStorage.removeItem(AUTOSAVE_PERSONA_KEY);
            return false;
        }

        if (!draft || typeof draft !== "object") {
            localStorage.removeItem(AUTOSAVE_PERSONA_KEY);
            return false;
        }


        // Controllo TTL (età bozza)
        const ts = draft.timestamp ? Date.parse(draft.timestamp) : NaN;
        if (!Number.isNaN(ts)) {
            const ageMs = Date.now() - ts;
            const ttlMs = AUTOSAVE_PERSONA_TTL_HOURS * 60 * 60 * 1000;
            if (ageMs > ttlMs) {
                console.log("Bozza analisi persona più vecchia di TTL, non viene caricata.");
                // opzionale: localStorage.removeItem(AUTOSAVE_PERSONA_KEY);
                return false;
            }
        }

        const conferma = window.confirm(
            "Esiste una bozza recente dell'analisi persona salvata su questo dispositivo.\nVuoi ripristinarla?"
        );
        if (!conferma) {
            return false;
        }

        // Merge sullo stato
        if (draft.user && typeof draft.user === "object") {
            const anaDraft = draft.user.anagrafica || {};
            const polizzeDraft = Array.isArray(draft.user.polizze) ? draft.user.polizze : [];

            appStatePersona.user.anagrafica = {
                ...(appStatePersona.user.anagrafica || {}),
                ...anaDraft
            };
            appStatePersona.user.polizze = polizzeDraft.map(p => ({ ...p }));
        }

        if (draft.questionnaire && typeof draft.questionnaire === "object") {
            appStatePersona.questionnaire.answers = draft.questionnaire.answers || {};
            appStatePersona.questionnaire.currentIndex =
                typeof draft.questionnaire.currentIndex === "number"
                    ? draft.questionnaire.currentIndex
                    : 0;
        }
    
// Ripristino Coperture Attive V2 (bozza)
const copDraft = draft.user.copertureAttive || {};
if (copDraft && typeof copDraft === "object") {
    const out = {};
    for (const k of Object.keys(copDraft)) {
        const v = copDraft[k] || {};
        out[k] = { ...v };
    }
    appStatePersona.user.copertureAttive = out;
}

                // Ripristino caring, se presente nella bozza
        if (draft.caring && typeof draft.caring === "object") {
            appStatePersona.caring = {
                dataAppuntamento: draft.caring.dataAppuntamento || "",
                oraAppuntamento: draft.caring.oraAppuntamento || "",
                modalita: draft.caring.modalita || "",
                valutazione: draft.caring.valutazione || "",
                note: draft.caring.note || ""
            };
        } else {
            appStatePersona.caring = {
                dataAppuntamento: "",
                oraAppuntamento: "",
                modalita: "",
                valutazione: "",
                note: ""
            };
        }


        // Sincronizza UI
        popolaFormAnagraficaDaStatePersona();

// Riallinea UI coperture V2 dopo restore bozza
if (typeof initCopertureAttiveV2 === "function") {
    initCopertureAttiveV2();
}


                // Sincronizza UI caring
        const setCaringVal = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.value = value != null ? String(value) : "";
        };

        const car = appStatePersona.caring || {};
        setCaringVal("caringDataAppuntamento", car.dataAppuntamento);
        setCaringVal("caringOraAppuntamento", car.oraAppuntamento);
        setCaringVal("caringModalita", car.modalita);
        setCaringVal("caringValutazione", car.valutazione);
        setCaringVal("caringNote", car.note);


        if (typeof renderPolizzePersona === "function") {
            renderPolizzePersona();
        }

        if (typeof renderDomandaCorrentePersona === "function") {
            renderDomandaCorrentePersona();
        }

        if (typeof mostraToast === "function") {
            mostraToast("Bozza analisi persona ripristinata.", "info");
        }
        console.log("✅ Bozza analisi persona ripristinata da localStorage.");

        return true;
    } catch (err) {
        console.error("Errore nel caricamento bozza analisi persona:", err);
        return false;
    }
}


/* =========================
   UTILITIES GENERALI
========================= */

function normalizzaNumeroItalia(str) {
    if (str == null) return null;
    if (typeof str === "number") return str;
    const clean = String(str)
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/[^\d.-]/g, "")
        .trim();
    const num = Number(clean);
    return isFinite(num) ? num : null;
}

function calcolaEtaDaData(dataStr) {
    if (!dataStr) return null;
    const d = new Date(dataStr);
    if (isNaN(d.getTime())) return null;
    const oggi = new Date();
    let eta = oggi.getFullYear() - d.getFullYear();
    const m = oggi.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && oggi.getDate() < d.getDate())) {
        eta--;
    }
    return eta >= 0 && eta < 120 ? eta : null;
}

/* =========================
   TOAST NOTIFICHE
========================= */
function mostraToast(messaggio, tipo = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) {
        console.error("Toast container mancante");
        return;
    }

    const t = document.createElement("div");
    t.className = "toast";

    if (tipo === "error") t.classList.add("toast-error");
    else if (tipo === "success") t.classList.add("toast-success");
    else if (tipo === "warning") t.classList.add("toast-warning");

    t.textContent = messaggio;
    container.appendChild(t);

    setTimeout(() => {
        if (container.contains(t)) {
            container.removeChild(t);
        }
    }, 3500);
}

/* =========================
   LOGIN PERSONA
========================= */

function popolaSelectConsulenti() {
    const select = document.getElementById("consulenteSelect");
    const emailConsulenteInput = document.getElementById("emailConsulente");
    if (!select) return;

    if (!window.CONSULENTI_GENERALI || !Array.isArray(window.CONSULENTI_GENERALI)) {
        console.warn("CONSULENTI_GENERALI non disponibile.");
        return;
    }

    select.innerHTML = '<option value="">Seleziona il consulente</option>';

    window.CONSULENTI_GENERALI.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.email;
        opt.textContent = `${c.cognome} ${c.nome} (${c.ruolo || "Consulente"})`;
        select.appendChild(opt);
    });

    select.addEventListener("change", () => {
        const email = select.value || "";
        if (emailConsulenteInput) {
            emailConsulenteInput.value = email;
        }
        appStatePersona.user.anagrafica.consulenteEmail = email || null;
        appStatePersona.user.anagrafica.consulenteEmailVisibile = email || null;
    });
}

function eseguiLoginPersona() {
    const userInput = document.getElementById("loginUser");
    const passInput = document.getElementById("loginPass");

    if (!userInput || !passInput) {
        console.error("Campi login mancanti nell'HTML.");
        return;
    }

    const user = userInput.value.trim();
    const pass = passInput.value.trim();

    if (!user || !pass) {
        mostraToast("Inserisci nome/cognome e password.", "error");
        return;
    }

    if (pass !== "Generali2026!") {
        mostraToast("Password non corretta.", "error");
        return;
    }

    if (!window.CONSULENTI_GENERALI || !Array.isArray(window.CONSULENTI_GENERALI)) {
        mostraToast("Errore: database consulenti non caricato.", "error");
        console.error("CONSULENTI_GENERALI non disponibile");
        return;
    }

    // 🔎 Cerco il consulente usando lo stesso criterio di Azienda (trovaConsulente)
if (typeof window.trovaConsulente !== "function") {
    mostraToast("Errore: funzione trovaConsulente non disponibile.", "error");
    console.error("trovaConsulente non disponibile");
    return;
}

const consulente = window.trovaConsulente(user);
if (!consulente) {
    mostraToast("Consulente non trovato. Verifica nome e cognome.", "error");
    return;
}

// ✅ Sessione unica condivisa (userId canonico = "COGNOME NOME")
if (!window.GBA_SESSION || typeof window.GBA_SESSION.set !== "function") {
    mostraToast("Errore: session manager non caricato.", "error");
    console.error("GBA_SESSION non disponibile");
    return;
}

const userIdCanonico = `${consulente.cognome} ${consulente.nome}`.toUpperCase().replace(/\s+/g, " ").trim();

window.GBA_SESSION.set({
    userId: userIdCanonico,
    displayName: `${consulente.nome} ${consulente.cognome}`,
    role: (consulente.ruolo || "CONSULENTE")
});


    const overlay = document.getElementById("loginOverlay");
    const mainContent = document.getElementById("mainContentPersona");

    if (overlay) overlay.style.display = "none";
    if (mainContent) mainContent.style.display = "block";

    appStatePersona.user.anagrafica = appStatePersona.user.anagrafica || {};
    appStatePersona.user.anagrafica.consulenteLogin = userIdCanonico;

    mostraToast("Accesso effettuato. Benvenuto.", "success");
}

function initLoginPersona() {
    const btnLogin = document.getElementById("btnLogin");
    const inputUser = document.getElementById("loginUser");
    const inputPass = document.getElementById("loginPass");

    // Click sul bottone => login
    if (btnLogin) {
        btnLogin.addEventListener("click", eseguiLoginPersona);
    }

    // Invio dentro il campo PASSWORD => login diretto
    if (inputPass) {
        inputPass.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                eseguiLoginPersona();
            }
        });
    }

    // Invio dentro il campo USERNAME:
    // - se esiste il campo password => sposta focus lì
    // - se per qualche motivo non esiste => esegui login
    if (inputUser) {
        inputUser.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                if (inputPass) {
                    inputPass.focus();
                } else {
                    eseguiLoginPersona();
                }
            }
        });
    }

    // Rimane invariato
    popolaSelectConsulenti();
}

/* ============================
   ESTRAZIONE DATA DI NASCITA DA CF
============================ */

function estraiDataNascitaDaCF(cf) {
    cf = cf.toUpperCase();

    const anno = parseInt(cf.substring(6, 8), 10);
    const meseChar = cf.charAt(8);
    const giornoNum = parseInt(cf.substring(9, 11), 10);

    const mesi = {
        'A': 1,'B': 2,'C': 3,'D': 4,'E': 5,'H': 6,
        'L': 7,'M': 8,'P': 9,'R': 10,'S': 11,'T': 12
    };

    const mese = mesi[meseChar];
    if (!mese || !giornoNum || Number.isNaN(anno)) {
        return { data: null };
    }

    let giorno = giornoNum;
    if (giorno > 40) {
        giorno -= 40; // > donna
    }

    const currentYY = new Date().getFullYear() % 100;
    const secolo = anno <= currentYY ? 2000 : 1900;
    const annoCompleto = secolo + anno;

    const dataISO = `${annoCompleto}-${String(mese).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;

    return { data: dataISO };
}

function estraiInfoAnagraficaDaCF(cf) {
    if (!cf) return { data: null, sesso: null, luogoNascita: null, codiceLuogo: null };
    cf = cf.toUpperCase().trim();

    // Data + sesso (giorno > 40 = F)
    const anno = parseInt(cf.substring(6, 8), 10);
    const meseChar = cf.charAt(8);
    const giornoNum = parseInt(cf.substring(9, 11), 10);

    const mesi = { A:1,B:2,C:3,D:4,E:5,H:6,L:7,M:8,P:9,R:10,S:11,T:12 };
    const mese = mesi[meseChar];

    if (!mese || Number.isNaN(anno) || Number.isNaN(giornoNum)) {
        return { data: null, sesso: null, luogoNascita: null, codiceLuogo: null };
    }

    let sesso = "M";
    let giorno = giornoNum;
    if (giorno > 40) {
        giorno -= 40;
        sesso = "F";
    }

    const currentYY = new Date().getFullYear() % 100;
    const secolo = anno <= currentYY ? 2000 : 1900;
    const annoCompleto = secolo + anno;

    const dataISO = `${annoCompleto}-${String(mese).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;

    // Codice luogo: posizioni 12-15 (0-based: 11..14)
    const codiceLuogo = cf.substring(11, 15); // es: H501

    const luogoNascita = risolviLuogoNascitaDaCodiceLuogo(codiceLuogo);

    return { data: dataISO, sesso, luogoNascita, codiceLuogo };
}

function risolviLuogoNascitaDaCodiceLuogo(codiceLuogo) {
    if (!codiceLuogo) return null;
    const code = String(codiceLuogo).toUpperCase().trim();

    // Estero: spesso Z***
    if (code.startsWith("Z")) return `Estero (${code})`;

    // Dataset comuni: tentativi ragionevoli (perché i dataset non sono mai standard, ovviamente)
    const dataset =
        (typeof window !== "undefined" && (window.COMUNI_ITALIA || window.comuniItalia || window.COMUNI)) ||
        (typeof COMUNI_ITALIA !== "undefined" && COMUNI_ITALIA) ||
        null;

    const arr = Array.isArray(dataset) ? dataset : (dataset && Array.isArray(dataset.data) ? dataset.data : []);
    if (!arr.length) return null;

    const keyCandidates = ["codiceCatastale", "codice_catastale", "catastale", "belfiore", "codiceBelfiore", "codice"];
    const nameCandidates = ["nome", "comune", "denominazione", "descrizione"];
    const provCandidates = ["provincia", "siglaProvincia", "prov", "pr"];

    const found = arr.find(r => {
        if (!r || typeof r !== "object") return false;
        return keyCandidates.some(k => (r[k] || "").toString().toUpperCase().trim() === code);
    });

    if (!found) return null;

    const nome = nameCandidates.map(k => found[k]).find(v => typeof v === "string" && v.trim()) || null;
    const prov = provCandidates.map(k => found[k]).find(v => typeof v === "string" && v.trim()) || null;

    return (nome && prov) ? `${nome} (${prov})` : (nome || null);
}

/* =========================
   LETTURA ANAGRAFICA PERSONA
========================= */

function leggiAnagraficaPersona() {
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    };
    const getNum = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const num = normalizzaNumeroItalia(el.value);
        return num != null ? num : null;
    };

 // ✅ LETTURA NOME/COGNOME (ID reali in pagina)
const nomeEl = document.getElementById("nome");
const cognomeEl = document.getElementById("cognome");

const nome = (nomeEl && typeof nomeEl.value === "string") ? nomeEl.value.trim() : "";
const cognome = (cognomeEl && typeof cognomeEl.value === "string") ? cognomeEl.value.trim() : "";

// Se hai già variabili nome/cognome, sovrascrivile con questi valori

    const codiceFiscaleRaw = getVal("codiceFiscale");
    const codiceFiscale = (codiceFiscaleRaw || "").toUpperCase();

    let dataNascita = getVal("dataNascita");
    let luogoNascita = getVal("luogoNascita");

    // Prefill da CF (solo se il campo dataNascita è vuoto e CF sembra valido)
    if (!dataNascita && codiceFiscale && codiceFiscale.length === 16) {
        try {
            const cfInfo = estraiDataNascitaDaCF(codiceFiscale);
            if (cfInfo && cfInfo.data) {
                dataNascita = cfInfo.data; // YYYY-MM-DD
                const elData = document.getElementById("dataNascita");
                if (elData) elData.value = dataNascita;
            }
        } catch (e) {
            console.warn("⚠️ Prefill dataNascita da CF fallito:", e);
        }
    // ✅ Auto-compilazione luogo di nascita da CF (solo se vuoto)
    try {
        if (
            codiceFiscale &&
            codiceFiscale.length === 16 &&
            !luogoNascita &&
            typeof window.trovaComuneDaCodiceCatastale === "function"
        ) {
            // Codice catastale: caratteri 12-15 del CF (index 11..14)
            const codCat = codiceFiscale.substring(11, 15).toUpperCase();
            const comune = window.trovaComuneDaCodiceCatastale(codCat);

            if (comune && comune.n) {
                luogoNascita = comune.n;
                const elLN = document.getElementById("luogoNascita");
                if (elLN && !elLN.value) elLN.value = comune.n;
            }
        }
    } catch (e) {
        console.warn("⚠️ Prefill luogoNascita da CF fallito:", e);
    }
    }
       
    let eta = null;
    if (dataNascita) {
        eta = calcolaEtaDaData(dataNascita);
        const elEta = document.getElementById("eta");
        if (elEta && !elEta.value) elEta.value = String(eta);
    }

    const professione = getVal("professione");
    const situazioneLavorativa = getVal("situazioneLavorativa");
    const redditoAnnuo = getNum("redditoAnnuo");
    const redditoFamiliareAnnuo = getNum("redditoFamiliareAnnuo");
    const numPercettoriReddito = getNum("numPercettoriReddito");
    const nucleoComponenti = getNum("nucleoComponenti");
    const figliMinorenni = getNum("figliMinorenni");
    const patrimonioFinanziario = getNum("patrimonioFinanziario");
    const emailCliente = getVal("emailCliente");
    const telefonoCliente = getVal("telefonoCliente");
    const citta = getVal("citta");
    const provincia = getVal("provincia");
    const cap = getVal("cap");

    const selectConsulente = document.getElementById("consulenteSelect");
    const emailConsulenteInput = document.getElementById("emailConsulente");
    const consulenteEmail = selectConsulente ? selectConsulente.value : "";
    const consulenteEmailVisibile = emailConsulenteInput ? emailConsulenteInput.value : "";

    appStatePersona.user.anagrafica = {
        nome,
        cognome,
        codiceFiscale,
        dataNascita,
        luogoNascita,
        eta,
        professione,
        situazioneLavorativa,
        redditoAnnuo,
        redditoFamiliareAnnuo,
        numPercettoriReddito,
        nucleoComponenti,
        figliMinorenni,
        patrimonioFinanziario,
        emailCliente,
        telefonoCliente,
        citta,
        provincia,
        cap,
        consulenteEmail,
        consulenteEmailVisibile
    };

    // Aggiorna il contesto dinamico persona se è disponibile il costruttore
    if (typeof window.buildContestoPersonaFromAnagrafica === "function") {
        try {
            if (!appStatePersona.dynamic) {
                appStatePersona.dynamic = {};
            }

            appStatePersona.dynamic.contestoPersona =
                window.buildContestoPersonaFromAnagrafica(
                    appStatePersona.user.anagrafica
                );
        } catch (err) {
            console.warn("Errore nella costruzione del contesto persona:", err);
        }
    }
// ✅ Allinea lo state: anagrafica sempre disponibile sia in user.anagrafica (V2) sia in appStatePersona.anagrafica (legacy)
try {
    // Prendo l'oggetto anagrafica appena letto, qualunque sia il nome variabile:
    // 1) se esiste "ana" uso quello
    // 2) altrimenti uso appStatePersona.anagrafica se già valorizzato
    // 3) altrimenti provo a derivarlo dal logico "appStatePersona.user.anagrafica"
    const anaSafe =
        (typeof ana !== "undefined" && ana) ||
        (appStatePersona && appStatePersona.anagrafica) ||
        (appStatePersona && appStatePersona.user && appStatePersona.user.anagrafica) ||
        {};

    appStatePersona.user = appStatePersona.user || {};
    appStatePersona.user.anagrafica = anaSafe;
    appStatePersona.anagrafica = anaSafe; // compatibilità legacy
    window.appStatePersona = appStatePersona; // anti-reset UI
} catch (e) {
    console.warn("⚠️ Impossibile allineare appStatePersona.user.anagrafica:", e);
}

    console.log("📇 Anagrafica persona letta:", appStatePersona.user.anagrafica);

    // Autosave bozza analisi persona
    if (typeof salvaBozzaAnalisiPersona === "function") {
        salvaBozzaAnalisiPersona();
    }
}


/* =========================
   VALIDAZIONE COERENZA ANAGRAFICA
========================= */
function validaCoerenzaAnagraficaPersona() {
    const ana = appStatePersona.user && appStatePersona.user.anagrafica
        ? appStatePersona.user.anagrafica
        : {};

    const warnings = [];
    const markField = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.borderColor = "#DC2626";
        el.style.backgroundColor = "#FEE2E2";
    };

    // 1) CF vs data di nascita + età
    const cf = (ana.codiceFiscale || "").toString().trim().toUpperCase();
    const dataCampo = (ana.dataNascita || "").toString().trim();

    if (cf && cf.length === 16) {
        try {
            const cfInfo = estraiDataNascitaDaCF(cf);
            if (cfInfo && cfInfo.data) {
                const dataDaCF = cfInfo.data; // formato YYYY-MM-DD

                // CF vs data di nascita campo
                if (dataCampo && dataCampo !== dataDaCF) {
                    warnings.push("Data di nascita non coerente con il codice fiscale.");
                    markField("dataNascita");
                    markField("codiceFiscale");
                }

                // CF vs età campo
                const etaCampo = ana.eta != null ? Number(ana.eta) : null;
                if (!Number.isNaN(etaCampo) && etaCampo != null) {
                    const etaDaCF = calcolaEtaDaData(dataDaCF);
                    if (Number.isFinite(etaDaCF) && Math.abs(etaDaCF - etaCampo) > 1) {
                        warnings.push("Età indicata non coerente con l'età derivata dal codice fiscale.");
                        markField("eta");
                    }
                }
            }
        } catch (e) {
            console.warn("Impossibile verificare coerenza CF/data di nascita:", e);
        }
    }

    // 2) Nucleo familiare vs figli minorenni
    const nucleo = ana.nucleoComponenti != null ? Number(ana.nucleoComponenti) : null;
    const figli = ana.figliMinorenni != null ? Number(ana.figliMinorenni) : null;

    if (nucleo != null && figli != null && !Number.isNaN(nucleo) && !Number.isNaN(figli)) {
        if (figli > nucleo) {
            warnings.push("Numero di figli minorenni superiore al numero di componenti del nucleo familiare.");
            markField("nucleoComponenti");
            markField("figliMinorenni");
        }
    }

    // 3) Situazione lavorativa vs professione
    const prof = (ana.professione || "").toString().toLowerCase();
    const sitLav = (ana.situazioneLavorativa || "").toString().toLowerCase();

    if (sitLav === "pensionato") {
        // Se uno è pensionato ma la professione non accenna a "pensionato" / "ex", lo segnaliamo
        if (prof && !prof.includes("pensionat") && !prof.startsWith("ex ")) {
            warnings.push("Situazione lavorativa 'pensionato' e professione indicata potenzialmente non coerenti.");
            markField("professione");
            markField("situazioneLavorativa");
        }
    }

    // Notifica sintetica se ci sono problemi
    if (warnings.length > 0) {
        if (typeof mostraToast === "function") {
            mostraToast(
                "Verifica alcuni dati anagrafici non coerenti (campi evidenziati).",
                "warning"
            );
        } else {
            console.warn("Coerenza anagrafica:", warnings);
        }
    }

    return warnings;
}


/* =========================
   CARING PERSONA
========================= */
function leggiCaringPersona() {
    if (!appStatePersona.caring) {
        appStatePersona.caring = {};
    }

    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? (el.value || "").trim() : "";
    };

    appStatePersona.caring = {
        dataAppuntamento: getVal("caringDataAppuntamento"),
        oraAppuntamento: getVal("caringOraAppuntamento"),
        modalita: getVal("caringModalita"),
        valutazione: getVal("caringValutazione"),
        note: getVal("caringNote")
    };

    console.log("🧩 Caring persona letto:", appStatePersona.caring);
}
function initCaringPersonaHelpers() {
    const dataInput = document.getElementById("caringDataAppuntamento");
    if (!dataInput) return;

    dataInput.addEventListener("change", () => {
        const val = dataInput.value;
        if (!val) return;

        const dataApp = new Date(val);
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        if (isNaN(dataApp.getTime())) {
            // input non valido, lascio stare
            return;
        }

        if (dataApp < oggi) {
            dataInput.style.borderColor = "#EF4444";
            dataInput.style.backgroundColor = "#FEE2E2";

            if (typeof mostraToast === "function") {
                mostraToast("La data dell'appuntamento non può essere nel passato.", "warning");
            }

            dataInput.value = "";
        } else {
            dataInput.style.borderColor = "#10B981";
            dataInput.style.backgroundColor = "#F0FDF4";
        }
    });
}

/* =========================
   USER DATA PERSONA (DERIVAZIONI)
========================= */
function buildUserDataPersona() {
    const ana = (appStatePersona.user && appStatePersona.user.anagrafica) ? appStatePersona.user.anagrafica : {};

    const eta = ana.eta != null ? Number(ana.eta) : calcolaEtaDaData(ana.dataNascita);
    const reddito = ana.redditoAnnuo != null ? Number(ana.redditoAnnuo) : 0;
    const nucleo = ana.nucleoComponenti != null ? Number(ana.nucleoComponenti) : 1;
    const figli = ana.figliMinorenni != null ? Number(ana.figliMinorenni) : 0;

    // ✅ Single source of truth: stessa regola del contesto (include "bamboccione")
    let statoFamiliare = "single";
    try {
        const utils = (typeof window !== "undefined") ? window.ContestoPersonaUtils : null;
        if (utils && typeof utils.deriveStatoFamiliare === "function") {
            const sf = utils.deriveStatoFamiliare(ana);
            if (sf) statoFamiliare = sf;
        } else {
            // fallback legacy
            if (nucleo > 1 && figli > 0) {
                statoFamiliare = "famiglia_con_figli";
            } else if (nucleo > 1 && figli === 0) {
                statoFamiliare = "coppia_senza_figli";
            }
        }
    } catch (e) {
        // fallback hard
        if (nucleo > 1 && figli > 0) {
            statoFamiliare = "famiglia_con_figli";
        } else if (nucleo > 1 && figli === 0) {
            statoFamiliare = "coppia_senza_figli";
        }
    }

    let tipoLavoratore = "";
    switch ((ana.situazioneLavorativa || "").toLowerCase()) {
        case "dipendente":
        case "dirigente":
            tipoLavoratore = "dipendente_privato";
            break;
        case "autonomo":
            tipoLavoratore = "autonomo";
            break;
        case "imprenditore":
            tipoLavoratore = "imprenditore";
            break;
        case "pensionato":
            tipoLavoratore = "pensionato";
            break;
        default:
            tipoLavoratore = "";
    }

    // =========================
    // STRATO DECISIONALE – REDDITO FAMILIARE / QUOTA REDDITO
    // =========================
    const redditoCliente = (ana.redditoAnnuo != null && ana.redditoAnnuo !== "") ? Number(ana.redditoAnnuo) : 0;

    // ⚠️ Nomi variabili "blindati" per evitare collisioni:
    // niente "redditoFamiliare" qui dentro
    const redditoFamiliareAnnuo = (ana.redditoFamiliareAnnuo != null && ana.redditoFamiliareAnnuo !== "")
        ? Number(ana.redditoFamiliareAnnuo)
        : null;

    const numPercettoriReddito = (ana.numPercettoriReddito != null && ana.numPercettoriReddito !== "")
        ? Number(ana.numPercettoriReddito)
        : null;

    let quotaRedditoCliente = null;
    let redditoPrevalente = null;

    if (Number.isFinite(redditoCliente) && Number.isFinite(redditoFamiliareAnnuo) && redditoFamiliareAnnuo > 0) {
        quotaRedditoCliente = redditoCliente / redditoFamiliareAnnuo;
        redditoPrevalente = quotaRedditoCliente >= 0.6;
    }

    return {
        age: Number.isFinite(eta) ? eta : null,
        redditoAnnuo: Number.isFinite(reddito) ? reddito : 0,
        nucleoComponenti: Number.isFinite(nucleo) ? nucleo : 1,
        numeroFigli: Number.isFinite(figli) ? figli : 0,
        statoFamiliare,
        tipoLavoratore,

        // nuovi campi per TCM/decisionale
        redditoFamiliareAnnuo,
        numPercettoriReddito,
        quotaRedditoCliente,
        redditoPrevalente
    };
}


/* =========================
   POLIZZE PERSONA
========================= */

/* =========================
   COPERTURE ATTIVE (V2)
========================= */

// Catalogo “coperture” spuntabili (V2)
const COPERTURE_ATTIVE_CATALOG = [
    { key: "pac", label: "Piani di Accumulo (PAC)" },
    { key: "pip", label: "Fondo pensione / PIP" },
    { key: "tfr", label: "TFR" },
    { key: "infortuni", label: "Polizza Infortuni" },
    { key: "sanitaria", label: "Polizza Sanitaria" },
    { key: "casa", label: "Polizza Casa" },
    { key: "cat_nat", label: "Polizza Catastrofali (addendum casa)" },
    { key: "rc_capofamiglia", label: "RC Capofamiglia" },
    { key: "rc_auto_moto", label: "RC Auto / Moto" },
    { key: "ltc", label: "Long Term Care (LTC)" },
    { key: "tcm", label: "TCM (Temporanea Caso Morte)" },

    // Extra utili (già che ci siamo)
    { key: "invalidita", label: "Invalidità / Malattia Grave" },
    { key: "protezione_reddito", label: "Protezione Reddito (diaria / IP)" },
    { key: "cyber", label: "Cyber / Frodi digitali" }
];

// Lista “principali” (pragmatica, non accademica)
const COMPAGNIE_ITALIANE_TOP = [
    "Generali",
    "Allianz",
    "UnipolSai",
    "AXA",
    "Reale Mutua",
    "Zurich",
    "Groupama",
    "Intesa Sanpaolo Assicura",
    "Poste Assicura",
    "BNP Paribas Cardif",
    "Cattolica",
    "Vittoria Assicurazioni",
    "Helvetia",
    "Aviva",
    "Europ Assistance",
    "MetLife",
    "HDI",
    "Sara Assicurazioni",
    "Assimoco",
    "Crédit Agricole Assicurazioni",
    "Altro"
];

// Entry point V2: render + binding
function initCopertureAttiveV2() {
    // Se il container non esiste, non rompiamo l’app (ma lo segnaliamo)
    const container = document.getElementById("copertureAttiveV2Container");
    if (!container) {
        // Silenzioso in produzione, utile in debug
        console.debug("Coperture V2: container copertureAttiveV2Container non presente (skip).");
        return;
    }

    // Stato: mappa per key copertura
    if (!appStatePersona.user) appStatePersona.user = {};
    if (!appStatePersona.user.copertureAttive || typeof appStatePersona.user.copertureAttive !== "object") {
        appStatePersona.user.copertureAttive = {};
    }

    // Inizializza record mancanti
    for (const item of COPERTURE_ATTIVE_CATALOG) {
        if (!appStatePersona.user.copertureAttive[item.key]) {
            appStatePersona.user.copertureAttive[item.key] = {
    active: false,
    compagnia: "",
    compagniaAltro: "",
    premioAnnuo: "",
    scadenza: "",
    note: "",
    capitaleEuro: "" // usato SOLO per alcune coperture (es. TCM)
};
        }
    }

    renderCopertureAttiveV2();
}

function renderCopertureAttiveV2() {
    const container = document.getElementById("copertureAttiveV2Container");
    if (!container) return;

    const stateMap = appStatePersona.user.copertureAttive || {};

    let html = `
    <div class="coperture-v2-grid">
`;


    for (const item of COPERTURE_ATTIVE_CATALOG) {
        const rec = stateMap[item.key] || {};
        const checked = rec.active === true ? "checked" : "";
        const showDetails = rec.active === true ? "" : "display:none;";

        const compagniaVal = rec.compagnia != null ? String(rec.compagnia) : "";
        const altroVal = rec.compagniaAltro != null ? String(rec.compagniaAltro) : "";
        const premioVal = rec.premioAnnuo != null ? String(rec.premioAnnuo) : "";
        const scadenzaVal = rec.scadenza != null ? String(rec.scadenza) : "";
        const noteVal = rec.note != null ? String(rec.note) : "";
        const capitaleVal = rec.capitaleEuro != null ? String(rec.capitaleEuro) : "";
      const isTCM = item.key === "tcm";
       const isInfortuni = item.key === "infortuni";
const labelCapitale = isInfortuni ? "Capitale IP (€)" : "Capitale assicurato (€)";
        const showAltro = (compagniaVal === "Altro") ? "" : "display:none;";

        html += `
            <div class="copertura-v2-card">
    <div class="copertura-v2-head">
        <div class="copertura-v2-title">${item.label}</div>

        <input type="checkbox"
               data-copertura-key="${item.key}"
               class="coperturaV2Check copertura-toggle"
               ${checked} />
    </div>


                <div class="coperturaV2Details" data-copertura-details="${item.key}" style="margin-top:10px; ${showDetails}">
                    <div class="form-grid">
                        <div>
                            <label>Compagnia</label>
                            <select class="coperturaV2Compagnia" data-copertura-key="${item.key}">
                                ${COMPAGNIE_ITALIANE_TOP.map(n => {
                                    const sel = (n === compagniaVal) ? "selected" : "";
                                    return `<option value="${n}" ${sel}>${n}</option>`;
                                }).join("")}
                            </select>
                        </div>

                        <div class="coperturaV2AltroWrap" data-copertura-altrowrap="${item.key}" style="${showAltro}">
                            <label>Se “Altro”, specifica</label>
                            <input type="text" class="coperturaV2Altro" data-copertura-key="${item.key}" value="${altroVal}" placeholder="Es. Banca XYZ / Compagnia..." />
                        </div>

                        <div>
                            <label>Premio annuo (€)</label>
                            <input type="number" min="0" step="1" class="coperturaV2Premio" data-copertura-key="${item.key}" value="${premioVal}" placeholder="0" />
                        </div>

                        <div>
                            <label>Scadenza</label>
                            <input type="date" class="coperturaV2Scadenza" data-copertura-key="${item.key}" value="${scadenzaVal}" />
                        </div>
${(isTCM || isInfortuni) ? `
<div>
    <label>${labelCapitale}</label>
    <input type="number"
           min="0"
           step="1000"
           class="coperturaV2Capitale"
           data-copertura-key="${item.key}"
           value="${capitaleVal}"
           placeholder="Es. 200000" />
</div>
` : ""}

                        <div style="grid-column:1/-1;">
                            <label>Note</label>
                            <input type="text" class="coperturaV2Note" data-copertura-key="${item.key}" value="${noteVal}" placeholder="Opzionale (es. capitale, garanzie, vincoli...)" />
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    html += `</div>`;

    container.innerHTML = html;

    // Bindings
    container.querySelectorAll(".coperturaV2Check").forEach(el => {
        el.addEventListener("change", (e) => {
            const key = e.target.getAttribute("data-copertura-key");
            if (!key) return;

            const rec = appStatePersona.user.copertureAttive[key];
            rec.active = e.target.checked === true;

            const details = container.querySelector(`[data-copertura-details="${key}"]`);
            if (details) details.style.display = rec.active ? "" : "none";
        });
    });

    container.querySelectorAll(".coperturaV2Compagnia").forEach(el => {
        el.addEventListener("change", (e) => {
            const key = e.target.getAttribute("data-copertura-key");
            if (!key) return;

            const rec = appStatePersona.user.copertureAttive[key];
            rec.compagnia = e.target.value;

            const altroWrap = container.querySelector(`[data-copertura-altrowrap="${key}"]`);
            if (altroWrap) altroWrap.style.display = (rec.compagnia === "Altro") ? "" : "none";

            // Se non è Altro, pulisco il campo (evita sporcizia dati)
            if (rec.compagnia !== "Altro") rec.compagniaAltro = "";
        });
    });

    container.querySelectorAll(".coperturaV2Altro").forEach(el => {
        el.addEventListener("input", (e) => {
            const key = e.target.getAttribute("data-copertura-key");
            if (!key) return;
            appStatePersona.user.copertureAttive[key].compagniaAltro = e.target.value || "";
        });
    });

    container.querySelectorAll(".coperturaV2Premio").forEach(el => {
        el.addEventListener("input", (e) => {
            const key = e.target.getAttribute("data-copertura-key");
            if (!key) return;
            appStatePersona.user.copertureAttive[key].premioAnnuo = e.target.value || "";
        });
    });

   container.querySelectorAll(".coperturaV2Capitale").forEach(el => {
    el.addEventListener("input", (e) => {
        const key = e.target.getAttribute("data-copertura-key");
        if (!key) return;
        appStatePersona.user.copertureAttive[key].capitaleEuro = e.target.value || "";
    });
});

    container.querySelectorAll(".coperturaV2Scadenza").forEach(el => {
        el.addEventListener("change", (e) => {
            const key = e.target.getAttribute("data-copertura-key");
            if (!key) return;
            appStatePersona.user.copertureAttive[key].scadenza = e.target.value || "";
        });
    });

    container.querySelectorAll(".coperturaV2Note").forEach(el => {
        el.addEventListener("input", (e) => {
            const key = e.target.getAttribute("data-copertura-key");
            if (!key) return;
            appStatePersona.user.copertureAttive[key].note = e.target.value || "";
        });
    });
}

function initPolizzePersonaUI() {
    // Garantiamo che lo state sia un array
    if (!Array.isArray(appStatePersona.user.polizze)) {
        appStatePersona.user.polizze = [];
    }

    const btnAdd = document.getElementById("btnAggiungiPolizzaPersona");
    const tbody = document.getElementById("polizzePersonaBody");
    const filtroTipo = document.getElementById("filtroTipoPolizza");
    const filtroSoloNonGenerali = document.getElementById("filtroSoloNonGenerali");

    if (btnAdd) {
        btnAdd.addEventListener("click", () => {
            aggiungiPolizzaPersona();
        });
    }

    if (tbody) {
        // Aggiornamento valori in tempo reale
        tbody.addEventListener("input", onPolizzaPersonaChange);
        tbody.addEventListener("change", onPolizzaPersonaChange);

        // Rimozione polizza (delegation)
        tbody.addEventListener("click", (e) => {
            const btn = e.target.closest("[data-action='remove-polizza']");
            if (!btn) return;
            const idx = parseInt(btn.dataset.index, 10);
            if (!Number.isNaN(idx)) {
                rimuoviPolizzaPersona(idx);
            }
        });
    }

    const applyFilter = () => {
        const tipo = filtroTipo ? filtroTipo.value : "";
        const soloNonGen = filtroSoloNonGenerali ? filtroSoloNonGenerali.value === "1" : false;
        renderPolizzePersona(tipo, soloNonGen);
    };

    if (filtroTipo) {
        filtroTipo.addEventListener("change", applyFilter);
    }
    if (filtroSoloNonGenerali) {
        filtroSoloNonGenerali.addEventListener("change", applyFilter);
    }

    // Primo render
    renderPolizzePersona();
}

function getPolizzePersonaArray() {
    if (!appStatePersona.user) {
        appStatePersona.user = { anagrafica: {}, polizze: [] };
    }
    if (!Array.isArray(appStatePersona.user.polizze)) {
        appStatePersona.user.polizze = [];
    }
    return appStatePersona.user.polizze;
}

function aggiungiPolizzaPersona() {
    const polizze = getPolizzePersonaArray();

    polizze.push({
        tipo: "",
        compagnia: "",
        prodotto: "",
        premioAnnuale: "",
        capitale: "",
        isGenerali: false,
        scadenza: "",
        strategia: ""
    });

    renderPolizzePersona();
}

function rimuoviPolizzaPersona(index) {
    const polizze = getPolizzePersonaArray();
    if (index < 0 || index >= polizze.length) return;

    polizze.splice(index, 1);
    renderPolizzePersona();
}

function renderPolizzePersona(filtroTipo = "", soloNonGenerali = false) {
    const tbody = document.getElementById("polizzePersonaBody");
    if (!tbody) return;

    const tutte = getPolizzePersonaArray().map((p, idx) => ({
        ...p,
        __index: idx
    }));

    const filtrate = tutte.filter((p) => {
        if (filtroTipo && p.tipo !== filtroTipo) return false;
        if (soloNonGenerali && p.isGenerali) return false;
        return true;
    });

    if (!filtrate.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="padding:8px 4px; color:#9ca3af; text-align:center;">
                    Nessuna polizza inserita per i filtri selezionati.
                </td>
            </tr>
        `;
        return;
    }

    const optionsTipo = `
        <option value=""></option>
        <option value="fondo_pensione">Fondo pensione</option>
        <option value="tcm">Temporanea caso morte</option>
        <option value="infortuni">Infortuni</option>
        <option value="sanitaria">Sanitaria</option>
        <option value="ltc">Long Term Care</option>
        <option value="abitazione">Abitazione</option>
        <option value="rca">RCA</option>
        <option value="investimenti">Investimenti</option>
        <option value="accantonamento">Accantonamento / PAC</option>
    `;

    const optionsStrategia = `
        <option value=""></option>
        <option value="tenere">Tenere</option>
        <option value="valutare_portabilita">Valutare portabilità</option>
        <option value="sostituire">Sostituire</option>
    `;

    const rowsHtml = filtrate.map((p) => {
        const idx = p.__index;
        return `
            <tr>
                <td style="padding:4px;">
                    <select data-index="${idx}" data-field="tipo">
                        ${optionsTipo}
                    </select>
                </td>
                <td style="padding:4px;">
                    <input type="text" data-index="${idx}" data-field="compagnia" placeholder="Compagnia" value="${p.compagnia || ""}">
                </td>
                <td style="padding:4px;">
                    <input type="text" data-index="${idx}" data-field="prodotto" placeholder="Prodotto" value="${p.prodotto || ""}">
                </td>
                <td style="padding:4px; text-align:right;">
                    <input type="text" data-index="${idx}" data-field="premioAnnuale" placeholder="Es: 1.200" value="${p.premioAnnuale || ""}">
                </td>
                <td style="padding:4px; text-align:right;">
                    <input type="text" data-index="${idx}" data-field="capitale" placeholder="Capitale / rendita" value="${p.capitale || ""}">
                </td>
                <td style="padding:4px; text-align:center;">
                    <input type="checkbox" data-index="${idx}" data-field="isGenerali" ${p.isGenerali ? "checked" : ""}>
                </td>
                <td style="padding:4px; text-align:center;">
                    <input type="date" data-index="${idx}" data-field="scadenza" value="${p.scadenza || ""}">
                </td>
                <td style="padding:4px; text-align:center;">
                    <select data-index="${idx}" data-field="strategia">
                        ${optionsStrategia}
                    </select>
                </td>
                <td style="padding:4px; text-align:center;">
                    <button type="button" class="btn" data-action="remove-polizza" data-index="${idx}">
                        🗑
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tbody.innerHTML = rowsHtml;

    // Impostiamo i valori selezionati per select tipo/strategia dopo l'inserimento in DOM
    filtrate.forEach((p) => {
        const idx = p.__index;
        const selTipo = tbody.querySelector(`select[data-field="tipo"][data-index="${idx}"]`);
        const selStrategia = tbody.querySelector(`select[data-field="strategia"][data-index="${idx}"]`);
        if (selTipo) selTipo.value = p.tipo || "";
        if (selStrategia) selStrategia.value = p.strategia || "";
    });
}

function onPolizzaPersonaChange(e) {
    const target = e.target;
    const index = parseInt(target.dataset.index, 10);
    const field = target.dataset.field;
    if (Number.isNaN(index) || !field) return;

    const polizze = getPolizzePersonaArray();
    if (!polizze[index]) return;

    if (target.type === "checkbox") {
        polizze[index][field] = !!target.checked;
    } else {
        polizze[index][field] = target.value;
    }
}

/* =========================
   GAP STATALE PERSONA
========================= */
function formattaEuroPersona(val) {
    const num = Number(val);
    if (!isFinite(num) || num <= 0) return "0";
    return num.toLocaleString("it-IT", { maximumFractionDigits: 0 });
}
// ================================
// GATE INPS - REVERSIBILITÀ (MORTE)
// ================================
// Se mancano dati contributivi -> eligible=null (non inventiamo)
// Regola pratica:
// - OK se anniContributiTotali >= 15
// - oppure OK se anniContributiTotali >= 5 e anniContributiUltimi5 >= 3
function valutaReversibilitaINPSPersona(userData) {
    const anniTot = (userData && typeof userData.anniContributiTotali === "number")
        ? userData.anniContributiTotali
        : null;

    const anniUlt5 = (userData && typeof userData.anniContributiUltimi5 === "number")
        ? userData.anniContributiUltimi5
        : null;

    if (anniTot == null || anniUlt5 == null) {
        return { eligible: null, motivo: "Dati contributivi mancanti (anni totali / ultimi 5)." };
    }

    const ok15 = anniTot >= 15;
    const ok5e3 = (anniTot >= 5 && anniUlt5 >= 3);

    if (ok15 || ok5e3) {
        return {
            eligible: true,
            motivo: ok15
                ? "Requisito raggiunto: ≥15 anni contributi."
                : "Requisito raggiunto: ≥5 anni contributi e ≥3 negli ultimi 5."
        };
    }

    return {
        eligible: false,
        motivo: "Requisito NON raggiunto: probabile assenza di pensione ai superstiti (pensione indiretta)."
    };
}

/* =========================
   NORMATIVA INFORTUNI -> COPERTURA STIMATA (HELPER)
   Ritorna un importo annuo stimato (EUR) o 0.
   Fail-safe: se manca normativa o dati, torna 0 senza rompere nulla.
========================= */
function stimaCoperturaInfortuniAnnuaDaNormativaPersona({ tipoLavoratore, redditoAnnuo }) {
    try {
        const rows = window.NORMATIVA_INFORTUNI && Array.isArray(window.NORMATIVA_INFORTUNI.rows)
            ? window.NORMATIVA_INFORTUNI.rows
            : [];

        if (!rows.length) return 0;

        const r = Number(redditoAnnuo);
        if (!isFinite(r) || r <= 0) return 0;

        const tl = (tipoLavoratore || "").toString().trim().toLowerCase();
        if (!tl) return 0;

        // Mapping "ragionato" (degradato ma difendibile):
        // - dipendente/dirigente -> "dipendente"
        // - autonomo -> "autonomo"
        // - imprenditore -> "autonomo" (degradato)
        // - altro -> nessuna applicazione
        let categoria = "";
        if (tl === "dipendente_privato" || tl === "dipendente" || tl === "dirigente") categoria = "dipendente";
        else if (tl === "autonomo") categoria = "autonomo";
        else if (tl === "imprenditore") categoria = "autonomo";
        else return 0;

        // Cerco una riga normativa che matcha la categoria.
        // Provo su più colonne possibili (per non dipendere dal naming esatto del JSON).
        const pick = rows.find(x => {
            if (!x || typeof x !== "object") return false;
            const t =
                (x.tipoLavoratore ?? x.tipo ?? x.lavoratore ?? x.categoria ?? x.gruppo ?? "")
                    .toString()
                    .trim()
                    .toLowerCase();
            return t === categoria;
        });

        if (!pick) return 0;

        // Estraggo un "tasso di copertura" annuo (percentuale del reddito).
        // Provo chiavi tipiche: quotaReddito, coeff, tasso, percentuale, coverageRate...
        let rate =
            pick.quotaReddito ?? pick.coeff ?? pick.tasso ?? pick.percentuale ?? pick.coverageRate ?? pick.rate;

        rate = Number(rate);
        if (!isFinite(rate) || rate <= 0) return 0;

        // Se nel JSON è espresso in percentuale (es: 60) lo normalizzo a 0.60
        if (rate > 1.5) rate = rate / 100;

        // Clamp hard per evitare assurdità (mai oltre 90% del reddito)
        if (rate > 0.9) rate = 0.9;

        const out = Math.round(r * rate);
        return isFinite(out) && out > 0 ? out : 0;
    } catch (e) {
        console.warn("⚠️ stimaCoperturaInfortuniAnnuaDaNormativaPersona() errore:", e);
        return 0;
    }
}

function calcolaGapStatalePersona() {
    const ana = appStatePersona.user?.anagrafica || {};

    let eta = ana.eta != null ? Number(ana.eta) : null;
    if ((!eta || !isFinite(eta)) && ana.dataNascita) {
        eta = calcolaEtaDaData(ana.dataNascita);
    }

    const reddito = ana.redditoAnnuo != null ? Number(ana.redditoAnnuo) : null;
    const sitLav = ana.situazioneLavorativa || "";

    const nucleo = ana.nucleoComponenti != null ? Number(ana.nucleoComponenti) : 1;
    const figli = ana.figliMinorenni != null ? Number(ana.figliMinorenni) : 0;

    let statoFamiliare = "single";
    try {
        const utils = (typeof window !== "undefined") ? window.ContestoPersonaUtils : null;
        if (utils && typeof utils.deriveStatoFamiliare === "function") {
            const sf = utils.deriveStatoFamiliare(ana);
            if (sf) statoFamiliare = sf;
        } else {
            // fallback legacy
            if (nucleo > 1 && figli > 0) statoFamiliare = "famiglia_con_figli";
            else if (nucleo > 1 && figli === 0) statoFamiliare = "coppia_senza_figli";
        }
    } catch (e) {
        // fallback legacy (fail-safe)
        if (nucleo > 1 && figli > 0) statoFamiliare = "famiglia_con_figli";
        else if (nucleo > 1 && figli === 0) statoFamiliare = "coppia_senza_figli";
    }

if (!eta || !isFinite(eta) || !reddito || reddito <= 0) {
        return null;
    }

    let tipoLavoratore = "";
    switch (sitLav) {
        case "dipendente":
        case "dirigente":
            tipoLavoratore = "dipendente_privato";
            break;
        case "autonomo":
            tipoLavoratore = "autonomo";
            break;
        case "imprenditore":
            tipoLavoratore = "imprenditore";
            break;
        case "pensionato":
            tipoLavoratore = "pensionato";
            break;
        default:
            tipoLavoratore = "";
    }

const userData = {
    age: eta,
    redditoAnnuo: reddito,
    tipoLavoratore,

    // ⚠️ Stima legacy: NON è una verità normativa, è un fallback.
    // La usiamo solo se non abbiamo input reali.
    anniContributiviStimati: eta > 22 ? (eta - 22) : 0,

    // ✅ Nuovi campi: se un domani li inserisci in anagrafica, il gate diventa "vero".
    // Per ora: se non esistono, restano null e il gate segna "dato mancante".
    anniContributiTotali:
        (ana.anniContributiTotali != null && isFinite(Number(ana.anniContributiTotali)))
            ? Number(ana.anniContributiTotali)
            : null,

    anniContributiUltimi5:
        (ana.anniContributiUltimi5 != null && isFinite(Number(ana.anniContributiUltimi5)))
            ? Number(ana.anniContributiUltimi5)
            : null
};


    const gap = {
        morte:      { copertura: 0, gap: 0, adeguato: 0 },
        invalidita: { copertura: 0, gap: 0, adeguato: 0 },
        ltc:        { copertura: 0, gap: 0, adeguato: 0 },
        pensione:   { copertura: 0, gap: 0, adeguato: 0 }
    };

    const redditoAnnuo = userData.redditoAnnuo;
    const tl = userData.tipoLavoratore;

    // ======================
    // ACCESSO LIBRERIA NORMATIVA
    // ======================
    const norm = (typeof NORMATIVA_PERSONA_2025 !== "undefined")
        ? NORMATIVA_PERSONA_2025
        : null;

    // ======================
        // MORTE
    // ======================
    const normMorte = norm && norm.morte ? norm.morte : null;
    let targetMultiploMorte =
        normMorte && typeof normMorte.targetMultiploReddito === "number"
            ? normMorte.targetMultiploReddito
            : 10;

    const haFamiglia =
        statoFamiliare === "famiglia_con_figli" ||
        statoFamiliare === "coppia_senza_figli";

    // Single senza persone a carico: il capitale “adeguato” per morte
    // non è 10x reddito. Nel modello lo mettiamo a 0.
    if (!haFamiglia && figli === 0) {
        targetMultiploMorte = 0;
    }


    const cfgMorte =
        normMorte &&
        normMorte.coperturaAnnuaStimata &&
        tl &&
        normMorte.coperturaAnnuaStimata[tl]
            ? normMorte.coperturaAnnuaStimata[tl]
            : null;

    let coperturaMorte = 0;
       // Gate contributivo: sotto una soglia minima, la superstite può essere nulla/irrilevante.
    // Default: 5 anni (puoi parametrizzare in NORMATIVA_PERSONA_2025.morte.minAnniContributiSuperstiti)
    const minAnniSuperstiti =
        normMorte && typeof normMorte.minAnniContributiSuperstiti === "number"
            ? normMorte.minAnniContributiSuperstiti
            : 5;

// ✅ Anni contributivi da usare nel gate (preferisci dato reale, altrimenti stima)
const anniContributivi =
    (userData && userData.anniContributiTotali != null && isFinite(Number(userData.anniContributiTotali)))
        ? Number(userData.anniContributiTotali)
        : (userData && isFinite(Number(userData.anniContributiviStimati)))
            ? Number(userData.anniContributiviStimati)
            : 0;


    const superstitiAmmissibile = anniContributivi >= minAnniSuperstiti;

        if (!superstitiAmmissibile) {
        coperturaMorte = 0;
    } else if (
        cfgMorte &&
        typeof cfgMorte.quotaSuperstitiPensione === "number" &&
        typeof cfgMorte.anniEquivalenti === "number"
    ) {
        coperturaMorte =
            redditoAnnuo *
            cfgMorte.quotaSuperstitiPensione *
            cfgMorte.anniEquivalenti;
    }

    // ✅ Gate INPS reversibilità: se non eleggibile, lo Stato è 0 (stop favole)
const revINPS = valutaReversibilitaINPSPersona(userData);
let notaMorteINPS = "";

if (revINPS.eligible === false) {
    coperturaMorte = 0;
    notaMorteINPS = "INPS: " + revINPS.motivo;
} else if (revINPS.eligible === null) {
    // Dati mancanti: non blocco, ma lo segnalo (governance/data quality)
    notaMorteINPS = "INPS: " + revINPS.motivo;
}

    gap.morte.adeguato = redditoAnnuo * targetMultiploMorte;
    gap.morte.copertura = coperturaMorte;
    gap.morte.gap = Math.max(0, gap.morte.adeguato - gap.morte.copertura);

   // ======================
// TCM ATTIVA (COPERTURE ATTIVE V2)
// ======================

// Lettura capitale TCM inserito manualmente (se presente)
let capitaleTCM = null;
try {
    const copV2 = appStatePersona?.user?.copertureAttiveV2 || {};
    const tcm = copV2.tcm || null;
    const cap = tcm && tcm.capitaleEuro != null ? Number(tcm.capitaleEuro) : null;
    if (isFinite(cap) && cap > 0) {
        capitaleTCM = cap;
    }
} catch (e) {
    capitaleTCM = null;
}

// Ricalcolo gap morte considerando TCM privata
const coperturaTotaleMorte = gap.morte.copertura + (capitaleTCM || 0);
const gapResiduoMorte = Math.max(0, gap.morte.adeguato - coperturaTotaleMorte);

// Stato rischio morte (logico, non UI)
let statoMorte = "INDETERMINATO";

// Caso 1: fabbisogno zero → adeguato by definition
if (gap.morte.adeguato === 0) {
    statoMorte = "ADEGUATO";
}
// Caso 2: capitale TCM assente → dati mancanti
else if (capitaleTCM == null) {
    statoMorte = "INDETERMINATO";
}
// Caso 3: copertura sufficiente
else if (gapResiduoMorte === 0) {
    statoMorte = "ADEGUATO";
}
// Caso 4: copertura insufficiente
else {
    statoMorte = "INADEGUATO";
}

// Override valori morte con residuo reale
gap.morte.copertura = coperturaTotaleMorte;
gap.morte.gap = gapResiduoMorte;

// Telemetria controllata
console.log("🧮 TCM / RISCHIO MORTE:", {
    capitaleTCM,
    adeguato: gap.morte.adeguato,
    coperturaTotaleMorte,
    gapResiduoMorte,
    statoMorte
});
 
   // ======================
    // INVALIDITÀ
    // ======================
    const normInvalidita = norm && norm.invalidita ? norm.invalidita : null;

    const targetQuotaInvalidita =
        normInvalidita && typeof normInvalidita.targetQuotaReddito === "number"
            ? normInvalidita.targetQuotaReddito
            : 0.70;

    const coeffInvalidita =
        normInvalidita &&
        normInvalidita.coeffSostituzioneReddito &&
        typeof normInvalidita.coeffSostituzioneReddito[tl] === "number"
            ? normInvalidita.coeffSostituzioneReddito[tl]
            : 0;

    const baseInvaliditaCivile =
        normInvalidita &&
        normInvalidita.baseInvaliditaCivile &&
        typeof normInvalidita.baseInvaliditaCivile.importoAnnuale === "number"
            ? normInvalidita.baseInvaliditaCivile.importoAnnuale
            : 0;

    const targetInvalidita = redditoAnnuo * targetQuotaInvalidita;

// Se ho una normativa infortuni caricata, provo a usare un coefficiente più specifico
let coeffInvaliditaEff = coeffInvalidita;

try {
    const normInf = window.__NORMATIVA_INFORTUNI__ || window.NORMATIVA_INFORTUNI || null;
    // ci aspettiamo un array di righe normalizzate con campi tipo: tipoLavoratore / coeff / ecc.
    if (Array.isArray(normInf) && normInf.length) {
        // mapping minimale e robusto
        const mapKey = (k) => String(k || "").toLowerCase().trim();
        const tlKey = mapKey(tl);

        // prova match diretto su tipoLavoratore
        let row = normInf.find(r => mapKey(r.tipoLavoratore) === tlKey);

        // fallback: se non trovato, prova categorie più larghe
        if (!row && tlKey.includes("dipendente")) {
            row = normInf.find(r => mapKey(r.tipoLavoratore).includes("dipendente"));
        }
        if (!row && tlKey.includes("autonomo")) {
            row = normInf.find(r => mapKey(r.tipoLavoratore).includes("autonomo"));
        }

        // estrai coefficiente se presente
        const c = row ? Number(row.coeffSostituzioneReddito || row.coeff || row.coefficiente) : NaN;
        if (isFinite(c) && c > 0) {
            coeffInvaliditaEff = c;
        }
    }
} catch (e) {
    // fail-safe: restiamo sul coefficiente generico
}

// Copertura "base" da normativa generale (comportamento attuale)
const coperturaInvaliditaBase = Math.max(
    baseInvaliditaCivile,
    redditoAnnuo * coeffInvalidita
);

// ➕ Integrazione INAIL / infortuni da lavoro (dipendenti) o degradata (autonomi)
let coperturaInfortuni = 0;
try {
    coperturaInfortuni = stimaCoperturaInfortuniAnnuaDaNormativaPersona({
        tipoLavoratore: tl,
        redditoAnnuo
    });
} catch (e) {
    coperturaInfortuni = 0;
}

// Copertura statale complessiva INVALIDITÀ
// - sommo base + infortuni
// - ma non supero mai il target adeguato
const coperturaInvaliditaStato = Math.min(
    targetInvalidita,
    Math.max(0, coperturaInvaliditaBase + coperturaInfortuni)
);



    gap.invalidita.adeguato = targetInvalidita;
    gap.invalidita.copertura = coperturaInvaliditaStato;
    gap.invalidita.gap = Math.max(
        0,
        gap.invalidita.adeguato - gap.invalidita.copertura
    );

    // ======================
    // LTC
    // ======================
    const normLTC = norm && norm.ltc ? norm.ltc : null;

    const costoMensileRSA =
        normLTC && typeof normLTC.costoMensileRSA === "number"
            ? normLTC.costoMensileRSA
            : 2500;

    const mesiLTC =
        normLTC && typeof normLTC.mesi === "number"
            ? normLTC.mesi
            : 12;

    const coperturaPubblicaMensile =
        normLTC &&
        typeof normLTC.coperturaPubblicaMensileStimata === "number"
            ? normLTC.coperturaPubblicaMensileStimata
            : 0;

    const targetLTC = costoMensileRSA * mesiLTC;
    const coperturaLTCStato = coperturaPubblicaMensile * mesiLTC;

    gap.ltc.adeguato = targetLTC;
    gap.ltc.copertura = coperturaLTCStato;
    gap.ltc.gap = Math.max(0, gap.ltc.adeguato - gap.ltc.copertura);

    // ======================
    // PENSIONE
    // ======================
    const normPensione = norm && norm.pensione ? norm.pensione : null;

    const targetQuotaPensione =
        normPensione && typeof normPensione.targetQuotaReddito === "number"
            ? normPensione.targetQuotaReddito
            : 0.80;

    const coeffSostPensione =
        normPensione &&
        normPensione.coeffSostituzioneStato &&
        typeof normPensione.coeffSostituzioneStato[tl] === "number"
            ? normPensione.coeffSostituzioneStato[tl]
            : 0.55;

    const targetPensione = redditoAnnuo * targetQuotaPensione;
    const coperturaPensioneStato = redditoAnnuo * coeffSostPensione;

    gap.pensione.adeguato = targetPensione;
    gap.pensione.copertura = coperturaPensioneStato;
    gap.pensione.gap = Math.max(
        0,
        gap.pensione.adeguato - gap.pensione.copertura
    );

    // ======================
    // TOTALE & INDICE
    // ======================
    const totaleAdeguato =
        gap.morte.adeguato +
        gap.invalidita.adeguato +
        gap.ltc.adeguato +
        gap.pensione.adeguato;

    const totaleStatale =
        gap.morte.copertura +
        gap.invalidita.copertura +
        gap.ltc.copertura +
        gap.pensione.copertura;

    let indiceCopertura = 0;
    if (totaleAdeguato > 0) {
        indiceCopertura = Math.round(
            Math.min(100, (totaleStatale / totaleAdeguato) * 100)
        );
    }

    console.log("🧮 GAP STATALE PERSONA:", {
        input: {
            eta,
            reddito,
            situazioneLavorativa: sitLav,
            tipoLavoratore: tl
        },
        calcoli: { totaleAdeguato, totaleStatale, indiceCopertura },
        dettaglio: {
            morte: gap.morte,
            invalidita: gap.invalidita,
            ltc: gap.ltc,
            pensione: gap.pensione
        }
    });

    return {
        indiceCopertura,
morte: {
    statale: gap.morte.copertura,
    adeguato: gap.morte.adeguato,
    gap: gap.morte.gap,
    stato: statoMorte,
    nota: (typeof notaMorteINPS === "string" && notaMorteINPS) ? notaMorteINPS : ""
},

        invalidita: {
            statale: gap.invalidita.copertura,
            adeguato: gap.invalidita.adeguato,
            gap: gap.invalidita.gap
        },
        ltc: {
            statale: gap.ltc.copertura,
            adeguato: gap.ltc.adeguato,
            gap: gap.ltc.gap
        },
        pensione: {
            statale: gap.pensione.copertura,
            adeguato: gap.pensione.adeguato,
            gap: gap.pensione.gap
        }
    };
}

/* =========================
   NORMOTIPO PERSONA
========================= */
function analizzaNormotipoPersona(userData) {
    const {
        age = null,
        redditoAnnuo = 0,
        nucleoComponenti = 1,
        numeroFigli = 0,
        statoFamiliare = "single",
        tipoLavoratore = ""
    } = userData || {};

    // Base neutra: 50 su tutto
    const priorita = {
        vita: 50,
        tcm: 50,
        infortuni: 50,
        sanitaria: 50,
        ltc: 50,
        previdenza: 50,
        investimenti: 50
    };

    const caratteristiche = [];
    const esclusioni = [];

    const haFamiglia =
        statoFamiliare === "famiglia_con_figli" ||
        statoFamiliare === "coppia_senza_figli";

    // CLUSTER ETA'
    let clusterEta = "young";
    if (age != null && !Number.isNaN(age)) {
        if (age < 35) {
            clusterEta = "young";
        } else if (age < 50) {
            clusterEta = "mid";
        } else if (age < 67) {
            clusterEta = "pre_pensione";
        } else {
            clusterEta = "senior";
        }
    }

    // CLUSTER REDDITO
    let fasciaReddito = "bassa";
    if (redditoAnnuo >= 60000) {
        fasciaReddito = "alta";
    } else if (redditoAnnuo >= 30000) {
        fasciaReddito = "media";
    }

    /* =========================
       REGOLA 1: NUCLEO / FIGLI
    ========================== */
    if (haFamiglia && numeroFigli > 0) {
        priorita.vita += 30;
        priorita.tcm += 35;
        priorita.infortuni += 10;
        priorita.previdenza += 10;
        caratteristiche.push("Nucleo familiare con figli a carico");
    } else if (haFamiglia) {
        priorita.vita += 15;
        priorita.tcm += 20;
        caratteristiche.push("Coppia senza figli: esposizione alla perdita di reddito del nucleo");
    } else {
        caratteristiche.push("Nessun familiare a carico dichiarato");
    }

    /* =========================
       REGOLA 2: TIPO LAVORATORE
    ========================== */
    if (tipoLavoratore === "autonomo" || tipoLavoratore === "imprenditore") {
        priorita.infortuni += 25;
        priorita.vita += 10;
        caratteristiche.push("Reddito legato direttamente alla capacità lavorativa personale");
    } else if (tipoLavoratore === "dipendente_privato") {
        priorita.previdenza += 15;
        caratteristiche.push("Dipendente privato: rischio gap pensionistico futuro");
    } else if (tipoLavoratore === "pensionato") {
        priorita.vita -= 20;
        priorita.tcm -= 30;
        priorita.previdenza -= 40;
        priorita.ltc += 25;
        priorita.sanitaria += 20;
        caratteristiche.push("Pensionato: focus su salute, autonomia e gestione spese ricorrenti");
        esclusioni.push("Previdenza complementare di lungo periodo poco rilevante");
    }

    /* =========================
       REGOLA 3: CLUSTER ETA'
    ========================== */
    switch (clusterEta) {
        case "young":
            priorita.investimenti += 25;
            priorita.previdenza += 15;
            priorita.ltc -= 10;
            caratteristiche.push("Età giovane: orizzonte lungo per investimenti e previdenza");
            break;
        case "mid":
            priorita.vita += 10;
            priorita.tcm += 10;
            priorita.previdenza += 10;
            caratteristiche.push("Età centrale: equilibrio tra protezione e accumulo previdenziale");
            break;
        case "pre_pensione":
            priorita.previdenza += 25;
            priorita.sanitaria += 15;
            priorita.ltc += 15;
            caratteristiche.push("Fase pre-pensionamento: priorità su pensione e costi sanitari futuri");
            break;
        case "senior":
            priorita.investimenti -= 10;
            priorita.vita -= 10;
            priorita.tcm -= 20;
            priorita.sanitaria += 20;
            priorita.ltc += 30;
            caratteristiche.push("Età avanzata: centrale la gestione della non autosufficienza e delle spese sanitarie");
            esclusioni.push("Prodotti vita puri di lungo periodo da proporre con forte cautela");
            break;
    }

    /* =========================
       REGOLA 4: FASCIA REDDITO
    ========================== */
    if (fasciaReddito === "bassa") {
        priorita.investimenti -= 10;
        priorita.previdenza -= 5;
        caratteristiche.push("Reddito contenuto: prima messa in sicurezza di protezione e liquidità");
        esclusioni.push("Piani di investimento rigidi con impegni di premio elevati");
    } else if (fasciaReddito === "media") {
        priorita.investimenti += 10;
        priorita.previdenza += 10;
    } else if (fasciaReddito === "alta") {
        priorita.investimenti += 20;
        priorita.previdenza += 10;
        caratteristiche.push("Reddito medio/alto: capacità potenziale di accumulo e diversificazione patrimoniale");
    }

    /* =========================
       NORMALIZZAZIONE PUNTEGGI
    ========================== */
    Object.keys(priorita).forEach((k) => {
        if (priorita[k] < 0) priorita[k] = 0;
        if (priorita[k] > 100) priorita[k] = 100;
        priorita[k] = Math.round(priorita[k]);
    });

    /* =========================
       PROFILO SINTETICO
       (macro-aree: Protezione / Previdenza / Investimenti)
    ========================== */
    const scoreProtezione =
        (priorita.vita +
            priorita.tcm +
            priorita.infortuni +
            priorita.sanitaria +
            priorita.ltc) / 5;

    const scorePrevidenza = priorita.previdenza;
    const scoreInvestimenti = priorita.investimenti;

    const maxScore = Math.max(scoreProtezione, scorePrevidenza, scoreInvestimenti);

    let profilo = "Equilibrato";
    if (maxScore > 60) {
        if (maxScore === scoreProtezione) {
            profilo = "Protezione-centrico";
        } else if (maxScore === scorePrevidenza) {
            profilo = "Previdenza-centrico";
        } else if (maxScore === scoreInvestimenti) {
            profilo = "Crescita / Accumulo";
        }
    }

    const esclusioniUniche = Array.from(new Set(esclusioni));

    return {
        profilo,
        priorita,
        caratteristiche,
        esclusioni: esclusioniUniche
    };
}


/* =========================
   SEMAFORO COPERTURE PERSONA
========================= */
function calcolaSemaforoPersona(userData, answers, normotipo, gapStatale) {
    const eta = userData.age || 0;
    const reddito = userData.redditoAnnuo || 0;
    const statoFamiliare = userData.statoFamiliare || "";
    const numeroFigli = userData.numeroFigli || 0;
    const tipoLavoratore = userData.tipoLavoratore || "";

    const haFamiglia =
        statoFamiliare === "famiglia_con_figli" ||
        statoFamiliare === "coppia_senza_figli";

    const semaforo = {
        vita: { colore: "yellow", motivo: "Copertura vita da valutare" },
        tcm: { colore: "yellow", motivo: "Copertura temporanea caso morte da valutare" },
        infortuni: { colore: "yellow", motivo: "Protezione da infortuni da valutare" },
        sanitaria: { colore: "yellow", motivo: "Copertura sanitaria integrativa da valutare" },
        ltc: { colore: "yellow", motivo: "Non autosufficienza da valutare" },
        previdenza: { colore: "yellow", motivo: "Posizione previdenziale da valutare" },
        investimenti: { colore: "yellow", motivo: "Spazio per investimenti da valutare" }
    };

    const getGap = (path) => {
        if (!gapStatale) return 0;
        const p = gapStatale[path];
        if (!p || typeof p.gap !== "number") return 0;
        return p.gap;
    };

    const gapMorte = getGap("morte");
    const gapInvalidita = getGap("invalidita");
    const gapPensione = getGap("pensione");

    const qSanitaria = answers.A4 != null ? Number(answers.A4) : 3;
    const qPropRischio = answers.B6 != null ? Number(answers.B6) : 3;
    const qInvestProp = answers.C7 != null ? Number(answers.C7) : 3;

        if (!haFamiglia && numeroFigli === 0) {
        semaforo.vita.colore = "gray";
        semaforo.vita.motivo = "Assenza di familiari economicamente dipendenti";
        semaforo.tcm.colore = "gray";
        semaforo.tcm.motivo = "Nessun reddito familiare da sostituire in caso di decesso";
    } else if (gapMorte > reddito * 8) {
        semaforo.vita.colore = "red";
        semaforo.vita.motivo = "Scopertura elevata in caso di decesso";
    } else if (normotipo?.priorita?.vita >= 80) {
        semaforo.vita.colore = "orange";
        semaforo.vita.motivo = "Dipendenza economica significativa";
    }


    if (eta > 75) {
        semaforo.tcm.colore = "gray";
        semaforo.tcm.motivo = "Età oltre limiti sottoscrizione";
    } else if (haFamiglia && numeroFigli > 0 && gapMorte > reddito * 5) {
        semaforo.tcm.colore = "red";
        semaforo.tcm.motivo = "Figli a carico + scopertura reddito";
    } else if (haFamiglia) {
        semaforo.tcm.colore = "orange";
        semaforo.tcm.motivo = "Protezione consigliata per la stabilità familiare";
    }

    const lavoriManuali = ["autonomo", "imprenditore"];
    if (lavoriManuali.includes(tipoLavoratore)) {
        semaforo.infortuni.colore = "red";
        semaforo.infortuni.motivo = "Dipendenza diretta dalla capacità lavorativa";
    } else if (tipoLavoratore === "dipendente_privato") {
        semaforo.infortuni.colore = "orange";
        semaforo.infortuni.motivo = "Rischio medio sulla continuità di reddito";
    }

    if (eta >= 55 || qSanitaria <= 2) {
        semaforo.sanitaria.colore = "orange";
        semaforo.sanitaria.motivo =
            eta >= 55
                ? "Fascia d’età più esposta a spese sanitarie"
                : "Percezione insufficiente della tutela sanitaria";
    }

    if (eta > 75) {
        semaforo.ltc.colore = "gray";
        semaforo.ltc.motivo = "Non più sottoscrivibile";
    } else if (eta >= 55) {
        semaforo.ltc.colore = "orange";
        semaforo.ltc.motivo = "Finestra ottimale per impostare copertura non autosufficienza";
    } else if (eta >= 45) {
        semaforo.ltc.colore = "yellow";
        semaforo.ltc.motivo = "Utile iniziare a ragionare su LTC in ottica di protezione futura";
    } else {
        semaforo.ltc.colore = "yellow";
        semaforo.ltc.motivo = "Priorità ancora moderata, tema da introdurre gradualmente";
    }

    if (eta > 0 && eta < 80) {
        const anniMancanti = Math.max(0, 67 - eta);
        if (anniMancanti <= 15) {
            semaforo.previdenza.colore = "red";
            semaforo.previdenza.motivo = `Mancano circa ${anniMancanti} anni alla pensione: integrazione urgente`;
        } else if (anniMancanti <= 30) {
            semaforo.previdenza.colore = "orange";
            semaforo.previdenza.motivo = "Finestra ideale per costruire montante previdenziale con interesse composto";
        } else {
            semaforo.previdenza.colore = "yellow";
            semaforo.previdenza.motivo = "Prima si inizia, più efficiente è la costruzione previdenziale";
        }
    } else {
        semaforo.previdenza.colore = "gray";
        semaforo.previdenza.motivo = "Dati anagrafici insufficienti per valutare la posizione previdenziale";
    }

    if (reddito > 30000 && qInvestProp >= 4 && qPropRischio >= 3) {
        semaforo.investimenti.colore = "green";
        semaforo.investimenti.motivo = "Capacità di risparmio e propensione al rischio adeguate: spazio per investimenti strutturati";
    } else if (reddito < 20000 || qPropRischio <= 1) {
        semaforo.investimenti.colore = "gray";
        semaforo.investimenti.motivo = "Prima consolidare capacità di risparmio e riserva di liquidità";
    } else {
        semaforo.investimenti.colore = "yellow";
        semaforo.investimenti.motivo = "Possibile spazio di investimento da calibrare su orizzonte temporale e obiettivi";
    }

    return semaforo;
}

/* =========================
   INCONGRUENZE / COERENZA BASE
========================= */
function calcolaIncongruenzePersona(answers, userData, gapStatale, normotipo) {
    const lista = [];

    const add = (codice, messaggio, livello = "medio") => {
        lista.push({ codice, messaggio, livello });
    };

    const eta = userData.age || 0;
    const reddito = userData.redditoAnnuo || 0;
    const statoFamiliare = userData.statoFamiliare || "";
    const numeroFigli = userData.numeroFigli || 0;
    const tipoLavoratore = userData.tipoLavoratore || "";

    // Risposte questionario (normalizzate)
    const a1 = answers.A1 != null ? Number(answers.A1) : null; // percezione protezione economica
    const a2 = answers.A2 != null ? Number(answers.A2) : null; // autonomia economica famiglia
    const a4 = answers.A4 != null ? Number(answers.A4) : null; // percezione tutela sanitaria
    const a6 = answers.A6 != null ? Number(answers.A6) : null; // importanza tutela figli

    const b2 = answers.B2 != null ? Number(answers.B2) : null; // capacità di risparmio mensile
    const b3 = answers.B3 != null ? Number(answers.B3) : null; // riserve / liquidità
    const b5 = answers.B5 != null ? Number(answers.B5) : null; // rischio fisico lavoro
    const b6 = answers.B6 != null ? Number(answers.B6) : null; // propensione al rischio
    const b8 = answers.B8 != null ? Number(answers.B8) : null; // attività rischiose

    const c1 = answers.C1 != null ? Number(answers.C1) : null; // azione previdenza complementare
    const c3 = answers.C3 != null ? Number(answers.C3) : null; // consapevolezza numeri pensione
    const c4 = answers.C4 != null ? Number(answers.C4) : null; // chiarezza obiettivi futuri
    const c7 = answers.C7 != null ? Number(answers.C7) : null; // propensione investimenti
    const c8 = answers.C8 != null ? Number(answers.C8) : null; // debiti / esposizione

    // Helper gap
    const getGapRatio = (k) => {
        if (!gapStatale || !gapStatale[k]) return 0;
        const adeguato = gapStatale[k].adeguato || 0;
        const gap = gapStatale[k].gap || 0;
        if (!adeguato || adeguato <= 0) return 0;
        return gap / adeguato; // 0 = ok, 1 = totalmente scoperto
    };

    const ratioMorte = getGapRatio("morte");
    const ratioInvalidita = getGapRatio("invalidita");
    const ratioPensione = getGapRatio("pensione");

    /* =========================
       1) FIGLI + PROTEZIONE
    ========================== */

    // FIGLI + percezione alta + gap elevato su morte/invalidità
    if (
        numeroFigli > 0 &&
        a1 != null && a1 >= 4 &&
        (ratioMorte > 0.5 || ratioInvalidita > 0.5)
    ) {
        add(
            "FIGLI_GAP_PROTEZIONE",
            "Presenza di figli a carico e percezione elevata di protezione economica, " +
            "ma la stima di scopertura in caso di morte/invalidità risulta ancora rilevante. " +
            "Allineare la percezione del cliente alla reale tenuta economica della famiglia.",
            "critico"
        );
    }

    // Percezione alta vs gap elevato (caso generale, senza focus specifico sui figli)
    if (
        (numeroFigli || 0) === 0 &&        // nessun figlio -> uso regola generica
        a1 != null && a1 >= 4 &&
        (ratioMorte > 0.5 || ratioInvalidita > 0.5)
    ) {
        add(
            "PERC_VS_GAP_PROTEZIONE",
            "Alta percezione di protezione economica in caso di imprevisti gravi, " +
            "ma la scopertura stimata su morte/invalidità risulta ancora rilevante.",
            "alto"
        );
    }

    // Figli + percezione molto bassa
    if (numeroFigli > 0 && a1 != null && a1 <= 2) {
        add(
            "FAMIGLIA_SCOPERTA_PERCEPITA",
            "Presenza di figli a carico e percezione molto bassa di protezione economica: " +
            "area emotiva sensibile da presidiare con priorità.",
            "alto"
        );
    }

    // Figli presenti ma tutela specifica per i figli considerata poco rilevante
    if (numeroFigli > 0 && a6 != null && a6 <= 2) {
        add(
            "FIGLI_IMPORTANZA_BASSA",
            "Presenza di figli a carico, ma la tutela specifica a loro nome viene percepita come poco rilevante. " +
            "Verificare coerenza tra responsabilità genitoriale e priorità assicurative dichiarate.",
            "alto"
        );
    }

    // Single fragile (nessun figlio ma situazione complessiva debole)
    if (
        statoFamiliare === "single" &&
        reddito > 0 && reddito < 20000 &&
        a1 != null && a1 <= 2
    ) {
        add(
            "SINGLE_FRAGILE",
            "Cliente single con reddito contenuto e percezione di protezione molto bassa: " +
            "elevata esposizione a shock di reddito anche di breve durata.",
            "medio"
        );
    }

    /* =========================
       2) SANITARIA / LAVORO
    ========================== */

    if (a4 != null && a4 <= 2 && eta >= 50) {
        add(
            "SANITARIA_CRITICA",
            "Percezione di tutela sanitaria molto bassa in una fascia di età in cui i costi sanitari tendono ad aumentare. " +
            "Valutare una struttura integrativa sanitaria.",
            "alto"
        );
    }

    if (
        (tipoLavoratore === "autonomo" || tipoLavoratore === "imprenditore") &&
        a1 != null && a1 >= 4 &&
        ratioInvalidita > 0.4
    ) {
        add(
            "AUTONOMO_SOTTOSTIMA_INVALIDITA",
            "Attività autonoma/imprenditoriale con forte dipendenza dalla capacità lavorativa personale: " +
            "la percezione di protezione è elevata ma la copertura per invalidità risulta insufficiente.",
            "critico"
        );
    }

    if (
        a4 != null && a4 >= 4 &&
        ((b5 != null && b5 >= 4) || (b8 != null && b8 >= 4))
    ) {
        add(
            "SSN_VS_RISCHIO_FISICO",
            "Elevata fiducia nelle tutele sanitarie pubbliche a fronte di attività o abitudini con livello di rischio fisico significativo.",
            "medio"
        );
    }

    /* =========================
       3) PERCEZIONE vs AUTONOMIA
    ========================== */

    if (
        a1 != null && a2 != null &&
        a1 <= 2 &&        // percezione: per nulla / poco protetto
        a2 >= 4          // autonomia famiglia > 2 anni
    ) {
        add(
            "PERCEZIONE_VS_AUTONOMIA",
            "Il cliente dichiara di sentirsi quasi per nulla protetto in caso di evento grave, " +
            "ma valuta che la famiglia potrebbe mantenere il tenore di vita per oltre 2 anni: " +
            "disallineamento tra percezione del rischio e capacità reale di tenuta.",
            "alto"
        );
    }

    /* =========================
       4) PREVIDENZA
    ========================== */

    // Età avanzata + gap pensione rilevante + azione previdenziale bassa
    if (
        eta >= 55 &&
        ratioPensione > 0.4 &&
        c1 != null && c1 <= 2
    ) {
        add(
            "PREV_RITARDO_CRITICO",
            "Età avanzata e gap pensionistico rilevante a fronte di azione sulla previdenza complementare molto bassa. " +
            "Rischio concreto di tenore di vita ridotto in pensione se non si interviene.",
            "critico"
        );
    }

    // Gap pensione rilevante + età non avanzata ma azione comunque troppo bassa
    if (
        eta >= 45 && eta < 55 &&
        ratioPensione > 0.4 &&
        c1 != null && c1 <= 2
    ) {
        add(
            "PREV_AZIONE_INSUFFICIENTE",
            "Gap pensionistico già significativo rispetto all'età attuale, ma azione dichiarata sulla previdenza complementare molto contenuta.",
            "alto"
        );
    }

    // Obiettivi chiari ma poca consapevolezza numerica
    if (
        c4 != null && c4 >= 4 &&
        c3 != null && c3 <= 2
    ) {
        add(
            "PREV_OBIETTIVI_VS_NUMERI",
            "Obiettivi futuri dichiarati molto chiari, ma scarsa consapevolezza dei numeri legati alla pensione: " +
            "necessario quantificare il fabbisogno per rendere credibile il piano.",
            "medio"
        );
    }

    // Profilo normotipo che segnala forte bisogno vita vs percezione
    if (
        normotipo &&
        normotipo.priorita &&
        normotipo.priorita.vita >= 80 &&
        a1 != null && a1 <= 3
    ) {
        add(
            "NORMOTIPO_VS_PERCEZIONE",
            "Il profilo normotipo evidenzia una forte necessità di protezione vita, " +
            "ma la percezione soggettiva non riflette pienamente questo bisogno.",
            "medio"
        );
    }

    /* =========================
       5) RISCHIO / DEBITO / LIQUIDITÀ
    ========================== */

    // Propensione al rischio elevata + debiti pesanti + poca riserva
    if (
        ((b6 != null && b6 >= 4) || (c7 != null && c7 >= 4)) &&
        c8 != null && c8 <= 2 &&
        b3 != null && b3 <= 2
    ) {
        add(
            "RISCHIO_DEBITO_CRITICO",
            "Elevata propensione al rischio con debiti importanti e scarsa riserva di sicurezza: " +
            "combinazione potenzialmente instabile sul piano finanziario.",
            "critico"
        );
    }

    // Alta capacità di risparmio dichiarata ma riserva di sicurezza molto bassa
    if (
        b2 != null && !Number.isNaN(b2) &&
        b3 != null && !Number.isNaN(b3) &&
        b2 >= 4 &&          // "riesco a risparmiare molto / con costanza"
        b3 <= 2             // riserva ≤ 3 mesi
    ) {
        add(
            "RISPARMIO_SENZA_RISERVA",
            "Capacità di risparmio mensile dichiarata elevata, ma riserva di sicurezza attuale molto ridotta: " +
            "disallineamento tra il comportamento di risparmio dichiarato e il risultato concreto accumulato.",
            "alto"
        );
    }

    return lista;
}



/* =========================
   COERENZA AVANZATA PERSONA
========================= */
function calcolaIndiceCoerenzaAvanzataPersona(answers, userData, gapStatale) {
    if (!answers) return { indice: null, dettagli: [] };

    const dettagli = [];
    let punteggio = 100;

    const eta = userData.age || 0;
    const numeroFigli = userData.numeroFigli || 0;  // uso esplicito dei figli

    const a1 = answers.A1 != null ? Number(answers.A1) : null; // percezione protezione economica
    const a4 = answers.A4 != null ? Number(answers.A4) : null; // percezione tutela sanitaria

    const b2 = answers.B2 != null ? Number(answers.B2) : null; // capacità di risparmio mensile
    const b3 = answers.B3 != null ? Number(answers.B3) : null; // riserva / liquidità
    const b5 = answers.B5 != null ? Number(answers.B5) : null; // rischio fisico lavoro
    const b6 = answers.B6 != null ? Number(answers.B6) : null; // propensione al rischio
    const b8 = answers.B8 != null ? Number(answers.B8) : null; // attività rischiose

    const c1 = answers.C1 != null ? Number(answers.C1) : null; // azione previdenza complementare
    const c3 = answers.C3 != null ? Number(answers.C3) : null; // consapevolezza numeri pensione
    const c4 = answers.C4 != null ? Number(answers.C4) : null; // chiarezza obiettivi futuri
    const c7 = answers.C7 != null ? Number(answers.C7) : null; // propensione investimenti
    const c8 = answers.C8 != null ? Number(answers.C8) : null; // debiti / esposizione

    const getGapRatio = (k) => {
        if (!gapStatale || !gapStatale[k]) return 0;
        const adeg = gapStatale[k].adeguato || 0;
        const gap = gapStatale[k].gap || 0;
        if (!adeg || adeg <= 0) return 0;
        return gap / adeg; // 0 = ok, 1 = totalmente scoperto
    };

    const ratioMorte = getGapRatio("morte");
    const ratioInvalidita = getGapRatio("invalidita");
    const ratioPensione = getGapRatio("pensione");

    const penalizza = (punti, descrizione, codice) => {
        punteggio -= punti;
        dettagli.push({
            codice: codice || "GEN",
            descrizione,
            impatto: punti
        });
    };

    // 🔴 AREA PROTEZIONE / AUTONOMIA
    if (a1 != null && b3 != null && a1 >= 4 && b3 <= 2) {
        penalizza(
            8,
            "Percezione di forte protezione economica, ma autonomia finanziaria molto limitata in caso di stop del reddito.",
            "COER_PROTEZIONE_AUTONOMIA"
        );
    }

    // 🔴 AREA PROTEZIONE / GAP OGGETTIVO
    if (a1 != null && a1 >= 4 && (ratioMorte > 0.5 || ratioInvalidita > 0.5)) {
        penalizza(
            10,
            "Percezione di elevata protezione in caso di eventi gravi, a fronte di una scopertura stimata ancora rilevante.",
            "COER_PROTEZIONE_GAP"
        );
    }

    // 🔴 FIGLI + PERCEZIONE PROTEZIONE VS GAP
    if (
        numeroFigli > 0 &&
        a1 != null && a1 >= 4 &&
        (ratioMorte > 0.5 || ratioInvalidita > 0.5)
    ) {
        penalizza(
            6,
            "Presenza di figli a carico con percezione di forte protezione economica, ma scopertura stimata significativa in caso di morte/invalidità.",
            "COER_FIGLI_PROTEZIONE_GAP"
        );
    }

    // 🔴 AREA SANITARIA / RISCHIO LAVORO / SPORT
    if (a4 != null && a4 >= 4 && ((b5 != null && b5 >= 4) || (b8 != null && b8 >= 4))) {
        penalizza(
            6,
            "Elevata fiducia nel SSN a fronte di attività o lavoro con livello di rischio fisico significativo.",
            "COER_SSN_RISCHIO"
        );
    }

    // 🔴 AREA RISCHIO / DEBITO / LIQUIDITÀ
    if (
        ((b6 != null && b6 >= 4) || (c7 != null && c7 >= 4)) &&
        c8 != null && c8 <= 2 &&
        b3 != null && b3 <= 2
    ) {
        penalizza(
            10,
            "Elevata propensione al rischio con debiti pesanti e scarsa riserva di sicurezza: combinazione potenzialmente instabile.",
            "COER_RISCHIO_DEBITO"
        );
    }

    // 🔴 NUOVO: RISPARMIO DICHIARATO ALTO VS RISERVA BASSA
    if (
        b2 != null && !Number.isNaN(b2) &&
        b3 != null && !Number.isNaN(b3) &&
        b2 >= 4 &&          // risparmio mensile percepito alto
        b3 <= 2             // riserva ≤ 3 mesi
    ) {
        penalizza(
            7,
            "Capacità di risparmio mensile dichiarata elevata, ma riserva di sicurezza attuale molto ridotta: coerenza tra intenzioni e risultato accumulato da rafforzare.",
            "COER_RISPARMIO_RISERVA"
        );
    }

    // 🔴 AREA PREVIDENZA / GAP PENSIONE
    if (
        eta >= 50 &&
        c1 != null && c1 <= 2 &&
        ratioPensione > 0.4
    ) {
        penalizza(
            9,
            "Bassa azione sulla previdenza complementare a fronte di età e gap pensionistico che richiederebbero intervento.",
            "COER_PREVIDENZA_GAP"
        );
    }

    // 🔴 AREA PREVIDENZA / CONSAPEVOLEZZA NUMERICA
    if (
        c4 != null && c4 >= 4 &&
        c3 != null && c3 <= 2
    ) {
        penalizza(
            5,
            "Obiettivi futuri dichiarati molto chiari, ma scarsa consapevolezza sui numeri legati alla pensione.",
            "COER_OBIETTIVI_PENSIONE"
        );
    }

    // Normalizzazione indice
    if (punteggio < 0) punteggio = 0;
    if (punteggio > 100) punteggio = 100;

    return {
        indice: Math.round(punteggio),
        dettagli
    };
}


/* =========================
   PRIORITÀ PRODOTTI PERSONA
   - Pipeline: Protezione → Previdenza → Investimenti
========================= */
function calcolaPrioritaProdottiPersona(risultati) {
    if (!risultati) return [];

    const semaforo = risultati.semaforo || {};
    const normotipo = risultati.normotipo || {};
    const gapStatale = risultati.gapStatale || null;
    const aree = risultati.aree || {};
    const coerenzaAvanzata = risultati.coerenzaAvanzata || {};
    const incongruenze = Array.isArray(risultati.incongruenze) ? risultati.incongruenze : [];
    const userData = risultati.userData || {};
    const eta = userData.age || null;

    const prioNormotipo = normotipo.priorita || {};

    const getGapRatio = (k) => {
        if (!gapStatale || !gapStatale[k]) return 0;
        const adeguato = gapStatale[k].adeguato || 0;
        const gap = gapStatale[k].gap || 0;
        if (!adeguato || adeguato <= 0) return 0;
        return gap / adeguato;
    };

    const semColorScore = (colore) => {
        switch ((colore || "").toLowerCase()) {
            case "red":    return 95;
            case "orange": return 80;
            case "yellow": return 60;
            case "green":  return 40;
            case "gray":   return 30;
            default:       return 50;
        }
    };

    const getAreaScore = (areaKey) => {
        const info = aree[areaKey] || {};
        return typeof info.score === "number" ? info.score : 60; // default neutro
    };

    const areaRischio = (areaKey) => {
        const s = getAreaScore(areaKey);
        return 100 - s; // score basso = più rischio ⇒ più priorità
    };

    const scoreCoerenza = typeof coerenzaAvanzata.indice === "number"
        ? coerenzaAvanzata.indice
        : null;

    const numIncongrCritiche = incongruenze.filter(
        (x) => x && (x.livello === "alto" || x.livello === "critico")
    ).length;

    // Macro indicatori per gating della pipeline
    const protezioneAreaScore = getAreaScore("protezione");
    const previdenzaAreaScore = getAreaScore("previdenza");
    const investimentiAreaScore = getAreaScore("investimenti");
    const liquiditaAreaScore = getAreaScore("reddito_stile_vita");

    const gapMorteRatio = getGapRatio("morte");
    const gapInvaliditaRatio = getGapRatio("invalidita");
    const gapPensioneRatio = getGapRatio("pensione");

    const protezioneCritica =
        protezioneAreaScore < 50 ||
        gapMorteRatio > 0.6 ||
        gapInvaliditaRatio > 0.6;

    const previdenzaCritica =
        previdenzaAreaScore < 50 ||
        (gapPensioneRatio > 0.4 && (eta == null || eta >= 45));

    const prodottiDef = [
        { key: "tcm",          nome: "TCM (reddito famiglia)",    famiglia: "protezione", icon: "👨‍👩‍👧‍👦", gapKey: "morte" },
        { key: "infortuni",    nome: "Infortuni",                 famiglia: "protezione", icon: "⚙️",   gapKey: "invalidita" },
        { key: "sanitaria",    nome: "Sanitaria",                 famiglia: "protezione", icon: "🏥",   gapKey: null },
        { key: "ltc",          nome: "Non autosufficienza (LTC)", famiglia: "protezione", icon: "🧩",   gapKey: "ltc" },
        { key: "previdenza",   nome: "Previdenza complementare",  famiglia: "previdenza", icon: "📈",   gapKey: "pensione" },
        { key: "investimenti", nome: "Investimenti / accumulo",   famiglia: "patrimonio", icon: "💰",   gapKey: null }
    ];

    const mapProdottoArea = (key) => {
        switch (key) {
            case "vita":
            case "tcm":
            case "infortuni":
            case "sanitaria":
            case "ltc":
                return "protezione";
            case "previdenza":
                return "previdenza";
            case "investimenti":
                return "investimenti";
            default:
                return null;
        }
    };

    const risultatiProdotti = prodottiDef.map((p) => {
        const infoSem = semaforo[p.key] || {};
        const colore = infoSem.colore || "gray";
        const motivoSemaforo = infoSem.motivo || "";

        const scoreSem = semColorScore(colore);
        const scoreNorm = prioNormotipo[p.key] != null
            ? Number(prioNormotipo[p.key])
            : 60;

        let scoreGap = 0;
        if (p.gapKey) {
            const ratio = getGapRatio(p.gapKey);
            scoreGap = Math.max(0, Math.min(100, Math.round(ratio * 100)));
        }

        const areaKey = mapProdottoArea(p.key);
        const scoreArea = areaKey ? areaRischio(areaKey) : 50;

        let scoreRaw;

        switch (p.key) {
            // Protezione: forte peso a semaforo + gap + area protezione
            case "vita":
            case "tcm":
            case "infortuni":
            case "sanitaria":
            case "ltc":
                scoreRaw =
                    scoreSem * 0.40 +
                    scoreNorm * 0.30 +
                    scoreGap * 0.20 +
                    scoreArea * 0.10;
                break;

            // Previdenza: equilibrio tra normotipo, gap pensione e area previdenza
            case "previdenza":
                scoreRaw =
                    scoreSem * 0.30 +
                    scoreNorm * 0.35 +
                    scoreGap * 0.25 +
                    scoreArea * 0.10;
                break;

            // Investimenti: meno “impulso” dal gap, più da profilo + coerenza
            case "investimenti": {
                let fattoreCoerenza = 1;
                if (scoreCoerenza != null && scoreCoerenza < 70) {
                    fattoreCoerenza = 0.9;
                }
                if (scoreCoerenza != null && scoreCoerenza < 60) {
                    fattoreCoerenza = 0.8;
                }

                let penalitaIncongr = 0;
                if (numIncongrCritiche >= 3) penalitaIncongr = 15;
                else if (numIncongrCritiche === 2) penalitaIncongr = 8;
                else if (numIncongrCritiche === 1) penalitaIncongr = 4;

                scoreRaw =
                    scoreSem * 0.30 +
                    scoreNorm * 0.35 +
                    scoreArea * 0.20;

                scoreRaw = scoreRaw * fattoreCoerenza - penalitaIncongr;
                break;
            }

            default:
                scoreRaw =
                    scoreSem * 0.35 +
                    scoreNorm * 0.35 +
                    scoreGap * 0.15 +
                    scoreArea * 0.15;
        }

        // ✅ GATING PIPELINE
        if (protezioneCritica) {
            // Protezione davanti a tutto
            if (
                p.key === "tcm" ||
                p.key === "infortuni" ||
                p.key === "sanitaria" ||
                p.key === "ltc"
            ) {
                scoreRaw += 10;
            } else if (p.key === "previdenza") {
                scoreRaw = Math.min(scoreRaw, 70);
            } else if (p.key === "investimenti") {
                // Investimenti fortemente ridimensionati se protezione non è a posto
                scoreRaw = Math.min(scoreRaw, 55);
            }
        } else if (!protezioneCritica && previdenzaCritica) {
            // Protezione ok, previdenza ancora indietro
            if (p.key === "previdenza") {
                scoreRaw += 10;
            } else if (p.key === "investimenti") {
                scoreRaw = Math.min(scoreRaw, 70);
            }
        }

        let score = Math.round(Math.max(0, Math.min(100, scoreRaw)));

        let livello = "basso";
        if (score >= 80) livello = "altissimo";
        else if (score >= 65) livello = "alto";
        else if (score >= 50) livello = "medio";

        const notaConsulente = (() => {
            if (p.key === "tcm") {
                if (protezioneCritica) {
                    return "Gap di protezione rilevante: TCM da mettere al centro della conversazione prima di tutto il resto.";
                }
                if (gapMorteRatio > 0.4) {
                    return "Scopertura in caso morte significativa rispetto al target: valutare rapidamente copertura TCM.";
                }
            }

            if (p.key === "previdenza") {
                if (previdenzaCritica) {
                    return "Gap pensionistico rilevante rispetto a età e aspettative: portare il tema previdenza entro il primo ciclo di appuntamenti.";
                }
                if (gapPensioneRatio > 0.3 && eta != null && eta >= 50) {
                    return "Età avanzata e gap pensione non trascurabile: calendarizzare un focus dedicato sulla previdenza.";
                }
            }

            if (p.key === "investimenti") {
                if (protezioneCritica || previdenzaCritica) {
                    return "Investimenti da trattare solo dopo aver messo in sicurezza protezione e previdenza.";
                }
                if (scoreCoerenza != null && scoreCoerenza < 60) {
                    return "Prima di strutturare investimenti complessi, lavorare su coerenza decisionale e allineamento aspettative/rischio.";
                }
            }

            return "";
        })();

        return {
            key: p.key,
            nome: p.nome,
            famiglia: p.famiglia,
            icon: p.icon,
            score,
            livello,
            coloreSemaforo: colore,
            motivoSemaforo,
              notaConsulente: notaConsulente,
  note: notaConsulente, // alias backward compat
        };
    });

    risultatiProdotti.sort((a, b) => b.score - a.score);

    return risultatiProdotti;
}


/* =========================
   SINTESI OPERATIVA PERSONA
========================= */
function generaSintesiOperativaPersona(risultati) {
    if (!risultati) return [];

    const priorita = Array.isArray(risultati.prioritaProdotti)
        ? risultati.prioritaProdotti
        : [];
    const gapStatale = risultati.gapStatale || null;
    const incongruenze = Array.isArray(risultati.incongruenze)
        ? risultati.incongruenze
        : [];
    const indiceGlobale = risultati.indiceGlobale ?? null;
    const normotipo = risultati.normotipo || null;

    const bullets = [];

    if (indiceGlobale != null) {
        let testo;
        if (indiceGlobale >= 80) {
            testo = "Profilo complessivo in buon equilibrio. Intervento mirato su alcune aree specifiche può consolidare il livello di protezione.";
        } else if (indiceGlobale >= 60) {
            testo = "Equilibrio complessivo accettabile, ma con alcune aree di vulnerabilità che richiedono un intervento strutturato.";
        } else if (indiceGlobale >= 40) {
            testo = "Profilo con diverse criticità: è prioritario definire un piano di protezione e pianificazione in più step.";
        } else {
            testo = "Profilo complessivamente fragile: impostare un percorso di messa in sicurezza graduale ma continuativo.";
        }

        bullets.push({
            tipo: "overview",
            titolo: "Equilibrio complessivo del cliente",
            dettaglio: testo,
            peso: 90
        });
    }

    const topProdotti = priorita
        .filter(p => (p.score ?? 0) >= 65)
        .slice(0, 3);

    topProdotti.forEach((p, idx) => {
        const labelOrdine = idx === 0
            ? "Intervento primario"
            : (idx === 1 ? "Intervento secondario" : "Intervento successivo");

        const base = `${labelOrdine}: presidiare la copertura ${p.nome} (${p.famiglia}).`;
        const motivo = p.notaConsulente || p.motivoSemaforo || "";

        bullets.push({
            tipo: "prodotto",
            prodottoKey: p.key,
            titolo: p.nome,
            dettaglio: motivo ? `${base} ${motivo}` : base,
            peso: 100 - idx * 5
        });
    });

    if (gapStatale) {
        const critici = [];

        const pushCritico = (label, key) => {
            if (!gapStatale[key]) return;
            const adeg = gapStatale[key].adeguato || 0;
            const gap = gapStatale[key].gap || 0;
            if (!adeg || adeg <= 0) return;
            const ratio = gap / adeg;
            if (ratio >= 0.5) critici.push(label);
        };

        pushCritico("morte", "morte");
        pushCritico("invalidità", "invalidita");
        pushCritico("non autosufficienza", "ltc");
        pushCritico("pensione", "pensione");

        if (critici.length) {
            bullets.push({
                tipo: "gap_statale",
                titolo: "Scoperture rilevanti rispetto alle tutele pubbliche",
                dettaglio: `Le principali aree di scopertura rispetto al solo sistema pubblico sono: ${critici.join(", ")}. È opportuno costruire coperture dedicate.`,
                peso: 85
            });
        }
    }

    const incRilevanti = incongruenze.filter(inc =>
        (inc.livello || "").toLowerCase() === "critico" ||
        (inc.livello || "").toLowerCase() === "alto"
    ).slice(0, 3);

    if (incRilevanti.length) {
        const elenco = incRilevanti
            .map(inc => `- ${inc.messaggio}`)
            .join("<br/>");

        bullets.push({
            tipo: "incongruenze",
            titolo: "Punti di incoerenza utili al dialogo",
            dettaglio: `Alcune risposte evidenziano discrepanze tra percezione e realtà di copertura:<br/>${elenco}`,
            peso: 80
        });
    }

    if (normotipo && normotipo.profilo) {
        bullets.push({
            tipo: "normotipo",
            titolo: "Stile di ingaggio consigliato",
            dettaglio: `Impostare la conversazione in coerenza con il profilo "${normotipo.profilo}", valorizzando i driver principali emersi e accompagnando gradualmente sui temi più sensibili.`,
            peso: 70
        });
    }

    const ordinati = bullets
        .sort((a, b) => (b.peso || 0) - (a.peso || 0))
        .slice(0, 5);

    return ordinati;
}

/* =========================
   DOMANDE POTENTI – METODO ROSSO (PERSONA)
   Suggerimenti consulenziali basati su contestoPersona
========================= */

/**
 * generaDomandePotentiPersona
 *
 * @param {Object|null} contestoPersona - output di buildContestoPersonaFromAnagrafica
 * @returns {Array<{id:string, titolo:string, domande:string[]}>}
 *
 * NOTA:
 * - Non è usata per lo scoring.
 * - Non è un questionario da compilare.
 * - Serve solo come libreria di spunti per il consulente.
 */
function generaDomandePotentiPersona(contestoPersona) {
    if (!contestoPersona || !contestoPersona.segmenti) {
        return [];
    }

    const seg = Array.isArray(contestoPersona.segmenti)
        ? contestoPersona.segmenti
        : [];

        const risultato = [];

    const has = (tag) => seg.includes(tag);

    // =========================
    // PROFILO FAMIGLIA CON FIGLI ATTIVI
    // =========================
    if (has("profilo_F1_famiglia_figli_attivi")) {
        risultato.push({
            id: "F1_core",
            titolo: "Famiglia con figli: leve da approfondire",
            domande: [
                "Se per un periodo non potessi lavorare, come cambierebbe concretamente la vita quotidiana dei tuoi figli nei prossimi 6-12 mesi?",
                "In caso di tua assenza improvvisa, chi si occuperebbe in pratica delle spese ricorrenti legate ai tuoi figli (scuola, sport, attività extra)?",
                "Ad oggi, quanto è chiaro tra voi genitori chi fa cosa se dovesse arrivare un evento serio (invalidità, malattia, morte prematura)?"
            ]
        });
    }

    // =========================
    // PROFILO SINGLE UNDER 30
    // =========================
    if (has("profilo_S1_single_under30")) {
        risultato.push({
            id: "S1_core",
            titolo: "Single under 30: costruzione delle basi",
            domande: [
                "Se tra 5 anni guardassi indietro a oggi, cosa ti dispiacerebbe non aver messo in sicurezza (salute, reddito, progetti)?",
                "In caso di infortunio o malattia che ti fermano per qualche mese, da chi dipenderesti concretamente per le spese fisse?",
                "Quanto è importante per te poter scegliere in autonomia il tuo futuro (casa, lavoro, città) senza dover chiedere aiuto economico alla famiglia?",
                "Oggi quanto spazio hanno nella tua testa imprevisti seri (salute, lavoro) rispetto ai progetti ‘positivi’ che stai costruendo?"
            ]
        });
    }


    // =========================
    // PROFILO FAMIGLIA CON FIGLI GRANDI / CLIENTE MATURO
    // =========================
    if (has("profilo_F2_famiglia_figli_grandi")) {
        risultato.push({
            id: "F2_legacy",
            titolo: "Trasferimento del patrimonio e ruoli in famiglia",
            domande: [
                "Oggi i tuoi figli hanno chiaro cosa succederebbe al patrimonio familiare se a te o al tuo partner succedesse qualcosa?",
                "Ci sono beni o capitali che vorresti fossero destinati in modo diverso rispetto alla 'divisione standard' prevista dalla legge?",
                "Chi, in famiglia, sarebbe più in difficoltà a gestire pratiche, burocrazia e decisioni se fossi tu a non poterlo più fare?"
            ]
        });
    }

    // =========================
    // PROFILO SINGLE GIOVANE
    // =========================
    if (has("profilo_S1_single_under30")) {
        risultato.push({
            id: "S1_growth",
            titolo: "Costruzione del primo zoccolo di sicurezza",
            domande: [
                "Se domani dovessi fermarti 3 mesi per un problema di salute, quale sarebbe l’impatto concreto sul tuo stile di vita attuale?",
                "Oggi, quali sono le 2-3 spese che non potresti permetterti di tagliare neanche in caso di emergenza?",
                "Tra accumulare capitale e proteggere il reddito, cosa ti preoccupa di più nei prossimi 5 anni?"
            ]
        });
    }

    // =========================
    // PROFILO PENSIONATO
    // =========================
    if (has("profilo_P_pensionato")) {
        risultato.push({
            id: "P1_equilibrio",
            titolo: "Pensione, stabilità e non autosufficienza",
            domande: [
                "Negli ultimi anni, quanto senti che il costo della vita abbia eroso la tua pensione reale?",
                "Se dovessi aver bisogno di assistenza continuativa (es. badante o struttura), chi prenderebbe le decisioni economiche al posto tuo?",
                "C’è qualcosa che oggi ti trattiene dal proteggere in modo più strutturato il rischio di perdita di autosufficienza?"
            ]
        });
    }

    // =========================
    // PROFILO AUTONOMO / IMPRENDITORE CON RISCHIO REDDITO
    // =========================
    if (has("profilo_L1_autonomo_rischio")) {
        risultato.push({
            id: "L1_business",
            titolo: "Continuità del reddito e del business",
            domande: [
                "Se domani ti fermassi per 6 mesi, quali entrate aziendali o professionali continuerebbero ad arrivare senza di te?",
                "Oggi chi, oltre a te, ha la visione completa di incassi, costi e impegni finanziari della tua attività?",
                "Cosa succederebbe ai tuoi debiti professionali se fossi impossibilitato a lavorare per un periodo lungo?"
            ]
        });
    }

    // Se per qualche motivo non è scattato nessun profilo,
    // ritorniamo comunque un array (vuoto).
    return risultato;
}

/* =========================
   QUESTIONARIO PERSONA
========================= */
function getDomandePersona() {
    // 1) Lista base domande (già decorate da persona_domande.js)
    const domandeBase = Array.isArray(window.questionsPersona)
        ? window.questionsPersona
        : [];

    if (!domandeBase.length) {
        console.error("questionsPersona non definito o non è un array.");
        return [];
    }

    // 2) Calcolo / recupero contestoPersona a partire dall'anagrafica
    let contesto = null;
    try {
        if (typeof buildContestoPersonaFromAnagrafica === "function") {
            const ana =
                (appStatePersona &&
                    appStatePersona.user &&
                    appStatePersona.user.anagrafica) || {};

            contesto = buildContestoPersonaFromAnagrafica(ana);
        }
    } catch (err) {
        console.warn("Errore nel calcolo del contestoPersona:", err);
        contesto = null;
    }

    // 3) Allineo lo state (Single Source of Truth: contesto SOLO in dynamic)
if (!appStatePersona.questionnaire) {
    appStatePersona.questionnaire = {
        currentIndex: 0,
        answers: {}
    };
}
if (!appStatePersona.dynamic) {
    appStatePersona.dynamic = {
        contestoPersona: null,
        domandeVisibili: [],
        indiceCorrente: 0
    };
}

// ✅ contesto ufficiale solo qui
appStatePersona.dynamic.contestoPersona = contesto || null;

const answers = appStatePersona.questionnaire.answers || {};


    // 4) Filtro domande in base a visibileSe / segmentiTarget
    const domandeVisibili = domandeBase.filter((q) => {
        if (!q) return false;

        // Priorità: funzione visibileSe
        if (typeof q.visibileSe === "function") {
            try {
                return !!q.visibileSe(contesto, answers);
            } catch (err) {
                console.warn("Errore in visibileSe per domanda", q.id, err);
                // Non blocco il questionario per un errore di logica: fallback "visibile"
                return true;
            }
        }

        // Secondo livello: segmentiTarget vs eventuali segmenti nel contesto
        if (Array.isArray(q.segmentiTarget) && q.segmentiTarget.length && contesto) {
            const segmentiPersona = Array.isArray(contesto.segmenti)
                ? contesto.segmenti
                : [];

            if (segmentiPersona.length) {
                return q.segmentiTarget.some((seg) => segmentiPersona.includes(seg));
            }
        }

        // Default V1: se non c'è logica specifica, la domanda è visibile
        return true;
    });

// 4-bis) RIDUZIONE CLUSTERIZZATA CENTRALIZZATA (V2)
let domandeFinali = domandeVisibili;
try {
    domandeFinali = riduciDomandePerProfiloPersona(contesto, domandeFinali);
} catch (err) {
    console.warn("Errore in riduciDomandePerProfiloPersona:", err);
    domandeFinali = domandeVisibili;
}

// ✅ Guardrail: se cambiano le domande attive, NON perdo dati.
// Archivia risposte orfane e ripristina se le domande tornano attive.
try {
    const idsAttivi = new Set(domandeFinali.map(d => d && d.id).filter(Boolean));

    if (!appStatePersona.questionnaire) appStatePersona.questionnaire = {};
    if (!appStatePersona.questionnaire.answers) appStatePersona.questionnaire.answers = {};
    if (!appStatePersona.questionnaire.risposteOrfane) appStatePersona.questionnaire.risposteOrfane = {};

    const ansState = appStatePersona.questionnaire.answers;
    const orfane = appStatePersona.questionnaire.risposteOrfane;

    let archived = 0;
    for (const k of Object.keys(ansState)) {
        if (!idsAttivi.has(k)) {
            orfane[k] = ansState[k];
            delete ansState[k];
            archived++;
        }
    }

    let restored = 0;
    for (const k of Object.keys(orfane)) {
        if (idsAttivi.has(k) && ansState[k] == null) {
            ansState[k] = orfane[k];
            delete orfane[k];
            restored++;
        }
    }

    if (archived > 0) {
        console.log(`📦 Risposte archiviate (cambio profilo): ${archived}. Non perse.`);
    }
    if (restored > 0) {
        console.log(`♻️ Risposte ripristinate (domande tornate attive): ${restored}.`);
    }

    appStatePersona.questionnaire.answers = ansState;
    appStatePersona.questionnaire.risposteOrfane = orfane;
} catch (e) {
    console.warn("Errore nella gestione risposte orfane:", e);
}


appStatePersona.dynamic.domandeVisibili = domandeFinali;

// 5) Riallineo l'indice corrente rispetto al nuovo numero di domande
let idx = appStatePersona.questionnaire.currentIndex || 0;
if (idx < 0) idx = 0;
if (domandeFinali.length === 0) {
    idx = 0;
} else if (idx >= domandeFinali.length) {
    idx = domandeFinali.length - 1;
}
appStatePersona.questionnaire.currentIndex = idx;
appStatePersona.dynamic.indiceCorrente = idx;


    // Debug: elenco domande visibili e conteggio, per controllo cluster
    try {
        const idsDebug = domandeFinali
            .map((d) => d && d.id)
            .filter(Boolean);
        console.log(
            "Questionario persona – domande visibili:",
            idsDebug,
            "totale:",
            idsDebug.length
        );
    } catch (err) {
        console.warn("Errore nel debug domande visibili persona:", err);
    }

    // 6) Ritorno solo le domande effettivamente attive
    return domandeFinali;
}

/**
 * Determina il profilo operativo V2 (uno solo) a partire dal contesto.
 * Regola: se più profili scattano insieme, scegliamo il più “dominante”.
 * Priorità: F1 (famiglia) > L1 (autonomo rischio) > S1 (giovane single)
 *
 * @returns {"F1"|"L1"|"S1"|null}
 */
// Cache log profilo (evita spam quando getDomandePersona() viene richiamata più volte)
let __lastV2ProfiloLogKey = null;

function resolveProfiloOperativoPersonaV2(contesto) {
    const seg = contesto && Array.isArray(contesto.segmenti) ? contesto.segmenti : [];

    let profilo = null;
    if (seg.includes("profilo_F1_famiglia_figli_attivi")) profilo = "F1";
    else if (seg.includes("profilo_L1_autonomo_rischio")) profilo = "L1";
    else if (seg.includes("profilo_S1_single_under30")) profilo = "S1";

    // ✅ FAIL-SAFE: mai null in produzione
    if (!profilo) profilo = "GENERIC";

    try {
        const key = `${profilo}|${seg.join(",") || "no-segmenti"}`;
        if (key !== __lastV2ProfiloLogKey) {
            __lastV2ProfiloLogKey = key;
            console.log("🧩 V2 profilo: scelto=", profilo, "segmenti=", seg);
        }
    } catch (e) {}

    return profilo;
}




// Matrice V2: cluster "core" per profilo (domande chiave)
// Tenere qui per evitare ricreazione ad ogni chiamata
const PROFILI_V2_CORE = {
    S1: [
        "A1", "A2", "A4", "A6",
        "B2", "B3", "B5", "B6", "B8",
        "C1", "C3", "C4", "C7", "C8"
    ],
    F1: [
        "B2", "B3", "B5", "B6", "B7",
        "A1", "A2", "A4", "A6",
        "C1", "C2", "C3", "C4",
        "C7", "C8"
    ],
    L1: [
        "A1", "A2", "A6",
        "B2", "B3", "B5", "B6", "B8",
        "C1", "C3", "C4", "C7", "C8"
    ]
};

// Domande “driver” del Metodo Rosso: non devono MAI sparire dai cluster V2
const METODO_ROSSO_REQUIRED_IDS = [
  "A1", "A2", "A4", "A6",
  "B2", "B3", "B5", "B6", "B7", "B8",
  "C1", "C3", "C4", "C7", "C8"
];



/**
 * Riduce il numero di domande visibili in base al profilo.
 * V2 – prima implementazione: profilo_S1_single_under30
 *
 * Obiettivo: 10–15 domande massime, preservando:
 * - domande che alimentano Metodo Rosso / incongruenze / coerenza
 * - copertura aree chiave (protezione, reddito, previdenza/investimenti)
 */
function riduciDomandePerProfiloPersona(contesto, domandeVisibili) {
    if (!Array.isArray(domandeVisibili) || domandeVisibili.length === 0) {
        return domandeVisibili || [];
    }
    
    const profilo = resolveProfiloOperativoPersonaV2(contesto);

// ✅ Fail-safe: profilo non risolto o GENERIC → nessuna riduzione
if (!profilo || profilo === "GENERIC") {
    return Array.isArray(domandeVisibili) ? domandeVisibili : [];
}

const segmentiPersona = contesto && Array.isArray(contesto.segmenti)
    ? contesto.segmenti
    : [];

if (!segmentiPersona.length) {
    return Array.isArray(domandeVisibili) ? domandeVisibili : [];
}



    const MAX_DOMANDE_PER_PROFILO = {
    S1: 12,
    F1: 15,
    L1: 14
};

const MAX_DOMANDE = MAX_DOMANDE_PER_PROFILO[profilo] || 15;


    // Se già sotto soglia, non tocchiamo niente
    if (domandeVisibili.length <= MAX_DOMANDE) {
        return domandeVisibili;
    }

    

    const coreList = PROFILI_V2_CORE[profilo] || null;
if (!coreList) {
    return domandeVisibili;
}

    const coreIds = new Set(coreList);

// Forzo inclusione dei driver Metodo Rosso
for (const id of METODO_ROSSO_REQUIRED_IDS) {
    coreIds.add(id);
}

// Normalizzo: tengo solo ID che esistono davvero tra le domande visibili
const visibiliIds = new Set(domandeVisibili.map(q => q && q.id).filter(Boolean));
for (const id of Array.from(coreIds)) {
    if (!visibiliIds.has(id)) coreIds.delete(id);
}

// ✅ Driver Metodo Rosso "applicabili" al contesto (alcuni sono condizionali per visibilità)
const requiredIds = METODO_ROSSO_REQUIRED_IDS.filter(id => {
    const eta = contesto && contesto.cluster ? contesto.cluster.etaCluster : null;
    const stato = contesto && contesto.cluster ? contesto.cluster.statoFamiliare : null;
    const haFigli = contesto && contesto.flag ? contesto.flag.haFigli === true : false;

    // A6: ha senso solo se ci sono figli (ed è anche visibileSe così)
    if (id === "A6") return haFigli;

    // C3: non è visibile under30
    if (id === "C3") return eta !== "under30";

    // C4: non è visibile per single under30
    if (id === "C4") return !(eta === "under30" && stato === "single");

    return true;
});

// 🧱 Guardrail Metodo Rosso: segnalo se mancano driver nelle domande visibili
try {
    const missing = requiredIds.filter(id => !visibiliIds.has(id));
    if (missing.length) {
        console.warn(
  `🧱 Metodo Rosso incompleto: mancano ${missing.length} driver nelle domande visibili (profilo=${profilo}). missing=${missing.join(",")}`
);

    }
} catch (e) {
    // no-op difensivo
}


    // Ordine stabile: core mantiene l’ordine originale, extra viene ordinato con ranking deterministico
const core = [];
const extraRaw = [];

for (const q of domandeVisibili) {
    if (!q || !q.id) continue;
    if (coreIds.has(q.id)) core.push(q);
    else extraRaw.push(q);
}

if (core.length >= MAX_DOMANDE) {
    return core.slice(0, MAX_DOMANDE);
}

// Coperture del core (aree/sezioni)
const coreAree = new Set(core.map(q => q.area).filter(Boolean));
const coreSezioni = new Set(core.map(q => q.section).filter(Boolean));

// Ranking extra: prima copertura area mancante, poi sezione mancante
const extra = extraRaw
    .map(q => {
        let score = 0;
        if (q.area && !coreAree.has(q.area)) score += 2;
        if (q.section && !coreSezioni.has(q.section)) score += 1;
        return { q, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(x => x.q);

const risultato = [...core];
for (const q of extra) {
    if (risultato.length >= MAX_DOMANDE) break;
    risultato.push(q);
}

// 🔍 Telemetria V2 (debug controllato)
try {
    const idsFinali = risultato.map(q => q && q.id).filter(Boolean);

    const setFinali = new Set(idsFinali);
    const missingFinal = requiredIds
    .filter(id => visibiliIds.has(id) && !setFinali.has(id));


    if (missingFinal.length) {
    console.warn(
        `🧱 Metodo Rosso TRONCATO: reinserisco driver esclusi (profilo=${profilo}, max=${MAX_DOMANDE}).`,
        missingFinal
    );

    // Re-inserisco i driver mancanti rispettando l’ordine originale del questionario
    const byId = new Map(domandeVisibili.map(q => [q && q.id, q]));
    for (const id of missingFinal) {
        const q = byId.get(id);
        if (q && !setFinali.has(id)) {
            risultato.push(q);
            setFinali.add(id);
        }
    }

    // Tronco a MAX_DOMANDE sacrificando extra in coda
    if (risultato.length > MAX_DOMANDE) {
        risultato.splice(MAX_DOMANDE);
    }
}


    console.log(
        `🧠 V2 riduzione: profilo=${profilo} max=${MAX_DOMANDE} core=${core.length} extra=${extra.length} finale=${risultato.length}`,
        idsFinali
    );
} catch (e) {
    // no-op difensivo
}


return risultato;
}





/**
 * V2 – motore di visibilità delle domande
 * Entry point di servizio che delega al motore principale getDomandePersona().
 * Obiettivo: un solo motore di calcolo, niente logiche duplicate.
 */
function calcolaDomandeVisibiliPersona() {
    // Usa sempre il motore principale
    const domande = getDomandePersona();

    // ✅ contesto ufficiale: dynamic.contestoPersona (già valorizzato da getDomandePersona)
    const contesto = (appStatePersona.dynamic && appStatePersona.dynamic.contestoPersona) || null;
    const qState = appStatePersona.questionnaire || {};

    if (!appStatePersona.dynamic) {
        appStatePersona.dynamic = {
            contestoPersona: contesto,
            domandeVisibili: Array.isArray(domande) ? domande : [],
            indiceCorrente: qState.currentIndex || 0
        };
    } else {
        appStatePersona.dynamic.domandeVisibili = Array.isArray(domande) ? domande : [];
        appStatePersona.dynamic.contestoPersona = contesto;
        appStatePersona.dynamic.indiceCorrente = qState.currentIndex || 0;
    }

    return Array.isArray(domande) ? domande : [];
}




function renderDomandaCorrentePersona() {
    const container = document.getElementById("questionarioPersonaContainer");
    const btnPrev = document.getElementById("btnPrevDomanda");
    const btnNext = document.getElementById("btnNextDomanda");

    if (!container) {
        console.error("Container questionarioPersonaContainer mancante.");
        return;
    }

    const domande = getDomandePersona();
    if (!Array.isArray(domande) || !domande.length) {
        container.innerHTML = `
            <p style="font-size:13px; color:#9ca3af;">
                Nessuna domanda configurata. Verificare il file persona_domande.js.
            </p>
        `;
        if (btnPrev) btnPrev.disabled = true;
        if (btnNext) btnNext.disabled = true;
        return;
    }

        // Safety sullo stato questionario / dynamic
    if (!appStatePersona.questionnaire) {
        appStatePersona.questionnaire = {
            currentIndex: 0,
            answers: {}
        };
    }
    if (!appStatePersona.questionnaire.answers) {
        appStatePersona.questionnaire.answers = {};
    }
    if (!appStatePersona.dynamic) {
        appStatePersona.dynamic = {
            contestoPersona: null,
            domandeVisibili: [],
            indiceCorrente: 0
        };
    }

    // Normalizzazione indice: master = dynamic.indiceCorrente
    let idx = 0;
    if (typeof appStatePersona.dynamic.indiceCorrente === "number") {
        idx = appStatePersona.dynamic.indiceCorrente;
    } else if (typeof appStatePersona.questionnaire.currentIndex === "number") {
        idx = appStatePersona.questionnaire.currentIndex;
    }

    if (idx < 0) idx = 0;
    if (idx >= domande.length) idx = domande.length - 1;

    // Allineo entrambi gli indici
    appStatePersona.dynamic.indiceCorrente = idx;
    appStatePersona.questionnaire.currentIndex = idx;

    const domandaRaw = domande[idx];


    if (!domandaRaw || typeof domandaRaw !== "object") {
        console.error("Domanda non valida all'indice", idx, domandaRaw);
        container.innerHTML = `
            <p style="font-size:13px; color:#ef4444;">
                Errore di configurazione domanda (indice ${idx}). Verificare persona_domande.js.
            </p>
        `;
        if (btnPrev) btnPrev.disabled = idx === 0;
        if (btnNext) btnNext.disabled = idx >= domande.length - 1;
        return;
    }

    // Compatibilità V1/V2: testo/testo & options/opzioni
    const testoDomanda =
        domandaRaw.text ||
        domandaRaw.testo ||
        "(testo domanda non configurato)";

    const opzioniDomanda = Array.isArray(domandaRaw.options)
        ? domandaRaw.options
        : Array.isArray(domandaRaw.opzioni)
            ? domandaRaw.opzioni
            : [];

    if (!opzioniDomanda.length) {
        console.warn("Domanda senza opzioni:", domandaRaw);
    }

    const domanda = {
        ...domandaRaw,
        text: testoDomanda,
        options: opzioniDomanda
    };

    const answers = appStatePersona.questionnaire.answers;
    const rispostaSelezionata = answers[domanda.id];

    let html = `
        <div class="domanda-block">
            <div class="domanda-titolo">
                ${idx + 1}. ${domanda.text}
            </div>
            <div class="domanda-descr">
                Rispondi in base alla tua situazione attuale.
            </div>
            <div class="risposte-row">
    `;

    domanda.options.forEach(opt => {
        const optValue = typeof opt.value === "number"
            ? opt.value
            : Number(opt.value);

        const isSelected = rispostaSelezionata === optValue;
        const selectedClass = isSelected ? "btn-opzione selected" : "btn-opzione";

        html += `
            <button
                class="${selectedClass}"
                data-question-id="${domanda.id}"
                data-value="${optValue}">
                ${opt.label != null ? opt.label : ""}
            </button>
        `;
    });

    html += `
            </div>
        </div>
        <div style="font-size:12px; color:#9ca3af; margin-top:4px;">
            Domanda ${idx + 1} di ${domande.length}
        </div>
    `;

    container.innerHTML = html;

    const buttons = container.querySelectorAll(".btn-opzione");
    buttons.forEach(btn => {
        btn.addEventListener("click", function () {
            const qId = this.getAttribute("data-question-id");
            const valNum = Number(this.getAttribute("data-value"));
            selezionaRispostaPersona(qId, valNum);
        });
    });

    if (btnPrev) {
        btnPrev.disabled = idx === 0;
    }
    if (btnNext) {
        btnNext.disabled = false;
        btnNext.textContent =
            idx === domande.length - 1
                ? "Concludi questionario"
                : "Avanti ➜";
    }

    // Log di debug minimale per capire cosa stai davvero eseguendo
    console.debug("renderDomandaCorrentePersona -> idx:", idx, "domanda:", domanda);
}



function selezionaRispostaPersona(questionId, value) {
    if (!questionId) return;

    // Allinea lo stato con l'anagrafica corrente prima dei controlli di coerenza
    if (typeof leggiAnagraficaPersona === "function") {
        leggiAnagraficaPersona();
    }

    const answers = appStatePersona.questionnaire.answers || {};
    const valoreNumerico = Number(value);

    /* ==========================================
       REGOLA LIVE FIGLI – A6 vs ANAGRAFICA
       A6 = "Se hai figli, quanto ritieni importante tutelarli."
    ========================================== */
    if (questionId === "A6") {
        const ana = (appStatePersona.user && appStatePersona.user.anagrafica) || {};
        const figliAnagrafica =
            ana.figliMinorenni != null ? Number(ana.figliMinorenni) : 0;
        const haFigliAnagrafica =
            !Number.isNaN(figliAnagrafica) && figliAnagrafica > 0;

        // Caso 1: in anagrafica risultano figli, ma risposta "Non ho figli" (valore 1)
        if (haFigliAnagrafica && valoreNumerico === 1) {
            const msg =
                `Attenzione: nei dati anagrafici risultano ${figliAnagrafica} figlio/i minorenne/i,\n` +
                `ma in questa domanda stai selezionando "Non ho figli".\n\n` +
                `Confermi comunque questa risposta?`;

            const conferma = window.confirm(msg);
            if (!conferma) {
                // Non salvo la risposta, non faccio autosave, non rerenderizzo
                return;
            }

            if (typeof mostraToast === "function") {
                mostraToast(
                    "Risposta su figli confermata nonostante l'incongruenza con i dati anagrafici.",
                    "warning"
                );
            }
        }

        // Caso 2: in anagrafica NON risultano figli, ma la priorità figli è medio/alta (>=3)
        if (!haFigliAnagrafica &&
            !Number.isNaN(valoreNumerico) &&
            valoreNumerico >= 3) {

            const msg =
                "In anagrafica non risultano figli minorenni (campo 'Figli minorenni' pari a 0 o vuoto),\n" +
                "ma qui stai indicando che la tutela dei figli è piuttosto o molto importante.\n\n" +
                "Se ci sono figli a carico (anche maggiorenni), verifica di aver compilato correttamente l'anagrafica.\n\n" +
                "Vuoi confermare comunque questa risposta su A6?";

            const conferma = window.confirm(msg);
            if (!conferma) {
                return;
            }

            if (typeof mostraToast === "function") {
                mostraToast(
                    "Risposta su A6 confermata; valuta di aggiornare l'anagrafica se ci sono figli effettivamente a carico.",
                    "info"
                );
            }
        }
    }

    /* ==========================================
       REGOLA LIVE PROTEZIONE: A1 vs A2
       A1 = percezione protezione
       A2 = autonomia tenore di vita famiglia
    ========================================== */
    if (questionId === "A2") {
        const a1 = answers.A1 != null ? Number(answers.A1) : null;
        const a2 = valoreNumerico;

        // A1 molto bassa (1–2) + A2 molto alta (4–5)
        if (
            a1 != null &&
            !Number.isNaN(a1) &&
            !Number.isNaN(a2) &&
            a1 <= 2 &&
            a2 >= 4
        ) {
            const msg =
                "In precedenza il cliente ha dichiarato di sentirsi poco o per nulla protetto " +
                "in caso di evento grave (A1), ma ora indica una autonomia del tenore di vita " +
                "molto elevata (A2: oltre 1 anno).\n\n" +
                "Vuoi confermare comunque questa combinazione di risposte?";

            const conferma = window.confirm(msg);
            if (!conferma) {
                // Non salvo la risposta, non vado avanti
                return;
            }

            if (typeof mostraToast === "function") {
                mostraToast(
                    "Combinazione A1/A2 confermata nonostante la potenziale incoerenza percezione/autonomia.",
                    "warning"
                );
            }
        }
    }

    /* ==========================================
       REGOLA LIVE PREVIDENZA: C1, C3, C4
       vs età e gap pensione stimato
    ========================================== */
    if (questionId === "C1" || questionId === "C3" || questionId === "C4") {
        const ana = (appStatePersona.user && appStatePersona.user.anagrafica) || {};
        const eta = ana.eta != null ? Number(ana.eta) : null;

        // Calcolo gap pensione attuale (riuso logica modello)
        let ratioPensione = 0;
        try {
            if (typeof calcolaGapStatalePersona === "function") {
                const gapStatale = calcolaGapStatalePersona();
                if (gapStatale && gapStatale.pensione) {
                    const adeg = gapStatale.pensione.adeguato || 0;
                    const gap = gapStatale.pensione.gap || 0;
                    if (adeg > 0) {
                        ratioPensione = gap / adeg;
                    }
                }
            }
        } catch (e) {
            console.warn("Impossibile calcolare gap pensione per controlli live previdenza:", e);
        }

        // Valori correnti/precedenti delle domande C1, C3, C4
        const c1Corrente =
            questionId === "C1"
                ? valoreNumerico
                : (answers.C1 != null ? Number(answers.C1) : null);

        const c3Corrente =
            questionId === "C3"
                ? valoreNumerico
                : (answers.C3 != null ? Number(answers.C3) : null);

        const c4Corrente =
            questionId === "C4"
                ? valoreNumerico
                : (answers.C4 != null ? Number(answers.C4) : null);

        const condizioniBaseOk =
            eta != null &&
            !Number.isNaN(eta) &&
            eta >= 50 &&
            ratioPensione > 0.4;

        if (condizioniBaseOk) {
            // 1) C1: poca azione previdenziale con gap alto
            if (questionId === "C1") {
                const c1 = c1Corrente;
                if (!Number.isNaN(c1) && c1 <= 2) {
                    const msg =
                        "Dai dati emerge un gap pensionistico rilevante in relazione all'età del cliente,\n" +
                        "ma in questa domanda stai indicando un livello di azione molto basso sulla previdenza complementare.\n\n" +
                        "Vuoi confermare comunque questa risposta su C1?";

                    const conferma = window.confirm(msg);
                    if (!conferma) {
                        return;
                    }

                    if (typeof mostraToast === "function") {
                        mostraToast(
                            "Risposta su previdenza confermata nonostante il gap pensionistico rilevante.",
                            "warning"
                        );
                    }
                }
            }

            // 2) C3: alta "preparazione" pensione con gap alto
            if (questionId === "C3") {
                const c3 = c3Corrente;
                if (!Number.isNaN(c3) && c3 >= 4) {
                    const msg =
                        "Il modello stima un gap pensionistico significativo in relazione all'età,\n" +
                        "ma qui il cliente dichiara un livello di preparazione molto alto sul tema pensione.\n\n" +
                        "Vuoi confermare comunque questa risposta su C3?";

                    const conferma = window.confirm(msg);
                    if (!conferma) {
                        return;
                    }

                    if (typeof mostraToast === "function") {
                        mostraToast(
                            "Preparazione pensionistica elevata confermata nonostante il gap stimato.",
                            "info"
                        );
                    }
                }
            }

            // 3) C4: obiettivi molto chiari ma azione previdenziale nulla/bassa
            if (questionId === "C4") {
                const c4 = c4Corrente;
                const c1 = c1Corrente;

                if (
                    !Number.isNaN(c4) && c4 >= 4 &&
                    (c1 == null || Number.isNaN(c1) || c1 <= 2)
                ) {
                    const msg =
                        "Il cliente dichiara obiettivi futuri molto chiari (C4),\n" +
                        "ma non risultano azioni coerenti sulla previdenza complementare (C1 bassa o assente)\n" +
                        "a fronte di un gap pensionistico stimato rilevante.\n\n" +
                        "Vuoi confermare comunque questa risposta su C4?";

                    const conferma = window.confirm(msg);
                    if (!conferma) {
                        return;
                    }

                    if (typeof mostraToast === "function") {
                        mostraToast(
                            "Obiettivi dichiarati chiari confermati nonostante la bassa azione previdenziale.",
                            "warning"
                        );
                    }
                }
            }
        }
    }

    /* ==========================================
       REGOLA LIVE RISCHIO/DEBITO: B6, C7, C8
       vs debiti (C8) e riserva (B3)
    ========================================== */
    if (questionId === "B6" || questionId === "C7" || questionId === "C8") {
        const answersCorrenti = appStatePersona.questionnaire.answers || {};

        let b3 = answersCorrenti.B3 != null ? Number(answersCorrenti.B3) : null;
        let b6Val = answersCorrenti.B6 != null ? Number(answersCorrenti.B6) : null;
        let c7Val = answersCorrenti.C7 != null ? Number(answersCorrenti.C7) : null;
        let c8Val = answersCorrenti.C8 != null ? Number(answersCorrenti.C8) : null;

        // Aggiorno il valore della domanda corrente
        if (questionId === "B6") b6Val = valoreNumerico;
        if (questionId === "C7") c7Val = valoreNumerico;
        if (questionId === "C8") c8Val = valoreNumerico;

        const hasB3 = b3 != null && !Number.isNaN(b3);
        const hasB6 = b6Val != null && !Number.isNaN(b6Val);
        const hasC7 = c7Val != null && !Number.isNaN(c7Val);
        const hasC8 = c8Val != null && !Number.isNaN(c8Val);

        if (hasB3 && hasC8 && (hasB6 || hasC7)) {
            const propRischioAlta = (hasB6 && b6Val >= 4) || (hasC7 && c7Val >= 4);
            const debitiPesanti = c8Val <= 2; // debiti molto/abbastanza pesanti
            const riservaBassa = b3 <= 2;     // riserva < 3 mesi

            if (propRischioAlta && debitiPesanti && riservaBassa) {
                const msg =
                    "Dalle risposte emerge una combinazione potenzialmente instabile:\n" +
                    "- Propensione al rischio negli investimenti medio-alta;\n" +
                    "- Debiti percepiti come pesanti;\n" +
                    "- Riserva di sicurezza molto limitata (pochi mesi coperti).\n\n" +
                    "Vuoi confermare comunque questa combinazione di risposte su rischio/debito?";

                const conferma = window.confirm(msg);
                if (!conferma) {
                    // Non salvo la risposta, non faccio autosave, non rerenderizzo
                    return;
                }

                if (typeof mostraToast === "function") {
                    mostraToast(
                        "Combinazione rischio/debito confermata nonostante la potenziale instabilità finanziaria.",
                        "warning"
                    );
                }
            }
        }
    }

    /* ==========================================
       REGOLA LIVE 4: A2 vs B3
       A2 = autonomia tenore di vita famiglia
       B3 = autonomia spese essenziali con i risparmi
    ========================================== */
    if (questionId === "B3") {
        const a2 = answers.A2 != null ? Number(answers.A2) : null;
        const b3 = valoreNumerico;

        // Caso da attenzionare:
        // A2 >= 3 → famiglia dice "almeno 6 mesi"
        // B3 <= 2 → liquidità personale max 3 mesi
        if (
            a2 != null &&
            !Number.isNaN(a2) &&
            !Number.isNaN(b3) &&
            a2 >= 3 &&   // 6-12 mesi o più
            b3 <= 2      // fino a 3 mesi di risparmi
        ) {
            const msg =
                "Dalle risposte emerge che la famiglia potrebbe mantenere l'attuale tenore di vita " +
                "per almeno 6 mesi (A2), ma con i soli risparmi disponibili oggi riusciresti a coprire " +
                "le spese essenziali al massimo per 3 mesi (B3).\n\n" +
                "Vuoi confermare comunque questa combinazione di risposte?";

            const conferma = window.confirm(msg);
            if (!conferma) {
                // Non salvo la risposta, non avanzo di domanda
                return;
            }

            if (typeof mostraToast === "function") {
                mostraToast(
                    "Combinazione A2/B3 confermata nonostante la differenza tra autonomia familiare e liquidità disponibile.",
                    "warning"
                );
            }
        }
    }

    /* ==========================================
       REGOLA LIVE 5: B8 vs professione anagrafica
       B8 = rischio percepito del lavoro
    ========================================== */
    if (questionId === "B8") {
        const ana =
            (appStatePersona.user && appStatePersona.user.anagrafica) || {};

        const profRaw = ana.professione || "";
        const prof = profRaw.toString().toLowerCase();
        const sitLav = (ana.situazioneLavorativa || "").toString().toLowerCase();

        const b8 = valoreNumerico;

        // Profili tipicamente "da ufficio" a rischio fisico basso
        const lowRiskKeywords = [
            "assicurator",
            "impiegat",
            "consulent",
            "funzionar",
            "amministrativ",
            "back office",
            "office",
            "promotore finanziario",
            "private banker",
            "addetto commerciale"
        ];

        const isDipendenteUfficio =
            (sitLav === "dipendente" || sitLav === "dirigente") &&
            lowRiskKeywords.some(kw => prof.includes(kw));

        if (
            isDipendenteUfficio &&
            !Number.isNaN(b8) &&
            b8 >= 4
        ) {
            const msg =
                `In anagrafica il lavoro risulta "${profRaw || "non specificato"}", ` +
                "tipicamente a rischio fisico contenuto, ma qui stai indicando un rischio di lavoro elevato (B8).\n\n" +
                "Vuoi confermare comunque questa risposta?";

            const conferma = window.confirm(msg);
            if (!conferma) {
                // Non salvo la risposta, non avanzo
                return;
            }

            if (typeof mostraToast === "function") {
                mostraToast(
                    "Rischio lavoro elevato confermato nonostante la professione tendenzialmente a basso rischio.",
                    "warning"
                );
            }
        }
    }


    /* ==========================================
       REGOLA LIVE 4: A4 vs B5 (SSN vs rischio fisico)
       A4 = fiducia nel Servizio Sanitario Nazionale
       B5 = esposizione ad attività fisicamente rischiose
    ========================================== */
    if (questionId === "B5") {
        const a4Raw =
            appStatePersona.questionnaire &&
            appStatePersona.questionnaire.answers
                ? appStatePersona.questionnaire.answers["A4"]
                : null;

        const a4 = a4Raw != null ? Number(a4Raw) : null;
        const b5 = valoreNumerico;

        // Caso da segnalare:
        // - A4 alta (4–5): SSN "buono / molto buono"
        // - B5 alta (4–5): attività fisicamente rischiose frequenti
        if (
            a4 != null && !Number.isNaN(a4) &&
            b5 != null && !Number.isNaN(b5) &&
            a4 >= 4 &&
            b5 >= 4
        ) {
            if (typeof mostraToast === "function") {
                mostraToast(
                    "Alta fiducia nel SSN e forte esposizione ad attività fisicamente rischiose: " +
                    "attenzione a non sovrastimare la copertura pubblica rispetto a costi extra e perdita di reddito.",
                    "warning"
                );
            }
        }
    }

    /* ==========================================
       REGOLA LIVE: B3 vs A2 / B7
       B3 = "per quanto tempo copri le spese essenziali con i risparmi"
       A2 = "per quanto tempo la famiglia mantiene il tenore di vita"
       B7 = supporto rete familiare/sociale
    ========================================== */
    if (questionId === "B3") {
        const nuovoB3 = valoreNumerico;

        const a2 = answers.A2 != null ? Number(answers.A2) : null;
        const b7 = answers.B7 != null ? Number(answers.B7) : null;

        if (
            nuovoB3 != null &&
            !Number.isNaN(nuovoB3) &&
            a2 != null &&
            !Number.isNaN(a2)
        ) {
            const autonomiaFamigliaAlta = a2 >= 3;  // 6-12 mesi in su
            const riservaMoltoBassa = nuovoB3 <= 2; // meno di 3 mesi
            const supportoDebole =
                b7 != null && !Number.isNaN(b7) && b7 <= 3; // supporto non forte

            if (autonomiaFamigliaAlta && riservaMoltoBassa && supportoDebole) {
                const msg =
                    "Attenzione: prima hai indicato che la famiglia riuscirebbe a mantenere lo stesso tenore di vita per almeno 6 mesi (A2), " +
                    "ma in questa risposta stai indicando che con i risparmi disponibili oggi riusciresti a coprire le spese essenziali per meno di 3 mesi (B3), " +
                    "senza una rete di supporto particolarmente forte.\n\n" +
                    "Vuoi confermare comunque questa combinazione di risposte?";

                const conferma = window.confirm(msg);
                if (!conferma) {
                    // Non salvo la risposta, non vado avanti
                    return;
                }

                if (typeof mostraToast === "function") {
                    mostraToast(
                        "Combinazione A2/B3 confermata nonostante la potenziale incoerenza autonomia/riserva.",
                        "warning"
                    );
                }
            }
        }
    }

    // Salvataggio standard della risposta
    appStatePersona.questionnaire.answers[questionId] = value;

    // Autosave bozza analisi persona
    if (typeof salvaBozzaAnalisiPersona === "function") {
        salvaBozzaAnalisiPersona();
    }

    renderDomandaCorrentePersona();
}

function vaiDomandaSuccessivaPersona() {
  // GUARD anti-doppio trigger (click multipli / listener duplicati)
  if (window.__PERSONA_NEXT_LOCK__) {
    console.warn("⛔ vaiDomandaSuccessivaPersona bloccata (double-trigger).");
    return;
  }

  window.__PERSONA_NEXT_LOCK__ = true;

  try {
    // 1) Sync anagrafica SUBITO (prima di calcolare domande/profilo)
    if (typeof leggiAnagraficaPersona === "function") {
      leggiAnagraficaPersona();
    }

    const domande = getDomandePersona();
    if (!domande.length) {
      console.warn("⛔ Nessuna domanda disponibile.");
      return;
    }

    if (!appStatePersona.dynamic) {
      appStatePersona.dynamic = {
        contestoPersona: null,
        domandeVisibili: [],
        indiceCorrente: 0
      };
    }

    let idx = 0;
    if (typeof appStatePersona.dynamic.indiceCorrente === "number") {
      idx = appStatePersona.dynamic.indiceCorrente;
    } else if (typeof appStatePersona.questionnaire.currentIndex === "number") {
      idx = appStatePersona.questionnaire.currentIndex;
    }

    // ✅ Clamp indice: se cambia profilo/domande, evita UI “morta”
    if (idx < 0) idx = 0;
    if (idx > domande.length - 1) idx = domande.length - 1;
    appStatePersona.dynamic.indiceCorrente = idx;
    appStatePersona.questionnaire.currentIndex = idx;

    const domanda = domande[idx];
    if (!domanda) {
      console.warn("⛔ Domanda non trovata per idx:", idx, "len:", domande.length, domande);
      return;
    }

    const risposta = appStatePersona.questionnaire.answers[domanda.id];
    if (risposta == null) {
      mostraToast("Rispondi alla domanda prima di proseguire.", "warning");
window.__PERSONA_NEXT_LOCK__ = false; // fail-safe: non restare bloccato dopo toast
return;
    }

    // ✅ GATE ANAGRAFICA MINIMA (anti-analisi vuote)
    const ana = appStatePersona.user?.anagrafica || {};
    console.log("🧪 GATE ana:", JSON.stringify(ana));
     
    const nome = (ana.nome || "").toString().trim();
    const cognome = (ana.cognome || "").toString().trim();
    const cf = (ana.codiceFiscale || "").toString().trim().toUpperCase();
    const dataNascita = (ana.dataNascita || "").toString().trim();

    const hasMinAnag = !!nome && !!cognome && (!!cf || !!dataNascita);
    if (!hasMinAnag) {
      mostraToast(
        "Compila anagrafica minima: Nome, Cognome e (Codice Fiscale oppure Data di nascita).",
        "warning"
      );
      return;
    }

    if (idx < domande.length - 1) {
      idx++;
      appStatePersona.dynamic.indiceCorrente = idx;
      appStatePersona.questionnaire.currentIndex = idx;
      renderDomandaCorrentePersona();
      return;
    }

    // Ultima domanda → chiudo il questionario e lancio l’analisi
    mostraToast("Questionario completato. Calcolo analisi in corso.", "success");
    console.log("✅ Questionario persona completato:", appStatePersona.questionnaire.answers);

    calcolaRisultatiPersona();
    renderRisultatiPersona();
    renderRadarPersona();
    renderTimelinePersona();

    const risultatiSection = document.getElementById("risultatiPersonaSection");
    if (risultatiSection) {
      risultatiSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (
      typeof creaRecordAnalisiPersona === "function" &&
      typeof aggiungiAnalisiPersonaInArchivio === "function" &&
      typeof renderArchivioPersona === "function"
    ) {
      const record = creaRecordAnalisiPersona();
      aggiungiAnalisiPersonaInArchivio(record);
      renderArchivioPersona();
      console.log("💾 Analisi persona salvata in archivio.");
    } else {
      console.warn("Funzioni archivio persona non disponibili.");
    }
  } finally {
    // ✅ sblocco SEMPRE, anche su return/errore
    window.__PERSONA_NEXT_LOCK__ = false;
  }
}

function vaiDomandaPrecedentePersona() {
    const domande = getDomandePersona();
    if (!domande.length) return;

    if (!appStatePersona.dynamic) {
        appStatePersona.dynamic = {
            contestoPersona: null,
            domandeVisibili: [],
            indiceCorrente: 0
        };
    }

    let idx = 0;
    if (typeof appStatePersona.dynamic.indiceCorrente === "number") {
        idx = appStatePersona.dynamic.indiceCorrente;
    } else if (typeof appStatePersona.questionnaire.currentIndex === "number") {
        idx = appStatePersona.questionnaire.currentIndex;
    }

    if (idx > 0) {
        idx--;
        appStatePersona.dynamic.indiceCorrente = idx;
        appStatePersona.questionnaire.currentIndex = idx;
        renderDomandaCorrentePersona();
    }
}


// ======================================================
//  ORCHESTRATORE COMPLETO ANALISI PERSONA
// ======================================================
function eseguiAnalisiPersona() {
    try {
        // 1. salva anagrafica
        if (typeof leggiAnagraficaPersona === "function") {
            leggiAnagraficaPersona();
        }

        // 2. verifica coerenza anagrafica (soft validation, non blocca)
        if (typeof validaCoerenzaAnagraficaPersona === "function") {
            validaCoerenzaAnagraficaPersona();
        }

        // 3. calcolo risultati completi
        calcolaRisultatiPersona();

                // 4. render UI step 3
        if (typeof renderRisultatiPersona === "function") renderRisultatiPersona();
        if (typeof renderRadarPersona === "function") renderRadarPersona();
        if (typeof renderTimelinePersona === "function") renderTimelinePersona();
        if (typeof renderPolizzePersona === "function") renderPolizzePersona();

        // 4b. allinea Caring nello stato prima del salvataggio
        if (typeof leggiCaringPersona === "function") {
            leggiCaringPersona();
        }

        // 5. salva in archivio
        if (typeof salvaAnalisiPersonaInArchivio === "function") {
            salvaAnalisiPersonaInArchivio();
        }


        // 6. scroll ai risultati
        const section = document.getElementById("risultatiPersonaSection");
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (typeof mostraToast === "function") {
            mostraToast("Analisi persona completata.", "success");
        }
    } catch (err) {
        console.error("Errore in eseguiAnalisiPersona():", err);
        if (typeof mostraToast === "function") {
            mostraToast("Errore durante l'analisi. Controlla la console.", "error");
        }
    }
}

/* ======================================================
   SALVATAGGIO ANALISI PERSONA NELL'ARCHIVIO (NUOVO)
====================================================== */
function salvaAnalisiPersonaInArchivio() {
    try {
        if (typeof creaRecordAnalisiPersona !== "function" ||
            typeof aggiungiAnalisiPersonaInArchivio !== "function" ||
            typeof renderArchivioPersona !== "function") {

            console.warn("⚠️ Funzioni archivio persona non disponibili.");
            return;
        }

        // 1. Creo il record completo
        const record = creaRecordAnalisiPersona();
        if (!record) {
            console.warn("⚠️ Record analisi persona non generato.");
            return;
        }

        // 2. Lo salvo nel localStorage
        aggiungiAnalisiPersonaInArchivio(record);

        // 3. Aggiorno la tabella archivio
        renderArchivioPersona();

        console.log("💾 Analisi persona salvata in archivio:", record);

    } catch (err) {
        console.error("❌ Errore in salvaAnalisiPersonaInArchivio:", err);
    }
}


/* =========================
   CALCOLO RISULTATI PERSONA
========================= */
function calcolaRisultatiPersona() {
    const domande = getDomandePersona();
    const risposte = appStatePersona.questionnaire.answers || {};

    if (!domande.length) return;

    // 1) Calcolo media per area + indice globale
    const areeMap = {};
    let sommaGlobale = 0;
    let countGlobale = 0;

    domande.forEach(d => {
        const val = risposte[d.id];
        if (val == null) return;

        sommaGlobale += val;
        countGlobale++;

        const area = d.area || "generale";
        if (!areeMap[area]) {
            areeMap[area] = { somma: 0, count: 0 };
        }
        areeMap[area].somma += val;
        areeMap[area].count += 1;
    });

    const areeScore = {};
    Object.keys(areeMap).forEach(area => {
        const info = areeMap[area];
        const media = info.count > 0 ? info.somma / info.count : 0;
        const score100 = Math.round(((media - 1) / 4) * 100);
        areeScore[area] = {
            media,
            score: score100
        };
    });

    let indiceGlobale = 0;
    if (countGlobale > 0) {
        const mediaGlobale = sommaGlobale / countGlobale;
        indiceGlobale = Math.round(((mediaGlobale - 1) / 4) * 100);
    }

    // 2) Gap statale, normotipo, semaforo, incongruenze, coerenza
    const gapStatale = calcolaGapStatalePersona();
    const userData = buildUserDataPersona();
    const normotipo = analizzaNormotipoPersona(userData);
    const semaforo = calcolaSemaforoPersona(userData, risposte, normotipo, gapStatale);
    const incongruenze = calcolaIncongruenzePersona(risposte, userData, gapStatale, normotipo);

        const coerenzaAvanzata =
        typeof calcolaIndiceCoerenzaAvanzataPersona === "function"
            ? calcolaIndiceCoerenzaAvanzataPersona(risposte, userData, gapStatale, incongruenze)
            : { indice: 100, dettagli: [] };

    // 2b) Contesto + domande potenti Metodo Rosso
    let contestoPersona = null;
    try {
        if (typeof buildContestoPersonaFromAnagrafica === "function") {
            const anaSafe =
                (appStatePersona &&
                    appStatePersona.user &&
                    appStatePersona.user.anagrafica) ||
                {};
            contestoPersona = buildContestoPersonaFromAnagrafica(anaSafe);
        }
    } catch (err) {
        console.warn("Errore nel ricalcolo del contestoPersona in calcolaRisultatiPersona:", err);
        contestoPersona = null;
    }

    let domandePotenti = [];
    if (typeof generaDomandePotentiPersona === "function") {
        domandePotenti = generaDomandePotentiPersona(contestoPersona) || [];
    }

    // 3) Strato "parziale" strutturato
    const risultatiParziali = {
        aree: areeScore,
        indiceGlobale,
        gapStatale,
        normotipo,
        semaforo,
        incongruenze,
        coerenzaAvanzata,
        userData,          // 🔗 età, reddito, nucleo, stato familiare, tipo lavoratore
        contestoPersona,   // 🔗 cluster + segmenti
        domandePotenti     // 🔗 suggerimenti consulenziali V2
    };

        // 4) Priorità prodotti basata sui risultati parziali
    const prioritaProdotti = calcolaPrioritaProdottiPersona(risultatiParziali) || [];

    // 5) Governance (decisionGraph + readiness/confidence + audit)
let governance = null;
try {
            governance = evaluatePersonaGovernance({
            anagrafica: appStatePersona.anagrafica || {},
            userData,
            answers: (appStatePersona.questionnaire && appStatePersona.questionnaire.answers) ? appStatePersona.questionnaire.answers : {},
            incongruenze,
            coerenzaAvanzata,
            gapStatale
        }) || null;

} catch (e) {
    console.warn("Errore in evaluatePersonaGovernance:", e);
    governance = null;
}

// 6) Risultati complessivi (strato unico, coerente con V1 + estensioni V2)
const risultatiComplessivi = {
    // core scoring
    aree: areeScore,
    indiceGlobale,
    gapStatale,
    normotipo,
    semaforo,
    incongruenze,
    coerenzaAvanzata,

    // Metodo Rosso / contesto
    userData,        // età, reddito, nucleo, ecc.
    contestoPersona, // cluster + segmenti
    domandePotenti,  // lista domande potenti

    // prodotti
    prioritaProdotti,

    // governance + decision graph
    governance,
    decisionGraph: Array.isArray(governance?.decisionGraph) ? governance.decisionGraph : []
};


    // 6) Sintesi operativa (narrativa Metodo Rosso)
    let sintesiOperativa = [];
    if (typeof generaSintesiOperativaPersona === "function") {
        try {
            sintesiOperativa =
                generaSintesiOperativaPersona(risultatiComplessivi) || [];
        } catch (err) {
            console.warn(
                "Errore in generaSintesiOperativaPersona:",
                err
            );
            sintesiOperativa = [];
        }
    }

// 7) Scrivo nello state in forma piatta (compatibile con riepilogo + archivio)
appStatePersona.risultati = {
    ...risultatiComplessivi,
    sintesiOperativa
};

console.log("📊 Risultati persona (completi):", appStatePersona.risultati);

// ancora lo state sul window (anti-reset UI) + fallback robusto per DG/UI
window.appStatePersona = appStatePersona;
window.__PERSONA_LAST_RESULTS__ = appStatePersona.risultati;
try {
    if (typeof mountDecisionGraphUI === "function") mountDecisionGraphUI({ force: true });
} catch (e) {}

}
/* =========================
   RENDER SUPPORT
========================= */
function giudizioDaScore(score) {
    if (score >= 80) return "Buono / in equilibrio";
    if (score >= 60) return "Accettabile con aree da rafforzare";
    if (score >= 40) return "Profilo fragile";
    return "Profilo critico";
}

function renderDomandePotentiPersona(domandePotenti) {
    if (!Array.isArray(domandePotenti) || !domandePotenti.length) {
        return "";
    }

    let html = `
        <div style="
            margin-top: 14px;
            padding: 10px 12px;
            border-radius: 10px;
            background: #f9fafb;
            border: 1px dashed #d1d5db;
        ">
            <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">
                Domande esplorative suggerite dal Metodo Rosso
            </div>
            <div style="font-size: 11px; color:#6b7280; margin-bottom: 6px;">
                Non sono domande da compilare nel questionario, ma spunti per approfondire in consulenza
                le aree emerse come sensibili per questo profilo.
            </div>
    `;

    domandePotenti.forEach(block => {
        if (!block || !Array.isArray(block.domande) || !block.domande.length) {
            return;
        }

        const titolo = block.titolo || "Area da approfondire";
        html += `
            <div style="margin-top: 8px; padding: 8px 8px; border-radius: 8px; background:#ffffff; border:1px solid #e5e7eb;">
                <div style="font-size: 12px; font-weight: 600; color:#111827; margin-bottom: 4px;">
                    ${titolo}
                </div>
                <ul style="font-size: 12px; color:#374151; padding-left: 16px; margin: 0;">
                    ${block.domande
                        .map(d => `<li style="margin-bottom: 2px;">${d}</li>`)
                        .join("")}
                </ul>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

function calcolaPilastriBenesserePersona(risultati) {
    risultati = risultati || {};
    const aree = risultati.aree || {};
    const gapStatale = risultati.gapStatale || null;
    const coerenza = risultati.coerenzaAvanzata || {};
    const dettagli = Array.isArray(coerenza.dettagli) ? coerenza.dettagli : [];

    const getGapRatio = (k) => {
        if (!gapStatale || !gapStatale[k]) return 0;
        const adeg = gapStatale[k].adeguato || 0;
        const gap = gapStatale[k].gap || 0;
        if (!adeg || adeg <= 0) return 0;
        return gap / adeg;
    };

    const hasCode = (codice) => {
        return dettagli.some(d => d && d.codice === codice);
    };

    const clamp = (v) => {
        if (v < 0) return 0;
        if (v > 100) return 100;
        return Math.round(v);
    };

    // SALUTE: protezione + invalidità/LTC + coerenza sanitaria
    let saluteScore = 70;
    if (aree.protezione && typeof aree.protezione.score === "number") {
        saluteScore = aree.protezione.score;
    }

    const ratioInvalidita = getGapRatio("invalidita");
    const ratioLtc = getGapRatio("ltc");

    if (ratioInvalidita > 0.5) saluteScore -= 10;
    if (ratioInvalidita > 0.8) saluteScore -= 5;
    if (ratioLtc > 0.5) saluteScore -= 5;

    if (hasCode("COER_SSN_RISCHIO")) {
        saluteScore -= 5;
    }

    saluteScore = clamp(saluteScore);

    // TENORE DI VITA: reddito / stile di vita + morte + pensione + riserve
    let tenoreScore = 70;
    if (aree.reddito_stile_vita && typeof aree.reddito_stile_vita.score === "number") {
        tenoreScore = aree.reddito_stile_vita.score;
    }

    const ratioMorte = getGapRatio("morte");
    const ratioPensione = getGapRatio("pensione");

    if (ratioMorte > 0.5) tenoreScore -= 10;
    if (ratioMorte > 0.8) tenoreScore -= 5;
    if (ratioPensione > 0.4) tenoreScore -= 10;

    // coerenza collegata ad autonomia, figli, riserva, previdenza
    if (hasCode("COER_PROTEZIONE_AUTONOMIA")) tenoreScore -= 5;
    if (hasCode("COER_PROTEZIONE_GAP")) tenoreScore -= 5;
    if (hasCode("COER_FIGLI_PROTEZIONE_GAP")) tenoreScore -= 5;
    if (hasCode("COER_RISPARMIO_RISERVA")) tenoreScore -= 5;
    if (hasCode("COER_PREVIDENZA_GAP")) tenoreScore -= 5;

    tenoreScore = clamp(tenoreScore);

    // PATRIMONIO: investimenti + rischio/debito
    let patrimonioScore = 70;
    if (aree.investimenti && typeof aree.investimenti.score === "number") {
        patrimonioScore = aree.investimenti.score;
    }

    if (hasCode("COER_RISCHIO_DEBITO")) {
        patrimonioScore -= 10;
    }

    patrimonioScore = clamp(patrimonioScore);

    return {
        salute: {
            score: saluteScore,
            giudizio: giudizioDaScore(saluteScore)
        },
        tenore_vita: {
            score: tenoreScore,
            giudizio: giudizioDaScore(tenoreScore)
        },
        patrimonio: {
            score: patrimonioScore,
            giudizio: giudizioDaScore(patrimonioScore)
        }
    };
}

function renderScorecardPilastriPersona(pilastri) {
    if (!pilastri) return "";

    const items = [
        { key: "salute", label: "Salute" },
        { key: "tenore_vita", label: "Tenore di vita" },
        { key: "patrimonio", label: "Patrimonio" }
    ];

    const cardsHtml = items.map(item => {
        const p = pilastri[item.key];
        if (!p) return "";
        const score = typeof p.score === "number" ? p.score : 0;
        const giudizio = p.giudizio || giudizioDaScore(score);

        return `
            <div style="
                flex:1 1 0;
                min-width: 0;
                padding:8px 10px;
                border-radius:10px;
                border:1px solid #e5e7eb;
                background:#ffffff;
                display:flex;
                flex-direction:column;
                gap:4px;
            ">
                <div style="font-size:12px; font-weight:600; color:#374151;">
                    ${item.label}
                </div>
                <div style="font-size:18px; font-weight:700; color:#b91c1c;">
                    ${score}/100
                </div>
                <div style="font-size:11px; color:#4b5563;">
                    ${giudizio}
                </div>
            </div>
        `;
    }).join("");

    if (!cardsHtml.trim()) return "";

    return `
        <div style="margin-top:10px; margin-bottom:4px;">
            <div style="font-size:12px; font-weight:600; margin-bottom:4px; color:#374151;">
                Scorecard Metodo Rosso per aree di benessere
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
                ${cardsHtml}
            </div>
        </div>
    `;
}

function renderGapStatalePersona(gapStatale) {
    if (!gapStatale) {
        return `
            <div style="margin-top:10px; font-size:12px; color:#6b7280;">
                Dati insufficienti per una stima sintetica delle tutele statali.
            </div>
        `;
    }

    const blocco = (label, k) => {
        const info = gapStatale[k];
        if (!info) return "";
        const statale = formattaEuroPersona(info.statale);
        const adeg = formattaEuroPersona(info.adeguato);
        const gap = formattaEuroPersona(info.gap);
        return `
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:2px;">
                <div style="width:40%;">${label}</div>
                <div style="width:20%; text-align:right;">${statale} €</div>
                <div style="width:20%; text-align:right;">${adeg} €</div>
                <div style="width:20%; text-align:right; font-weight:600;">${gap} €</div>
            </div>
        `;
    };

    return `
        <div style="margin-top:10px; padding:10px 12px; border-radius:10px; background:#ffffff; border:1px solid #e5e7eb;">
            <div style="font-size:13px; font-weight:600; margin-bottom:4px;">
                Tutele statali vs copertura minima adeguata
            </div>
            <div style="font-size:11px; color:#6b7280; margin-bottom:6px;">
                Sintesi indicativa di quanto copre il sistema pubblico rispetto ad un livello minimo di protezione ritenuto adeguato.
            </div>
            <div style="display:flex; font-size:11px; font-weight:600; margin-bottom:4px;">
                <div style="width:40%;">Evento</div>
                <div style="width:20%; text-align:right;">Tutele pubbliche</div>
                <div style="width:20%; text-align:right;">Obiettivo</div>
                <div style="width:20%; text-align:right;">Scopertura</div>
            </div>
            ${blocco("Morte", "morte")}
            ${blocco("Invalidità", "invalidita")}
            ${blocco("Non autosufficienza", "ltc")}
            ${blocco("Pensione", "pensione")}
        </div>
    `;
}

function renderSemaforoPersona(semaforo) {
    if (!semaforo) return "";

    const mapping = [
        { key: "tcm", label: "TCM (reddito famiglia)" },
        { key: "infortuni", label: "Infortuni" },
        { key: "sanitaria", label: "Sanitaria" },
        { key: "ltc", label: "Non autosufficienza (LTC)" },
        { key: "previdenza", label: "Previdenza complementare" },
        { key: "investimenti", label: "Investimenti / accumulo" }
    ];

    const coloreDot = (colore) => {
        switch (colore) {
            case "red": return "#b91c1c";
            case "orange": return "#ea580c";
            case "yellow": return "#ca8a04";
            case "green": return "#15803d";
            case "gray": return "#6b7280";
            default: return "#6b7280";
        }
    };

    const itemsHtml = mapping.map(({ key, label }) => {
        const item = semaforo[key];
        if (!item) return "";
        const c = item.colore || "gray";
        const motivo = item.motivo || "";
        return `
            <div style="display:flex; flex-direction:column; gap:2px; padding:6px 8px; border-radius:8px; background:#ffffff; border:1px solid #e5e7eb;">
                <div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:600;">
                    <span style="width:10px; height:10px; border-radius:999px; background:${coloreDot(c)};"></span>
                    <span>${label}</span>
                </div>
                <div style="font-size:11px; color:#4b5563;">
                    ${motivo}
                </div>
            </div>
        `;
    }).join("");

    return `
        <div style="margin-top:12px; padding:10px 12px; border-radius:10px; background:#f9fafb; border:1px solid #e5e7eb;">
            <div style="font-size:13px; font-weight:600; margin-bottom:4px;">
                Semaforo coperture & priorità di intervento
            </div>
            <div style="font-size:12px; color:#6b7280; margin-bottom:8px;">
                Lettura immediata delle aree da presidiare con priorità (rosso/arancione) rispetto a quelle da monitorare (giallo/verde/grigio).
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap:8px;">
                ${itemsHtml}
            </div>
        </div>
    `;
}

function renderPrioritaProdottiPersona(prioritaProdotti) {
    if (!Array.isArray(prioritaProdotti) || !prioritaProdotti.length) {
        return "";
    }

    const righe = prioritaProdotti.map(p => {
        return `
            <div style="display:flex; flex-direction:column; gap:2px; padding:6px 8px; border-radius:8px; background:#ffffff; border:1px solid #e5e7eb;">
                <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600;">
                    <span>${p.icon || ""} ${p.nome}</span>
                    <span>${p.score}/100</span>
                </div>
                <div style="font-size:11px; color:#4b5563;">${p.livello}</div>
                ${
  (p.notaConsulente || p.nota || p.note)
    ? `<div style="font-size:11px; color:#6b7280;">${p.notaConsulente || p.nota || p.note}</div>`
    : ""
}
            </div>
        `;
    }).join("");

    return `
        <div style="margin-top:12px; padding:10px 12px; border-radius:10px; background:#f9fafb; border:1px solid #e5e7eb;">
            <div style="font-size:13px; font-weight:600; margin-bottom:4px;">
                Priorità operative per famiglie di copertura
            </div>
            <div style="font-size:12px; color:#6b7280; margin-bottom:8px;">
                Ordinamento sintetico delle aree su cui intervenire, integrando semaforo, profilo normotipo e gap rispetto alle tutele pubbliche.
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap:8px;">
                ${righe}
            </div>
        </div>
    `;
}

function renderSintesiOperativaPersona(sintesiOperativa) {
    if (!Array.isArray(sintesiOperativa) || !sintesiOperativa.length) {
        return "";
    }

    const righe = sintesiOperativa.map(item => {
        const titolo = item.titolo || "";
        const dettaglio = item.dettaglio || "";
        const tipo = item.tipo || "";

        let icon = "📝";
        if (tipo === "overview") icon = "📊";
        else if (tipo === "prodotto") icon = "🎯";
        else if (tipo === "gap_statale") icon = "🏛️";
        else if (tipo === "incongruenze") icon = "🧠";
        else if (tipo === "normotipo") icon = "🧭";

        return `
            <div style="display:flex; gap:8px; align-items:flex-start; margin-bottom:6px;">
                <div style="font-size:14px; line-height:1.2;">${icon}</div>
                <div>
                    <div style="font-size:12px; font-weight:600; margin-bottom:2px;">
                        ${titolo}
                    </div>
                    <div style="font-size:11px; color:#4b5563;">
                        ${dettaglio}
                    </div>
                </div>
            </div>
        `;
    }).join("");

    return `
        <div style="margin-top:8px; margin-bottom:8px; padding:10px 12px; border-radius:10px; background:#fef2f2; border:1px solid #fecaca;">
            <div style="font-size:13px; font-weight:700; margin-bottom:4px; color:#b91c1c;">
                Sintesi operativa per il consulente
            </div>
            <div style="font-size:12px; color:#7f1d1d; margin-bottom:6px;">
                Punto di partenza per la proposta: sequenza logica degli interventi prioritari da condividere con il cliente.
            </div>
            ${righe}
        </div>
    `;
}

function costruisciNarrativaMetodoRossoPersona(risultati) {
    if (!risultati) return "";

    const zoneLuminose = [];
    const zoneOscure = [];
    const ostacoli = [];
    const progetto = [];

    const indiceGlobale = risultati.indiceGlobale ?? null;
    const aree = risultati.aree || {};
    const coerenza = risultati.coerenzaAvanzata || {};
    const indiceCoerenza = coerenza.indice ?? null;
    const dettagliCoerenza = Array.isArray(coerenza.dettagli) ? coerenza.dettagli : [];
    const incongruenze = Array.isArray(risultati.incongruenze) ? risultati.incongruenze : [];
    const priorita = Array.isArray(risultati.prioritaProdotti) ? risultati.prioritaProdotti : [];

    // Zone luminose: equilibrio generale e aree forti
    if (indiceGlobale != null && indiceGlobale >= 75) {
        zoneLuminose.push(
            "Equilibrio complessivo buono: il quadro generale risulta coerente rispetto alle risposte fornite."
        );
    }

    const areeForti = Object.entries(aree)
        .filter(([, info]) => info && typeof info.score === "number" && info.score >= 75)
        .slice(0, 3);
    if (areeForti.length) {
        const etichette = areeForti.map(([k]) => k).join(", ");
        zoneLuminose.push(
            `Aree con percezione e comportamenti relativamente solidi: ${etichette}.`
        );
    }

    if (indiceCoerenza != null && indiceCoerenza >= 75) {
        zoneLuminose.push(
            "Coerenza interna elevata tra percezioni, comportamenti dichiarati e numeri oggettivi."
        );
    }

    // Zone oscure: incongruenze critiche / alte e profilo fragile
    const incCritiche = incongruenze.filter(i => i && i.livello === "critico");
    const incAlte = incongruenze.filter(i => i && i.livello === "alto");
    const incChiave = incCritiche.concat(incAlte).slice(0, 3);
    incChiave.forEach(i => {
        if (i.messaggio) {
            zoneOscure.push(i.messaggio);
        }
    });

    if (indiceGlobale != null && indiceGlobale <= 40) {
        zoneOscure.push(
            "Profilo complessivo fragile: è prioritario mettere in sicurezza le basi prima di destinare risorse a obiettivi di lungo periodo."
        );
    }

    // Ostacoli: penalizzazioni maggiori della coerenza avanzata
    const ostacoliCoerenza = dettagliCoerenza
        .slice()
        .sort((a, b) => (b.impatto || 0) - (a.impatto || 0))
        .slice(0, 3);

    ostacoliCoerenza.forEach(d => {
        if (d.descrizione) {
            ostacoli.push(d.descrizione);
        }
    });

    // Progetto: priorità prodotti per orizzonte temporale (allineato a score/livello reali)
    const urgenti = priorita
        .filter(p => p && typeof p.score === "number" && p.score >= 80)
        .slice(0, 3);

    const medie = priorita
        .filter(p => p && typeof p.score === "number" && p.score >= 65 && p.score < 80)
        .slice(0, 2);

    const basse = priorita
        .filter(p => p && typeof p.score === "number" && p.score < 65)
        .slice(0, 2);


    if (urgenti.length) {
        const nomi = urgenti.map(p => p.nome || p.key).join(", ");
        progetto.push(
            `0-6 mesi: mettere a terra le priorità urgenti su ${nomi}, avviando subito il percorso di messa in sicurezza.`
        );
    }

    if (medie.length) {
        const nomi = medie.map(p => p.nome || p.key).join(", ");
        progetto.push(
            `6-18 mesi: pianificare in modo strutturato gli interventi su ${nomi}, integrandoli nel budget familiare senza creare frizioni inutili.`
        );
    }

    if (basse.length) {
        const nomi = basse.map(p => p.nome || p.key).join(", ");
        progetto.push(
            `>18 mesi: valutare opportunità su ${nomi} una volta consolidate le aree di base e verificate eventuali variazioni di reddito o patrimonio.`
        );
    }

    if (
        !zoneLuminose.length &&
        !zoneOscure.length &&
        !ostacoli.length &&
        !progetto.length
    ) {
        return "";
    }

    const renderLista = (titolo, voci) => {
        if (!voci || !voci.length) return "";
        const itemsHtml = voci
            .map(v => `<li style="margin-bottom:2px;">${v}</li>`)
            .join("");
        return `
            <div style="margin-top:6px;">
                <div style="font-size:12px; font-weight:600; margin-bottom:2px;">
                    ${titolo}
                </div>
                <ul style="font-size:11px; color:#4b5563; padding-left:18px; margin:0;">
                    ${itemsHtml}
                </ul>
            </div>
        `;
    };

    return `
        <div style="margin-top:10px; padding:10px 12px; border-radius:10px; background:#fff7ed; border:1px solid #fed7aa;">
            <div style="font-size:13px; font-weight:600; color:#9a3412; margin-bottom:4px;">
                Sintesi Metodo Rosso: zone luminose, zone da presidiare e progetto di viaggio
            </div>
            ${renderLista("Zone luminose", zoneLuminose)}
            ${renderLista("Zone da presidiare", zoneOscure)}
            ${renderLista("Ostacoli comportamentali", ostacoli)}
            ${renderLista("Progetto di viaggio (bozza)", progetto)}
        </div>
    `;
}

function renderCoerenzaAvanzataPersona(coerenzaAvanzata) {
    if (!coerenzaAvanzata || coerenzaAvanzata.indice == null) {
        return "";
    }

    const indice = coerenzaAvanzata.indice;
    const dettagli = Array.isArray(coerenzaAvanzata.dettagli)
        ? coerenzaAvanzata.dettagli
        : [];

    let giudizio = "Coerenza moderata";
    let colore = "#f59e0b";
    if (indice >= 80) {
        giudizio = "Coerenza elevata";
        colore = "#16a34a";
    } else if (indice < 50) {
        giudizio = "Coerenza critica";
        colore = "#b91c1c";
    }

    const elencoHtml = dettagli.slice(0, 4).map(d => {
        const desc = d.descrizione || "";
        return `<li style="margin-bottom:2px;">${desc}</li>`;
    }).join("");

    return `
        <div style="margin-top:12px; padding:10px 12px; border-radius:10px; background:#f9fafb; border:1px solid #e5e7eb;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <div style="font-size:13px; font-weight:600;">
                    Coerenza complessiva delle risposte
                </div>
                <div style="text-align:right;">
                    <div style="font-size:14px; font-weight:700; color:${colore};">
                        ${indice}/100
                    </div>
                    <div style="font-size:11px; color:#4b5563;">
                        ${giudizio}
                    </div>
                </div>
            </div>
            ${
                elencoHtml
                    ? `
                        <div style="font-size:11px; color:#4b5563; margin-top:4px;">
                            <div style="font-weight:600; margin-bottom:2px;">
                                Punti di attenzione principali:
                            </div>
                            <ul style="padding-left:16px; margin:0;">
                                ${elencoHtml}
                            </ul>
                        </div>
                      `
                    : `
                        <div style="font-size:11px; color:#6b7280; margin-top:4px;">
                            Non emergono particolari elementi di incoerenza rilevanti tra percezioni dichiarate e indicatori oggettivi.
                        </div>
                      `
            }
        </div>
    `;
}

/* =========================
   RENDER RISULTATI PERSONA
========================= */
function renderRisultatiPersona() {
    const sintesiEl = document.getElementById("sintesiPersona");
    const areeContainer = document.getElementById("areeRischioPersona");

    if (!sintesiEl || !areeContainer) {
        console.error("Container risultati persona mancanti.");
        return;
    }

    const indiceGlobale = appStatePersona.risultati.indiceGlobale ?? 0;
    const aree = appStatePersona.risultati.aree || {};
    const anagrafica = appStatePersona.user.anagrafica || {};
    const gapStatale = appStatePersona.risultati.gapStatale || null;
    const normotipo = appStatePersona.risultati.normotipo || null;
    const semaforo = appStatePersona.risultati.semaforo || null;
    const prioritaProdotti = appStatePersona.risultati.prioritaProdotti || [];
    const sintesiOperativa = appStatePersona.risultati.sintesiOperativa || [];
    const coerenzaAvanzata = appStatePersona.risultati.coerenzaAvanzata || null;

    const nome = anagrafica.nome || "";
    const cognome = anagrafica.cognome || "";
    const cf = anagrafica.codiceFiscale || "-";
    const eta = anagrafica.eta != null ? anagrafica.eta : "età non calcolata";
    const professione = anagrafica.professione || "-";
    const sitLav = anagrafica.situazioneLavorativa || "-";

    const headerCliente = `
        <div style="margin-bottom:8px; border-bottom:1px solid #e5e7eb; padding-bottom:6px;">
            <div style="font-size:15px; font-weight:700; color:#111827;">
            Dashboard sintetica    
            </div>
            <div style="font-size:13px; margin-top:4px;">
                Cliente: <strong>${nome} ${cognome}</strong>
            </div>
            <div style="font-size:12px; color:#6b7280; margin-top:2px;">
                CF: ${cf} &nbsp; | &nbsp; Età: ${eta} &nbsp; | &nbsp; Professione: ${professione} &nbsp; | &nbsp; Situazione lavorativa: ${sitLav}
            </div>
        </div>
    `;

        const gapBlockHtml = renderGapStatalePersona(gapStatale);
    const pilastriBenessere = calcolaPilastriBenesserePersona(appStatePersona.risultati);
    const scorecardBenessereHtml = renderScorecardPilastriPersona(pilastriBenessere);


    sintesiEl.innerHTML = `
        ${headerCliente}
        <p style="font-size:14px; margin-bottom:8px;">
            <strong>Indice complessivo di equilibrio personale:</strong>
            <span style="font-size:20px; font-weight:700; color:#b91c1c; margin-left:6px;">
                ${indiceGlobale}/100
            </span>
        </p>
        <p style="font-size:13px; color:#6b7280; margin-bottom:6px;">
            Indice sintetico costruito sulle risposte del questionario Metodo Rosso.
            È affiancato dalla lettura del profilo normotipo, dal confronto tra tutele statali e fabbisogno minimo
            e dal semaforo operativo delle coperture.
        </p>
                ${scorecardBenessereHtml}
        ${renderSintesiOperativaPersona(sintesiOperativa)}
        ${costruisciNarrativaMetodoRossoPersona(appStatePersona.risultati)}
        ${renderDomandePotentiPersona(appStatePersona.risultati.domandePotenti || [])}
        ${
            normotipo
                ? `
        <div style="margin-top:10px; padding:10px 12px; border-radius:10px; background:#ffffff; border:1px solid #e5e7eb;">

            <div style="font-size:13px; font-weight:600; margin-bottom:4px;">
                Profilo normotipo cliente
            </div>
            <div style="font-size:14px; font-weight:700; color:#b91c1c; margin-bottom:4px;">
                ${normotipo.profilo}
            </div>
            ${
                Array.isArray(normotipo.caratteristiche) && normotipo.caratteristiche.length
                    ? `
                        <ul style="font-size:12px; color:#4b5563; padding-left:18px; margin:0;">
                            ${normotipo.caratteristiche.map(c => `<li>${c}</li>`).join("")}
                        </ul>
                      `
                    : ""
            }
            ${
                normotipo.esclusioni && normotipo.esclusioni.length
                    ? `<div style="margin-top:6px; font-size:11px; color:#b91c1c;">
                        Esclusioni operative: ${normotipo.esclusioni.join(" • ")}
                       </div>`
                    : ""
            }
        </div>
                `
                : ""
        }
        ${gapBlockHtml}
        ${renderCoerenzaAvanzataPersona(coerenzaAvanzata)}
        ${semaforo ? renderSemaforoPersona(semaforo) : ""}
        ${renderPrioritaProdottiPersona(prioritaProdotti)}
    `;

    let htmlAree = `
        <div style="font-size:13px; font-weight:600; margin-bottom:6px;">
            Aree di rischio & percezioni chiave
        </div>
    `;

    const areeEntries = Object.entries(aree);
    if (!areeEntries.length) {
        htmlAree += `
            <p style="font-size:12px; color:#9ca3af;">
                Nessuna area valutabile. Completare il questionario per ottenere il dettaglio.
            </p>
        `;
    } else {
        areeEntries.forEach(([areaKey, info]) => {
            const label = areaKey;
            const score = info.score ?? 0;
            const giudizio = giudizioDaScore(score);
            htmlAree += `
                <div style="margin-bottom:6px; padding:6px 8px; border-radius:8px; border:1px solid #e5e7eb; background:#ffffff;">
                    <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:2px;">
                        <span>${label}</span>
                        <span>${score}/100</span>
                    </div>
                    <div style="font-size:11px; color:#6b7280;">
                        ${giudizio}
                    </div>
                </div>
            `;
        });
    }

    areeContainer.innerHTML = htmlAree;
}

/* =========================
   RADAR PERSONA (CHART.JS)
========================= */
function renderRadarPersona() {
    const canvas = document.getElementById("radarPersonaChart");
    if (!canvas) {
        console.warn("⚠️ radarPersonaChart non trovato nel DOM.");
        return;
    }
    if (typeof Chart === "undefined") {
        console.warn("⚠️ Chart.js non disponibile: impossibile renderizzare il radar.");
        return;
    }

    const aree = (appStatePersona.risultati && appStatePersona.risultati.aree) || {};
    const labels = Object.keys(aree);
    const dataScore = labels.map((k) => {
        const area = aree[k] || {};
        return typeof area.score === "number" ? area.score : 0;
    });

    // Nessun dato → pulisco e esco
    const ctx = canvas.getContext("2d");
    if (!labels.length) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        console.warn("⚠️ Nessun dato per il radar persona.");
        return;
    }

    // Forzo dimensioni fisse per evitare canvas infinito
    canvas.style.width = "360px";
    canvas.style.height = "260px";
    canvas.width = 360;
    canvas.height = 260;

    if (!appStatePersona.charts) {
        appStatePersona.charts = {};
    }
    if (appStatePersona.charts.radar) {
        try {
            appStatePersona.charts.radar.destroy();
        } catch (e) {
            console.warn("Errore nella destroy del radar precedente:", e);
        }
        appStatePersona.charts.radar = null;
    }

    appStatePersona.charts.radar = new Chart(ctx, {
        type: "radar",
        data: {
            labels,
            datasets: [
                {
                    label: "Equilibrio aree",
                    data: dataScore,
                    fill: true,
                    backgroundColor: "rgba(220,38,38,0.16)",
                    borderColor: "rgba(220,38,38,1)",
                    pointBackgroundColor: "rgba(220,38,38,1)",
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: false,              // ⬅ blocchiamo il resize folle
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                        showLabelBackdrop: false
                    },
                    grid: {
                        display: true
                    },
                    angleLines: {
                        display: true
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}



/* =========================
   TIMELINE PERSONA - PIANO OPERATIVO
========================= */
function renderTimelinePersona() {
    const container = document.getElementById("timelinePersona");
    if (!container) return;

    const state = (typeof appStatePersona === "object") ? appStatePersona : null;
    const r = state && state.risultati ? state.risultati : {};

    // Se non ho praticamente nulla, faccio un fallback molto semplice
    if (!r || Object.keys(r).length === 0) {
        const nowFallback = new Date().toLocaleString("it-IT");
        container.innerHTML = `
            <div style="font-size:13px; font-weight:600; margin-bottom:4px;">
                Timeline analisi
            </div>
            <div style="font-size:11px; color:#6b7280;">
                Nessun risultato calcolato. Esegui l'analisi per vedere il piano temporale.
            </div>
            <div style="font-size:11px; color:#9ca3af; margin-top:4px;">
                Ultimo controllo UI: ${nowFallback}
            </div>
        `;
        return;
    }

    const indice = (typeof r.indiceGlobale === "number") ? r.indiceGlobale : null;
    const priorita = Array.isArray(r.prioritaProdotti) ? r.prioritaProdotti : [];
    const aree = r.aree || {};
    const incongruenze = Array.isArray(r.incongruenze) ? r.incongruenze : [];
    const coerenzaObj = r.coerenzaAvanzata || {};
    const coerenza = (typeof coerenzaObj.indice === "number")
        ? coerenzaObj.indice
        : (typeof coerenzaObj.score === "number" ? coerenzaObj.score : null);

    const now = new Date();
    const timestamp = now.toLocaleString("it-IT");

    const bucketImmediato = [];
    const bucketMedio = [];
    const bucketLungo = [];

    const pushUnique = (arr, txt) => {
        if (!txt) return;
        if (!arr.includes(txt)) arr.push(txt);
    };

    // 1) Priorità prodotti -> mapping su finestre temporali
    priorita.forEach((p) => {
        if (!p || typeof p !== "object") return;

        const score = (typeof p.score === "number") ? p.score : null;
        const livello = p.livello || "";
        const baseLabel = p.nome || p.key || "Prodotto";
        const icon = p.icon || "";
        const nota = p.notaConsulente || p.motivoSemaforo || "Intervento consigliato sulla copertura.";

        const label = `${icon ? icon + " " : ""}${baseLabel} - ${nota}`;

        if ((score != null && score >= 80) || livello === "altissimo") {
            // Urgente -> 0-6 mesi
            pushUnique(bucketImmediato, label);
        } else if (score != null && score >= 65) {
            // Priorità media -> 6-18 mesi
            pushUnique(bucketMedio, label);
        } else {
            // Resto -> >18 mesi
            pushUnique(bucketLungo, label);
        }
    });

    // 2) Aree di rischio più deboli -> focus temporale
    const areaEntries = Object.keys(aree)
        .map((k) => {
            const a = aree[k] || {};
            return {
                key: k,
                score: (typeof a.score === "number") ? a.score : null
            };
        })
        .filter((a) => a.score != null)
        .sort((a, b) => a.score - b.score);

    areaEntries.slice(0, 2).forEach((a) => {
        const labelArea = a.key.charAt(0).toUpperCase() + a.key.slice(1);
        const testo = `Area "${labelArea}" con punteggio ${a.score}/100: rafforzare coperture e pianificazione.`;
        if (a.score < 50) {
            // Molto debole -> 0-6 mesi
            pushUnique(bucketImmediato, testo);
        } else if (a.score < 70) {
            // Debole ma non disastro -> 6-18 mesi
            pushUnique(bucketMedio, testo);
        }
    });

    // 3) Incongruenze critiche/alte -> sempre 0-6 mesi
    const incongruenzeCritiche = incongruenze.filter((i) => {
        if (!i || typeof i !== "object") return false;
        const lvl = (i.livello || "").toLowerCase();
        return lvl === "critico" || lvl === "alto";
    });

    incongruenzeCritiche.slice(0, 3).forEach((inc) => {
        const code = inc.codice ? ` (${inc.codice})` : "";
        const msg = inc.messaggio || "Incongruenza da approfondire.";
        pushUnique(
            bucketImmediato,
            `Incongruenza da chiarire${code}: ${msg}`
        );
    });

    // 4) Coerenza avanzata bassa -> finestra 0-6 o 6-18 mesi
    if (coerenza != null && coerenza < 70) {
        const msgCoer =
            coerenza < 50
                ? "Indice di coerenza complessiva basso: programmare subito un confronto di riallineamento numeri/aspettative."
                : "Indice di coerenza da monitorare: fissare un check di follow-up su percezioni e numeri entro 12 mesi.";

        if (coerenza < 50) {
            pushUnique(bucketImmediato, msgCoer);
        } else {
            pushUnique(bucketMedio, msgCoer);
        }
    }

    // Helper per renderizzare i bucket
    const renderBucket = (titolo, items) => {
        if (!items || !items.length) {
            return `
                <div style="padding:8px 10px; border-radius:10px; border:1px dashed #d1d5db; background:#f9fafb;">
                    <div style="font-size:11px; font-weight:600; margin-bottom:4px;">${titolo}</div>
                    <div style="font-size:11px; color:#9ca3af;">
                        Nessuna azione specifica emersa in questa finestra temporale.
                    </div>
                </div>
            `;
        }

        const li = items
            .map((t) => `<li style="margin-bottom:2px;">${t}</li>`)
            .join("");

        return `
            <div style="padding:8px 10px; border-radius:10px; border:1px solid #e5e7eb; background:#ffffff;">
                <div style="font-size:11px; font-weight:600; margin-bottom:4px;">${titolo}</div>
                <ul style="padding-left:16px; margin:0; font-size:11px;">
                    ${li}
                </ul>
            </div>
        `;
    };

    container.innerHTML = `
        <div style="font-size:13px; font-weight:600; margin-bottom:4px;">
            Timeline operativa
        </div>
        <div style="font-size:11px; color:#6b7280; margin-bottom:6px;">
            Ultima analisi eseguita il ${timestamp}${
                indice != null ? ` - indice complessivo <strong>${indice}/100</strong>` : ""
            }
        </div>
        <div style="
            display:grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap:8px;
        ">
            ${renderBucket("0-6 mesi: interventi prioritari", bucketImmediato)}
            ${renderBucket("6-18 mesi: consolidamento", bucketMedio)}
            ${renderBucket(">18 mesi: sviluppo / investimento", bucketLungo)}
        </div>
    `;
}


/* =========================
   RIEPILOGO CONSULENZIALE PERSONA
========================= */
function visualizzaRiepilogoPersona() {
    try {
        // Controllo minimo: serve un'analisi eseguita
        if (
            !appStatePersona.risultati ||
            appStatePersona.risultati.indiceGlobale == null
        ) {
            if (typeof mostraToast === "function") {
                mostraToast("Esegui prima l'analisi persona.", "warning");
            }
            return;
        }

        // Allinea anagrafica e caring con lo stato UI corrente
        if (typeof leggiAnagraficaPersona === "function") {
            leggiAnagraficaPersona();
        }
        leggiCaringPersona();

        const ana = appStatePersona.user.anagrafica || {};
        const r = appStatePersona.risultati || {};
        const caring = appStatePersona.caring || {};

        const indice = r.indiceGlobale ?? "-";
        const normotipo = r.normotipo?.profilo || "Non classificato";
        const coerenza = r.coerenzaAvanzata?.indice ?? null;

        const aree = r.aree || {};
        const listaAree = Object.keys(aree)
            .map((k) => {
                const v = aree[k] || {};
                const score = v.score ?? 0;
                return `<li><strong>${k}</strong>: ${score}/100 (${giudizioDaScore(score)})</li>`;
            })
            .join("");

        const priorita = (r.prioritaProdotti || [])
            .slice(0, 6)
            .map(
                (p) =>
                    `<li><strong>${p.nome}</strong> (${p.famiglia || "n.d."}) – priorità ${
                        p.score ?? 0
                    }/100</li>`
            )
            .join("");

        const sintesi = (r.sintesiOperativa || [])
            .map((b) => `<li><strong>${b.titolo}</strong>: ${b.dettaglio}</li>`)
            .join("");

        const noteCaring = caring.note
            ? caring.note.replace(/\n/g, "<br/>")
            : "";

        // Costruzione modal
        const modal = document.createElement("div");
        modal.id = "riepilogoPersonaModal";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.background = "rgba(15,23,42,0.6)";
        modal.style.display = "flex";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        modal.style.zIndex = "9999";

        modal.innerHTML = `
            <div
                style="
                    background:#ffffff;
                    max-width:900px;
                    width:90%;
                    max-height:90vh;
                    overflow:auto;
                    border-radius:12px;
                    padding:24px 28px;
                    box-shadow:0 20px 45px rgba(15,23,42,0.45);
                    font-size:13px;
                    color:#111827;
                "
            >
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
                    <div>
                        <div style="font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#9ca3af;">
                            Generali Business Advisor – Persona
                        </div>
                        <h2 style="margin:4px 0 0 0; font-size:20px;">
                            Riepilogo analisi per ${ana.nome || ""} ${ana.cognome || ""}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onclick="chiudiRiepilogoPersona()"
                        style="
                            border:none;
                            background:transparent;
                            font-size:18px;
                            cursor:pointer;
                            color:#6b7280;
                        "
                    >
                        ✕
                    </button>
                </div>

                <!-- KPI principali -->
                <div
                    style="
                        display:grid;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                        gap:14px;
                        margin-bottom:18px;
                    "
                >
                    <div style="padding:12px; border-radius:10px; background:#eff6ff;">
                        <div style="font-size:11px; color:#374151; margin-bottom:4px;">Indice complessivo</div>
                        <div style="font-size:22px; font-weight:700;">${indice}/100</div>
                    </div>

                    <div style="padding:12px; border-radius:10px; background:#fef3c7;">
                        <div style="font-size:11px; color:#374151; margin-bottom:4px;">Normotipo</div>
                        <div style="font-size:14px; font-weight:600;">${normotipo}</div>
                    </div>

                    <div style="padding:12px; border-radius:10px; background:#ecfdf3;">
                        <div style="font-size:11px; color:#374151; margin-bottom:4px;">Coerenza risposte</div>
                        <div style="font-size:14px; font-weight:600;">
                            ${coerenza != null ? coerenza + "%" : "n.d."}
                        </div>
                    </div>
                </div>

                <!-- Dati cliente -->
                <h3 style="font-size:15px; margin:14px 0 8px 0;">Dati cliente</h3>
                <div
                    style="
                        display:grid;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                        gap:10px;
                        margin-bottom:14px;
                        font-size:12px;
                    "
                >
                    <div><strong>Nome</strong><br/>${ana.nome || ""} ${ana.cognome || ""}</div>
                    <div><strong>Età</strong><br/>${ana.eta || ""}</div>
                    <div><strong>Professione</strong><br/>${ana.professione || ""}</div>
                    <div><strong>Situazione lavorativa</strong><br/>${ana.situazioneLavorativa || ""}</div>
                    <div><strong>Reddito annuo</strong><br/>${ana.redditoAnnuo || ""}</div>
                    <div><strong>Nucleo / figli</strong><br/>${ana.nucleoComponenti || "-"} / ${ana.figliMinorenni || 0}</div>
                    <div><strong>Città</strong><br/>${ana.citta || ""} ${ana.provincia ? "(" + ana.provincia + ")" : ""}</div>
                    <div><strong>Email</strong><br/>${ana.emailCliente || ""}</div>
                    <div><strong>Telefono</strong><br/>${ana.telefonoCliente || ""}</div>
                </div>

                <!-- Equilibrio aree -->
                <h3 style="font-size:15px; margin:14px 0 8px 0;">Equilibrio aree di bisogno</h3>
                <ul style="margin:0 0 12px 18px; padding:0; font-size:12px;">
                    ${listaAree || "<li>Nessuna area valutata.</li>"}
                </ul>

                <!-- Priorità prodotti -->
                <h3 style="font-size:15px; margin:14px 0 8px 0;">Priorità prodotti suggerite</h3>
                <ul style="margin:0 0 12px 18px; padding:0; font-size:12px;">
                    ${priorita || "<li>Nessuna priorità evidenziata.</li>"}
                </ul>

                <!-- Sintesi operativa -->
                <h3 style="font-size:15px; margin:14px 0 8px 0;">Sintesi operativa</h3>
                <ul style="margin:0 0 12px 18px; padding:0; font-size:12px;">
                    ${sintesi || "<li>Nessuna sintesi specifica generata.</li>"}
                </ul>

                <!-- Caring -->
                <h3 style="font-size:15px; margin:14px 0 8px 0;">Piano di caring</h3>
                <div style="font-size:12px; margin-bottom:8px;">
                    <strong>Prossimo contatto:</strong>
                    ${
                        caring.dataAppuntamento
                            ? `${caring.dataAppuntamento} ${caring.oraAppuntamento || ""}`
                            : "non pianificato"
                    }
                    <br/>
                    <strong>Modalità:</strong> ${caring.modalita || "n.d."}<br/>
                    <strong>Valutazione ultimo incontro:</strong> ${caring.valutazione || "n.d."}
                </div>
                ${
                    noteCaring
                        ? `<div style="font-size:12px; padding:10px 12px; border-radius:8px; background:#f9fafb; border:1px solid #e5e7eb;">
                               <strong>Note operative:</strong><br/>${noteCaring}
                           </div>`
                        : ""
                }

                <div style="margin-top:18px; text-align:right; font-size:11px; color:#9ca3af;">
                    Generato con Partner Persona – uso interno consulente
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    } catch (err) {
        console.error("Errore in visualizzaRiepilogoPersona:", err);
        if (typeof mostraToast === "function") {
            mostraToast("Errore nella generazione del riepilogo (vedi console).", "error");
        }
    }
}

function chiudiRiepilogoPersona() {
    const modal = document.getElementById("riepilogoPersonaModal");
    if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
    }
}

/* =========================
   UTILITÀ ARCHIVIO / NUOVA ANALISI PERSONA
========================= */

/**
 * Avvia una nuova analisi persona:
 * - resetta lo stato in memoria
 * - pulisce i campi principali di anagrafica
 * - riporta il questionario alla prima domanda
 * - pulisce la dashboard risultati
 */
function nuovaAnalisiPersona() {
    try {
        // Cancella eventuale bozza salvata
        if (typeof cancellaBozzaAnalisiPersona === "function") {
            cancellaBozzaAnalisiPersona();
        }
        // Reset stato in memoria
        appStatePersona.user.anagrafica = {};
        appStatePersona.user.consulente = {};
        appStatePersona.user.copertureAttive = {};
        appStatePersona.questionnaire.answers = {};
        appStatePersona.questionnaire.currentIndex = 0;
        appStatePersona.risultati = {
            aree: {},
            indiceGlobale: null,
            gapStatale: null,
            normotipo: null,
            semaforo: null,
            incongruenze: [],
            prioritaProdotti: [],
            sintesiOperativa: [],
            coerenzaAvanzata: null
        };

        // Pulisci campi anagrafica principali
        const campiDaPulire = [
            "nome",
            "cognome",
            "codiceFiscale",
            "dataNascita",
            "eta",
            "professione",
            "situazioneLavorativa",
            "redditoAnnuo",
            "nucleoComponenti",
            "figliMinorenni",
            "patrimonioFinanziario",
            "citta",
            "provincia",
            "cap",
            "emailCliente",
            "telefonoCliente"
        ];

        campiDaPulire.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

        const consulenteSelect = document.getElementById("consulenteSelect");
        if (consulenteSelect) {
            consulenteSelect.value = "";
        }
        const emailConsulente = document.getElementById("emailConsulente");
        if (emailConsulente) {
            emailConsulente.value = "";
        }

        // Rimetti il questionario alla prima domanda
        renderDomandaCorrentePersona();
        // Re-render Coperture Attive V2 (ripulisce la UI dopo reset stato)
if (typeof initCopertureAttiveV2 === "function") {
    initCopertureAttiveV2();
}


        // Pulisci la dashboard risultati
        const sintesiEl = document.getElementById("sintesiPersona");
        if (sintesiEl) {
            sintesiEl.innerHTML = `
                <p style="font-size:13px; color:#9ca3af;">
                    Compila la nuova analisi persona per vedere qui i risultati.
                </p>
            `;
        }

        const areeContainer = document.getElementById("areeRischioPersona");
        if (areeContainer) {
            areeContainer.innerHTML = "";
        }

        // Reset radar se presente
        if (appStatePersona.charts && appStatePersona.charts.radar) {
            appStatePersona.charts.radar.destroy();
            appStatePersona.charts.radar = null;
        }

        // Porta in vista il questionario
        const questionarioSection = document.getElementById("questionarioPersonaSection");
        if (questionarioSection) {
            questionarioSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (typeof mostraToast === "function") {
            mostraToast("Nuova analisi persona avviata.", "info");
        }
        console.log("🔄 Nuova analisi persona: stato resettato.");
    } catch (err) {
        console.error("Errore in nuovaAnalisiPersona:", err);
        if (typeof mostraToast === "function") {
            mostraToast("Errore nell'avvio di una nuova analisi (vedi console).", "error");
        }
    }
}

/**
 * Carica un'analisi dall'archivio in base all'indice di riga.
 * Usa:
 *  - caricaArchivioPersona() da persona_archivio.js
 *  - risposte salvate per ricalcolare i risultati con la logica attuale
 */
/**
 * Carica un'analisi dall'archivio in base al codice fiscale.
 * Ripristina:
 *  - anagrafica
 *  - consulente
 *  - polizze
 *  - risposte questionario
 *  - caring
 * e riallinea la UI + ricalcola i risultati.
 */
function caricaAnalisiPersonaDaArchivio(codiceFiscale) {
    try {
        if (typeof caricaArchivioPersona !== "function") {
            console.error("caricaArchivioPersona non disponibile.");
            return;
        }

        const archivio = caricaArchivioPersona();
        if (!Array.isArray(archivio) || !archivio.length) {
            if (typeof mostraToast === "function") {
                mostraToast("Nessuna analisi in archivio.", "warning");
            }
            return;
        }

        const keyRaw = (codiceFiscale || "").toString().trim();
if (!keyRaw) {
    if (typeof mostraToast === "function") {
        mostraToast("Identificativo non valido per il richiamo analisi.", "error");
    }
    return;
}

const keyUpper = keyRaw.toUpperCase();

// 1) Prima provo match per ID record (click archivio passa data-id)
let rec = archivio.find(r => {
    const idRec = (r && r.id != null) ? String(r.id).trim() : "";
    return idRec && idRec === keyRaw;
});

// 2) Fallback: match per CF, ma prendo SEMPRE l’ultima analisi (timestamp più recente)
if (!rec) {
    const candidati = archivio.filter(r => {
        const cfRec = (r && r.cliente && r.cliente.codiceFiscale)
            ? String(r.cliente.codiceFiscale).trim().toUpperCase()
            : "";
        return cfRec === keyUpper;
    });

    if (candidati.length) {
        candidati.sort((a, b) => {
            const ta = a && a.timestamp ? Date.parse(a.timestamp) : 0;
            const tb = b && b.timestamp ? Date.parse(b.timestamp) : 0;
            return tb - ta;
        });
        rec = candidati[0];
    }
}

if (!rec) {
    if (typeof mostraToast === "function") {
        mostraToast("Analisi non trovata (ID/CF).", "warning");
    }
    console.warn("Nessun record archivio persona per key:", keyRaw);
    return;
}


        // 1) Ripristina stato: anagrafica, consulente, polizze, risposte
        appStatePersona.user.anagrafica = rec.cliente || {};
        appStatePersona.user.consulente = rec.consulente || {};
        appStatePersona.user.polizze = Array.isArray(rec.polizze)
            ? rec.polizze.map(p => ({ ...p }))
            : [];
        appStatePersona.questionnaire.answers = rec.risposte || {};
        appStatePersona.questionnaire.currentIndex = 0;

        // 2) Ripristina CARING
        const c = rec.caring || {};
        appStatePersona.caring = {
            dataAppuntamento: c.dataAppuntamento || "",
            oraAppuntamento: c.oraAppuntamento || "",
            modalita: c.modalita || "",
            valutazione: c.valutazione || "",
            note: c.note || ""
        };

        // 3) Sincronizza UI anagrafica
        if (typeof popolaFormAnagraficaDaStatePersona === "function") {
            popolaFormAnagraficaDaStatePersona();
        }

        // 4) Sincronizza UI caring
        const setCaringVal = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.value = value != null ? String(value) : "";
        };

        const car = appStatePersona.caring || {};
        setCaringVal("caringDataAppuntamento", car.dataAppuntamento);
        setCaringVal("caringOraAppuntamento", car.oraAppuntamento);
        setCaringVal("caringModalita", car.modalita);
        setCaringVal("caringValutazione", car.valutazione);
        setCaringVal("caringNote", car.note);

        // 5) Ricalcolo con la logica attuale
        calcolaRisultatiPersona();
        if (typeof renderDomandaCorrentePersona === "function") {
            renderDomandaCorrentePersona();
        }
        if (typeof renderRisultatiPersona === "function") {
            renderRisultatiPersona();
        }
        if (typeof renderRadarPersona === "function") {
            renderRadarPersona();
        }
        if (typeof renderTimelinePersona === "function") {
            renderTimelinePersona();
        }
        if (typeof renderPolizzePersona === "function") {
            renderPolizzePersona();
        }

        // 6) Porta ai risultati
        const risultatiSection = document.getElementById("risultatiPersonaSection");
        if (risultatiSection) {
            risultatiSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (typeof mostraToast === "function") {
            mostraToast("Analisi persona caricata dall'archivio.", "success");
        }
        console.log("📂 Analisi persona caricata da archivio, key:", keyRaw, "record:", rec);
    } catch (err) {
        console.error("Errore in caricaAnalisiPersonaDaArchivio:", err);
        if (typeof mostraToast === "function") {
            mostraToast("Errore nel caricamento dall'archivio (vedi console).", "error");
        }
    }
}


/* ============================
   VALIDAZIONE CODICE FISCALE
============================ */

function validaCodiceFiscale(cf) {
    if (!cf) return { valido: false, errore: "Codice fiscale vuoto." };
    cf = cf.toUpperCase().trim();

    // Controllo lunghezza
    if (cf.length !== 16) {
        return { valido: false, errore: "Il codice fiscale deve contenere 16 caratteri." };
    }

    // Controllo caratteri
    const regex = /^[A-Z0-9]+$/;
    if (!regex.test(cf)) {
        return { valido: false, errore: "Il codice fiscale contiene caratteri non validi." };
    }

    // Calcolo check digit
    const odd = {
        '0': 1,'1': 0,'2': 5,'3': 7,'4': 9,'5': 13,'6': 15,'7': 17,'8': 19,'9': 21,
        'A': 1,'B': 0,'C': 5,'D': 7,'E': 9,'F': 13,'G': 15,'H': 17,'I': 19,'J': 21,
        'K': 2,'L': 4,'M': 18,'N': 20,'O': 11,'P': 3,'Q': 6,'R': 8,'S': 12,'T': 14,
        'U': 16,'V': 10,'W': 22,'X': 25,'Y': 24,'Z': 23
    };

    const even = {
        '0': 0,'1': 1,'2': 2,'3': 3,'4': 4,'5': 5,'6': 6,'7': 7,'8': 8,'9': 9,
        'A': 0,'B': 1,'C': 2,'D': 3,'E': 4,'F': 5,'G': 6,'H': 7,'I': 8,'J': 9,
        'K': 10,'L': 11,'M': 12,'N': 13,'O': 14,'P': 15,'Q': 16,'R': 17,'S': 18,'T': 19,
        'U': 20,'V': 21,'W': 22,'X': 23,'Y': 24,'Z': 25
    };

    let sum = 0;
    for (let i = 0; i < 15; i++) {
        const c = cf[i];
        sum += (i % 2 === 0) ? odd[c] : even[c];
    }

    const checkChar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[sum % 26];
    if (checkChar !== cf[15]) {
        return { valido: false, errore: "Check digit non valido." };
    }

    return { valido: true };
}


/* ============================
   ESTRAZIONE DATA DI NASCITA + SESSO
============================ */

function estraiDataNascitaDaCF(cf) {
    cf = cf.toUpperCase();

    const anno = parseInt(cf.substring(6, 8), 10);
    const meseChar = cf.charAt(8);
    const giornoChar = parseInt(cf.substring(9, 11), 10);

    const mesi = {
        'A': 1,'B': 2,'C': 3,'D': 4,'E': 5,'H': 6,
        'L': 7,'M': 8,'P': 9,'R': 10,'S': 11,'T': 12
    };

    const mese = mesi[meseChar];

    // Donna → giorno + 40
    let giorno = giornoChar;
    let sesso = "M";
    if (giorno > 40) {
        giorno -= 40;
        sesso = "F";
    }

    // Anno → 1900–1999 oppure 2000–2099 (assunzione moderna)
    const currentYear = new Date().getFullYear() % 100;
    const secolo = anno <= currentYear ? 2000 : 1900;
    const annoCompleto = secolo + anno;

    const dataISO = `${annoCompleto}-${String(mese).padStart(2,"0")}-${String(giorno).padStart(2,"0")}`;

    return {
        data: dataISO,
        sesso
    };
}

function initAnagraficaPersonaHelpers() {
    const dataNascitaInput = document.getElementById("dataNascita");
    const luogoNascitaInput = document.getElementById("luogoNascita");
    const sessoInput = document.getElementById("sesso");
    const etaInput = document.getElementById("eta");
    const cfInput = document.getElementById("codiceFiscale");


    // Se mancano i campi chiave, log e fine (non blocchiamo l'app)
    if (!dataNascitaInput || !etaInput) {
        console.warn("Campi dataNascita / eta non trovati in pagina.");
    }

    // 1) CALCOLO ETA' DA DATA DI NASCITA
    if (dataNascitaInput && etaInput) {
        dataNascitaInput.addEventListener("change", () => {
            const val = dataNascitaInput.value;
            if (!val) {
                etaInput.value = "";
                return;
            }

            const birth = new Date(val);
            if (Number.isNaN(birth.getTime())) {
                console.warn("Data di nascita non valida:", val);
                return;
            }

            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }

            etaInput.value = age >= 0 ? age : "";
        });
    }

    // 2) VALIDAZIONE CF + AUTO-DATA
    if (cfInput) {
        cfInput.addEventListener("input", () => {
            const cf = cfInput.value.toUpperCase().trim();

            // Se ancora corto → stile neutro e basta
            if (cf.length < 16) {
                cfInput.style.borderColor = "#d1d5db";
                return;
            }

            const res = validaCodiceFiscale(cf);

            if (!res.valido) {
                cfInput.style.borderColor = "var(--rosso)";
                if (typeof mostraToast === "function") {
                    mostraToast("Codice fiscale non valido: " + res.errore, "warning");
                }
                return;
            }

            // CF valido → bordo verde
cfInput.style.borderColor = "#10b981";

// Estrai info anagrafica (data + sesso + luogo)
const info = estraiInfoAnagraficaDaCF(cf);
// ✅ Fallback luogo nascita da codice catastale (CF pos 12-15), se il campo è ancora vuoto
if (
    luogoNascitaInput &&
    !luogoNascitaInput.value &&
    typeof window.trovaComuneDaCodiceCatastale === "function" &&
    cf.length === 16
) {
    const codCat = cf.substring(11, 15).toUpperCase();
    const comune = window.trovaComuneDaCodiceCatastale(codCat);
    if (comune && comune.n) {
        luogoNascitaInput.value = comune.n;
    }
}

// Data nascita
if (info.data && dataNascitaInput) {
    dataNascitaInput.value = info.data;
    // forza ricalcolo età
    dataNascitaInput.dispatchEvent(new Event("change"));
}

// Sesso
if (sessoInput) {
    sessoInput.value = info.sesso || "";
}

// Luogo nascita (se risolvibile)
// 1) usa info.luogoNascita se già disponibile
if (luogoNascitaInput && info.luogoNascita) {
    luogoNascitaInput.value = info.luogoNascita;
}

// 2) fallback: CF → codice catastale → comune (usa catasto_comuni.js)
if (
    luogoNascitaInput &&
    !luogoNascitaInput.value &&
    cf.length === 16 &&
    typeof window.trovaComuneDaCodiceCatastale === "function"
) {
    try {
        const codCat = cf.substring(11, 15).toUpperCase(); // pos 12-15
        const comune = window.trovaComuneDaCodiceCatastale(codCat);
        if (comune && comune.n) {
            luogoNascitaInput.value = comune.n;
        }
    } catch (e) {
        console.warn("⚠️ Fallback luogoNascita da CF fallito:", e);
    }
}


        });
    }
}

/* =========================
   NORMATIVA INFORTUNI - LOADER (JSON)
   Espone: window.NORMATIVA_INFORTUNI
========================= */
async function loadNormativaInfortuniPersona() {
    try {
        // già caricata
        if (window.NORMATIVA_INFORTUNI && Array.isArray(window.NORMATIVA_INFORTUNI.rows)) {
            return window.NORMATIVA_INFORTUNI;
        }

        const url = "../../assets/normativa_infortuni_normalizzata.json";
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
            console.warn("⚠️ Normativa infortuni non caricata:", res.status, res.statusText);
            return null;
        }

        const data = await res.json();

        // Normalizzazione minima: ci aspettiamo { rows: [...] } oppure direttamente un array
        const payload = Array.isArray(data) ? { rows: data } : data;
        const rows = payload && Array.isArray(payload.rows) ? payload.rows : [];

        window.NORMATIVA_INFORTUNI = { rows };
        window.__NORMATIVA_INFORTUNI__ = rows;
        console.log("✅ Normativa infortuni caricata. Righe:", rows.length);

        return window.NORMATIVA_INFORTUNI;
    } catch (e) {
        console.warn("⚠️ Errore loadNormativaInfortuniPersona:", e);
        return null;
    }
}

/* =========================
   INIT APP PERSONA
========================= */
function initPersonaApp() {
       // HARD GUARD: evita doppia inizializzazione (listener duplicati / doppio include)
    if (window.__PERSONA_APP_INITED__ === true) {
        console.warn("⚠️ Persona init già eseguito: skip");
        return;
    }
    window.__PERSONA_APP_INITED__ = true;
    initLoginPersona();

    // Inizializza UI polizze LEGACY solo se il blocco è realmente attivo (in V2 è nascosto)
const legacyBlock = document.getElementById("polizzePersonaLegacyBlock");
const legacyIsVisible =
    legacyBlock &&
    legacyBlock.style.display !== "none" &&
    legacyBlock.offsetParent !== null;

if (legacyIsVisible && typeof initPolizzePersonaUI === "function") {
    initPolizzePersonaUI();
}


    const btnPrev = document.getElementById("btnPrevDomanda");
    const btnNext = document.getElementById("btnNextDomanda");

    if (btnPrev) {
        btnPrev.addEventListener("click", vaiDomandaPrecedentePersona);
    }
    if (btnNext) {
        btnNext.addEventListener("click", vaiDomandaSuccessivaPersona);
    }

    // Pulsanti risultati
const btnRiep = document.getElementById("btnRiepilogoPersona");
const btnStampa = document.getElementById("btnStampaPersona");
const btnSalva = document.getElementById("btnSalvaAnalisiPersona");
const btnNuova = document.getElementById("btnNuovaAnalisiPersona");

if (btnRiep) {
    btnRiep.addEventListener("click", visualizzaRiepilogoPersona);
}

if (btnStampa) {
    btnStampa.addEventListener("click", () => {
        window.print();
    });
}

// ✅ SALVA MANUALE: usa la stessa pipeline del salvataggio automatico
if (btnSalva) {
    btnSalva.addEventListener("click", () => {
        try {
            // allinea dati correnti prima di salvare (coerente con eseguiAnalisiPersona)
            if (typeof leggiAnagraficaPersona === "function") {
                leggiAnagraficaPersona();
            }
            if (typeof leggiCaringPersona === "function") {
                leggiCaringPersona();
            }

            if (typeof salvaAnalisiPersonaInArchivio === "function") {
                salvaAnalisiPersonaInArchivio();
                if (typeof mostraToast === "function") {
                    mostraToast("Analisi salvata in archivio.", "success");
                }
            } else {
                console.warn("salvaAnalisiPersonaInArchivio non disponibile.");
                if (typeof mostraToast === "function") {
                    mostraToast("Salvataggio non disponibile (vedi console).", "error");
                }
            }
        } catch (e) {
            console.error("Errore salvataggio manuale analisi persona:", e);
            if (typeof mostraToast === "function") {
                mostraToast("Errore durante il salvataggio.", "error");
            }
        }
    });
}

if (btnNuova) {
    btnNuova.addEventListener("click", () => {
        if (typeof nuovaAnalisiPersona === "function") {
            nuovaAnalisiPersona();
        }
    });
}


// V2 Coperture attive (se la funzione esiste)
if (typeof initCopertureAttiveV2 === "function") {
    initCopertureAttiveV2();
} else {
    console.warn("initCopertureAttiveV2 non disponibile: salto init coperture V2.");
}

renderDomandaCorrentePersona();
console.log("Persona app inizializzata.");

// Carica normativa infortuni in background (non blocca l'app)
loadNormativaInfortuniPersona();
}

document.addEventListener("DOMContentLoaded", () => {
    try {
        initPersonaApp();

        // Inizializza logiche di supporto anagrafica (es. calcolo età)
        if (typeof initAnagraficaPersonaHelpers === "function") {
            initAnagraficaPersonaHelpers();
        }

        // Inizializza validazioni caring
        if (typeof initCaringPersonaHelpers === "function") {
            initCaringPersonaHelpers();
        }
    } catch (err) {
        console.error("Errore in initPersonaApp:", err);
    }
});
