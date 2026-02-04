// persona_aladdin.js
// Aladdin Core - Architettura Fil Rouge Decisionale (Versione Browser)

class AladdinCore {
    constructor(appState) {
        this.appState = appState;
        this.clientTwin = null;
        this.filRouge = null;
        this.caringPlan = null;
        this.timestamp = new Date().toISOString();
    }

    // ========================================================================
    // 1. LETTURA COMPLETA DATI
    // ========================================================================
    
    analyze() {
        console.log("🏛️ ALADDIN: Inizializzazione analisi olistica...");
        
        const anagrafica = this.appState.user.anagrafica || {};
        this.anagraficaCompleta = {
            nome: anagrafica.nome || '',
            cognome: anagrafica.cognome || '',
            codiceFiscale: anagrafica.codiceFiscale || '',
            dataNascita: anagrafica.dataNascita || '',
            luogoNascita: anagrafica.luogoNascita || '',
            eta: parseInt(anagrafica.eta) || 0,
            sesso: anagrafica.sesso || '',
            professione: anagrafica.professione || '',
            situazioneLavorativa: anagrafica.situazioneLavorativa || '',
            redditoAnnuoLordo: parseFloat(anagrafica.redditoAnnuo) || 0,
            redditoFamiliareAnnuo: parseFloat(anagrafica.redditoFamiliareAnnuo) || 0,
            numPercettoriNucleo: parseInt(anagrafica.numPercettoriReddito) || 1,
            componentiNucleo: parseInt(anagrafica.nucleoComponenti) || 1,
            patrimonioFinanziario: parseFloat(anagrafica.patrimonioFinanziario) || 0,
            figliMinorenni: parseInt(anagrafica.figliMinorenni) || 0,
            figliMaggiorenniConviventi: parseInt(anagrafica.figliMaggiorenniConviventi) || 0,
            statoCivile: anagrafica.statoCivile || 'non_specificato',
            anniContributivi: parseInt(anagrafica.anniContributiTotali) || 0,
            emailCliente: anagrafica.emailCliente || '',
            telefono: anagrafica.telefonoCliente || '',
            citta: anagrafica.citta || '',
            provincia: anagrafica.provincia || '',
            cap: anagrafica.cap || '',
            consulenteEmail: anagrafica.consulenteEmail || ''
        };

        this.polizzeRaw = this.appState.user.polizze || [];
        this.copertureV2 = this.appState.user.copertureAttive || {};
        
        this.portfolioAssicurativo = this.processaPolizze(this.polizzeRaw, this.copertureV2);
        this.risposte = this.appState.questionnaire?.answers || {};
        this.risultatiSistema = this.appState.risultati || {};
        this.datiFigli = this.calcolaDatiFigli();
        
        console.log("✅ ALADDIN: Dati acquisiti", {
            reddito: this.anagraficaCompleta.redditoAnnuoLordo,
            polizze: this.portfolioAssicurativo.totalePolizze,
            figli: this.anagraficaCompleta.figliMinorenni,
            risposte: Object.keys(this.risposte).length
        });
        
        return this;
    }

    // ========================================================================
    // 2. PROCESSAMENTO POLIZZE
    // ========================================================================
    
