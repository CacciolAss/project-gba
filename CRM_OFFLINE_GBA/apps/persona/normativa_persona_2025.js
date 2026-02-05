// normativa_persona_2025.js (aggiornato ai valori INPS 2026)
// Parametri basati su Circolare INPS n. 153/2025 (valori 2026)

const NORMATIVA_PERSONA_2025 = {
  meta: {
    annoRiferimento: 2026,
    note: "Dati INPS 2026 (Circolare 153/2025). Invalidità civile: €340,71/mese. Accompagnamento: €552,57/mese."
  },

  categorieLavoratore: ["dipendente_privato", "autonomo", "imprenditore", "pensionato"],

  morte: {
    targetMultiploReddito: 10,

    coperturaAnnuaStimata: {
      dipendente_privato: {
        quotaSuperstitiPensione: 0.60,
        anniEquivalenti: 5,
        note: "Reversibilità INPS: 60% pensione coniuge + quota figli. Copertura limitata nel tempo."
      },
      autonomo: {
        quotaSuperstitiPensione: 0.50,
        anniEquivalenti: 3,
        note: "Reversibilità ridotta per carriere contributive discontinue."
      },
      imprenditore: {
        quotaSuperstitiPensione: 0.40,
        anniEquivalenti: 2,
        note: "Copertura minima per versamenti contributivi spesso discontinui."
      },
      pensionato: {
        quotaSuperstitiPensione: 0.60,
        anniEquivalenti: 10,
        note: "Reversibilità su pensione in corso, ma erodibile dal tempo."
      }
    }
  },

  invalidita: {
    // INPS 2026 - Invalidità civile totale (limite reddito €20.029,55)
    baseInvaliditaCivile: {
      importoMensile: 340.71,
      importoAnnuale: 340.71 * 13, // 13 mensilità
      limiteReddito: 20029.55,
      note: "Invalidità civile totale (100%) - INPS 2026. Solo se reddito sotto limite."
    },
    
    // INPS 2026 - Indennità di accompagnamento (invalidi totali + ciechi)
    assegnoAccompagnamento: {
      invalidiTotali: {
        importoMensile: 552.57,
        importoAnnuale: 552.57 * 13,
        note: "Per invalidi totali che non compiono atti di vita quotidiana. Senza limiti di reddito."
      },
      ciechiAssoluti: {
        importoMensile: 1064.98,
        importoAnnuale: 1064.98 * 13,
        note: "Ciechi civili assoluti (riferimento)."
      }
    },

    // Stima prudenziale per invalidità previdenziale (non esistono coefficienti fissi INPS, dipendono dagli anni)
    coeffSostituzioneReddito: {
      dipendente_privato: 0.50,   // Stima media su AOI + integrazioni
      autonomo: 0.30,             // Stima prudenziale (INPS calcola su contributi effettivi)
      imprenditore: 0.20,
      pensionato: 0.60
    },

    targetQuotaReddito: 0.70
  },

  // Contributi INPS 2026 (Circolare 153/2025)
  contributiPrevidenza: {
    dipendente_privato: 0.0919,   // 9,19% dipendente
    autonomo: 0.24,               // 24% artigiani (minimo €4.460,64 annuo)
    imprenditore: 0.2448,         // 24,48% commercianti (minimo €4.549,70 annuo)
    minimoArtigiano: 4460.64,
    minimoCommerciante: 4549.70,
    note: "Aliquote effettive 2026. Per autonomi calcolo su reddito d'impresa (non lordo)."
  },

  ltc: {
    costoMensileRSA: 2500,
    mesi: 12,
    coperturaPubblicaMensileStimata: 800,
    note: "Costi RSA 2026 stazionari rispetto al 2025. Contributi pubblici variabili per regione."
  },

  pensione: {
    targetQuotaReddito: 0.80,
    coeffSostituzioneStato: {
      dipendente_privato: 0.60,
      autonomo: 0.45,
      imprenditore: 0.35,
      pensionato: 1.00
    }
  },

  infortunio: {
    coperturaLavorativa: {
      dipendente_privato: {
        quotaRetribuzione: 0.60,
        note: "INAIL: rendita inabilità permanente + indennità temporanea."
      },
      autonomo: {
        quotaRetribuzione: 0.30,
        note: "INAIL solo se aderente alla gestione separata infortuni (opzionale)."
      },
      imprenditore: {
        quotaRetribuzione: 0.30,
        note: "Come autonomo."
      },
      pensionato: {
        quotaRetribuzione: 0.10,
        note: "Rendite ridotte, focus su assistenza."
      }
    }
  }
};

if (typeof window !== "undefined") {
  window.NORMATIVA_PERSONA_2025 = NORMATIVA_PERSONA_2025;
}
