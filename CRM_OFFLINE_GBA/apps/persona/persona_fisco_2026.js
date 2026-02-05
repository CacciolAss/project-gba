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
/* =========================
   INTEGRAZIONE V2 - DETRAZIONI FIGLI E WRAPPER PERSONA
========================= */

// Detrazioni figli a carico 2026 (valori base per reddito medio 35-55k)
FISCO_2026.detrazioniFigli = {
  basePerFiglio: 950, // Euro annui per figlio fino a 21 anni o studente
  studenteUniversitario: 1200 // Se over 21 studente
};

/**
 * Calcola detrazioni per figli a carico
 * @param {number} numFigli - Numero figli
 * @param {boolean} studenti - Se true, usa detrazione studente universitario (over 21)
 * @returns {number} Detrazione totale annua
 */
FISCO_2026.calcolaDetrazioniFigli = function(numFigli, studenti = false) {
  if (!numFigli || numFigli <= 0) return 0;
  const detrazionePerFiglio = studenti ? this.detrazioniFigli.studenteUniversitario : this.detrazioniFigli.basePerFiglio;
  // Per reddito sopra 28k, la detrazione si riduce, qui usiamo valore medio
  return Math.round(detrazionePerFiglio * numFigli * 0.8); // 0.8 = correzione per reddito medio-alto
};

/**
 * FUNZIONE PRINCIPALE V2 - Calcolo netto completo per sistema Persona
 * Gestisce correttamente autonomi con stima costi e detrazioni figli
 * 
 * @param {number} lordo - Reddito lordo annuo
 * @param {string} tipoLavoro - 'autonomo' | 'dipendente' | 'imprenditore'
 * @param {string} regione - Nome regione
 * @param {string} comune - Nome comune  
 * @param {number} numFigli - Numero figli a carico
 * @returns {Object} Risultato completo con netto annuo e mensile
 */
FISCO_2026.calcolaNettoPersona = function(lordo, tipoLavoro = 'autonomo', regione = 'toscana', comune = 'prato', numFigli = 0) {
  // Mappatura tipo lavoro
  const categoriaMap = {
    'autonomo': 'autonomo',
    'imprenditore': 'imprenditore', 
    'dipendente': 'dipendente_privato',
    'libero_professionista': 'autonomo'
  };
  
  const categoria = categoriaMap[tipoLavoro] || 'autonomo';
  
  // Per autonomi: stima costi deducibili (INPS calcolato sul reddito d'impresa, non sul lordo)
  // Approssimazione: costi = 40% per autonomi ordinari (non forfettari)
  let redditoPerContributi = lordo;
  let contributi = 0;
  
  if (categoria === 'autonomo' || categoria === 'imprenditore') {
    // Stima reddito d'impresa (lordo - 40% costi)
    const redditoImpresa = lordo * 0.60;
    // Contributi INPS 25,98% sul reddito d'impresa (con minimo circa 3800, qui semplificato)
    contributi = Math.max(3800, redditoImpresa * 0.2598);
  } else {
    contributi = this.calcolaContributiPrevidenza(lordo, categoria);
  }
  
  // Ricalcola imponibile IRPEF (lordo - contributi)
  const imponibile = Math.max(0, lordo - contributi);
  
  // Calcolo imposte
  const irpef = this.calcolaIrpefLorda(imponibile);
  const addReg = this.calcolaAddizionaleRegionale(imponibile, regione);
  const addCom = this.calcolaAddizionaleComunale(imponibile, comune);
  
  // Detrazioni figli
  const detrazioni = this.calcolaDetrazioniFigli(numFigli);
  
  // NETTO FINALE
  const nettoAnnuo = lordo - contributi - irpef - addReg - addCom + detrazioni;
  const nettoMensile = nettoAnnuo / 12;
  
  return {
    lordo: Math.round(lordo),
    nettoAnnuo: Math.round(nettoAnnuo),
    nettoMensile: Math.round(nettoMensile),
    imponibile: Math.round(imponibile),
    contributi: Math.round(contributi),
    irpef: irpef,
    addizionaleRegionale: addReg,
    addizionaleComunale: addCom,
    detrazioniFigli: detrazioni,
    tassazioneEffettiva: ((lordo - nettoAnnuo) / lordo * 100).toFixed(1) + '%'
  };
};

if (typeof window !== "undefined") window.FISCO_2026 = FISCO_2026;