    processaPolizze(polizze, copertureV2) {
        const portfolio = {
            totalePolizze: polizze.length,
            premioAnnuoTotale: 0,
            coperture: {},
            gapRiscontrati: [],
            scadenzeProssime: []
        };

        const tipiCopertura = [
            'pac', 'pip', 'tfr', 'infortuni', 'sanitaria', 'casa', 
            'cat_nat', 'rc_capofamiglia', 'rc_auto_moto', 'ltc', 
            'tcm', 'invalidita', 'protezione_reddito', 'cyber'
        ];

        tipiCopertura.forEach(tipo => {
            const c = copertureV2[tipo];
            if (c && c.active) {
                const copertura = {
                    tipo: tipo,
                    compagnia: c.compagnia || 'N/D',
                    premioAnnuo: parseFloat(c.premioAnnuo) || 0,
                    scadenza: c.scadenza || null,
                    note: c.note || '',
                    attiva: true
                };

                if (tipo === 'tcm' || tipo === 'infortuni') {
                    copertura.capitaleIP = parseFloat(c.capitaleEuro) || 0;
                    copertura.capitaleDecesso = parseFloat(c.capitaleEuro) || 0;
                }
                
                if (tipo === 'invalidita') {
                    copertura.capitaleInvalidita = parseFloat(c.capitaleEuro) || 0;
                }

                if (tipo === 'protezione_reddito') {
                    copertura.diariaMensile = parseFloat(c.capitaleEuro) || 0;
                }

                portfolio.coperture[tipo] = copertura;
                portfolio.premioAnnuoTotale += copertura.premioAnnuo;

                if (c.scadenza) {
                    const scadenza = new Date(c.scadenza);
                    const mesiRimanenti = this.mesiRimanenti(scadenza);
                    if (mesiRimanenti <= 24 && mesiRimanenti > 0) {
                        portfolio.scadenzeProssime.push({
                            tipo: tipo,
                            data: c.scadenza,
                            mesiRimanenti: mesiRimanenti,
                            capitaleCoinvolto: copertura.capitaleIP || copertura.capitaleDecesso || 0
                        });
                    }
                }
            }
        });

        return portfolio;
    }

    calcolaDatiFigli() {
        const numMinorenni = this.anagraficaCompleta.figliMinorenni;
        const numMaggiorenni = this.anagraficaCompleta.figliMaggiorenniConviventi;
        
        const figli = [];
        
        for (let i = 0; i < numMinorenni; i++) {
            figli.push({ 
                id: i, 
                eta: 10,
                tipo: 'minorenne',
                anniAllaMaggiorEta: 8
            });
        }
        
        for (let i = 0; i < numMaggiorenni; i++) {
            figli.push({ 
                id: i + numMinorenni, 
                eta: 20, 
                tipo: 'maggiorenne_convivente',
                anniAllaIndipendenza: 5
            });
        }
        
        return {
            lista: figli,
            totale: numMinorenni + numMaggiorenni,
            haFigli: (numMinorenni + numMaggiorenni) > 0,
            etaMinore: numMinorenni > 0 ? 5 : null,
            tuttiMaggiorenni: numMinorenni === 0 && numMaggiorenni > 0
        };
    }

    // ========================================================================
    // 3. COSTRUZIONE CLIENT TWIN
    // ========================================================================
    
