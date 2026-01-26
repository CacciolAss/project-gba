// Configurazione famiglie e pesi prodotti - VERSIONE BASE
// Tutto modificabile in futuro senza toccare il resto dell'app

const PRODOTTI_CONFIG = {
    famiglie: {
        danni_beni: {
            id: "danni_beni",
            nome: "Danni & Beni",
            pesoBase: 0.75
        },
        rc_azienda: {
            id: "rc_azienda",
            nome: "Responsabilità Civile Attività",
            pesoBase: 1.0
        },
        persone: {
            id: "persone",
            nome: "Persone & Welfare",
            pesoBase: 0.8
        },
        cyber: {
            id: "cyber",
            nome: "Cyber & Protezione Dati",
            pesoBase: 0.9
        },
        legale: {
            id: "legale",
            nome: "Tutela Legale",
            pesoBase: 0.8
        },
        trasporti: {
            id: "trasporti",
            nome: "Trasporti / Merci",
            pesoBase: 0.75
        },
        credito: {
            id: "credito",
            nome: "Credito Commerciale",
            pesoBase: 0.85
        },
        vita_soci: {
            id: "vita_soci",
            nome: "Vita / Soci / Continuità",
            pesoBase: 0.95
        }
    },

    // Mappa i value dei checkbox alle famiglie sopra
    mappaPolizze: {
        incendio: "danni_beni",
        rcg: "rc_azienda",
        infortuni_titolare: "persone",
        keyman: "vita_soci",
        vita_tcm: "vita_soci",
        sanitaria: "persone",
        cyber: "cyber",
        tutela_legale: "legale",
        trasporti: "trasporti",
        credito: "credito"
    }
};
