/* ============================================================
   GENERALI BUSINESS ADVISOR – DATASET DOMANDE
   File: domande_full.js
   Descrizione: contiene tutte le domande del questionario premium,
   suddivise per area tematica, con pesi, ID, e opzioni testuali.
   ============================================================ */

const DOMANDE_FULL = [
    /* ============================================================
       AREA 1 — ORGANIZZAZIONE & STRATEGIA (8 DOMANDE)
       Codice Area: ORG
       ============================================================ */
    
    {
        id: "ORG_01",
        area: "Organizzazione & Strategia",
        peso: 1.3,
        testo: "Quanto è chiara la strategia aziendale per i prossimi 12–36 mesi?",
        opzioni: [
            "Strategia non definita",
            "Obiettivi intuitivi ma non formali",
            "Strategia di base definita",
            "Piano strategico formalizzato",
            "Piano strategico strutturato e monitorato"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ORG_02",
        area: "Organizzazione & Strategia",
        peso: 1.1,
        testo: "Quanto l’azienda monitora competitor e trend del settore?",
        opzioni: [
            "Mai",
            "Occasionalmente",
            "Monitoraggio minimo",
            "Monitoraggio regolare",
            "Analisi avanzata e continua"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ORG_03",
        area: "Organizzazione & Strategia",
        peso: 1.2,
        testo: "Come valuti la capacità dell’azienda di adattarsi ai cambiamenti?",
        opzioni: [
            "Rigida",
            "Poca flessibilità",
            "Flessibilità media",
            "Buona capacità adattiva",
            "Altamente reattiva"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ORG_04",
        area: "Organizzazione & Strategia",
        peso: 1.4,
        testo: "Quanto l'azienda dipende dal titolare o da poche figure chiave?",
        opzioni: [
            "Dipendenza totale",
            "Molto alta",
            "Moderata",
            "Limitata",
            "Nessuna dipendenza"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ORG_05",
        area: "Organizzazione & Strategia",
        peso: 1.0,
        testo: "Quanto è formalizzato il processo decisionale interno?",
        opzioni: [
            "Decisioni non strutturate",
            "Struttura molto semplice",
            "Processo basilare",
            "Processo chiaro e coerente",
            "Governance formalizzata"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ORG_06",
        area: "Organizzazione & Strategia",
        peso: 1.3,
        testo: "Quanto è strutturata la gestione dei fornitori critici?",
        opzioni: [
            "Nessuna gestione",
            "Informale",
            "Base",
            "Strutturata",
            "Ottimizzata"
        ],
        filtri: {
            settore: "MANIFATTURA|COMMERCIO|LOGISTICA|AGRO",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ORG_07",
        area: "Organizzazione & Strategia",
        peso: 1.1,
        testo: "Quanto la digitalizzazione supporta i processi aziendali?",
        opzioni: [
            "Assente",
            "Molto bassa",
            "In sviluppo",
            "Buon livello",
            "Digitalizzazione avanzata"
        ],
        filtri: {
            settore: "SERVIZI|TECNOLOGIA|INDUSTRIA",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ORG_08",
        area: "Organizzazione & Strateggia",
        peso: 1.0,
        testo: "Quanto sono chiari ruoli e responsabilità all’interno dell’organizzazione?",
        opzioni: [
            "Per nulla chiari",
            "Poco chiari",
            "Abbastanza chiari",
            "Chiari",
            "Completamente formalizzati"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    /* ============================================================
       AREA 2 — PERSONE & HR (8 DOMANDE)
       Codice Area: HR
       ============================================================ */
    {
        id: "HR_01",
        area: "Persone & HR",
        peso: 1.4,
        testo: "Quanto l’azienda dipende da figure chiave difficilmente sostituibili?",
        opzioni: [
            "Dipendenza totale",
            "Molto alta",
            "Media",
            "Bassa",
            "Nessuna"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "HR_02",
        area: "Persone & HR",
        peso: 1.3,
        testo: "Quanto è definito un piano di successione o continuità operativa?",
        opzioni: [
            "Nessun piano",
            "Informale",
            "In definizione",
            "Definito",
            "Formalizzato e operativo"
        ],
        filtri: {
            settore: "ANY",
            forma: "SRL|SPA|COOP",
            minimoDip: 5
        }
    },

    {
        id: "HR_03",
        area: "Persone & HR",
        peso: 1.1,
        testo: "Quanto sono strutturati i processi di selezione, inserimento e formazione?",
        opzioni: [
            "Assenti",
            "Minimi",
            "Base",
            "Strutturati",
            "Ottimizzati e continui"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "HR_04",
        area: "Persone & HR",
        peso: 1.2,
        testo: "Quanto è efficace la comunicazione interna?",
        opzioni: [
            "Molto inefficace",
            "Inefficace",
            "Adeguata",
            "Buona",
            "Molto efficace"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "HR_05",
        area: "Persone & HR",
        peso: 1.2,
        testo: "Qual è il livello di turnover del personale?",
        opzioni: [
            "Altissimo",
            "Alto",
            "Medio",
            "Basso",
            "Stabile"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 5
        }
    },

    {
        id: "HR_06",
        area: "Persone & HR",
        peso: 1.1,
        testo: "Quanto l’azienda investe nel benessere del personale?",
        opzioni: [
            "Nessun investimento",
            "Minimo",
            "Limitato",
            "Buono",
            "Strutturato"
        ],
        filtri: {
            settore: "SERVIZI|TECNOLOGIA|SANITÀ",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "HR_07",
        area: "Persone & HR",
        peso: 1.3,
        testo: "Quanto sono documentati processi, mansioni e attività critiche?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Abbastanza",
            "Molto",
            "Completamente documentati"
        ],
        filtri: {
            settore: "ANY",
            forma: "SRL|SPA|COOP",
            minimoDip: 5
        }
    },

    {
        id: "HR_08",
        area: "Persone & HR",
        peso: 1.0,
        testo: "Quanto è chiara la struttura organizzativa (organigramma, responsabilità)?",
        opzioni: [
            "Assente",
            "Molto poco chiara",
            "Abbastanza chiara",
            "Chiara",
            "Ben strutturata"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    /* ============================================================
       AREA 3 — LIQUIDITÀ & FINANZA (8 DOMANDE)
       Codice Area: FIN
       ============================================================ */

    {
        id: "FIN_01",
        area: "Liquidità & Finanza",
        peso: 1.4,
        testo: "Come valuti la liquidità disponibile per imprevisti o emergenze?",
        opzioni: [
            "Meno di 1 mese",
            "1-3 mesi",
            "3-6 mesi",
            "6-12 mesi",
            "Oltre 12 mesi"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_02",
        area: "Liquidità & Finanza",
        peso: 1.3,
        testo: "Quanto l’azienda dipende da finanziamenti esterni?",
        opzioni: [
            "Dipendenza totale",
            "Alta",
            "Media",
            "Bassa",
            "Autonomia finanziaria"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_03",
        area: "Liquidità & Finanza",
        peso: 1.5,
        testo: "Come valuti la marginalità aziendale?",
        opzioni: [
            "Negativa",
            "Molto scarsa",
            "Media",
            "Buona",
            "Eccellente"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_04",
        area: "Liquidità & Finanza",
        peso: 1.2,
        testo: "Quanto sono affidabili le previsioni finanziarie e di cassa?",
        opzioni: [
            "Assenti",
            "Minime",
            "Di base",
            "Buone",
            "Molto accurate"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_05",
        area: "Liquidità & Finanza",
        peso: 1.3,
        testo: "Com’è il livello di diversificazione delle fonti di ricavo?",
        opzioni: [
            "Monolinea",
            "2-3 linee",
            "Diversificata",
            "Molto diversificata",
            "Portafoglio ampio"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_06",
        area: "Liquidità & Finanza",
        peso: 1.2,
        testo: "Quali sono i tempi medi di incasso dai clienti?",
        opzioni: [
            "Oltre 180 giorni",
            "90-180 giorni",
            "60-90 giorni",
            "30-60 giorni",
            "Sotto i 30 giorni"
        ],
        filtri: {
            settore: "COMMERCIO|MANIFATTURA|SERVIZI",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_07",
        area: "Liquidità & Finanza",
        peso: 1.1,
        testo: "Qual è il livello di controllo su costi, budget e margini?",
        opzioni: [
            "Assente",
            "Molto basso",
            "Base",
            "Buono",
            "Strutturato"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "FIN_08",
        area: "Liquidità & Finanza",
        peso: 1.0,
        testo: "Quanto è stabile la posizione finanziaria complessiva?",
        opzioni: [
            "Molto instabile",
            "Instabile",
            "Mediamente stabile",
            "Stabile",
            "Molto stabile"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },
    /* ============================================================
       AREA 4 — RISCHI OPERATIVI (10 DOMANDE)
       Codice Area: ROP
       ============================================================ */

    {
        id: "ROP_01",
        area: "Rischi Operativi",
        peso: 1.5,
        testo: "Quanto la tua azienda dipende da un singolo impianto, sede o stabilimento?",
        opzioni: [
            "Dipendenza totale",
            "Alta dipendenza",
            "Media",
            "Bassa",
            "Diversificazione completa"
        ],
        filtri: {
            settore: "MANIFATTURA|INDUSTRIA|LOGISTICA",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ROP_02",
        area: "Rischi Operativi",
        peso: 1.4,
        testo: "Come valuti l'affidabilità dei fornitori critici?",
        opzioni: [
            "Molto bassa",
            "Bassa",
            "Media",
            "Alta",
            "Molto alta"
        ],
        filtri: {
            settore: "INDUSTRIA|COMMERCIO|LOGISTICA",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ROP_03",
        area: "Rischi Operativi",
        peso: 1.3,
        testo: "Quanto sono formalizzati i processi operativi essenziali?",
        opzioni: [
            "Assenti",
            "Minimi",
            "Parziali",
            "Completi",
            "Completamente documentati"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "ROP_04",
        area: "Rischi Operativi",
        peso: 1.2,
        testo: "Qual è il livello di controllo qualità o verifica interna?",
        opzioni: [
            "Assente",
            "Molto basso",
            "Adeguato",
            "Strutturato",
            "Certificato/avanzato"
        ],
        filtri: {
            settore: "MANIFATTURA|TECNOLOGIA|AGRO",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ROP_05",
        area: "Rischi Operativi",
        peso: 1.3,
        testo: "Quanto l’azienda è vulnerabile a interruzioni della supply chain?",
        opzioni: [
            "Massima vulnerabilità",
            "Alta vulnerabilità",
            "Media",
            "Bassa",
            "Minima vulnerabilità"
        ],
        filtri: {
            settore: "LOGISTICA|COMMERCIO|MANIFATTURA",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ROP_06",
        area: "Rischi Operativi",
        peso: 1.1,
        testo: "Quanto efficaci sono i sistemi interni di controllo accessi, sicurezza fisica e sorveglianza?",
        opzioni: [
            "Assenti",
            "Molto scarsi",
            "Adeguati",
            "Buoni",
            "Avanzati"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ROP_07",
        area: "Rischi Operativi",
        peso: 1.2,
        testo: "Qual è la maturità dei processi di manutenzione su macchinari, attrezzature o flotte?",
        opzioni: [
            "Nessuna manutenzione",
            "Reattiva",
            "Programmabile",
            "Programmabile e monitorata",
            "Predictive (IoT / sensori)"
        ],
        filtri: {
            settore: "INDUSTRIA|LOGISTICA|AGRO|EDILIZIA",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ROP_08",
        area: "Rischi Operativi",
        peso: 1.2,
        testo: "In caso di fermo operativo, quanto l’azienda è in grado di continuare l’attività?",
        opzioni: [
            "Non è in grado",
            "Molto difficilmente",
            "Parzialmente",
            "Abbastanza bene",
            "Completamente garantita"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ROP_09",
        area: "Rischi Operativi",
        peso: 1.0,
        testo: "Quanto è efficace il monitoraggio dei fornitori di servizi essenziali (energia, IT, trasporti)?",
        opzioni: [
            "Assente",
            "Scarso",
            "Adeguato",
            "Buono",
            "Ottimo"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "ROP_10",
        area: "Rischi Operativi",
        peso: 1.5,
        testo: "Quanto l’azienda ha già subito interruzioni operative negli ultimi 3 anni?",
        opzioni: [
            "Più di 5 episodi",
            "3-5 episodi",
            "1-2 episodi",
            "Rari episodi",
            "Mai"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },
    /* ============================================================
       AREA 5 — GOVERNANCE, ORGANIZZAZIONE & BUSINESS CONTINUITY
       Codice Area: GOV
       10 DOMANDE
       ============================================================ */

    {
        id: "GOV_01",
        area: "Governance & Organizzazione",
        peso: 1.3,
        testo: "Quanto sono chiari ruoli e responsabilità all’interno dell’azienda?",
        opzioni: [
            "Nessuna chiarezza",
            "Poca chiarezza",
            "Discreta chiarezza",
            "Buona chiarezza",
            "Massima chiarezza e formalizzazione"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "GOV_02",
        area: "Governance & Organizzazione",
        peso: 1.5,
        testo: "L’azienda ha un modello di governance definito (deleghe, organigramma, responsabilità)?",
        opzioni: [
            "Nessuno",
            "Molto informale",
            "Parzialmente definito",
            "Definito",
            "Strutturato e aggiornato"
        ],
        filtri: {
            settore: "ANY",
            forma: "SRL|SPA|COOPERATIVA",
            minimoDip: 5
        }
    },

    {
        id: "GOV_03",
        area: "Governance & Organizzazione",
        peso: 1.4,
        testo: "Il passaggio generazionale è stato pianificato o gestito?",
        opzioni: [
            "Non considerato",
            "Minimamente affrontato",
            "Discussione in corso",
            "Piano definito",
            "Piano attuato"
        ],
        filtri: {
            settore: "ANY",
            forma: "DITTA|SAS|SNC|SRL|SPA",
            minimoDip: 0
        }
    },

    {
        id: "GOV_04",
        area: "Business Continuity",
        peso: 1.6,
        testo: "L’azienda ha un piano scritto di continuità operativa (BCP)?",
        opzioni: [
            "Assente",
            "Abbozzato",
            "In stesura",
            "Definito",
            "Testato periodicamente"
        ],
        filtri: {
            settore: "ANY",
            forma: "SRL|SPA",
            minimoDip: 10
        }
    },

    {
        id: "GOV_05",
        area: "Business Continuity",
        peso: 1.4,
        testo: "Quanto rapidamente l’azienda può riprendere le attività dopo un evento grave?",
        opzioni: [
            "Più di 30 giorni",
            "15–30 giorni",
            "7–14 giorni",
            "1–6 giorni",
            "Entro 24 ore"
        ],
        filtri: {
            settore: "LOGISTICA|INDUSTRIA|TECNOLOGIA|SERVIZI",
            forma: "ANY",
            minimoDip: 5
        }
    },

    {
        id: "GOV_06",
        area: "Organizzazione Interna",
        peso: 1.2,
        testo: "Quanto è formalizzato il processo decisionale?",
        opzioni: [
            "Totalmente informale",
            "Parzialmente informale",
            "Discreto",
            "Formalizzato",
            "Estremamente strutturato"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "GOV_07",
        area: "Organizzazione Interna",
        peso: 1.1,
        testo: "Quanto è presente la cultura aziendale e la comunicazione interna?",
        opzioni: [
            "Quasi assente",
            "Debole",
            "Discreta",
            "Solida",
            "Molto forte"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "GOV_08",
        area: "Business Continuity",
        peso: 1.5,
        testo: "Sono presenti procedure per emergenze (incendi, allagamenti, emergenze sanitarie)?",
        opzioni: [
            "Nessuna",
            "Minime",
            "Basilari",
            "Complete",
            "Complete + test periodici"
        ],
        filtri: {
            settore: "INDUSTRIA|LOGISTICA|EDILIZIA",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "GOV_09",
        area: "Governance",
        peso: 1.3,
        testo: "Ci sono riunioni periodiche di revisione strategica?",
        opzioni: [
            "Mai",
            "Raramente",
            "Occasionalmente",
            "Regolarmente",
            "Regolarmente + documentate"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "GOV_10",
        area: "Governance",
        peso: 1.4,
        testo: "Quanto gli obiettivi aziendali sono misurati e monitorati (KPI)?",
        opzioni: [
            "Mai monitorati",
            "Poco monitorati",
            "In parte monitorati",
            "Ben monitorati",
            "Completamente misurati"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 3
        }
    },
    /* ============================================================
       AREA 6 — FINANZA, LIQUIDITÀ, INDEBITAMENTO & MARGINALITÀ
       Codice Area: FIN
       10 DOMANDE
       ============================================================ */

    {
        id: "FIN_01",
        area: "Finanza",
        peso: 1.6,
        testo: "Qual è il livello di liquidità disponibile?",
        opzioni: [
            "Meno di 1 mese",
            "1–3 mesi",
            "3–6 mesi",
            "6–12 mesi",
            "Oltre 12 mesi"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_02",
        area: "Finanza",
        peso: 1.4,
        testo: "Come giudichi il livello di indebitamento dell'azienda?",
        opzioni: [
            "Molto alto",
            "Alto",
            "Medio",
            "Basso",
            "Assente"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_03",
        area: "Finanza",
        peso: 1.5,
        testo: "La marginalità operativa (EBITDA) è:",
        opzioni: [
            "Negativa",
            "Molto bassa (<5%)",
            "Nella media (5–10%)",
            "Buona (10–20%)",
            "Eccellente (>20%)"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_04",
        area: "Finanza",
        peso: 1.3,
        testo: "Come vengono gestiti i flussi di cassa?",
        opzioni: [
            "Molto male",
            "Male",
            "Adeguatamente",
            "Bene",
            "Molto bene e in modo strutturato"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_05",
        area: "Finanza",
        peso: 1.2,
        testo: "Quanto l'azienda dipende da finanziamenti o linee di credito?",
        opzioni: [
            "Dipendenza totale",
            "Alta",
            "Media",
            "Bassa",
            "Nessuna"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_06",
        area: "Finanza",
        peso: 1.3,
        testo: "La puntualità dei pagamenti dei clienti è:",
        opzioni: [
            "Molto scarsa",
            "Scarsa",
            "Discreta",
            "Buona",
            "Ottima"
        ],
        filtri: {
            settore: "COMMERCIO|SERVIZI|LOGISTICA|TECNOLOGIA",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_07",
        area: "Finanza",
        peso: 1.4,
        testo: "L’azienda ha un budget annuale formalizzato?",
        opzioni: [
            "Assente",
            "Informale",
            "In definizione",
            "Presente",
            "Presente e monitorato periodicamente"
        ],
        filtri: {
            settore: "SRL|SPA|COOPERATIVA|PMI",
            forma: "ANY",
            minimoDip: 5
        }
    },

    {
        id: "FIN_08",
        area: "Finanza",
        peso: 1.2,
        testo: "I rapporti con le banche e fornitori finanziari sono:",
        opzioni: [
            "Molto tesi",
            "Tesi",
            "Stabili",
            "Buoni",
            "Ottimi"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_09",
        area: "Finanza",
        peso: 1.3,
        testo: "La capacità dell’azienda di far fronte a imprevisti finanziari è:",
        opzioni: [
            "Molto bassa",
            "Bassa",
            "Media",
            "Buona",
            "Eccellente"
        ],
        filtri: {
            settore: "ANY",
            forma: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_10",
        area: "Finanza",
        peso: 1.5,
        testo: "Quanto accurata è la pianificazione finanziaria per i prossimi 12 mesi?",
        opzioni: [
            "Nessuna pianificazione",
            "Molto scarsa",
            "Parziale",
            "Adeguata",
            "Molto accurata e aggiornata"
        ],
        filtri: {
            settore: "SPA|SRL|COOPERATIVA|TECNOLOGIA|SERVIZI|INDUSTRIA",
            minimoDip: 5
        }
    },
    /* ============================================================
       AREA 7 — PERSONE, WELFARE, KEY-MAN, CONTINUITÀ, HR
       Codice Area: HRW
       12 DOMANDE
       ============================================================ */

    {
        id: "HRW_01",
        area: "Persone & HR",
        peso: 1.5,
        testo: "Quanto l’azienda dipende da figure chiave difficilmente sostituibili?",
        opzioni: [
            "Dipendenza totale",
            "Molto alta",
            "Media",
            "Bassa",
            "Nessuna"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "HRW_02",
        area: "Persone & HR",
        peso: 1.3,
        testo: "Esiste una copertura assicurativa Key-Man per figure critiche?",
        opzioni: [
            "Nessuna",
            "Minima",
            "Base",
            "Buona",
            "Completa"
        ],
        filtri: {
            settore: "SRL|SPA|PMI|INDUSTRIA",
            minimoDip: 3
        }
    },

    {
        id: "HRW_03",
        area: "Persone & HR",
        peso: 1.4,
        testo: "Il welfare aziendale è presente e strutturato?",
        opzioni: [
            "Assente",
            "Minimo",
            "Parziale",
            "Strutturato",
            "Eccellente"
        ],
        filtri: {
            settore: "SERVIZI|TECNOLOGIA|FINANZA|PMI",
            minimoDip: 5
        }
    },

    {
        id: "HRW_04",
        area: "Persone & HR",
        peso: 1.2,
        testo: "Quanto è efficace il processo di onboarding dei nuovi dipendenti?",
        opzioni: [
            "Inesistente",
            "Molto debole",
            "Discreto",
            "Buono",
            "Molto strutturato"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 10
        }
    },

    {
        id: "HRW_05",
        area: "Persone & HR",
        peso: 1.3,
        testo: "Come valuti il livello di turnover del personale?",
        opzioni: [
            "Molto alto",
            "Alto",
            "Medio",
            "Basso",
            "Molto basso"
        ],
        filtri: {
            settore: "SERVIZI|COMMERCIO|LOGISTICA",
            minimoDip: 0
        }
    },

    {
        id: "HRW_06",
        area: "Persone & HR",
        peso: 1.4,
        testo: "L’azienda ha definito piani di successione interni?",
        opzioni: [
            "Nessuno",
            "Informale",
            "In sviluppo",
            "Definito",
            "Attuato"
        ],
        filtri: {
            settore: "FAMILIARE|PMI|SRL|SPA",
            minimoDip: 3
        }
    },

    {
        id: "HRW_07",
        area: "Persone & HR",
        peso: 1.5,
        testo: "Quanto sono affidabili i processi HR (assunzioni, valutazioni, formazione)?",
        opzioni: [
            "Molto deboli",
            "Deboli",
            "Adeguati",
            "Buoni",
            "Ottimi"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 15
        }
    },

    {
        id: "HRW_08",
        area: "Persone & HR",
        peso: 1.2,
        testo: "Sono presenti benefit aggiuntivi per attrarre nuovi talenti?",
        opzioni: [
            "Nessuno",
            "Molto pochi",
            "Limitati",
            "Buoni",
            "Molto competitivi"
        ],
        filtri: {
            settore: "TECNOLOGIA|SERVIZI|COMMERCIO",
            minimoDip: 0
        }
    },

    {
        id: "HRW_09",
        area: "Persone & HR",
        peso: 1.3,
        testo: "Esiste un sistema di valutazione periodica dei dipendenti?",
        opzioni: [
            "Assente",
            "Occasionale",
            "In sviluppo",
            "Strutturato",
            "Molto strutturato"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 8
        }
    },

    {
        id: "HRW_10",
        area: "Persone & HR",
        peso: 1.4,
        testo: "L’azienda effettua formazione periodica obbligatoria e non obbligatoria?",
        opzioni: [
            "Nessuna",
            "Molto poca",
            "Parziale",
            "Completa",
            "Molto completa"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "HRW_11",
        area: "Persone & HR",
        peso: 1.2,
        testo: "La continuità operativa è garantita in caso di assenza improvvisa di personale chiave?",
        opzioni: [
            "Per niente",
            "Molto poco",
            "In parte",
            "Abbastanza",
            "Completamente"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "HRW_12",
        area: "Persone & HR",
        peso: 1.3,
        testo: "L’azienda ha adottato iniziative per migliorare il benessere dei dipendenti?",
        opzioni: [
            "Nessuna",
            "Poche",
            "Qualche iniziativa",
            "Buon livello",
            "Eccellente livello"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },
    /* ============================================================
       AREA 8 — OPERATIONS, PROCESSI, LOGISTICA, QUALITÀ, FORNITORI
       Codice Area: OPS
       10 DOMANDE
       ============================================================ */

    {
        id: "OPS_01",
        area: "Operations",
        peso: 1.3,
        testo: "Quanto sono strutturati i processi operativi principali dell’azienda?",
        opzioni: [
            "Non strutturati",
            "Minimamente strutturati",
            "Discretamente strutturati",
            "Ben strutturati",
            "Molto strutturati"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 1
        }
    },

    {
        id: "OPS_02",
        area: "Operations",
        peso: 1.4,
        testo: "Esiste una mappatura documentata dei processi aziendali?",
        opzioni: [
            "Assente",
            "Minima",
            "Parziale",
            "Completa",
            "Molto dettagliata"
        ],
        filtri: {
            settore: "PMI|INDUSTRIA|SERVIZI",
            minimoDip: 5
        }
    },

    {
        id: "OPS_03",
        area: "Operations",
        peso: 1.5,
        testo: "La dipendenza da fornitori critici rappresenta un rischio significativo?",
        opzioni: [
            "Altissimo rischio",
            "Alto rischio",
            "Rischio medio",
            "Basso rischio",
            "Nessun rischio"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "OPS_04",
        area: "Operations",
        peso: 1.2,
        testo: "Quanto è efficace la gestione della supply chain?",
        opzioni: [
            "Molto inefficace",
            "Inefficace",
            "Adeguata",
            "Buona",
            "Eccellente"
        ],
        filtri: {
            settore: "INDUSTRIA|LOGISTICA|COMMERCIO",
            minimoDip: 2
        }
    },

    {
        id: "OPS_05",
        area: "Operations",
        peso: 1.3,
        testo: "L’azienda ha un sistema strutturato di controllo qualità?",
        opzioni: [
            "Assente",
            "Minimo",
            "Base",
            "Buono",
            "Ottimo"
        ],
        filtri: {
            settore: "INDUSTRIA|ALIMENTARE|PRODUZIONE",
            minimoDip: 3
        }
    },

    {
        id: "OPS_06",
        area: "Operations",
        peso: 1.3,
        testo: "Quanto è efficiente la gestione del magazzino?",
        opzioni: [
            "Molto inefficiente",
            "Inefficiente",
            "Adeguata",
            "Efficiente",
            "Molto efficiente"
        ],
        filtri: {
            settore: "COMMERCIO|LOGISTICA|INDUSTRIA",
            minimoDip: 2
        }
    },

    {
        id: "OPS_07",
        area: "Operations",
        peso: 1.4,
        testo: "Quanto l’azienda è esposta a interruzioni operative (guasti, ritardi, problemi logistici)?",
        opzioni: [
            "Esposizione molto alta",
            "Esposizione alta",
            "Esposizione media",
            "Esposizione bassa",
            "Esposizione minima"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "OPS_08",
        area: "Operations",
        peso: 1.1,
        testo: "Sono presenti procedure di manutenzione programmata per impianti e macchinari?",
        opzioni: [
            "Nessuna",
            "Minime",
            "Parziali",
            "Complete",
            "Molto avanzate"
        ],
        filtri: {
            settore: "INDUSTRIA|PRODUZIONE|ENERGIA",
            minimoDip: 2
        }
    },

    {
        id: "OPS_09",
        area: "Operations",
        peso: 1.3,
        testo: "Quanto è efficace la collaborazione tra reparti operativi (produzione, logistica, qualità, vendite)?",
        opzioni: [
            "Molto scarsa",
            "Scarsa",
            "Adeguata",
            "Buona",
            "Eccellente"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 5
        }
    },

    {
        id: "OPS_10",
        area: "Operations",
        peso: 1.2,
        testo: "L’azienda ha identificato e monitorato adeguatamente i fornitori alternativi?",
        opzioni: [
            "Nessuno",
            "Pochi",
            "Alcuni",
            "Diversi",
            "Molti e consolidati"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },
    /* ============================================================
       AREA 9 — IMMOBILI, STRUTTURE, MACCHINARI, ATTREZZATURE
       Codice Area: IMM
       10 DOMANDE
       ============================================================ */

    {
        id: "IMM_01",
        area: "Immobili & Strutture",
        peso: 1.4,
        testo: "Le strutture aziendali (uffici, fabbricati, reparti produttivi) sono adeguatamente manutenute?",
        opzioni: [
            "Pessima manutenzione",
            "Scarsa manutenzione",
            "Adeguata",
            "Buona",
            "Ottima"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "IMM_02",
        area: "Immobili & Strutture",
        peso: 1.5,
        testo: "Gli impianti elettrici e tecnologici sono a norma e certificati?",
        opzioni: [
            "Non certificati",
            "Certificati parzialmente",
            "Adeguati",
            "A norma",
            "A norma e periodicamente verificati"
        ],
        filtri: {
            settore: "INDUSTRIA|PRODUZIONE|ARTIGIANATO",
            minimoDip: 1
        }
    },

    {
        id: "IMM_03",
        area: "Macchinari & Attrezzature",
        peso: 1.3,
        testo: "Qual è lo stato generale dei macchinari o attrezzature utilizzate?",
        opzioni: [
            "Molto usurate",
            "Usurate",
            "Adeguate",
            "Buone",
            "Ottime"
        ],
        filtri: {
            settore: "INDUSTRIA|PRODUZIONE|AGRO|ARTIGIANATO",
            minimoDip: 1
        }
    },

    {
        id: "IMM_04",
        area: "Macchinari & Attrezzature",
        peso: 1.2,
        testo: "Esistono procedure formalizzate di manutenzione programmata?",
        opzioni: [
            "Nessuna",
            "Minime",
            "Parziali",
            "Complete",
            "Molto avanzate"
        ],
        filtri: {
            settore: "INDUSTRIA|PRODUZIONE|AGRO",
            minimoDip: 2
        }
    },

    {
        id: "IMM_05",
        area: "Strutture & Sicurezza",
        peso: 1.4,
        testo: "La sicurezza sul lavoro (DPI, formazione, procedure) è adeguatamente gestita?",
        opzioni: [
            "Molto carente",
            "Carente",
            "Adeguata",
            "Buona",
            "Eccellente"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "IMM_06",
        area: "Strutture & Sicurezza",
        peso: 1.3,
        testo: "Gli impianti antincendio sono presenti e correttamente manutenuti?",
        opzioni: [
            "Assenti",
            "Insufficienti",
            "Adeguati",
            "Buoni",
            "Molto buoni"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "IMM_07",
        area: "Strutture & Sicurezza",
        peso: 1.2,
        testo: "Il rischio incendio è stato valutato formalmente tramite DVR e piani di emergenza?",
        opzioni: [
            "Mai valutato",
            "Valutazione minima",
            "Valutazione base",
            "Valutazione completa",
            "Valutazione completa con prove periodiche"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 1
        }
    },

    {
        id: "IMM_08",
        area: "Immobili & Strutture",
        peso: 1.3,
        testo: "Gli immobili utilizzati (propri o in affitto) sono adeguati alle esigenze operative dell’azienda?",
        opzioni: [
            "Molto inadeguati",
            "Inadeguati",
            "Adeguati",
            "Buoni",
            "Ottimi"
        ],
        filtri: {
            settore: "SERVIZI|COMMERCIO|INDUSTRIA|LOGISTICA",
            minimoDip: 0
        }
    },

    {
        id: "IMM_09",
        area: "Macchinari & Attrezzature",
        peso: 1.2,
        testo: "Quanto l’attività aziendale dipende da macchinari critici che, se fermi, bloccherebbero l’azienda?",
        opzioni: [
            "Dipendenza totale",
            "Alta dipendenza",
            "Media",
            "Bassa",
            "Nessuna dipendenza"
        ],
        filtri: {
            settore: "INDUSTRIA|AGRO|PRODUZIONE|ARTIGIANATO",
            minimoDip: 0
        }
    },

    {
        id: "IMM_10",
        area: "Immobili & Strutture",
        peso: 1.4,
        testo: "Esiste un piano di continuità operativa (Business Continuity) per la sede aziendale?",
        opzioni: [
            "Assente",
            "Minimo",
            "Parziale",
            "Completo",
            "Molto avanzato"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 5
        }
    },
    /* ============================================================
       AREA 10 — FINANZA, CASH FLOW, BANCHE, RATING, CREDITO
       Codice Area: FIN
       10 DOMANDE
       ============================================================ */

    {
        id: "FIN_01",
        area: "Finanza & Cash Flow",
        peso: 1.5,
        testo: "Quanto è stabile il flusso di cassa mensile della tua azienda?",
        opzioni: [
            "Molto instabile",
            "Instabile",
            "Mediamente stabile",
            "Stabile",
            "Molto stabile"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_02",
        area: "Finanza & Cash Flow",
        peso: 1.6,
        testo: "Quanti mesi di liquidità disponibile possiede l’azienda?",
        opzioni: [
            "Meno di 1 mese",
            "1-2 mesi",
            "3-5 mesi",
            "6-12 mesi",
            "12+ mesi"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 1
        }
    },

    {
        id: "FIN_03",
        area: "Finanziamenti & Banche",
        peso: 1.4,
        testo: "Quanto l’azienda dipende dai finanziamenti bancari?",
        opzioni: [
            "Totalmente dipendente",
            "Molto dipendente",
            "Parzialmente dipendente",
            "Poco dipendente",
            "Indipendente"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_04",
        area: "Finanziamenti & Banche",
        peso: 1.4,
        testo: "Il rapporto con le banche è considerato stabile e positivo?",
        opzioni: [
            "Molto negativo",
            "Negativo",
            "Neutro",
            "Positivo",
            "Molto positivo"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_05",
        area: "Rating & Credito",
        peso: 1.3,
        testo: "L’azienda ha mai ricevuto peggioramenti nel rating o richieste di rientro?",
        opzioni: [
            "Sì, più volte",
            "Sì, una volta",
            "Rischio potenziale",
            "Mai",
            "Mai e rating in miglioramento"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 1
        }
    },

    {
        id: "FIN_06",
        area: "Rating & Credito",
        peso: 1.2,
        testo: "Qual è la puntualità dei clienti nei pagamenti?",
        opzioni: [
            "Molto scarsa",
            "Scarsa",
            "Adeguata",
            "Buona",
            "Ottima"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_07",
        area: "Rischio Economico",
        peso: 1.5,
        testo: "Quanto l’azienda è vulnerabile a improvvisi cali di fatturato?",
        opzioni: [
            "Estremamente vulnerabile",
            "Molto vulnerabile",
            "Mediamente vulnerabile",
            "Poco vulnerabile",
            "Non vulnerabile"
        ],
        filtri: {
            settore: "SERVIZI|COMMERCIO|INDUSTRIA|LOGISTICA|AGRO",
            minimoDip: 0
        }
    },

    {
        id: "FIN_08",
        area: "Rischio Economico",
        peso: 1.4,
        testo: "L’azienda ha margini (EBITDA) sufficientemente solidi?",
        opzioni: [
            "Molto negativi",
            "Negativi",
            "Bassi",
            "Buoni",
            "Ottimi"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },

    {
        id: "FIN_09",
        area: "Controllo di Gestione",
        peso: 1.3,
        testo: "Sono presenti sistemi di controllo di gestione e analisi dei costi?",
        opzioni: [
            "Assenti",
            "Minimi",
            "Parziali",
            "Presenti",
            "Molto evoluti"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "FIN_10",
        area: "Finanza & Cash Flow",
        peso: 1.5,
        testo: "L’azienda gestisce in modo attivo i crediti commerciali (scadenze, solleciti, analisi)?",
        opzioni: [
            "Per nulla",
            "Molto poco",
            "In parte",
            "Adeguatamente",
            "In modo eccellente"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 0
        }
    },
    /* ============================================================
       AREA 11 — HR, PERSONE, WELFARE, CULTURA, FORMAZIONE,
       SICUREZZA SUL LAVORO
       Codice Area: HR
       10 DOMANDE
       ============================================================ */

    {
        id: "HR_01",
        area: "Risorse Umane & Organizzazione",
        peso: 1.3,
        testo: "L’azienda ha difficoltà a reperire personale qualificato?",
        opzioni: [
            "Estreme",
            "Molte",
            "Moderate",
            "Poche",
            "Nessuna difficoltà"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 1
        }
    },

    {
        id: "HR_02",
        area: "Risorse Umane & Organizzazione",
        peso: 1.4,
        testo: "Esistono procedure formalizzate per selezione e onboarding?",
        opzioni: [
            "Assenti",
            "Minime",
            "Parziali",
            "Definite",
            "Molto strutturate"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "HR_03",
        area: "Formazione & Sviluppo",
        peso: 1.3,
        testo: "Quanto investe l’azienda nella formazione interna ed esterna?",
        opzioni: [
            "Niente",
            "Molto poco",
            "Qualcosa",
            "Tanto",
            "Investimento continuo e programmato"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "HR_04",
        area: "Welfare & Retention",
        peso: 1.4,
        testo: "Come giudichi la capacità dell’azienda di trattenere i talenti?",
        opzioni: [
            "Molto scarsa",
            "Scarsa",
            "Adeguata",
            "Buona",
            "Molto buona"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 5
        }
    },

    {
        id: "HR_05",
        area: "Welfare & Retention",
        peso: 1.3,
        testo: "Sono presenti strumenti di welfare aziendale?",
        opzioni: [
            "Nessuno",
            "Pochi e non strutturati",
            "Qualche iniziativa",
            "Diversi strumenti",
            "Sistema welfare completo"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 3
        }
    },

    {
        id: "HR_06",
        area: "Clima & Cultura Aziendale",
        peso: 1.4,
        testo: "Qual è la percezione del clima interno e della cultura aziendale?",
        opzioni: [
            "Molto negativa",
            "Negativa",
            "Neutra",
            "Positiva",
            "Molto positiva"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 1
        }
    },

    {
        id: "HR_07",
        area: "Sicurezza sul Lavoro",
        peso: 1.6,
        testo: "La tua azienda rispetta le normative su sicurezza e prevenzione infortuni?",
        opzioni: [
            "Completamente non conforme",
            "Gravi carenze",
            "Parzialmente conforme",
            "Conforme",
            "Molto conforme e aggiornata"
        ],
        filtri: {
            settore: "INDUSTRIA|ARTIGIANATO|LOGISTICA|AGRO",
            minimoDip: 1
        }
    },

    {
        id: "HR_08",
        area: "Sicurezza sul Lavoro",
        peso: 1.5,
        testo: "Sono presenti procedure regolari di valutazione dei rischi (DVR)?",
        opzioni: [
            "Mai effettuate",
            "Molto saltuarie",
            "Ogni tanto",
            "Regolari",
            "Regolarissime e aggiornate"
        ],
        filtri: {
            settore: "INDUSTRIA|SERVIZI|LOGISTICA|AGRO",
            minimoDip: 1
        }
    },

    {
        id: "HR_09",
        area: "Organizzazione & Processi",
        peso: 1.3,
        testo: "I processi interni sono chiari e documentati?",
        opzioni: [
            "Per nulla",
            "Poco",
            "In parte",
            "Abbastanza",
            "Molto"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 5
        }
    },

    {
        id: "HR_10",
        area: "Cultura Aziendale",
        peso: 1.2,
        testo: "Quanto l’azienda supporta la collaborazione e la comunicazione interna?",
        opzioni: [
            "Molto poco",
            "Poco",
            "Mediamente",
            "Molto",
            "In modo eccellente"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 3
        }
    },
    /* ============================================================
       AREA 12 — CYBERSECURITY, IT, DATA PROTECTION, DIGITAL RISK, AI RISK
       Codice Area: CYB
       10 DOMANDE
       ============================================================ */

    {
        id: "CYB_01",
        area: "Cybersecurity",
        peso: 1.7,
        testo: "Quanto sono protette le infrastrutture informatiche aziendali?",
        opzioni: [
            "Nessuna protezione",
            "Protezione minima",
            "Protezione base",
            "Buona protezione",
            "Protezione avanzata"
        ],
        filtri: {
            settore: "ANY",
            minimoDip: 1
        }
    },

    {
        id: "CYB_02",
        area: "Cybersecurity",
        peso: 1.8,
        testo: "Esiste un sistema di backup dei dati affidabile e testato?",
        opzioni: [
            "Nessun backup",
            "Backup non verificati",
            "Backup occasionali",
            "Backup regolari",
            "Backup certificati e testati"
        ],
        filtri: {
            settore: "ANY"
        }
    },

    {
        id: "CYB_03",
        area: "Cybersecurity",
        peso: 1.6,
        testo: "L’azienda utilizza sistemi antivirus/antimalware professionali?",
        opzioni: [
            "Nessuno",
            "Molto datati",
            "Base",
            "Buoni",
            "Professionali e monitorati"
        ],
        filtri: {
            settore: "ANY"
        }
    },

    {
        id: "CYB_04",
        area: "IT & Digital Risk",
        peso: 1.4,
        testo: "Quanto dipende l’azienda da sistemi digitali critici?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Moderatamente",
            "Molto",
            "Totalmente"
        ],
        filtri: {
            settore: "tecnologia|servizi|industria|logistica"
        }
    },

    {
        id: "CYB_05",
        area: "IT & Digital Risk",
        peso: 1.5,
        testo: "Esiste continuità operativa in caso di fermo dei sistemi?",
        opzioni: [
            "Nessuna",
            "Molto scarsa",
            "Parziale",
            "Buona",
            "Ottima"
        ],
        filtri: {
            settore: "ANY"
        }
    },

    {
        id: "CYB_06",
        area: "Data Protection (GDPR)",
        peso: 1.6,
        testo: "Il trattamento dei dati personali è conforme al GDPR?",
        opzioni: [
            "Non conforme",
            "Molto carente",
            "Parzialmente conforme",
            "Conforme",
            "Molto conforme"
        ],
        filtri: {
            settore: "ANY"
        }
    },

    {
        id: "CYB_07",
        area: "Data Protection (GDPR)",
        peso: 1.5,
        testo: "L’azienda ha nominato figure come DPO o privacy officer?",
        opzioni: [
            "Nessuno",
            "Non definito",
            "In valutazione",
            "Nominato informalmente",
            "Strutturato e documentato"
        ],
        filtri: {
            settore: "servizi|sanità|tecnologia|pubblica_amministrazione"
        }
    },

    {
        id: "CYB_08",
        area: "AI Risk",
        peso: 1.4,
        testo: "Vengono usati strumenti di Intelligenza Artificiale in azienda?",
        opzioni: [
            "No",
            "In modo sporadico",
            "Moderatamente",
            "Molto",
            "In maniera strategica"
        ],
        filtri: {
            settore: "tecnologia|servizi|industria"
        }
    },

    {
        id: "CYB_09",
        area: "AI Risk",
        peso: 1.5,
        testo: "Esistono controlli per evitare errori o bias prodotti dall’AI?",
        opzioni: [
            "Nessuno",
            "Minimi",
            "Base",
            "Buoni",
            "Avanzati"
        ],
        filtri: {
            settore: "tecnologia|servizi"
        }
    },

    {
        id: "CYB_10",
        area: "Cybersecurity & Continuità",
        peso: 1.7,
        testo: "Quanto un attacco cyber danneggerebbe la continuità del business?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Moderatamente",
            "Molto",
            "Criticamente"
        ],
        filtri: {
            settore: "ANY"
        }
    },
    /* ============================================================
       AREA 13 — LOGISTICA, SUPPLY CHAIN, ACQUISTI, MAGAZZINO
       Codice Area: LOG
       10 DOMANDE
       ============================================================ */

    {
        id: "LOG_01",
        area: "Logistica & Supply Chain",
        peso: 1.6,
        testo: "L’azienda dipende da fornitori esteri o extra-UE?",
        opzioni: [
            "Totalmente",
            "Molto",
            "Moderatamente",
            "Poco",
            "Per nulla"
        ],
        filtri: {
            settore: "industria|commercio|logistica"
        }
    },

    {
        id: "LOG_02",
        area: "Logistica & Supply Chain",
        peso: 1.5,
        testo: "Sono presenti fornitori alternativi per le materie prime?",
        opzioni: [
            "Nessuno",
            "Uno solo",
            "Alcuni",
            "Diversi",
            "Molti"
        ],
        filtri: {
            settore: "industria|artigianato|agroalimentare"
        }
    },

    {
        id: "LOG_03",
        area: "Magazzino",
        peso: 1.4,
        testo: "Il magazzino è gestito con sistemi digitali o software dedicati?",
        opzioni: [
            "Nessuno",
            "Molto poco digitalizzato",
            "Parzialmente",
            "Buon livello",
            "Completamente digitalizzato"
        ],
        filtri: {
            settore: "commercio|industria|logistica"
        }
    },

    {
        id: "LOG_04",
        area: "Magazzino",
        peso: 1.3,
        testo: "Quanto il magazzino incide sulle immobilizzazioni aziendali?",
        opzioni: [
            "Non incide",
            "Poco",
            "Moderatamente",
            "Molto",
            "È critico per l’attività"
        ],
        filtri: {
            settore: "commercio|industria"
        }
    },

    {
        id: "LOG_05",
        area: "Acquisti",
        peso: 1.5,
        testo: "I prezzi delle materie prime sono volatili per l’azienda?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Moderatamente",
            "Molto",
            "Estremamente"
        ],
        filtri: {
            settore: "industria|agroalimentare|artigianato"
        }
    },

    {
        id: "LOG_06",
        area: "Acquisti",
        peso: 1.4,
        testo: "Le procedure di acquisto sono formalizzate?",
        opzioni: [
            "Nessuna procedura",
            "Molto informali",
            "Parzialmente definite",
            "Definite",
            "Molto strutturate"
        ],
        filtri: {
            settore: "ANY"
        }
    },

    {
        id: "LOG_07",
        area: "Supply Chain",
        peso: 1.7,
        testo: "Quanto un ritardo dei fornitori potrebbe bloccare la produzione?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Moderatamente",
            "Molto",
            "Totalmente"
        ],
        filtri: {
            settore: "industria|logistica"
        }
    },

    {
        id: "LOG_08",
        area: "Logistica",
        peso: 1.3,
        testo: "La distribuzione dei prodotti è interna o affidata a terzi?",
        opzioni: [
            "Interna senza controllo",
            "Interna con controllo minimo",
            "Mista",
            "Terzi affidabili",
            "Sistema altamente strutturato"
        ],
        filtri: {
            settore: "commercio|industria|logistica"
        }
    },

    {
        id: "LOG_09",
        area: "Logistica",
        peso: 1.4,
        testo: "Esistono piani di continuità in caso di fermo dei trasporti?",
        opzioni: [
            "Nessuno",
            "Molto scarsi",
            "Parziali",
            "Buoni",
            "Ottimi"
        ],
        filtri: {
            settore: "logistica|industria|commercio"
        }
    },

    {
        id: "LOG_10",
        area: "Supply Chain & Rischio",
        peso: 1.6,
        testo: "Quanto varia la domanda dei tuoi prodotti/servizi?",
        opzioni: [
            "Mai",
            "Poco",
            "Moderatamente",
            "Molto",
            "Estremamente"
        ],
        filtri: {
            settore: "industria|commercio|agroalimentare|servizi"
        }
    },
    /* ============================================================
       AREA 14 — MARKETING, VENDITE, CUSTOMER EXPERIENCE, BRAND
       Codice Area: MKT
       10 DOMANDE
       ============================================================ */

    {
        id: "MKT_01",
        area: "Marketing & Vendite",
        peso: 1.4,
        testo: "Quanto l'azienda investe in marketing rispetto al fatturato?",
        opzioni: [
            "0%",
            "Meno dell'1%",
            "1–3%",
            "3–7%",
            "Oltre il 7%"
        ],
        filtri: {
            settore: "servizi|commercio|tecnologia"
        }
    },

    {
        id: "MKT_02",
        area: "Marketing & Vendite",
        peso: 1.5,
        testo: "Quanto è strutturata la rete vendita?",
        opzioni: [
            "Inesistente",
            "Molto piccola",
            "Media",
            "Strutturata",
            "Molto strutturata"
        ],
        filtri: {
            settore: "commercio|servizi|industria"
        }
    },

    {
        id: "MKT_03",
        area: "Customer Experience",
        peso: 1.3,
        testo: "L'azienda misura la soddisfazione dei clienti (NPS, survey)?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In modo avanzato"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "MKT_04",
        area: "Customer Experience",
        peso: 1.4,
        testo: "Quanto l'azienda dipende da clienti ricorrenti?",
        opzioni: [
            "0%",
            "Meno del 20%",
            "20–50%",
            "50–80%",
            "Oltre l’80%"
        ],
        filtri: {
            settore: "servizi|commercio"
        }
    },

    {
        id: "MKT_05",
        area: "Brand & Reputazione",
        peso: 1.6,
        testo: "Quanto è forte il brand dell’azienda nel mercato?",
        opzioni: [
            "Sconosciuto",
            "Poco conosciuto",
            "Moderatamente noto",
            "Molto noto",
            "Leader di settore"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "MKT_06",
        area: "Marketing Digitale",
        peso: 1.5,
        testo: "L’azienda utilizza strumenti digitali per generare contatti (lead generation)?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In modo avanzato"
        ],
        filtri: {
            settore: "tecnologia|servizi|commercio"
        }
    },

    {
        id: "MKT_07",
        area: "Vendite",
        peso: 1.4,
        testo: "I processi commerciali sono formalizzati e monitorati?",
        opzioni: [
            "Assenti",
            "Molto informali",
            "Parzialmente definiti",
            "Strutturati",
            "Ottimizzati con CRM"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "MKT_08",
        area: "Brand & Comunicazione",
        peso: 1.3,
        testo: "Il sito web e i canali social sono aggiornati e curati?",
        opzioni: [
            "Mai",
            "Poco",
            "Sufficientemente",
            "Molto",
            "Eccellentemente"
        ],
        filtri: {
            settore: "servizi|tecnologia|commercio"
        }
    },

    {
        id: "MKT_09",
        area: "Customer Experience",
        peso: 1.4,
        testo: "I tempi di risposta al cliente sono rapidi?",
        opzioni: [
            "Molto lunghi",
            "Lunghi",
            "Medi",
            "Buoni",
            "Eccellenti"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "MKT_10",
        area: "Vendite & Rischio",
        peso: 1.3,
        testo: "Quanto l’azienda è capace di generare nuove opportunità commerciali?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Discretamente",
            "Molto",
            "Costantemente e in modo strutturato"
        ],
        filtri: {
            settore: "servizi|commercio|tecnologia|industria"
        }
    },
    /* ============================================================
       AREA 15 — LOGISTICA, PRODUZIONE, QUALITÀ, OPERATIONS
       Codice Area: OPS
       10 DOMANDE
       ============================================================ */

    {
        id: "OPS_01",
        area: "Produzione",
        peso: 1.4,
        testo: "Quanto sono ottimizzati i processi produttivi?",
        opzioni: [
            "Totalmente manuali",
            "Poco automatizzati",
            "Parzialmente ottimizzati",
            "Automatizzati",
            "Altamente automatizzati"
        ],
        filtri: {
            settore: "industria|manifatturiero"
        }
    },

    {
        id: "OPS_02",
        area: "Supply Chain",
        peso: 1.5,
        testo: "Quanto l’azienda dipende da fornitori critici?",
        opzioni: [
            "Totalmente",
            "Molto",
            "Moderatamente",
            "Poco",
            "Per nulla"
        ],
        filtri: {
            settore: "industria|manifatturiero|commercio"
        }
    },

    {
        id: "OPS_03",
        area: "Qualità",
        peso: 1.3,
        testo: "Esistono procedure formalizzate di controllo qualità?",
        opzioni: [
            "Assenti",
            "Minimali",
            "Parziali",
            "Complete",
            "Certificate (ISO o simili)"
        ],
        filtri: {
            settore: "industria|manifatturiero|servizi"
        }
    },

    {
        id: "OPS_04",
        area: "Logistica",
        peso: 1.4,
        testo: "I tempi di consegna verso clienti sono affidabili?",
        opzioni: [
            "Molto inaffidabili",
            "Inaffidabili",
            "Variabili",
            "Affidabili",
            "Molto affidabili"
        ],
        filtri: {
            settore: "commercio|manifatturiero"
        }
    },

    {
        id: "OPS_05",
        area: "Produzione",
        peso: 1.5,
        testo: "Quanto spesso si verificano fermi macchina o interruzioni operative?",
        opzioni: [
            "Molto spesso",
            "Spesso",
            "A volte",
            "Raramente",
            "Quasi mai"
        ],
        filtri: {
            settore: "industria|manifatturiero"
        }
    },

    {
        id: "OPS_06",
        area: "Supply Chain",
        peso: 1.4,
        testo: "I fornitori sono diversificati o concentrati?",
        opzioni: [
            "Un unico fornitore",
            "Pochi fornitori",
            "Diversificazione minima",
            "Diversificazione media",
            "Altamente diversificata"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "OPS_07",
        area: "Lean Management",
        peso: 1.3,
        testo: "La gestione degli sprechi e inefficienze è monitorata?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In modo avanzato"
        ],
        filtri: {
            settore: "industria|manifatturiero"
        }
    },

    {
        id: "OPS_08",
        area: "Logistica",
        peso: 1.2,
        testo: "Quanto è efficiente il magazzino (gestione scorte, rotazione)?",
        opzioni: [
            "Molto inefficiente",
            "Inefficiente",
            "Adeguato",
            "Efficiente",
            "Molto efficiente"
        ],
        filtri: {
            settore: "commercio|manifatturiero"
        }
    },

    {
        id: "OPS_09",
        area: "Operations",
        peso: 1.4,
        testo: "Quanto è resiliente la produzione a shock esterni?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Parzialmente",
            "Abbastanza",
            "Molto resiliente"
        ],
        filtri: {
            settore: "industria|manifatturiero"
        }
    },

    {
        id: "OPS_10",
        area: "Qualità & Rischio",
        peso: 1.3,
        testo: "La qualità dei prodotti/servizi genera reclami ricorrenti?",
        opzioni: [
            "Molto frequenti",
            "Frequenti",
            "Occasionali",
            "Rari",
            "Quasi inesistenti"
        ],
        filtri: {
            settore: "tutti"
        }
    },
    /* ============================================================
       AREA 16 — EXPORT, INTERNAZIONALIZZAZIONE, SUPPLY CHAIN GLOBALE
       Codice Area: EXP
       10 DOMANDE
       ============================================================ */

    {
        id: "EXP_01",
        area: "Export",
        peso: 1.5,
        testo: "Quanto incide il fatturato estero sul totale aziendale?",
        opzioni: [
            "0% (nessun export)",
            "< 10%",
            "10–30%",
            "30–60%",
            "> 60%"
        ],
        filtri: {
            settore: "industria|commercio"
        }
    },

    {
        id: "EXP_02",
        area: "Internazionalizzazione",
        peso: 1.3,
        testo: "La tua azienda ha filiali, sedi o partner stabili all’estero?",
        opzioni: [
            "Nessuno",
            "Pochi partner occasionali",
            "Qualche partner stabile",
            "Rete partner sviluppata",
            "Filiali e struttura estera consolidata"
        ],
        filtri: {
            settore: "industria|servizi|commercio"
        }
    },

    {
        id: "EXP_03",
        area: "Export",
        peso: 1.4,
        testo: "Quanto è strutturato il processo di vendita internazionale?",
        opzioni: [
            "Inesistente",
            "Informale",
            "Base",
            "Strutturato",
            "Avanzato"
        ],
        filtri: {
            settore: "industria|commercio"
        }
    },

    {
        id: "EXP_04",
        area: "Supply Chain Globale",
        peso: 1.4,
        testo: "La supply chain internazionale è soggetta a rischi geopolitici?",
        opzioni: [
            "Altissimo rischio",
            "Alto rischio",
            "Rischio medio",
            "Basso rischio",
            "Rischio minimo"
        ],
        filtri: {
            settore: "industria|commercio|logistica"
        }
    },

    {
        id: "EXP_05",
        area: "Pagamenti Esteri",
        peso: 1.2,
        testo: "Come avvengono i pagamenti internazionali?",
        opzioni: [
            "Non presenti",
            "Non garantiti",
            "Parzialmente garantiti",
            "Ben garantiti",
            "Totalmente garantiti (LC, SBLC, assicurazioni crediti)"
        ],
        filtri: {
            settore: "industria|commercio"
        }
    },

    {
        id: "EXP_06",
        area: "Dogane & Compliance",
        peso: 1.3,
        testo: "Quanto sono robuste le procedure doganali e di compliance internazionale?",
        opzioni: [
            "Assenti",
            "Minime",
            "Base",
            "Solide",
            "Avanzate (AEO, certificazioni, audit)"
        ],
        filtri: {
            settore: "industria|commercio"
        }
    },

    {
        id: "EXP_07",
        area: "Logistica Globale",
        peso: 1.4,
        testo: "Le spedizioni internazionali sono affidabili?",
        opzioni: [
            "Molto inaffidabili",
            "Inaffidabili",
            "Variabili",
            "Affidabili",
            "Molto affidabili"
        ],
        filtri: {
            settore: "commercio|logistica|industria"
        }
    },

    {
        id: "EXP_08",
        area: "Rischio Paese",
        peso: 1.5,
        testo: "Gli Stati in cui operi presentano stabilità economica e politica?",
        opzioni: [
            "Molto instabili",
            "Instabili",
            "Moderatamente stabili",
            "Stabili",
            "Molto stabili"
        ],
        filtri: {
            settore: "industria|commercio|servizi"
        }
    },

    {
        id: "EXP_09",
        area: "Contrattualistica Internazionale",
        peso: 1.2,
        testo: "Esistono contratti internazionali formalizzati per clienti/fornitori?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Spesso",
            "Sempre (con revisione legale)"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "EXP_10",
        area: "Strategia Internazionale",
        peso: 1.4,
        testo: "Quanto è definita la strategia di espansione all’estero?",
        opzioni: [
            "Assente",
            "Molto vaga",
            "In sviluppo",
            "Definita",
            "Avanzata e strutturale"
        ],
        filtri: {
            settore: "industria|servizi|commercio"
        }
    },
    /* ============================================================
       AREA 17 — SOSTENIBILITÀ, ESG, AMBIENTE, SICUREZZA SUL LAVORO
       Codice Area: ESG
       10 DOMANDE
       ============================================================ */

    {
        id: "ESG_01",
        area: "Sostenibilità",
        peso: 1.4,
        testo: "Quanto è sviluppata la strategia di sostenibilità aziendale?",
        opzioni: [
            "Assente",
            "Iniziale",
            "In definizione",
            "Strutturata",
            "Avanzata e certificata"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_02",
        area: "ESG",
        peso: 1.5,
        testo: "L’azienda misura KPI ESG (emissioni, consumi, rifiuti)?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In modo avanzato (report ESG)"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_03",
        area: "Ambiente",
        peso: 1.3,
        testo: "Esistono rischi ambientali legati alla produzione?",
        opzioni: [
            "Molto elevati",
            "Elevati",
            "Moderati",
            "Bassi",
            "Minimi"
        ],
        filtri: {
            settore: "industria|manifatturiero|logistica"
        }
    },

    {
        id: "ESG_04",
        area: "Sicurezza sul lavoro",
        peso: 1.5,
        testo: "Il sistema di sicurezza sul lavoro è adeguato e aggiornato?",
        opzioni: [
            "Molto carente",
            "Carente",
            "Adeguato",
            "Solido",
            "Avanzato e certificato"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_05",
        area: "Governance ESG",
        peso: 1.3,
        testo: "L’azienda ha figure responsabili per ESG e sostenibilità?",
        opzioni: [
            "Nessuna",
            "Ruoli informali",
            "Referente definito",
            "Team dedicato",
            "Funzione strutturata"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_06",
        area: "Compliance Ambientale",
        peso: 1.4,
        testo: "La compliance ambientale è monitorata regolarmente?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In modo avanzato e certificato"
        ],
        filtri: {
            settore: "industria|manifatturiero"
        }
    },

    {
        id: "ESG_07",
        area: "Rischi Reputazionali",
        peso: 1.2,
        testo: "Quanto sono gestiti i rischi reputazionali legati ad ESG?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Parzialmente",
            "Abbastanza",
            "Molto"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_08",
        area: "Energia",
        peso: 1.4,
        testo: "Quanto è efficiente l’uso dell’energia in azienda?",
        opzioni: [
            "Molto inefficiente",
            "Inefficiente",
            "Adeguato",
            "Efficiente",
            "Molto efficiente"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_09",
        area: "Rifiuti & Ciclo Materiali",
        peso: 1.3,
        testo: "La gestione dei rifiuti e materiali è conforme e tracciata?",
        opzioni: [
            "Molto carente",
            "Carente",
            "Adeguata",
            "Buona",
            "Ottima e certificata"
        ],
        filtri: {
            settore: "industria|manifatturiero"
        }
    },

    {
        id: "ESG_10",
        area: "Sicurezza",
        peso: 1.3,
        testo: "Il personale è adeguatamente formato in tema di sicurezza?",
        opzioni: [
            "Mai",
            "Occasionalmente",
            "Periodicamente",
            "Regolarmente",
            "In modo avanzato e continuo"
        ],
        filtri: {
            settore: "tutti"
        }
    },
    /* ============================================================
       AREA 18 — SUPPLY CHAIN, FORNITORI, BUSINESS CONTINUITY E DR
       Codice Area: SC
       10 DOMANDE
       ============================================================ */

    {
        id: "SC_01",
        area: "Supply Chain",
        peso: 1.5,
        testo: "Quanto dipende l’azienda da fornitori critici non sostituibili?",
        opzioni: [
            "Dipendenza totale (unico fornitore)",
            "Molto alta",
            "Moderata",
            "Bassa",
            "Nessuna dipendenza critica"
        ],
        filtri: {
            settore: "industria|logistica|commercio"
        }
    },

    {
        id: "SC_02",
        area: "Supply Chain",
        peso: 1.3,
        testo: "Esistono piani di continuità operativa in caso di blocco fornitori?",
        opzioni: [
            "Nessun piano",
            "Piano minimo",
            "Piano base",
            "Piano strutturato",
            "Piano avanzato testato"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "SC_03",
        area: "Supply Chain",
        peso: 1.4,
        testo: "I tempi di consegna dei fornitori sono affidabili?",
        opzioni: [
            "Molto inaffidabili",
            "Inaffidabili",
            "Variabili",
            "Affidabili",
            "Altamente affidabili"
        ],
        filtri: {
            settore: "industria|commercio|logistica"
        }
    },

    {
        id: "SC_04",
        area: "Fornitori",
        peso: 1.2,
        testo: "I fornitori critici rispettano standard di sicurezza, qualità e compliance?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Parzialmente",
            "Abbastanza",
            "Completamente"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "SC_05",
        area: "Business Continuity",
        peso: 1.5,
        testo: "Esiste un Business Continuity Plan aggiornato?",
        opzioni: [
            "Assente",
            "Vecchio/non aggiornato",
            "Base",
            "Buono",
            "Avanzato e testato"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "SC_06",
        area: "Business Continuity",
        peso: 1.3,
        testo: "Quanto rapidamente l’azienda può riprendere le attività dopo un’interruzione?",
        opzioni: [
            "Più di 30 giorni",
            "15–30 giorni",
            "7–14 giorni",
            "1–6 giorni",
            "Sotto le 24 ore"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "SC_07",
        area: "Disaster Recovery",
        peso: 1.4,
        testo: "Esiste un piano di Disaster Recovery per sistemi IT e dati?",
        opzioni: [
            "Assente",
            "Molto carente",
            "Base",
            "Buono",
            "Avanzato e testato"
        ],
        filtri: {
            settore: "tecnologia|servizi|industria"
        }
    },

    {
        id: "SC_08",
        area: "Fornitori",
        peso: 1.3,
        testo: "Quanto è diversificato il parco fornitori strategici?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Parzialmente",
            "Molto",
            "Completamente diversificato"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "SC_09",
        area: "Business Continuity",
        peso: 1.4,
        testo: "L’azienda ha mai effettuato stress-test o simulazioni di emergenza?",
        opzioni: [
            "Mai",
            "Una volta",
            "Occasionalmente",
            "Regolarmente",
            "Con controllo esterno"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "SC_10",
        area: "Disaster Recovery",
        peso: 1.3,
        testo: "La protezione dei dati critici è ridondata su più sedi/cloud?",
        opzioni: [
            "Nessuna ridondanza",
            "Ridondanza minima",
            "Ridondanza base",
            "Ridondanza buona",
            "Ridondanza avanzata multi-cloud"
        ],
        filtri: {
            settore: "tecnologia|servizi|industria"
        }
    },
    /* ============================================================
       AREA 19 — ESG, SOSTENIBILITÀ, AMBIENTE, NORMATIVE, CERTIFICAZIONI
       Codice Area: ESG
       10 DOMANDE
       ============================================================ */

    {
        id: "ESG_01",
        area: "ESG & Ambiente",
        peso: 1.4,
        testo: "L’azienda misura e controlla l’impatto ambientale delle proprie attività?",
        opzioni: [
            "Mai valutato",
            "Valutazione sporadica",
            "Base (solo obblighi)",
            "Regolare monitoraggio",
            "Analisi strutturata con obiettivi"
        ],
        filtri: {
            settore: "industria|agroalimentare|logistica"
        }
    },

    {
        id: "ESG_02",
        area: "ESG & Ambiente",
        peso: 1.5,
        testo: "L’azienda è esposta a rischi ambientali significativi?",
        opzioni: [
            "Molto alti",
            "Alti",
            "Moderati",
            "Bassi",
            "Minimi"
        ],
        filtri: {
            settore: "industria|agroalimentare|logistica"
        }
    },

    {
        id: "ESG_03",
        area: "Compliance ESG",
        peso: 1.3,
        testo: "Sono presenti politiche ESG formalizzate e approvate dalla direzione?",
        opzioni: [
            "Assenti",
            "Minime",
            "Base",
            "Complete",
            "Avanzate con monitoraggio"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_04",
        area: "Compliance ESG",
        peso: 1.2,
        testo: "L’azienda possiede certificazioni (ISO 9001, 14001, 45001, ecc.)?",
        opzioni: [
            "Nessuna",
            "Una certificazione",
            "2 certificazioni",
            "3 certificazioni",
            "4 o più (alta compliance)"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_05",
        area: "Sostenibilità",
        peso: 1.3,
        testo: "Sono attive misure per la riduzione dei consumi energetici?",
        opzioni: [
            "Assenti",
            "Poche",
            "Alcune iniziative",
            "Programma strutturato",
            "Sistema avanzato di efficienza"
        ],
        filtri: {
            settore: "industria|servizi|tecnologia"
        }
    },

    {
        id: "ESG_06",
        area: "Sostenibilità",
        peso: 1.3,
        testo: "L’azienda utilizza energia da fonti rinnovabili?",
        opzioni: [
            "0%",
            "Fino al 20%",
            "20–50%",
            "50–80%",
            "80–100%"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_07",
        area: "Responsabilità Sociale",
        peso: 1.2,
        testo: "L’azienda ha programmi strutturati di welfare e benessere dei dipendenti?",
        opzioni: [
            "Nessuno",
            "Minimi",
            "Base",
            "Buoni",
            "Avanzati e misurati"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_08",
        area: "Responsabilità Sociale",
        peso: 1.3,
        testo: "Quanto è inclusiva e rispettosa dei diritti dei lavoratori l’organizzazione?",
        opzioni: [
            "Molto bassa",
            "Bassa",
            "Adeguata",
            "Buona",
            "Eccellente"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_09",
        area: "Governance ESG",
        peso: 1.5,
        testo: "La governance aziendale prevede ruoli dedicati alla sostenibilità?",
        opzioni: [
            "Nessuno",
            "Responsabile informale",
            "Figura assegnata ma non formata",
            "Responsabile ESG",
            "Team ESG dedicato"
        ],
        filtri: {
            settore: "tutti"
        }
    },

    {
        id: "ESG_10",
        area: "Governance ESG",
        peso: 1.4,
        testo: "L’azienda pubblica o pianifica un report di sostenibilità (bilancio ESG)?",
        opzioni: [
            "Mai fatto",
            "In valutazione",
            "Prima bozza",
            "Report annuale",
            "Report strutturato certificato"
        ],
        filtri: {
            settore: "tutti"
        }
    },
    /* ============================================================
       AREA 20 — LEGAL, NORMATIVA, COMPLIANCE, CONTRATTUALISTICA
       Codice Area: LEGAL
       10 DOMANDE
       ============================================================ */

    {
        id: "LEGAL_01",
        area: "Legal & Compliance",
        peso: 1.6,
        testo: "L’azienda ha un responsabile o un ufficio dedicato alla compliance normativa?",
        opzioni: [
            "No",
            "Figura informale",
            "Ruolo parziale",
            "Responsabile dedicato",
            "Team strutturato"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGAL_02",
        area: "Legal & Compliance",
        peso: 1.4,
        testo: "Con quale frequenza vengono aggiornati i contratti commerciali e di fornitura?",
        opzioni: [
            "Mai",
            "Raramente",
            "Ogni 2–3 anni",
            "Annualmente",
            "Aggiornamento continuo"
        ],
        filtri: { settore: "servizi|commercio|industria" }
    },

    {
        id: "LEGAL_03",
        area: "Contrattualistica",
        peso: 1.3,
        testo: "I contratti includono clausole di protezione adeguate (penali, responsabilità, assicurazioni)?",
        opzioni: [
            "Assenti",
            "Molto limitate",
            "Parziali",
            "Complete",
            "Verificate da legali esterni"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGAL_04",
        area: "Contrattualistica",
        peso: 1.4,
        testo: "Esistono procedure strutturate per la gestione delle non conformità contrattuali?",
        opzioni: [
            "No",
            "Molto informali",
            "Base",
            "Strutturate",
            "Avanzate e monitorate"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGAL_05",
        area: "Normativa & Responsabilità",
        peso: 1.5,
        testo: "L’azienda effettua formazione obbligatoria (sicurezza, privacy, antiriciclaggio, ecc.)?",
        opzioni: [
            "Mai",
            "Sporadica",
            "Regolare ma minima",
            "Completa",
            "Avanzata con verifiche"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGAL_06",
        area: "Normativa & Responsabilità",
        peso: 1.3,
        testo: "I processi aziendali sono documentati e aggiornati rispetto alle normative vigenti?",
        opzioni: [
            "Mai documentati",
            "Documentazione parziale",
            "Documentazione completa ma non aggiornata",
            "Aggiornata regolarmente",
            "Aggiornata + audit periodici"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGAL_07",
        area: "Tutela Legale",
        peso: 1.4,
        testo: "L’azienda ha una tutela legale aziendale attiva e aggiornata?",
        opzioni: [
            "Nessuna",
            "Minima",
            "Base",
            "Buona",
            "Completa e personalizzata"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGAL_08",
        area: "Tutela Legale",
        peso: 1.3,
        testo: "La gestione del rischio contenzioso è monitorata e analizzata?",
        opzioni: [
            "Mai",
            "Poco",
            "Adeguatamente",
            "In modo strutturato",
            "Analisi + prevenzione"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGAL_09",
        area: "Privacy & GDPR",
        peso: 1.5,
        testo: "La documentazione GDPR è aggiornata e verificata periodicamente?",
        opzioni: [
            "Assente",
            "Minima",
            "Adeguata",
            "Completa",
            "Completa + audit"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGAL_10",
        area: "Privacy & GDPR",
        peso: 1.3,
        testo: "È nominato un DPO (Data Protection Officer), se richiesto?",
        opzioni: [
            "Non richiesto ma assente",
            "Richiesto ma non nominato",
            "Nominato ma inattivo",
            "Nominato e attivo",
            "Struttura DPO completa"
        ],
        filtri: { settore: "tutti" }
    },
    /* ============================================================
       AREA 21 — DIGITALIZZAZIONE, AUTOMAZIONE, INDUSTRIA 4.0
       Codice Area: DIGI
       10 DOMANDE
       ============================================================ */

    {
        id: "DIGI_01",
        area: "Digitalizzazione",
        peso: 1.5,
        testo: "Quanto sono digitalizzati i processi aziendali principali?",
        opzioni: [
            "Completamente manuali",
            "Parzialmente digitalizzati",
            "Digitalizzati al 50%",
            "Digitalizzazione avanzata",
            "Automazione completa"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "DIGI_02",
        area: "Digitalizzazione",
        peso: 1.3,
        testo: "L’azienda utilizza software gestionali o ERP?",
        opzioni: [
            "Nessun software",
            "Solo strumenti base (Excel, Word)",
            "Gestionale semplice",
            "ERP strutturato",
            "ERP + integrazioni avanzate"
        ],
        filtri: { settore: "industria|commercio|servizi" }
    },

    {
        id: "DIGI_03",
        area: "Automazione",
        peso: 1.4,
        testo: "Il livello di automazione dei processi produttivi o operativi?",
        opzioni: [
            "Nessuna automazione",
            "Automazione minima",
            "Automazione parziale",
            "Automazione avanzata",
            "Automazione totale"
        ],
        filtri: { settore: "industria|logistica" }
    },

    {
        id: "DIGI_04",
        area: "Automazione",
        peso: 1.2,
        testo: "Esistono robot, cobot o sistemi intelligenti in azienda?",
        opzioni: [
            "Nessuno",
            "Progetti preliminari",
            "In fase di installazione",
            "Presenti in alcune funzioni",
            "Diffusi in più reparti"
        ],
        filtri: { settore: "industria" }
    },

    {
        id: "DIGI_05",
        area: "Industria 4.0",
        peso: 1.5,
        testo: "Adozione di tecnologie Industria 4.0 (IoT, sensori, macchine connesse)?",
        opzioni: [
            "Assente",
            "Molto limitata",
            "In ampliamento",
            "Buon livello",
            "Avanzatissima"
        ],
        filtri: { settore: "industria" }
    },

    {
        id: "DIGI_06",
        area: "Industria 4.0",
        peso: 1.4,
        testo: "I macchinari comunicano dati in tempo reale ai sistemi centrali?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Spesso",
            "Sempre"
        ],
        filtri: { settore: "industria" }
    },

    {
        id: "DIGI_07",
        area: "Digital Strategy",
        peso: 1.3,
        testo: "È presente una strategia digitale definita e documentata?",
        opzioni: [
            "Assente",
            "In costruzione",
            "Base",
            "Chiara e strutturata",
            "Completa e monitorata"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "DIGI_08",
        area: "Digital Strategy",
        peso: 1.2,
        testo: "L’azienda utilizza dati e analytics per prendere decisioni?",
        opzioni: [
            "Mai",
            "Poco",
            "A volte",
            "Spesso",
            "Decisioni sempre data-driven"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "DIGI_09",
        area: "Gestione Documentale",
        peso: 1.3,
        testo: "Quanto è digitalizzata la gestione dei documenti (archivio, firme, versioning)?",
        opzioni: [
            "Tutto in cartaceo",
            "Poco digitalizzato",
            "Digitalizzato al 50%",
            "Quasi tutto digitale",
            "Gestione completamente digitale"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "DIGI_10",
        area: "Gestione Documentale",
        peso: 1.2,
        testo: "L’azienda utilizza sistemi di firma digitale e workflow approvativi?",
        opzioni: [
            "Mai",
            "Raramente",
            "Talvolta",
            "Spesso",
            "Sempre e in tutti i reparti"
        ],
        filtri: { settore: "tutti" }
    },
    /* ============================================================
       AREA 22 — ESG, SOSTENIBILITÀ, AMBIENTE, COMPLIANCE AMBIENTALE
       Codice Area: ESG
       10 DOMANDE
       ============================================================ */

    {
        id: "ESG_01",
        area: "ESG",
        peso: 1.4,
        testo: "Quanto è strutturato il sistema aziendale di sostenibilità (ESG)?",
        opzioni: [
            "Assente",
            "Molto limitato",
            "Base",
            "Strutturato",
            "Avanzato e integrato nei processi"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_02",
        area: "ESG",
        peso: 1.3,
        testo: "Esiste un responsabile interno o un team dedicato ai temi ESG?",
        opzioni: [
            "Nessuno",
            "Responsabile informale",
            "Figura dedicata part-time",
            "Responsabile formalizzato",
            "Team dedicato e strutturato"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_03",
        area: "Ambiente",
        peso: 1.5,
        testo: "L’azienda misura la propria impronta ambientale (emissioni, consumi, rifiuti)?",
        opzioni: [
            "Mai",
            "Sporadicamente",
            "Parzialmente",
            "Regolarmente",
            "In modo completo e certificato"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_04",
        area: "Ambiente",
        peso: 1.3,
        testo: "Come vengono gestiti i rifiuti e le sostanze pericolose?",
        opzioni: [
            "In modo non strutturato",
            "Minimo indispensabile",
            "Standard adeguati",
            "Gestione strutturata",
            "Gestione certificata ISO 14001"
        ],
        filtri: { settore: "industria|artigianato" }
    },

    {
        id: "ESG_05",
        area: "Conformità",
        peso: 1.2,
        testo: "La normativa ambientale e gli adempimenti sono costantemente aggiornati?",
        opzioni: [
            "No",
            "Poco",
            "Parzialmente",
            "Abbastanza",
            "Completo e continuativo"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_06",
        area: "Conformità",
        peso: 1.4,
        testo: "Sono stati effettuati audit ambientali negli ultimi 24 mesi?",
        opzioni: [
            "Mai",
            "Più di 24 mesi fa",
            "Ogni tanto",
            "Annualmente",
            "Annualmente con terze parti"
        ],
        filtri: { settore: "industria|artigianato|logistica" }
    },

    {
        id: "ESG_07",
        area: "Sociale",
        peso: 1.1,
        testo: "Quanto è strutturata la gestione della sicurezza dei lavoratori?",
        opzioni: [
            "Minima",
            "Base",
            "Adeguata",
            "Avanzata",
            "Eccellente con monitoraggi continui"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_08",
        area: "Sociale",
        peso: 1.2,
        testo: "Sono presenti politiche di welfare aziendale?",
        opzioni: [
            "Assenti",
            "Molto limitate",
            "Presenti ma basiche",
            "Buon livello",
            "Welfare strutturato e personalizzato"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_09",
        area: "Governance",
        peso: 1.3,
        testo: "L’azienda pubblica o redige un bilancio di sostenibilità?",
        opzioni: [
            "Mai",
            "Solo parti interne",
            "Bozza preliminare",
            "Bilancio annuale",
            "Bilancio certificato e pubblico"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_10",
        area: "Governance",
        peso: 1.4,
        testo: "L’azienda integra ESG nei processi di selezione fornitori?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Spesso",
            "Sempre e formalmente"
        ],
        filtri: { settore: "tutti" }
    },
    /* ============================================================
       AREA 23 — QUALITÀ, CERTIFICAZIONI, PROCESSI, AUDIT, CONTROLLO
       Codice Area: QUALITA
       10 DOMANDE
       ============================================================ */

    {
        id: "QUALITA_01",
        area: "Qualità",
        peso: 1.3,
        testo: "L’azienda possiede certificazioni di qualità (ISO 9001 o equivalenti)?",
        opzioni: [
            "Nessuna",
            "Solo alcune aree",
            "In corso di ottenimento",
            "Certificata",
            "Certificata e con audit regolari"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "QUALITA_02",
        area: "Qualità",
        peso: 1.4,
        testo: "Come viene gestita la qualità dei processi produttivi/operativi?",
        opzioni: [
            "Nessun controllo",
            "Controlli base",
            "Procedure minime documentate",
            "Sistema qualità strutturato",
            "Sistema qualità completo e ottimizzato"
        ],
        filtri: { settore: "industria|artigianato|logistica" }
    },

    {
        id: "QUALITA_03",
        area: "Processi",
        peso: 1.2,
        testo: "I processi interni sono documentati e aggiornati?",
        opzioni: [
            "No",
            "Parzialmente",
            "In gran parte",
            "Completi",
            "Completi e continuamente migliorati"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "QUALITA_04",
        area: "Processi",
        peso: 1.5,
        testo: "Come vengono gestiti gli errori o le non conformità?",
        opzioni: [
            "Non gestiti",
            "Gestiti solo se gravi",
            "Registrati occasionalmente",
            "Con procedure definite",
            "Con analisi cause e miglioramento continuo"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "QUALITA_05",
        area: "Processi",
        peso: 1.3,
        testo: "Qual è il livello di automazione dei processi aziendali?",
        opzioni: [
            "Assente",
            "Molto bassa",
            "Media",
            "Alta",
            "Molto alta/Industria 4.0"
        ],
        filtri: { settore: "industria|logistica|tecnologia" }
    },

    {
        id: "QUALITA_06",
        area: "Audit",
        peso: 1.4,
        testo: "L’azienda svolge audit interni regolarmente?",
        opzioni: [
            "Mai",
            "Raramente",
            "Occasionalmente",
            "Regolarmente",
            "Regolarmente e con audit esterni"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "QUALITA_07",
        area: "Audit",
        peso: 1.2,
        testo: "Con quale frequenza vengono verificati i fornitori?",
        opzioni: [
            "Mai",
            "Raramente",
            "Ogni tanto",
            "Regolarmente",
            "Regolarmente con criteri avanzati"
        ],
        filtri: { settore: "industria|logistica|commercio" }
    },

    {
        id: "QUALITA_08",
        area: "Controllo",
        peso: 1.3,
        testo: "L’azienda utilizza KPI per misurare performance operative e produttive?",
        opzioni: [
            "Mai",
            "Raramente",
            "Qualche KPI",
            "Diversi KPI monitorati",
            "Sistema completo di KPI"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "QUALITA_09",
        area: "Controllo",
        peso: 1.4,
        testo: "I processi critici hanno sistemi di controllo ridondanti?",
        opzioni: [
            "Nessuno",
            "Minimi",
            "Base",
            "Avanzati",
            "Ridondanze complete e monitoraggio costante"
        ],
        filtri: { settore: "industria|Tecnologia|logistica" }
    },

    {
        id: "QUALITA_10",
        area: "Miglioramento",
        peso: 1.5,
        testo: "L’azienda applica metodologie di miglioramento continuo (Lean, Kaizen, Six Sigma)?",
        opzioni: [
            "Mai",
            "Raramente",
            "Occasionalmente",
            "Regolarmente",
            "In modo strutturato e certificato"
        ],
        filtri: { settore: "industria|logistica|manifattura" }
    },
    /* ============================================================
       AREA 24 — RISCHI LEGALI, CONTRATTUALI, COMPLIANCE, DATA PRIVACY
       Codice Area: LEGALE
       10 DOMANDE
       ============================================================ */

    {
        id: "LEGALE_01",
        area: "Legale",
        peso: 1.4,
        testo: "I contratti con clienti e fornitori sono aggiornati e rivisti periodicamente?",
        opzioni: [
            "Mai",
            "Molto raramente",
            "Solo in parte",
            "Regolarmente",
            "Regolarmente con supporto legale esterno"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGALE_02",
        area: "Legale",
        peso: 1.3,
        testo: "Sono presenti clausole di limitazione responsabilità nei contratti?",
        opzioni: [
            "No",
            "Poche",
            "Solo nei principali",
            "In quasi tutti",
            "In tutti i contratti e ben strutturate"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGALE_03",
        area: "Compliance",
        peso: 1.5,
        testo: "L’azienda è conforme al GDPR nella gestione dei dati personali?",
        opzioni: [
            "Non conforme",
            "Minima conformità",
            "Conformità base",
            "Conformità buona",
            "Conformità certificata/auditata"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGALE_04",
        area: "Compliance",
        peso: 1.2,
        testo: "Sono presenti procedure per gestire una violazione dei dati (data breach)?",
        opzioni: [
            "No",
            "Minime",
            "Base",
            "Buone",
            "Strutturate e testate"
        ],
        filtri: { settore: "tecnologia|servizi|sanità" }
    },

    {
        id: "LEGALE_05",
        area: "Contratti",
        peso: 1.4,
        testo: "I contratti includono politiche di tutela IP (proprietà intellettuale)?",
        opzioni: [
            "Mai",
            "Raramente",
            "Qualche volta",
            "Quasi sempre",
            "Sempre con tutele avanzate"
        ],
        filtri: { settore: "industria|tecnologia|servizi" }
    },

    {
        id: "LEGALE_06",
        area: "Contratti",
        peso: 1.3,
        testo: "Quanto sono strutturati i contratti con clienti chiave?",
        opzioni: [
            "Molto deboli",
            "Deboli",
            "Adeguati",
            "Forti",
            "Molto forti e blindati"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGALE_07",
        area: "Privacy",
        peso: 1.4,
        testo: "È presente un DPO (Data Protection Officer) o consulente esterno GDPR?",
        opzioni: [
            "No",
            "In valutazione",
            "Figura interna",
            "Figura esterna",
            "DPO strutturato con audit regolari"
        ],
        filtri: { settore: "sanità|tecnologia|servizi" }
    },

    {
        id: "LEGALE_08",
        area: "Privacy",
        peso: 1.3,
        testo: "I dipendenti ricevono formazione periodica sulla privacy?",
        opzioni: [
            "Mai",
            "Raramente",
            "Occasionalmente",
            "Regolarmente",
            "Regolarmente con verifica competenze"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGALE_09",
        area: "Rischi Legali",
        peso: 1.2,
        testo: "L’azienda ha avuto contenziosi legali significativi negli ultimi 5 anni?",
        opzioni: [
            "Molti",
            "Qualcuno",
            "Pochi",
            "Rari",
            "Nessuno"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "LEGALE_10",
        area: "Rischi Legali",
        peso: 1.5,
        testo: "La tutela legale attuale è adeguata ai rischi specifici del settore?",
        opzioni: [
            "Molto insufficiente",
            "Insufficiente",
            "Adeguata",
            "Buona",
            "Molto buona e aggiornata annualmente"
        ],
        filtri: { settore: "tutti" }
    },
    /* ============================================================
       AREA 25 — ESG, SOSTENIBILITÀ, NORMATIVE AMBIENTALI
       Codice Area: ESG
       10 DOMANDE
       ============================================================ */

    {
        id: "ESG_01",
        area: "ESG",
        peso: 1.5,
        testo: "L'azienda dispone di una politica ESG formalizzata?",
        opzioni: [
            "Nessuna",
            "Informale",
            "Base",
            "Definita",
            "Completa con KPI e revisione periodica"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_02",
        area: "ESG",
        peso: 1.3,
        testo: "La sostenibilità è integrata nella strategia aziendale?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Moderatamente",
            "Molto",
            "Totalmente integrata"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_03",
        area: "Ambiente",
        peso: 1.4,
        testo: "Quanto è strutturata la gestione dei rifiuti e del riciclo?",
        opzioni: [
            "Assente",
            "Minima",
            "Adeguata",
            "Strutturata",
            "Certificata"
        ],
        filtri: { settore: "industria|artigianato|agroalimentare|sanità" }
    },

    {
        id: "ESG_04",
        area: "Ambiente",
        peso: 1.4,
        testo: "L’azienda monitora le emissioni e l’impatto ambientale?",
        opzioni: [
            "Mai",
            "Occasionalmente",
            "Parzialmente",
            "Regolarmente",
            "Regolarmente con report pubblico"
        ],
        filtri: { settore: "industria|agroalimentare" }
    },

    {
        id: "ESG_05",
        area: "Sociale",
        peso: 1.3,
        testo: "L’azienda ha programmi di welfare, formazione e sicurezza per i dipendenti?",
        opzioni: [
            "Assenti",
            "Limitati",
            "Base",
            "Buoni",
            "Avanzati"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_06",
        area: "Governance",
        peso: 1.5,
        testo: "Sono presenti procedure anticorruzione, whistleblowing, etica aziendale?",
        opzioni: [
            "No",
            "Minime",
            "Parziali",
            "Strutturate",
            "Strutturate e certificate (231, ecc.)"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_07",
        area: "ESG",
        peso: 1.2,
        testo: "L’azienda è coinvolta in iniziative o certificazioni ambientali?",
        opzioni: [
            "Nessuna",
            "In valutazione",
            "Qualche iniziativa",
            "Regolari iniziative",
            "Certificazioni formali (ISO 14001, ecc.)"
        ],
        filtri: { settore: "industria|agroalimentare|sanità" }
    },

    {
        id: "ESG_08",
        area: "ESG",
        peso: 1.2,
        testo: "I fornitori sono valutati anche per criteri ESG?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Spesso",
            "Sempre con audit periodici"
        ],
        filtri: { settore: "industria|logistica|servizi" }
    },

    {
        id: "ESG_09",
        area: "Normativa",
        peso: 1.3,
        testo: "L’azienda ha avuto sanzioni ambientali o ispezioni critiche negli ultimi 5 anni?",
        opzioni: [
            "Molte",
            "Alcune",
            "Poche",
            "Rarissime",
            "Nessuna"
        ],
        filtri: { settore: "industria|agroalimentare" }
    },

    {
        id: "ESG_10",
        area: "ESG",
        peso: 1.4,
        testo: "Gli investimenti aziendali includono valutazioni di impatto ESG?",
        opzioni: [
            "Mai",
            "Raramente",
            "Qualche volta",
            "Spesso",
            "Sempre con processi strutturati"
        ],
        filtri: { settore: "tutti" }
    },
    /* ============================================================
       AREA 26 — INNOVAZIONE TECNOLOGICA, DIGITALIZZAZIONE, INDUSTRIA 4.0
       Codice Area: INN
       10 DOMANDE
       ============================================================ */

    {
        id: "INN_01",
        area: "Innovazione",
        peso: 1.4,
        testo: "Quanto è digitalizzata la gestione dei processi aziendali?",
        opzioni: [
            "Per nulla",
            "Poco",
            "Parzialmente",
            "Molto",
            "Totalmente digitalizzata"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "INN_02",
        area: "Innovazione",
        peso: 1.3,
        testo: "L’azienda utilizza software gestionali aggiornati e integrati?",
        opzioni: [
            "Nessun gestionale",
            "Molto datati",
            "Parziali",
            "Buoni",
            "Avanzati e integrati"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "INN_03",
        area: "Digitalizzazione",
        peso: 1.5,
        testo: "I dati aziendali sono centralizzati e accessibili in tempo reale?",
        opzioni: [
            "No",
            "Parzialmente",
            "In buona parte",
            "Quasi del tutto",
            "Totalmente"
        ],
        filtri: { settore: "servizi|tecnologia|industria" }
    },

    {
        id: "INN_04",
        area: "Industria 4.0",
        peso: 1.6,
        testo: "L’azienda utilizza tecnologie 4.0 (IoT, sensoristica, automazione)?",
        opzioni: [
            "Mai",
            "Minimamente",
            "Parzialmente",
            "Molto",
            "Totalmente 4.0"
        ],
        filtri: { settore: "industria|logistica|tecnologia" }
    },

    {
        id: "INN_05",
        area: "Innovazione",
        peso: 1.3,
        testo: "L’azienda investe annualmente in ricerca e sviluppo (R&D)?",
        opzioni: [
            "0%",
            "Fino all’1%",
            "1–3%",
            "3–5%",
            "Oltre il 5%"
        ],
        filtri: { settore: "tecnologia|industria" }
    },

    {
        id: "INN_06",
        area: "Digitalizzazione",
        peso: 1.2,
        testo: "Quanto è strutturata la gestione dei documenti digitali (DMS)?",
        opzioni: [
            "Nessuna",
            "Molto bassa",
            "Adeguata",
            "Buona",
            "Certificata e ottimizzata"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "INN_07",
        area: "Innovazione",
        peso: 1.4,
        testo: "Vengono utilizzati sistemi cloud per backup o operatività?",
        opzioni: [
            "Mai",
            "Raramente",
            "Parzialmente",
            "Molto",
            "Cloud-first"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "INN_08",
        area: "Digitalizzazione",
        peso: 1.3,
        testo: "L’azienda automatizza attività ripetitive tramite software (RPA)?",
        opzioni: [
            "Mai",
            "Poco",
            "A volte",
            "Spesso",
            "In modo esteso"
        ],
        filtri: { settore: "servizi|industria|tecnologia" }
    },

    {
        id: "INN_09",
        area: "Industria 4.0",
        peso: 1.4,
        testo: "Sono presenti macchinari interconnessi con sistemi di produzione?",
        opzioni: [
            "No",
            "Casi isolati",
            "Parzialmente",
            "Buona interconnessione",
            "Totalmente interconnessi"
        ],
        filtri: { settore: "industria|produzione|logistica" }
    },

    {
        id: "INN_10",
        area: "Innovazione",
        peso: 1.5,
        testo: "L’azienda analizza i dati attraverso BI, dashboard, KPI in tempo reale?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Spesso",
            "Sempre con strumenti avanzati"
        ],
        filtri: { settore: "servizi|tecnologia|industria" }
    },
    /* ============================================================
       AREA 27 — AMBIENTE, ESG, SOSTENIBILITÀ, IMPATTO AMBIENTALE
       Codice Area: ESG
       10 DOMANDE
       ============================================================ */

    {
        id: "ESG_01",
        area: "Sostenibilità",
        peso: 1.4,
        testo: "L’azienda misura e monitora l’impatto ambientale delle proprie attività?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In modo certificato"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_02",
        area: "Ambiente",
        peso: 1.3,
        testo: "Vengono adottate politiche per ridurre consumi energetici e sprechi?",
        opzioni: [
            "No",
            "Minimali",
            "Parziali",
            "Buone",
            "Avanzate e strutturate"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_03",
        area: "ESG",
        peso: 1.5,
        testo: "Sono stati implementati protocolli ESG formali o rating di sostenibilità?",
        opzioni: [
            "Nessuno",
            "Base",
            "In sviluppo",
            "Strutturato",
            "Certificato (ISO, ESG rating, ecc.)"
        ],
        filtri: { settore: "industria|tecnologia|servizi" }
    },

    {
        id: "ESG_04",
        area: "Ambiente",
        peso: 1.4,
        testo: "L’azienda smaltisce correttamente rifiuti, materiali e sostanze pericolose?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Quasi sempre",
            "Sempre, conformità totale"
        ],
        filtri: { settore: "industria|artigianato|logistica|agro" }
    },

    {
        id: "ESG_05",
        area: "Sostenibilità",
        peso: 1.2,
        testo: "I fornitori vengono valutati per sostenibilità e responsabilità sociale?",
        opzioni: [
            "Mai",
            "Poco",
            "A volte",
            "Spesso",
            "Sempre"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_06",
        area: "ESG",
        peso: 1.5,
        testo: "L’azienda ha un piano di riduzione CO₂ o iniziative green?",
        opzioni: [
            "Nessuna iniziativa",
            "Molto iniziale",
            "In sviluppo",
            "Strutturata",
            "Completamente attiva"
        ],
        filtri: { settore: "industria|tecnologia|servizi" }
    },

    {
        id: "ESG_07",
        area: "Ambiente",
        peso: 1.3,
        testo: "Gli stabilimenti utilizzano sistemi di controllo emissioni o efficientamento energetico?",
        opzioni: [
            "No",
            "Minimali",
            "Parziali",
            "Avanzati",
            "All’avanguardia"
        ],
        filtri: { settore: "industria|produzione|logistica" }
    },

    {
        id: "ESG_08",
        area: "Sostenibilità",
        peso: 1.4,
        testo: "L’azienda promuove pratiche sostenibili verso dipendenti e comunità?",
        opzioni: [
            "Mai",
            "Poco",
            "A volte",
            "Molto",
            "Da best practice"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "ESG_09",
        area: "ESG",
        peso: 1.4,
        testo: "Viene redatto un bilancio di sostenibilità o report CSR?",
        opzioni: [
            "Mai",
            "Raramente",
            "In alcuni anni",
            "Regolarmente",
            "In modo certificato"
        ],
        filtri: { settore: "tecnologia|industrie|grandi_imp" }
    },

    {
        id: "ESG_10",
        area: "Ambiente",
        peso: 1.2,
        testo: "L’azienda ha adottato processi per ridurre utilizzo di plastica o materiali monouso?",
        opzioni: [
            "Mai",
            "Poco",
            "Parzialmente",
            "Molto",
            "Completamente"
        ],
        filtri: { settore: "tutti" }
    },
    /* ============================================================
       AREA 28 — PRODUZIONE, OPERATIONS, QUALITÀ, LEAN, SUPPLY CHAIN
       Codice Area: OPS
       10 DOMANDE
       ============================================================ */

    {
        id: "OPS_01",
        area: "Operations",
        peso: 1.5,
        testo: "L’azienda utilizza sistemi strutturati per programmare la produzione (MRP, ERP)?",
        opzioni: [
            "Nessun sistema",
            "Foglio Excel",
            "Software base",
            "MRP/ERP parziale",
            "MRP/ERP completo e integrato"
        ],
        filtri: { settore: "industria|produzione|logistica" }
    },

    {
        id: "OPS_02",
        area: "Qualità",
        peso: 1.4,
        testo: "Sono presenti certificazioni di qualità (ISO 9001, 14001, ecc.)?",
        opzioni: [
            "Nessuna",
            "In valutazione",
            "In implementazione",
            "Certificazioni base",
            "Certificazioni avanzate"
        ],
        filtri: { settore: "industria|produzione" }
    },

    {
        id: "OPS_03",
        area: "Produzione",
        peso: 1.3,
        testo: "È presente una gestione documentata dei processi produttivi?",
        opzioni: [
            "Nessuna documentazione",
            "Minimale",
            "Parziale",
            "Completa",
            "Monitorata e continuamente migliorata"
        ],
        filtri: { settore: "industria|artigianato|produzione" }
    },

    {
        id: "OPS_04",
        area: "Lean",
        peso: 1.2,
        testo: "Sono applicati principi Lean (5S, Kaizen, Kanban, riduzione sprechi)?",
        opzioni: [
            "Mai",
            "Occasionalmente",
            "In alcuni reparti",
            "Diffusi a livello aziendale",
            "Maturità Lean elevata"
        ],
        filtri: { settore: "industria|produzione" }
    },

    {
        id: "OPS_05",
        area: "Supply Chain",
        peso: 1.4,
        testo: "Qual è il livello di integrazione con fornitori e partner logistici?",
        opzioni: [
            "Nessuna",
            "Debole",
            "Media",
            "Buona",
            "Molto elevata"
        ],
        filtri: { settore: "industria|commercio|logistica" }
    },

    {
        id: "OPS_06",
        area: "Produzione",
        peso: 1.5,
        testo: "L’azienda monitora KPI produttivi (OEE, scarti, downtime, lead time)?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In real-time con dashboard"
        ],
        filtri: { settore: "industria|produzione" }
    },

    {
        id: "OPS_07",
        area: "Qualità",
        peso: 1.3,
        testo: "Il controllo qualità è svolto in ogni fase del ciclo produttivo?",
        opzioni: [
            "Nessun controllo",
            "Alla fine del processo",
            "Campionario",
            "A livello di reparto",
            "Integrato in ogni fase"
        ],
        filtri: { settore: "industria|artigianato|alimentare" }
    },

    {
        id: "OPS_08",
        area: "Operations",
        peso: 1.4,
        testo: "Esistono piani di manutenzione programmata o predittiva per i macchinari?",
        opzioni: [
            "Mai",
            "Minimale",
            "Base",
            "Programmato",
            "Avanzato (IoT / predittivo)"
        ],
        filtri: { settore: "industria|produzione|logistica" }
    },

    {
        id: "OPS_09",
        area: "Supply Chain",
        peso: 1.3,
        testo: "La supply chain è resistente a interruzioni (fornitori multipli, scorte, alternative)?",
        opzioni: [
            "Molto fragile",
            "Fragile",
            "Media robustezza",
            "Buona",
            "Molto robusta"
        ],
        filtri: { settore: "industria|commercio|logistica" }
    },

    {
        id: "OPS_10",
        area: "Lean",
        peso: 1.2,
        testo: "L’azienda ha processi continui per ridurre scarti, difetti e rilavorazioni?",
        opzioni: [
            "No",
            "Poco",
            "Parzialmente",
            "Molto",
            "Integralmente"
        ],
        filtri: { settore: "industria|produzione|artigianato" }
    },
    /* ============================================================
       AREA 29 — COMMERCIALE, VENDITE, CRM, MARKETING, CLIENTI
       Codice Area: COM
       10 DOMANDE
       ============================================================ */

    {
        id: "COM_01",
        area: "Commerciale",
        peso: 1.4,
        testo: "Quanto è strutturato il processo commerciale (prospezione → offerta → chiusura)?",
        opzioni: [
            "Assente",
            "Molto informale",
            "Base",
            "Strutturato",
            "Molto strutturato e monitorato"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "COM_02",
        area: "Vendite",
        peso: 1.5,
        testo: "L’azienda utilizza un CRM per tracciare clienti, opportunità e conversioni?",
        opzioni: [
            "Mai",
            "Raramente",
            "Parzialmente",
            "Regolarmente",
            "CRM avanzato e integrato"
        ],
        filtri: { settore: "servizi|commercio|tecnologia|industria" }
    },

    {
        id: "COM_03",
        area: "Marketing",
        peso: 1.3,
        testo: "Quanto è strutturata la strategia di marketing digitale?",
        opzioni: [
            "Assente",
            "Occasionale",
            "Base",
            "Completa",
            "Molto avanzata"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "COM_04",
        area: "Customer Management",
        peso: 1.5,
        testo: "Viene monitorata la soddisfazione dei clienti (NPS, survey, recensioni)?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In modo automatico e sistemico"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "COM_05",
        area: "Commerciale",
        peso: 1.2,
        testo: "Esiste un piano commerciale annuale con obiettivi chiari?",
        opzioni: [
            "No",
            "Molto vago",
            "Sì ma non formalizzato",
            "Documentato",
            "Documentato + KPI mensili"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "COM_06",
        area: "Vendite",
        peso: 1.3,
        testo: "Quanto è stabile e prevedibile il flusso di nuovi clienti?",
        opzioni: [
            "Totalmente imprevedibile",
            "Molto variabile",
            "Moderatamente stabile",
            "Prevedibile",
            "Molto costante e stabile"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "COM_07",
        area: "Marketing",
        peso: 1.4,
        testo: "L’azienda utilizza canali di marketing diversificati?",
        opzioni: [
            "Nessuno",
            "1 canale",
            "2–3 canali",
            "Diversificazione ampia",
            "Marketing multicanale integrato"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "COM_08",
        area: "Customer Management",
        peso: 1.3,
        testo: "Esistono procedure strutturate per gestire reclami e assistenza clienti?",
        opzioni: [
            "No",
            "Molto deboli",
            "Base",
            "Buone",
            "Molto avanzate"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "COM_09",
        area: "Commerciale",
        peso: 1.2,
        testo: "Quanto è efficiente il ciclo di vendita (tempo tra prima interazione e chiusura)?",
        opzioni: [
            "Molto lento",
            "Lento",
            "Nella media",
            "Rapido",
            "Molto rapido e ottimizzato"
        ],
        filtri: { settore: "tutti" }
    },

    {
        id: "COM_10",
        area: "Vendite",
        peso: 1.4,
        testo: "L’azienda forma e aggiorna regolarmente la rete commerciale?",
        opzioni: [
            "Mai",
            "Raramente",
            "A volte",
            "Regolarmente",
            "In modo costante e strutturato"
        ],
        filtri: { settore: "tutti" }

    }
]; // ← chiusura array domande_full

// Esportazione globale (compatibile browser standalone)
window.DOMANDE_FULL = DOMANDE_FULL;

console.log("✔ DOMANDE_FULL caricato correttamente. Totale domande:", DOMANDE_FULL.length);