    buildClientTwin() {
        console.log("🏛️ ALADDIN: Costruzione Client Twin...");

        const redditoLordo = this.anagraficaCompleta.redditoAnnuoLordo;
const redditoFamLordo = this.anagraficaCompleta.redditoFamiliareAnnuo;

// Calcolo reddito NETTO usando il modulo fiscale 2026
const regione = this.anagraficaCompleta.provincia || 'lombardia';
const comune = this.anagraficaCompleta.citta || 'milano';
        
// Mapping categorie lavorative per FISCO_2026
const mappaCategorieFisco = {
    'dipendente': 'dipendente_privato',
    'dirigente': 'dipendente_privato',
    'autonomo': 'autonomo',
    'imprenditore': 'imprenditore',
    'pensionato': 'pensionato',
    'altro': 'dipendente_privato'
};
const categoriaRaw = this.anagraficaCompleta.situazioneLavorativa || 'dipendente';
const categoria = mappaCategorieFisco[categoriaRaw] || 'dipendente_privato';

let redditoNetto = redditoLordo;
let redditoFamNetto = redditoFamLordo;
let dettaglioFiscale = null;

if (typeof FISCO_2026 !== 'undefined') {
    const risultatoFiscale = FISCO_2026.calcolaNettoDaLordo(redditoLordo, categoria, regione, comune);
    redditoNetto = risultatoFiscale.redditoNetto;
    dettaglioFiscale = risultatoFiscale.dettaglio;
    
    // Per il reddito familiare, applico lo stesso tasso di tassazione
    const tassazioneEffettiva = risultatoFiscale.tassazioneEffettiva / 100;
    redditoFamNetto = redditoFamLordo * (1 - tassazioneEffettiva);
}

const reddito = redditoNetto; // Ora usa il netto
const redditoFam = redditoFamNetto;
        const componenti = this.anagraficaCompleta.componentiNucleo;
        
        const coperturaMorte = this.portfolioAssicurativo.coperture.tcm?.capitaleDecesso || 0;
        const coperturaInvalidita = this.portfolioAssicurativo.coperture.invalidita?.capitaleInvalidita || 0;
        const coperturaInfortuni = this.portfolioAssicurativo.coperture.infortuni?.capitaleIP || 0;
        const diariaReddito = this.portfolioAssicurativo.coperture.protezione_reddito?.diariaMensile || 0;

        const gapMorte = this.risultatiSistema.gapStatale?.morte?.gap || (reddito * 5 - coperturaMorte);
        const gapInvalidita = this.risultatiSistema.gapStatale?.invalidita?.gap || (reddito * 0.7 - coperturaInvalidita);
        
        this.clientTwin = {
            identita: {
                ...this.anagraficaCompleta,
                etaPensionabile: 67,
                anniAllaPensione: 67 - this.anagraficaCompleta.eta
            },
            
                        situazioneEconomica: {
                redditoProprio: reddito,
                redditoFamiliare: redditoFam,
                redditoPerCapite: componenti > 0 ? redditoFam / componenti : reddito,
                percentualeContributo: redditoFam > 0 ? (reddito / redditoFam) * 100 : 100,
                patrimonio: this.anagraficaCompleta.patrimonioFinanziario,
                liquiditaMensile: this.calcolaLiquiditaMensile()
            },
            
            famiglia: {
                ...this.datiFigli,
                componentiNucleo: componenti,
                numPercettori: this.anagraficaCompleta.numPercettoriNucleo,
                dipendenzaEconomica: this.calcolaDipendenzaEconomica()
            },
            
            rischioLavoro: this.calcolaRischioLavoro(),
            
            copertureAttuali: {
                morte: { capitale: coperturaMorte, sufficiente: coperturaMorte >= reddito * 3 },
                invalidita: { capitale: coperturaInvalidita, sufficiente: coperturaInvalidita >= reddito * 0.5 },
                infortuni: { capitale: coperturaInfortuni },
                reddito: { diariaMensile: diariaReddito },
                sanitaria: { attiva: !!this.portfolioAssicurativo.coperture.sanitaria },
                longTermCare: { attiva: !!this.portfolioAssicurativo.coperture.ltc }
            },
            
            gap: {
                morte: Math.max(0, gapMorte),
                invalidita: Math.max(0, gapInvalidita),
                reddito: Math.max(0, (reddito * 0.7 / 12) - diariaReddito),
                scopertureCritiche: []
            },
            
            percezioni: this.analizzaPercezioni(),
            
            statoCivile: this.anagraficaCompleta.statoCivile,
            anniContributivi: this.anagraficaCompleta.anniContributivi
        };

        this.identificaScopertureCritiche();

        console.log("✅ ALADDIN: Client Twin creato", {
            gapMorte: this.clientTwin.gap.morte,
            percezioneProtezione: this.clientTwin.percezioni.livelloProtezionePercepito
        });

        return this.clientTwin;
    }

    // ========================================================================
    // 4. ANALISI PERCEZIONI
    // ========================================================================
    
