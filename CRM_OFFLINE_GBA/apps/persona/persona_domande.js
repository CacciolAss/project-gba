// persona_domande.js
// Questionario Metodo Rosso - Persona
// Tutte le domande strutturate per aree + sezioni A/B/C

(function () {
    "use strict";

    const questionsPersona = [
        /* =========================
           SEZIONE A – PROTEZIONE
        ========================== */

        {
            id: "A1",
            section: "A",
            area: "protezione",
            text: "Quanto ti senti complessivamente tranquillo rispetto alla tua protezione economica in caso di imprevisti importanti (infortunio, perdita della capacità lavorativa, malattia)?",
            options: [
                { value: 1, label: "Per nulla protetto" },
                { value: 2, label: "Poco protetto" },
                { value: 3, label: "Abbastanza protetto" },
                { value: 4, label: "Molto protetto" },
                { value: 5, label: "Totalmente protetto" }
            ]
        },

        {
            id: "A2",
            section: "A",
            area: "protezione",
            text: "Se domani il tuo reddito sparisse, per quanto tempo la tua famiglia riuscirebbe a mantenere lo stesso tenore di vita?",
            options: [
                { value: 1, label: "Meno di 3 mesi" },
                { value: 2, label: "3-6 mesi" },
                { value: 3, label: "6-12 mesi" },
                { value: 4, label: "1-2 anni" },
                { value: 5, label: "Oltre 2 anni" }
            ]
        },

        {
            id: "A3",
            section: "A",
            area: "protezione",
            text: "Quanto è importante per te garantire stabilità economica ai tuoi familiari, qualunque cosa ti succeda?",
            options: [
                { value: 1, label: "Poco importante" },
                { value: 2, label: "Abbastanza importante" },
                { value: 3, label: "Importante" },
                { value: 4, label: "Molto importante" },
                { value: 5, label: "Assolutamente prioritario" }
            ]
        },

        {
            id: "A4",
            section: "A",
            area: "protezione",
            text: "Come valuti la capacità del Servizio Sanitario Nazionale di coprire eventuali spese sanitarie importanti?",
            options: [
                { value: 1, label: "Molto insufficiente" },
                { value: 2, label: "Insufficiente" },
                { value: 3, label: "Adeguata" },
                { value: 4, label: "Buona" },
                { value: 5, label: "Molto buona" }
            ]
        },

                {
            id: "A5",
            section: "A",
            area: "protezione",
            text: "Quanto senti di aver pianificato in modo consapevole la protezione del tuo nucleo familiare?",
            options: [
                { value: 1, label: "Per nulla, vado a braccio" },
                { value: 2, label: "Poco, qualche idea ma nulla di strutturato" },
                { value: 3, label: "Abbastanza, qualcosa ho impostato" },
                { value: 4, label: "Molto, ho fatto scelte precise" },
                { value: 5, label: "Completamente, tutto pianificato nel dettaglio" }
            ],

            // V2: domanda non prioritaria per single under 30
            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster) {
                    // fallback prudenziale: se non ho contesto, non buco la domanda
                    return true;
                }

                const eta = contesto.cluster.etaCluster;
                const stato = contesto.cluster.statoFamiliare;

                // Single under30 → la togliamo per snellire il flusso
                if (eta === "under30" && stato === "single") {
                    return false;
                }

                // Tutti gli altri profili la vedono normalmente
                return true;
            }
        },


        {
    id: "A6",
    section: "A",
    area: "protezione",
    text: "Se hai figli, quanto ritieni importante tutelarli con coperture specifiche a loro nome (es. infortuni, sanitarie, ecc.)?",
    options: [
        { value: 1, label: "Non applicabile / Non ho figli" },
        { value: 2, label: "Poco importante" },
        { value: 3, label: "Abbastanza importante" },
        { value: 4, label: "Molto importante" },
        { value: 5, label: "Assolutamente prioritario" }
    ],

    // 🔹 V2: visibile solo per profili con figli
    segmentiTarget: ["ha_figli", "stato_famiglia_con_figli"],

    visibileSe: (contesto, _answers) => {
        if (!contesto || !contesto.flag) return false;

        // Usiamo il flag derivato dall’anagrafica
        return contesto.flag.haFigli === true;
    }
},


        /* =========================
           SEZIONE B – REDDITO & STILE DI VITA
        ========================== */

                {
            id: "B1",
            section: "B",
            area: "reddito_stile_vita",
            text: "Se per un periodo non potessi lavorare (malattia, infortunio, ecc.), di quanto si ridurrebbe il reddito familiare mensile complessivo?",
            options: [
                { value: 1, label: "Nessuna riduzione" },
                { value: 2, label: "Riduzione fino al 25%" },
                { value: 3, label: "Riduzione tra il 25% e il 50%" },
                { value: 4, label: "Riduzione tra il 50% e il 75%" },
                { value: 5, label: "Riduzione oltre il 75%" }
            ],

            // V2: domanda di rischio reddito da lavoro,
            // inutile per i pensionati
            segmentiTarget: [
                "lavoro_dipendente",
                "lavoro_autonomo",
                "lavoro_imprenditore",
                "lavoro_altro"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster) return true;

                const lavoroCluster = contesto.cluster.lavoroCluster;
                // Nascondi per i pensionati
                if (lavoroCluster === "pensionato") {
                    return false;
                }

                return true;
            }
        },


                {
            id: "B2",
            section: "B",
            area: "reddito_stile_vita",
            text: "In caso di perdita totale del tuo reddito da lavoro, per quanti mesi riusciresti a mantenere invariato il tenore di vita familiare (utilizzando solo risparmi e patrimonio liquido)?",
            options: [
                { value: 1, label: "Meno di 1 mese" },
                { value: 2, label: "Da 1 a 3 mesi" },
                { value: 3, label: "Da 3 a 6 mesi" },
                { value: 4, label: "Da 6 a 12 mesi" },
                { value: 5, label: "Oltre 12 mesi" }
            ],

            // V2: domanda di resilienza al rischio reddito da lavoro,
            // irrilevante per chi è già pensionato
            segmentiTarget: [
                "lavoro_dipendente",
                "lavoro_autonomo",
                "lavoro_imprenditore",
                "lavoro_altro"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster) return true;

                const lavoroCluster = contesto.cluster.lavoroCluster;
                // Nascondi per i pensionati
                if (lavoroCluster === "pensionato") {
                    return false;
                }

                return true;
            }
        },


                {
            id: "B3",
            section: "B",
            area: "reddito_stile_vita",
            text: "Se smettessi di lavorare, per quanto tempo potresti coprire le spese essenziali con i risparmi disponibili oggi?",
            options: [
                { value: 1, label: "Meno di 1 mese" },
                { value: 2, label: "1-3 mesi" },
                { value: 3, label: "3-6 mesi" },
                { value: 4, label: "6-12 mesi" },
                { value: 5, label: "Più di 12 mesi" }
            ],

            // V2: domanda di resilienza al rischio reddito da lavoro,
            // NON rilevante per chi è già pensionato
            segmentiTarget: [
                "lavoro_dipendente",
                "lavoro_autonomo",
                "lavoro_imprenditore",
                "lavoro_altro"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster) return true;

                const lavoroCluster = contesto.cluster.lavoroCluster;
                // Se è pensionato, saltiamo la domanda
                if (lavoroCluster === "pensionato") {
                    return false;
                }

                return true;
            }
        },


        {
    id: "B4",
    section: "B",
    area: "reddito_stile_vita",
    text: "Quanto peso hanno le spese per tempo libero, viaggi, hobby rispetto al tuo budget complessivo?",
    options: [
        { value: 1, label: "Quasi nulle" },
        { value: 2, label: "Limitate" },
        { value: 3, label: "Bilanciate" },
        { value: 4, label: "Piuttosto elevate" },
        { value: 5, label: "Molto elevate, prioritarie" }
    ],

    // V2: domanda non rilevante per single under 30
    segmentiTarget: [
        "eta_30-45",
        "eta_46-60",
        "eta_over60",
        "stato_coppia_senza_figli",
        "stato_famiglia_con_figli"
    ],

    visibileSe: (contesto, _answers) => {
        if (!contesto || !contesto.cluster) return true;

        const eta = contesto.cluster.etaCluster;
        const stato = contesto.cluster.statoFamiliare;

        // Se single + under30 → la togliamo
        if (eta === "under30" && stato === "single") {
            return false;
        }

        return true;
    }
},


        {
    id: "B5",
    section: "B",
    area: "reddito_stile_vita",
    text: "Quanto ti esponi ad attività fisicamente rischiose (sport, lavoro manuale, attività pericolose)?",
    options: [
        { value: 1, label: "Per nulla" },
        { value: 2, label: "Raramente" },
        { value: 3, label: "Occasionalmente" },
        { value: 4, label: "Spesso" },
        { value: 5, label: "Molto spesso / in modo intenso" }
    ],
    // Target: tutti i profili NON pensionati
    segmentiTarget: [
        "lavoro_dipendente",
        "lavoro_autonomo",
        "lavoro_imprenditore",
        "lavoro_altro"
    ]
},


        {
            id: "B6",
            section: "B",
            area: "psicografico",
            text: "Come descriveresti la tua propensione al rischio negli investimenti?",
            options: [
                { value: 1, label: "Molto prudente" },
                { value: 2, label: "Piuttosto prudente" },
                { value: 3, label: "Equilibrata" },
                { value: 4, label: "Dinamica" },
                { value: 5, label: "Aggressiva / orientata al rischio" }
            ]
        },

        {
            id: "B7",
            section: "B",
            area: "psicografico",
            text: "Quanto ti senti supportato da familiari o rete sociale in caso di difficoltà economica?",
            options: [
                { value: 1, label: "Per nulla" },
                { value: 2, label: "Poco" },
                { value: 3, label: "Abbastanza" },
                { value: 4, label: "Molto" },
                { value: 5, label: "Totalmente, posso contare molto su di loro" }
            ]
        },

                {
            id: "B8",
            section: "B",
            area: "reddito_stile_vita",
            text: "Quanto consideri rischioso, fisicamente o economicamente, il tuo lavoro attuale?",
            options: [
                { value: 1, label: "Per nulla rischioso" },
                { value: 2, label: "Poco rischioso" },
                { value: 3, label: "Moderatamente rischioso" },
                { value: 4, label: "Abbastanza rischioso" },
                { value: 5, label: "Molto rischioso" }
            ],

            // V2: domanda rilevante solo per chi ha ancora un lavoro attivo
            // (tutti tranne i pensionati)
            segmentiTarget: [
                "lavoro_dipendente",
                "lavoro_autonomo",
                "lavoro_imprenditore",
                "lavoro_altro"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster) return true;

                const lavoroCluster = contesto.cluster.lavoroCluster;
                // Nascondi per i pensionati
                if (lavoroCluster === "pensionato") {
                    return false;
                }

                return true;
            }
        },


        /* =========================
           SEZIONE C – FUTURO, PREVIDENZA & INVESTIMENTI
        ========================== */

        {
            id: "C1",
            section: "C",
            area: "previdenza",
            text: "Quanto hai già riflettuto e agito sulla costruzione di una previdenza complementare/integrativa?",
            options: [
                { value: 1, label: "Non ci ho mai pensato" },
                { value: 2, label: "Ne ho parlato ma non ho fatto nulla" },
                { value: 3, label: "Sto valutando qualche soluzione" },
                { value: 4, label: "Ho già iniziato a versare qualcosa" },
                { value: 5, label: "Ho una strategia strutturata e contributi significativi" }
            ]
        },

                {
            id: "C2",
            section: "C",
            area: "previdenza",
            text: "Come ti aspetti evolverà il tuo reddito nei prossimi 10-15 anni?",
            options: [
                { value: 1, label: "Probabile diminuzione" },
                { value: 2, label: "Leggera diminuzione" },
                { value: 3, label: "Stabile" },
                { value: 4, label: "In crescita" },
                { value: 5, label: "In forte crescita" }
            ],

            // V2: domanda rilevante per chi è ancora in fase lavorativa,
            // non per i pensionati.
            segmentiTarget: [
                "lavoro_dipendente",
                "lavoro_autonomo",
                "lavoro_imprenditore",
                "lavoro_altro"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster) return true;

                const lavoroCluster = contesto.cluster.lavoroCluster;

                // Se è pensionato, saltiamo la domanda
                if (lavoroCluster === "pensionato") {
                    return false;
                }

                return true;
            }
        },


                {
            id: "C3",
            section: "C",
            area: "previdenza",
            text: "Quanto ti senti preparato rispetto al tema pensione (tempi, importi futuri, gap rispetto al reddito attuale)?",
            options: [
                { value: 1, label: "Per nulla, è tutto confuso" },
                { value: 2, label: "Poco, ho solo qualche informazione" },
                { value: 3, label: "Abbastanza, ho un’idea generale" },
                { value: 4, label: "Molto, conosco più o meno numeri e tempi" },
                { value: 5, label: "Completamente, ho simulazioni e piani chiari" }
            ],

            // V2: domanda di consapevolezza previdenziale,
            // ha senso soprattutto dai 30 anni in su.
            segmentiTarget: [
                "eta_30-45",
                "eta_46-60",
                "eta_over60"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster) return true;

                const etaCluster = contesto.cluster.etaCluster;

                // Se under 30, la saltiamo per pulire il questionario
                if (etaCluster === "under30") {
                    return false;
                }

                return true;
            }
        },


                {
            id: "C4",
            section: "C",
            area: "previdenza",
            text: "Quanto senti di avere obiettivi chiari per il tuo futuro finanziario (pensione, progetti, eredità)?",
            options: [
                { value: 1, label: "Per nulla chiari" },
                { value: 2, label: "Poco chiari" },
                { value: 3, label: "Abbastanza chiari" },
                { value: 4, label: "Chiari" },
                { value: 5, label: "Molto chiari e definiti" }
            ],

            // V2: domanda non prioritaria per single under 30
            segmentiTarget: [
                "eta_30-45",
                "eta_46-60",
                "eta_over60",
                "stato_coppia_senza_figli",
                "stato_famiglia_con_figli"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster) return true;

                const eta = contesto.cluster.etaCluster;
                const stato = contesto.cluster.statoFamiliare;

                // Single under30: saltiamo la domanda per snellire il flusso
                if (eta === "under30" && stato === "single") {
                    return false;
                }

                return true;
            }
        },


                {
            id: "C5",
            section: "C",
            area: "investimenti",
            text: "Quanto ti senti competente sui principali strumenti finanziari (fondi, polizze, piani di accumulo, ecc.)?",
            options: [
                { value: 1, label: "Per nulla competente" },
                { value: 2, label: "Poco competente" },
                { value: 3, label: "Conoscenza base" },
                { value: 4, label: "Abbastanza competente" },
                { value: 5, label: "Molto competente / esperto" }
            ],

            // V2: domanda di competenza finanziaria
            // Ha senso praticamente per tutti, tranne pensionato senza patrimonio.
            segmentiTarget: [
                "lavoro_dipendente",
                "lavoro_autonomo",
                "lavoro_imprenditore",
                "lavoro_pensionato"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.cluster || !contesto.flag) {
                    // fallback prudenziale: se il contesto non è disponibile,
                    // mostriamo comunque la domanda per non bucare il flusso
                    return true;
                }

                const lavoroCluster = contesto.cluster.lavoroCluster;
                const haPatrimonio = contesto.flag.haPatrimonioFinanziario === true;

                // Caso specifico: pensionato SENZA patrimonio finanziario
                // → la domanda sulla "competenza strumenti" è a marginalità bassa: la saltiamo.
                if (lavoroCluster === "pensionato" && !haPatrimonio) {
                    return false;
                }

                // In tutti gli altri casi la domanda resta attiva
                return true;
            }
        },


                {
            id: "C6",
            section: "C",
            area: "previdenza",
            text: "Quanto è importante per te lasciare un patrimonio (es. casa, risparmi, capitali) ai tuoi eredi/figli?",
            options: [
                { value: 1, label: "Per nulla importante" },
                { value: 2, label: "Poco importante" },
                { value: 3, label: "Abbastanza importante" },
                { value: 4, label: "Molto importante" },
                { value: 5, label: "Assolutamente prioritario" }
            ],

            // V2: domanda di eredità/trasferimento, sensata solo
            // se esistono figli / eredi diretti in prospettiva.
            segmentiTarget: [
                "ha_figli",
                "stato_famiglia_con_figli",
                "profilo_F1_famiglia_figli_attivi",
                "profilo_F2_famiglia_figli_grandi"
            ],

            visibileSe: (contesto, _answers) => {
                if (!contesto || !contesto.flag) return false;

                // Se ha figli → domanda rilevante
                if (contesto.flag.haFigli === true) {
                    return true;
                }

                // In futuro potresti estendere con altri flag (es. haNipoti, ecc.)
                return false;
            }
        },


        {
            id: "C7",
            section: "C",
            area: "investimenti",
            text: "Quanto ti senti propenso a investire una parte del tuo patrimonio in strumenti con un po’ di rischio per ottenere rendimenti migliori nel lungo periodo?",
            options: [
                { value: 1, label: "Per nulla propenso" },
                { value: 2, label: "Poco propenso" },
                { value: 3, label: "Moderatamente propenso" },
                { value: 4, label: "Abbastanza propenso" },
                { value: 5, label: "Molto propenso" }
            ]
        },

        {
            id: "C8",
            section: "C",
            area: "indebitamento",
            text: "Come valuti oggi il peso complessivo dei tuoi debiti (mutui, prestiti, finanziamenti) rispetto alla tua capacità di rimborso?",
            options: [
                { value: 1, label: "Molto pesanti, difficili da sostenere" },
                { value: 2, label: "Abbastanza pesanti" },
                { value: 3, label: "Gestibili" },
                { value: 4, label: "Leggeri" },
                { value: 5, label: "Praticamente inesistenti" }
            ]
        }
        ];

    /**
     * Decoratore domande Persona – V2 ready
     * - garantisce sempre:
     *   - area valorizzata
     *   - segmentiTarget come array
     *   - visibileSe come funzione
     */
    function decorateQuestionsPersona(list) {
        if (!Array.isArray(list)) {
            console.error("questionsPersona non è un array valido:", list);
            return [];
        }

        const defaultVisibileSe = function (_contestoPersona, _answers) {
            // Default V1: tutte le domande sono visibili
            return true;
        };

        return list.map((q) => {
            q = q || {};

            return {
                // Copia shallow degli attributi esistenti
                ...q,
                // Normalizzazioni di base
                section: q.section || null,
                area: q.area || "generale",
                // Nuovi campi V2
                segmentiTarget: Array.isArray(q.segmentiTarget)
                    ? q.segmentiTarget.slice()
                    : [],
                visibileSe: typeof q.visibileSe === "function"
                    ? q.visibileSe
                    : defaultVisibileSe
            };
        });
    }

    const questionsPersonaV2 = decorateQuestionsPersona(questionsPersona);

    // Espone nel browser (compatibilità V1 + hook V2)
    if (typeof window !== "undefined") {
        // V1: il resto dell’app continua a usare questo
        window.questionsPersona = questionsPersonaV2;
        // V2: alias esplicito per futura evoluzione
        window.questionsPersonaV2 = questionsPersonaV2;
    }
})();

