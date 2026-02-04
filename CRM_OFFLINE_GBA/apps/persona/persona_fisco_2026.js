// persona_fisco_2026.js
// Modulo calcolo fiscale completo per sistema Persona (Generali Business Advisor)
// Anno 2026 - IRPEF, addizionali regionali e comunali

const FISCO_2026 = {
  meta: {
    anno: 2026,
    versione: '1.0.0',
    note: 'Calcolo netto da lordo con IRPEF 2026, addizionali regionali e comunali'
  },

  // IRPEF NAZIONALE 2026 (Scaglioni aggiornati)
  irpef: {
    scaglioni: [
      { finoA: 15000, aliquota: 0.23, descrizione: 'Fino a €15.000' },
      { finoA: 28000, aliquota: 0.25, descrizione: 'Oltre €15.000 fino a €28.000' },
      { finoA: 50000, aliquota: 0.35, descrizione: 'Oltre €28.000 fino a €50.000' },
      { finoA: Infinity, aliquota: 0.43, descrizione: 'Oltre €50.000' }
    ],
    
    // Contributi previdenziali medi per categoria
    contributiPrevidenza: {
      dipendente_privato: 0.0919,
      autonomo: 0.2598,
      imprenditore: 0.2598,
      pensionato: 0.0919
    }
  },

  // Addizionali regionali (tutte le 20 regioni)
  addizionaleRegionale: {
    abruzzo: [{ finoA: Infinity, aliquota: 0.0173 }],
    basilicata: [{ finoA: Infinity, aliquota: 0.0195 }],
    calabria: [{ finoA: Infinity, aliquota: 0.0195 }],
    campania: [{ finoA: Infinity, aliquota: 0.0195 }],
    'emilia-romagna': [{ finoA: Infinity, aliquota: 0.0123 }],
    'friuli-venezia-giulia': [{ finoA: Infinity, aliquota: 0.0123 }],
    lazio: [{ finoA: Infinity, aliquota: 0.0195 }],
    liguria: [{ finoA: Infinity, aliquota: 0.0123 }],
    lombardia: [{ finoA: Infinity, aliquota: 0.0123 }],
    marche: [{ finoA: Infinity, aliquota: 0.0195 }],
    molise: [{ finoA: Infinity, aliquota: 0.0195 }],
    piemonte: [{ finoA: Infinity, aliquota: 0.0173 }],
    puglia: [{ finoA: Infinity, aliquota: 0.0195 }],
    sardegna: [{ finoA: Infinity, aliquota: 0.0195 }],
    sicilia: [{ finoA: Infinity, aliquota: 0.0195 }],
    toscana: [{ finoA: Infinity, aliquota: 0.0195 }],
    'trentino-alto-adige': [{ finoA: Infinity, aliquota: 0.0123 }],
    umbria: [{ finoA: Infinity, aliquota: 0.0195 }],
    'valle-d-aosta': [{ finoA: Infinity, aliquota: 0.0195 }],
    veneto: [{ finoA: Infinity, aliquota: 0.0123 }]
  },

  // Addizionali comunali (principali città)
  addizionaleComunale: {
    roma: 0.009, milano: 0.008, napoli: 0.008, torino: 0.008,
    palermo: 0.008, genova: 0.008, bologna: 0.008, firenze: 0.008,
    bari: 0.008, catania: 0.008, venezia: 0.008, verona: 0.008,
    padova: 0.008, trieste: 0.008, default: 0.008
  },

  calcolaIrpefLorda(reddito) {
    if (reddito <= 0) return 0;
    let imposta = 0, precedente = 0;
    for (const s of this.irpef.scaglioni) {
      if (reddito > precedente) {
        const imp = Math.min(reddito, s.finoA) - precedente;
        if (imp > 0) imposta += imp * s.aliquota;
        precedente = s.finoA;
      }
      if (reddito <= s.finoA) break;
    }
    return Math.round(imposta);
  },

  calcolaAddizionaleRegionale(reddito, regione) {
    if (reddito <= 0) return 0;
    const key = regione?.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '') || 'lombardia';
    const scaglioni = this.addizionaleRegionale[key] || this.addizionaleRegionale.lombardia;
    let imposta = 0, precedente = 0;
    for (const s of scaglioni) {
      if (reddito > precedente) {
        const imp = Math.min(reddito, s.finoA) - precedente;
        if (imp > 0) imposta += imp * s.aliquota;
        precedente = s.finoA;
      }
      if (reddito <= s.finoA) break;
    }
    return Math.round(imposta);
  },

  calcolaAddizionaleComunale(reddito, comune) {
    if (reddito <= 0) return 0;
    const key = comune?.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '') || 'default';
    const aliq = this.addizionaleComunale[key] || this.addizionaleComunale.default;
    return Math.round(reddito * aliq);
  },

  calcolaContributiPrevidenza(reddito, categoria) {
    if (reddito <= 0) return 0;
    const aliq = this.irpef.contributiPrevidenza[categoria] || this.irpef.contributiPrevidenza.dipendente_privato;
    return Math.round(reddito * aliq);
  },

  calcolaNettoDaLordo(redditoLordo, categoria = 'dipendente_privato', regione = 'lombardia', comune = 'milano') {
    if (!redditoLordo || redditoLordo <= 0) {
      return { redditoLordo: 0, redditoNetto: 0, tassazioneEffettiva: 0, dettaglio: {} };
    }

    const contributi = this.calcolaContributiPrevidenza(redditoLordo, categoria);
    const redditoImponibile = Math.max(0, redditoLordo - contributi);
    const irpefLorda = this.calcolaIrpefLorda(redditoImponibile);
    const addizionaleRegionale = this.calcolaAddizionaleRegionale(redditoImponibile, regione);
    const addizionaleComunale = this.calcolaAddizionaleComunale(redditoImponibile, comune);
    const totaleImposte = irpefLorda + addizionaleRegionale + addizionaleComunale + contributi;
    const redditoNetto = Math.max(0, redditoLordo - totaleImposte);
    const tassazioneEffettiva = redditoLordo > 0 ? ((totaleImposte / redditoLordo) * 100).toFixed(1) : 0;

    return {
      redditoLordo: Math.round(redditoLordo),
      redditoNetto: Math.round(redditoNetto),
      tassazioneEffettiva: parseFloat(tassazioneEffettiva),
      dettaglio: {
        contributiPrevidenza: contributi,
        redditoImponibile: Math.round(redditoImponibile),
        irpefLorda: irpefLorda,
        addizionaleRegionale: addizionaleRegionale,
        addizionaleComunale: addizionaleComunale,
        totaleImposte: totaleImposte
      },
      parametri: { categoria, regione, comune }
    };
  }
};

if (typeof window !== "undefined") window.FISCO_2026 = FISCO_2026;
