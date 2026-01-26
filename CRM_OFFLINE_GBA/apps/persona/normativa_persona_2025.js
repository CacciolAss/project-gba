// normativa_persona_2025.js
// Parametri sintetici di modello, non consulenza legale.
// Basati su fonti INPS / INAIL 2024-2025, semplificati per uso consulenziale.

const NORMATIVA_PERSONA_2025 = {
  meta: {
    annoRiferimento: 2025,
    note: "Modello semplificato per analisi consulenziale Partner di Vita - Persona."
  },

  categorieLavoratore: ["dipendente_privato", "autonomo", "imprenditore", "pensionato"],

  morte: {
    // Target teorico di capitale "adeguato" in multipli di reddito
    targetMultiploReddito: 10,

    // Proxy di copertura statale/reversibilità (su reddito annuo)
    // Dipendente: c'è INPS + eventuale INAIL su infortunio,
    // Autonomo/Imprenditore: copertura più bassa / discontinua.
    coperturaAnnuaStimata: {
      dipendente_privato: {
        quotaSuperstitiPensione: 0.60,   // 60% della pensione del dante causa per coniuge solo :contentReference[oaicite:7]{index=7}
        anniEquivalenti: 5,              // numero anni “equivalenti” che vogliamo valorizzare nel modello
        note: "Proxy reversibilità + indennità varie per nucleo standard con coniuge."
      },
      autonomo: {
        quotaSuperstitiPensione: 0.50,
        anniEquivalenti: 3,
        note: "Copertura inferiore per carriere discontinue / contributi più bassi."
      },
      imprenditore: {
        quotaSuperstitiPensione: 0.40,
        anniEquivalenti: 2,
        note: "Assume carriere con versamenti minimi e forte dipendenza dal patrimonio."
      },
      pensionato: {
        quotaSuperstitiPensione: 0.60,
        anniEquivalenti: 10,
        note: "Reversibilità tipica su pensione già in pagamento."
      }
    }
  },

  invalidita: {
    // Invalidità grave / totale
    // Riferimento: pensione di inabilità/invalidità civile ~336 €/mese * 13 mensilità 2025 :contentReference[oaicite:8]{index=8}
    baseInvaliditaCivile: {
      importoAnnuale: 336 * 13,
      note: "Pensione di inabilità civilistica, con limiti di reddito."
    },

    // Stima di sostituzione reddito per invalidità previdenziale
    coeffSostituzioneReddito: {
      dipendente_privato: 0.50,   // AOI + eventuali integrazioni
      autonomo: 0.30,
      imprenditore: 0.20,
      pensionato: 0.60            // già in pensione: focus su taglio capacità integrativa
    },

    // Target di fabbisogno annuo (es. 70% del reddito)
    targetQuotaReddito: 0.70
  },

  ltc: {
    // Costo annuo stimato di una RSA (semplificato)
    costoMensileRSA: 2500,
    mesi: 12,

    // Copertura pubblica stimata (INPS LTC, bandi ecc.): fino a 1.800 €/mese per alcuni profili :contentReference[oaicite:9]{index=9}
    coperturaPubblicaMensileStimata: 800, // valore prudenziale medio, non massimo bando
    note: "Proxy di contributi LTC / RSA da bandi INPS e misure territoriali. Non garantita a tutti."
  },

  pensione: {
    // Target di sostituzione reddito (adeguato)
    targetQuotaReddito: 0.80,

    // Coefficienti di sostituzione stato → pensione pubblica su ultimo reddito
    coeffSostituzioneStato: {
      dipendente_privato: 0.60,   // 60% medio prudenziale
      autonomo: 0.45,             // storicamente più basso
      imprenditore: 0.35,
      pensionato: 1.00            // già in pensione, focus su erosione potere d'acquisto
    }
  },

  infortunio: {
    // Rischio infortuni sul lavoro (INAIL) vs extra-lavorativi (nessuna copertura seria)
    coperturaLavorativa: {
      dipendente_privato: {
        quotaRetribuzione: 0.60,  // rendita media su retribuzione assicurata
        note: "Proxy rendite INAIL per inabilità permanente e superstiti."
      },
      autonomo: {
        quotaRetribuzione: 0.30,
        note: "Dipende da adesione a gestioni assicurative specifiche."
      },
      imprenditore: {
        quotaRetribuzione: 0.30,
        note: "Come autonomi, con forte variabilità."
      },
      pensionato: {
        quotaRetribuzione: 0.10,
        note: "Focus su ricoveri / assistenza più che sostituzione reddito."
      }
    }
  }
};

// Espone nel browser
if (typeof window !== "undefined") {
  window.NORMATIVA_PERSONA_2025 = NORMATIVA_PERSONA_2025;
}