    analizzaPercezioni() {
        const r = this.risposte;
        
        const percezioneProt = parseInt(r.A1) || 3;
        
        const autonomiaMap = {1: 3, 2: 6, 3: 12, 4: 24, 5: 36};
        const mesiAutonomia = autonomiaMap[parseInt(r.A2)] || 12;
        
        const liquiditaReale = parseInt(r.B3) || 0;
        const fiduciaSSN = parseInt(r.A4) || 3;
        
        const gapCopertura = this.clientTwin?.gap.morte || 0;
        const reddito = this.anagraficaCompleta.redditoAnnuoLordo;
        
        const incongruenzaProtezione = (percezioneProt >= 4 && gapCopertura > reddito * 2);
        const contraddizioneLiquidita = (parseInt(r.A2) >= 4 && liquiditaReale < 6);
        
        return {
            livelloProtezionePercepito: percezioneProt,
            mesiAutonomiaPercepiti: mesiAutonomia,
            liquiditaRealeMesi: liquiditaReale,
            fiduciaSSN: fiduciaSSN,
            incongruenze: {
                sovrastimaProtezione: incongruenzaProtezione,
                contraddizioneLiquidita: contraddizioneLiquidita,
                ottimismoPrevidenza: (fiduciaSSN >= 4 && this.anagraficaCompleta.anniContributivi < 20)
            },
            profiloRischio: this.calcolaProfiloRischioPsicometrico(r)
        };
    }

    calcolaProfiloRischioPsicometrico(risposte) {
        const preoccupazioni = [];
        if (risposte.C1 === '1') preoccupazioni.push('decesso');
        if (risposte.C2 === '1') preoccupazioni.push('invalidita');
        if (risposte.C3 === '1') preoccupazioni.push('malattia_grave');
        if (risposte.C4 === '1') preoccupazioni.push('perdita_lavoro');
        if (risposte.C5 === '1') preoccupazioni.push('long_term_care');
        if (risposte.C6 === '1') preoccupazioni.push('salute_figli');
        if (risposte.C7 === '1') preoccupazioni.push('protezione_reddito');
        if (risposte.C8 === '1') preoccupazioni.push('pensione');
        
        return {
            preoccupazioniEsplicitate: preoccupazioni,
            allarmeSanitario: preoccupazioni.includes('malattia_grave') || preoccupazioni.includes('long_term_care'),
            allarmeFamiliare: preoccupazioni.includes('decesso') || preoccupazioni.includes('salute_figli'),
            allarmeLavoro: preoccupazioni.includes('perdita_lavoro') || preoccupazioni.includes('protezione_reddito')
        };
    }

    // ========================================================================
    // 5. GENERAZIONE FIL ROUGE
    // ========================================================================
    
    generateFilRouge() {
        console.log("🏛️ ALADDIN: Generazione Fil Rouge Decisionale...");
        
        const twin = this.clientTwin;
        const inferenze = [];
        const azioniConsigliate = [];
        const alertCritici = [];

        if (twin.famiglia.haFigli && twin.famiglia.figliMinorenni > 0) {
            const anniAllaMaggiorEtaFiglioPiuPiccolo = Math.min(...twin.famiglia.lista
                .filter(f => f.tipo === 'minorenne')
                .map(f => f.anniAllaMaggiorEta));
            
            if (twin.gap.morte > 0) {
                inferenze.push({
                    tipo: 'RISCHIO_FAMILIARE_CRITICO',
                    priorita: 'ALTA',
                    descrizione: `Con ${twin.famiglia.figliMinorenni} figli minori e gap capitale morte di €${twin.gap.morte.toLocaleString()}, in caso decesso il nucleo familiare perderebbe il ${twin.situazioneEconomica.percentualeContributo.toFixed(0)}% del reddito.`,
                    impatto: `Fino alla maggiore età del figlio più piccolo (${anniAllaMaggiorEtaFiglioPiuPiccolo} anni), la famiglia avrebbe bisogno di €${(twin.situazioneEconomica.redditoProprio * anniAllaMaggiorEtaFiglioPiuPiccolo).toLocaleString()} per mantenere il tenore di vita.`
                });

                const scadenzaTCM = this.portfolioAssicurativo.scadenzeProssime
                    .find(s => s.tipo === 'tcm');
                
                if (scadenzaTCM && scadenzaTCM.mesiRimanenti < (anniAllaMaggiorEtaFiglioPiuPiccolo * 12)) {
                    const etaFiglioAllaScadenza = 18 - anniAllaMaggiorEtaFiglioPiuPiccolo + (scadenzaTCM.mesiRimanenti / 12);
                    
                    alertCritici.push({
                        tipo: 'SCADENZA_TCM_PRECOCE',
                        severita: 'CRITICA',
                        messaggio: `ATTENZIONE: La polizza TCM scade tra ${scadenzaTCM.mesiRimanenti} mesi. Il figlio più piccolo avrà solo ${Math.floor(etaFiglioAllaScadenza)} anni.`,
                        azione: `Rinnovo con capitale adeguato al reddito attuale o conversione in polizza a premio level con durata fino a 80 anni.`
                    });
                }

                azioniConsigliate.push({
                    priorità: 1,
                    azione: 'TCM_GAP_FAMIGLIA',
                    target: `Copertura €${Math.max(twin.gap.morte, twin.situazioneEconomica.redditoProprio * anniAllaMaggiorEtaFiglioPiuPiccolo).toLocaleString()}`,
                    motivazione: 'Coprire il periodo di dipendenza economica dei figli',
                    prodottoConsigliato: 'TCM Level 80 o Temporanea Case 2/3 con capitale adeguato'
                });
            }
        }

        if (this.portfolioAssicurativo.coperture.casa?.attiva && 
            this.portfolioAssicurativo.coperture.casa.note?.toLowerCase().includes('mutuo')) {
            
            const notaCasa = this.portfolioAssicurativo.coperture.casa.note || '';
            const quotaParte = notaCasa.includes('50%') || notaCasa.includes('metà') || notaCasa.includes('quota parte');
            
            if (quotaParte) {
                inferenze.push({
                    tipo: 'MUTUO_QUOTA_PARZIALE',
                    priorita: 'ALTA',
                    descrizione: 'Rilevata copertura mutuo solo per quota parte intestataria.',
                    impatto: `In caso decesso, il superstite dovrebbe sostenere l'intero mutuo con il ${100 - twin.situazioneEconomica.percentualeContributo.toFixed(0)}% del reddito familiare rimanente.`
                });

                alertCritici.push({
                    tipo: 'RISCHIO_SUPERSTITE_MUTUO',
                    severita: 'ALTA',
                    messaggio: 'Il superstite potrebbe essere costretto a vendere la casa per saldare la quota mutuo non coperta.',
                    azione: 'Integrare con TCM specifica per estinzione mutuo totale.'
                });
            }
        }

        if (twin.identita.situazioneLavorativa === 'autonomo' || 
    twin.identita.situazioneLavorativa === 'imprenditore') {
    
    const coperturaReddito = twin.copertureAttuali.reddito.diariaMensile;
    // Usa il reddito NETTO mensile per il calcolo della diaria target
    const redditoMensileNetto = twin.situazioneEconomica.redditoProprio / 12;
    
    if (coperturaReddito < (redditoMensileNetto * 0.5)) {
                inferenze.push({
                    tipo: 'AUTONOMO_SENZA_PARACADUTE',
                    priorita: 'CRITICA',
                    descrizione: 'Lavoratore autonomo con protezione reddito insufficiente.',
                    impatto: `In caso di inabilità temporanea, la diaria attuale (€${coperturaReddito}) copre meno del 50% del reddito mensile.`
                });

                azioniConsigliate.push({
                    priorità: 2,
                    azione: 'PROT_REDDITO_AUTONOMO',
                    target: `Diaria €${(redditoMensileNetto * 0.7).toFixed(0)}/mese (calcolata su reddito netto)`,
                    motivazione: 'Garantire continuità reddituale in caso di infortunio/malattia',
                    prodottoConsigliato: 'Protezione Reddito Generali con diaria indicizzata'
                });
            }

            if (twin.gap.morte > twin.situazioneEconomica.redditoProprio * 2) {
                inferenze.push({
                    tipo: 'AUTONOMO_RISCHIO_ESTINZIONE',
                    priorita: 'ALTA',
                    descrizione: 'Lavoratore autonomo con elevata esposizione al rischio decesso.',
                    impatto: 'Oltre alla perdita del reddito, potrebbero esserci debiti aziendali non coperti.'
                });
            }
        }

        if (twin.percezioni.incongruenze.sovrastimaProtezione) {
            inferenze.push({
                tipo: 'BIAS_OTTIMISMO',
                priorita: 'MEDIA',
                descrizione: 'Il cliente percepisce un livello di protezione superiore alla realtà oggettiva.',
                impatto: 'Rischio di sottovalutazione della necessità di coperture aggiuntive.'
            });
        }

        if (twin.identita.eta >= 50 && !twin.copertureAttuali.longTermCare.attiva) {
            const anniAllaPensione = twin.identita.anniAllaPensione;
            
            inferenze.push({
                tipo: 'LTC_FUTURA_NECESSITA',
                priorita: 'MEDIA',
                descrizione: `A ${twin.identita.eta} anni, con ${anniAllaPensione} anni alla pensione, la probabilità di eventi LTC aumenta.`
            });

            if (twin.percezioni.profiloRischio.allarmeSanitario) {
                azioniConsigliate.push({
                    priorità: 3,
                    azione: 'LTC_PREVENTIVA',
                    target: 'Copertura LTC con capitale giornaliero',
                    motivazione: 'Esplicitata preoccupazione per malattia grave/cure lunghe',
                    prodottoConsigliato: 'General Long Term Care con premio agevolato'
                });
            }
        }

        const timelineEventi = this.generaTimelineEventi();
        
        this.filRouge = {
            twin: twin,
            inferenze: inferenze,
            azioniConsigliate: azioniConsigliate.sort((a,b) => a.priorità - b.priorità),
            alertCritici: alertCritici,
            timelineFutura: timelineEventi,
            punteggioProtezione: this.calcolaPunteggioProtezione(),
            dataAnalisi: this.timestamp
        };

        console.log("✅ ALADDIN: Fil Rouge generato", {
            inferenze: inferenze.length,
            alertCritici: alertCritici.length,
            azioni: azioniConsigliate.length
        });

        return this.filRouge;
    }

    // ========================================================================
    // 6. CARING TEMPORALE
    // ========================================================================
    
    generaTimelineEventi() {
        const eventi = [];
        const oggi = new Date();
        const annoCorrente = oggi.getFullYear();
        
        this.datiFigli.lista.forEach((figlio, index) => {
            if (figlio.tipo === 'minorenne') {
                const annoMaggiorEta = annoCorrente + figlio.anniAllaMaggiorEta;
                eventi.push({
                    anno: annoMaggiorEta,
                    eta: 18,
                    evento: `Figlio ${index + 1} raggiunge la maggiore età`,
                    tipo: 'FAMIGLIA'
                });
            }
        });

        this.portfolioAssicurativo.scadenzeProssime.forEach(scadenza => {
            const dataScadenza = new Date(scadenza.data);
            const annoScadenza = dataScadenza.getFullYear();
            
            eventi.push({
                anno: annoScadenza,
                mesiDaOggi: scadenza.mesiRimanenti,
                evento: `Scadenza ${scadenza.tipo.toUpperCase()}`,
                tipo: 'SCADENZA',
                capitaleCoinvolto: scadenza.capitaleCoinvolto
            });
        });

        const annoPensione = annoCorrente + this.clientTwin.identita.anniAllaPensione;
        eventi.push({
            anno: annoPensione,
            evento: 'Pensione di vecchiaia',
            tipo: 'PREVIDENZA'
        });

        return eventi.sort((a, b) => a.anno - b.anno);
    }

    // ========================================================================
    // 7. UTILITY & CALCOLI
    // ========================================================================
    
    calcolaLiquiditaMensile() {
        const redditoMensile = this.anagraficaCompleta.redditoAnnuoLordo / 12;
        const liquiditaPatrimonio = this.anagraficaCompleta.patrimonioFinanziario * 0.05 / 12;
        return redditoMensile + liquiditaPatrimonio;
    }

    calcolaDipendenzaEconomica() {
        const componenti = this.anagraficaCompleta.componentiNucleo;
        const percettori = this.anagraficaCompleta.numPercettoriNucleo;
        const redditoTotale = this.anagraficaCompleta.redditoFamiliareAnnuo;
        const redditoQuesto = this.anagraficaCompleta.redditoAnnuoLordo;
        
        if (percettori === 1 && componenti > 1) {
            return { livello: 'MASSIMA', percentuale: 100, descrizione: 'Unico percettore del nucleo familiare' };
        }
        
        if ((redditoQuesto / redditoTotale) > 0.7) {
            return { livello: 'ALTA', percentuale: (redditoQuesto/redditoTotale)*100, descrizione: 'Contributo prevalente al reddito familiare' };
        }
        
        return { livello: 'MEDIA', percentuale: (redditoQuesto/redditoTotale)*100, descrizione: 'Contributo parziale' };
    }

    calcolaRischioLavoro() {
        const professione = this.anagraficaCompleta.professione?.toLowerCase() || '';
        const situazione = this.anagraficaCompleta.situazioneLavorativa;
        
        let livello = 'BASSO';
        let fattori = [];
        
        if (situazione === 'autonomo' || situazione === 'imprenditore') {
            livello = 'ALTO';
            fattori.push('Lavoro autonomo senza tutela INPS');
        }
        
        const rischioAlto = ['edile', 'operaio', 'conducente', 'pilota', 'pescatore', 'minatore', 'metalmeccanico'];
        if (rischioAlto.some(r => professione.includes(r))) {
            livello = 'ALTO';
            fattori.push('Settore ad alto rischio infortunistico');
        }
        
        return { livello, fattori, situazione };
    }

    identificaScopertureCritiche() {
        const gap = this.clientTwin.gap;
        const scoperture = [];
        
        if (gap.morte > this.anagraficaCompleta.redditoAnnuoLordo) {
            scoperture.push({ tipo: 'MORTE', severita: 'ALTA', gap: gap.morte });
        }
        if (gap.invalidita > this.anagraficaCompleta.redditoAnnuoLordo * 0.5) {
            scoperture.push({ tipo: 'INVALIDITA', severita: 'MEDIA', gap: gap.invalidita });
        }
        
        this.clientTwin.gap.scopertureCritiche = scoperture;
    }

    calcolaPunteggioProtezione() {
        let punteggio = 0;
        const twin = this.clientTwin;
        
        const coperturaMorte = twin.copertureAttuali.morte.capitale;
        const necessarioMorte = twin.situazioneEconomica.redditoProprio * 5;
        punteggio += Math.min(40, (coperturaMorte / necessarioMorte) * 40);
        
        const coperturaInv = twin.copertureAttuali.invalidita.capitale;
        const necessarioInv = twin.situazioneEconomica.redditoProprio * 3;
        punteggio += Math.min(30, (coperturaInv / necessarioInv) * 30);
        
        if (twin.copertureAttuali.reddito.diariaMensile > 0) punteggio += 20;
        if (twin.copertureAttuali.sanitaria.attiva) punteggio += 5;
        if (twin.copertureAttuali.longTermCare.attiva) punteggio += 5;
        
        return Math.round(punteggio);
    }

    mesiRimanenti(dataFutura) {
        const oggi = new Date();
        const diffTime = dataFutura - oggi;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.floor(diffDays / 30);
    }

    // ========================================================================
    // 8. OUTPUT FINALE
    // ========================================================================
    
    generateReport() {
        if (!this.filRouge) this.generateFilRouge();
        
        return {
            meta: {
                versione: '1.0.0',
                timestamp: this.timestamp,
                aladdinStatus: 'ACTIVE'
            },
            clientTwin: this.clientTwin,
            filRouge: this.filRouge,
            timelineFutura: this.filRouge.timelineFutura,
            punteggioProtezione: this.filRouge.punteggioProtezione
        };
    }

    run() {
        this.analyze();
        this.buildClientTwin();
        this.generateFilRouge();
        return this.generateReport();
    }
}

// Esportazione per browser (globale)
window.AladdinCore = AladdinCore;
