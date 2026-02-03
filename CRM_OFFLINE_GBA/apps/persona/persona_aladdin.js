// persona_aladdin.js
// Aladdin Core - Architettura Fil Rouge Decisionale

import { QuestionarioPersona } from './persona_domande.js';
import { ContestoPersona } from './persona_contesto.js';

export class AladdinCore {
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
        
        // 1. Anagrafica completa (esistente + campi da aggiungere)
        const anagrafica = this.appState.user.anagrafica || {};
        this.anagraficaCompleta = {
            // Dati base
            nome: anagrafica.nome || '',
            cognome: anagrafica.cognome || '',
            codiceFiscale: anagrafica.codiceFiscale || '',
            dataNascita: anagrafica.dataNascita || '',
            luogoNascita: anagrafica.luogoNascita || '',
            eta: parseInt(anagrafica.eta) || 0,
            sesso: anagrafica.sesso || '',
            professione: anagrafica.professione || '',
            situazioneLavorativa: anagrafica.situazioneLavorativa || '',
            
            // Dati economici
            redditoAnnuoLordo: parseFloat(anagrafica.redditoAnnuoLordo) || 0,
            redditoFamiliareAnnuo: parseFloat(anagrafica.redditoFamiliareAnnuo) || 0,
            numPercettoriNucleo: parseInt(anagrafica.numPercettoriNucleo) || 1,
            componentiNucleo: parseInt(anagrafica.componentiNucleo) || 1,
            patrimonioFinanziario: parseFloat(anagrafica.patrimonioFinanziario) || 0,
            
            // Dati familiari (CAMPI DA AGGIUNGERE ALLA UI)
            figliMinorenni: parseInt(anagrafica.figliMinorenni) || 0,
            figliMaggiorenniConviventi: parseInt(anagrafica.figliMaggiorenniConviventi) || 0, // DA AGGIUNGERE
            statoCivile: anagrafica.statoCivile || 'non_specificato', // DA AGGIUNGERE (celibe/nubile, coniugato, divorziato, vedovo)
            
            // Dati previdenziali
            anniContributivi: parseInt(anagrafica.anniContributivi) || 0,
            
            // Contatti
            emailCliente: anagrafica.emailCliente || '',
            telefono: anagrafica.telefono || '',
            citta: anagrafica.citta || '',
            provincia: anagrafica.provincia || '',
            cap: anagrafica.cap || '',
            
            // Metadati
            consulenteEmail: anagrafica.consulenteEmail || ''
        };

        // 2. Polizze e Coperture (gestione campi differenziati)
        this.polizzeRaw = this.appState.user.polizze || [];
        this.copertureV2 = this.appState.user.copertureAttiveV2 || {};
        
        this.portfolioAssicurativo = this.processaPolizze(this.polizzeRaw, this.copertureV2);
        
        // 3. Risposte Questionario (A1-C8)
        this.risposte = this.appState.questionnaire?.answers || {};
        
        // 4. Risultati calcolati dal sistema (gap, normotipo, semaforo)
        this.risultatiSistema = this.appState.risultati || {};
        
        // 5. Calcolo età figli (simulazione se non abbiamo date precise, usando età media)
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
    // 2. PROCESSAMENTO POLIZZE (TCM/Infortuni hanno capitaleIP)
    // ========================================================================
    
    processaPolizze(polizze, copertureV2) {
        const portfolio = {
            totalePolizze: polizze.length,
            premioAnnuoTotale: 0,
            coperture: {},
            gapRiscontrati: [],
            scadenzeProssime: []
        };

        // Processa coperture V2 (dalla UI con campi differenziati)
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

                // CAMPI SPECIFICI per TCM e Infortuni (hanno capitale IP)
                if (tipo === 'tcm' || tipo === 'infortuni') {
                    copertura.capitaleIP = parseFloat(c.capitaleEuro) || 0; // Capitale In caso di Premio/IP
                    copertura.capitaleDecesso = parseFloat(c.capitaleEuro) || 0; // Per TCM è il capitale morte
                }
                
                // Per Invalidità/Malattia Grave
                if (tipo === 'invalidita') {
                    copertura.capitaleInvalidita = parseFloat(c.capitaleEuro) || 0;
                }

                // Per Protezione Reddito (Diaria)
                if (tipo === 'protezione_reddito') {
                    copertura.diariaMensile = parseFloat(c.capitaleEuro) || 0; // O campo specifico se esiste
                }

                portfolio.coperture[tipo] = copertura;
                portfolio.premioAnnuoTotale += copertura.premioAnnuo;

                // Alert scadenze prossime (entro 24 mesi)
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
        
        // Se non abbiamo le età precise, assumiamo distribuzione standard
        // o leggiamo da un campo futuro "etaFigli" array
        const figli = [];
        
        // Simulazione età medie per calcolo caring (può essere raffinato con dati reali)
        for (let i = 0; i < numMinorenni; i++) {
            figli.push({ 
                id: i, 
                eta: 10, // media ipotetica, da sostituire con dati reali se disponibili
                tipo: 'minorenne',
                anniAllaMaggiorEta: 8 // 18 - 10
            });
        }
        
        for (let i = 0; i < numMaggiorenni; i++) {
            figli.push({ 
                id: i + numMinorenni, 
                eta: 20, 
                tipo: 'maggiorenne_convivente',
                anniAllaIndipendenza: 5 // stima
            });
        }
        
        return {
            lista: figli,
            totale: numMinorenni + numMaggiorenni,
            haFigli: (numMinorenni + numMaggiorenni) > 0,
            etaMinore: numMinorenni > 0 ? 5 : null, // assume il più piccolo abbia 5 anni se non specificato
            tuttiMaggiorenni: numMinorenni === 0 && numMaggiorenni > 0
        };
    }

    // ========================================================================
    // 3. COSTRUZIONE CLIENT TWIN (Gemello Digitale)
    // ========================================================================
    
    buildClientTwin() {
        console.log("🏛️ ALADDIN: Costruzione Client Twin...");

        const reddito = this.anagraficaCompleta.redditoAnnuoLordo;
        const redditoFam = this.anagraficaCompleta.redditoFamiliareAnnuo;
        const componenti = this.anagraficaCompleta.componentiNucleo;
        
        // Analisi coperture attuali
        const coperturaMorte = this.portfolioAssicurativo.coperture.tcm?.capitaleDecesso || 0;
        const coperturaInvalidita = this.portfolioAssicurativo.coperture.invalidita?.capitaleInvalidita || 0;
        const coperturaInfortuni = this.portfolioAssicurativo.coperture.infortuni?.capitaleIP || 0;
        const diariaReddito = this.portfolioAssicurativo.coperture.protezione_reddito?.diariaMensile || 0;

        // Gap calcolati dal sistema (se disponibili) o calcolati ora
        const gapMorte = this.risultatiSistema.gapStatale?.morte || (reddito * 5 - coperturaMorte); // stima 5 anni
        const gapInvalidita = this.risultatiSistema.gapStatale?.invalidita || (reddito * 0.7 - coperturaInvalidita);
        
        this.clientTwin = {
            identita: {
                ...this.anagraficaCompleta,
                etaPensionabile: 67, // o calcolata dinamicamente
                anniAllaPensione: 67 - this.anagraficaCompleta.eta
            },
            
            situazioneEconomica: {
                redditoProprio: reddito,
                redditoFamiliare: redditoFam,
                redditoPerCapite: redditoFam / componenti,
                percentualeContributo: (reddito / redditoFam) * 100,
                patrimonio: this.anagraficaCompleta.patrimonioFinanziario,
                liquiditaMensile: this.calcolaLiquiditaMensile()
            },
            
            famiglia: {
                ...this.datiFigli,
                componentiNucleo: componenti,
                numPercettori: this.anagraficaCompleta.numPercettoriNucleo,
                // Analisi dipendenza economica
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
                reddito: Math.max(0, (reddito * 0.7 / 12) - diariaReddito), // 70% reddito come diaria ideale
                scopertureCritiche: []
            },
            
            percezioni: this.analizzaPercezioni(),
            
            statoCivile: this.anagraficaCompleta.statoCivile,
            anniContributivi: this.anagraficaCompleta.anniContributivi
        };

        // Identificazione scoperture critiche specifiche
        this.identificaScopertureCritiche();

        console.log("✅ ALADDIN: Client Twin creato", {
            gapMorte: this.clientTwin.gap.morte,
            percezioneProtezione: this.clientTwin.percezioni.livelloProtezionePercepito
        });

        return this.clientTwin;
    }

    // ========================================================================
    // 4. ANALISI PERCEZIONI (Incongruenze Psicometriche)
    // ========================================================================
    
    analizzaPercezioni() {
        const r = this.risposte;
        
        // A1: Percezione protezione economica (1-5)
        const percezioneProt = parseInt(r.A1) || 3;
        
        // A2: Autonomia mesi di sostentamento (1-5 -> mesi)
        const autonomiaMap = {1: 3, 2: 6, 3: 12, 4: 24, 5: 36};
        const mesiAutonomia = autonomiaMap[parseInt(r.A2)] || 12;
        
        // B3: Liquidità reale (fino a X mesi)
        const liquiditaReale = parseInt(r.B3) || 0;
        
        // A4: Fiducia SSN (1-5)
        const fiduciaSSN = parseInt(r.A4) || 3;
        
        // Mappatura percezione vs realtà
        const gapCopertura = this.clientTwin?.gap.morte || 0;
        const reddito = this.anagraficaCompleta.redditoAnnuoLordo;
        
        // Se percepisce alta protezione (4-5) ma ha gap enorme = INCONGRUENZA
        const incongruenzaProtezione = (percezioneProt >= 4 && gapCopertura > reddito * 2);
        
        // Se dice di avere liquidità per 24+ mesi (A2=4-5) ma B3 dice <6 mesi = CONTRADDIZIONE
        const contraddizioneLiquidita = (parseInt(r.A2) >= 4 && liquiditaReale < 6);
        
        return {
            livelloProtezionePercepito: percezioneProt, // 1-5
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
        // Logica semplificata per profilo psicometrico
        // C1-C8: Preoccupazioni specifiche
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
    // 5. GENERAZIONE FIL ROUGE (Il Percorso Decisionale)
    // ========================================================================
    
    generateFilRouge() {
        console.log("🏛️ ALADDIN: Generazione Fil Rouge Decisionale...");
        
        const twin = this.clientTwin;
        const inferenze = [];
        const azioniConsigliate = [];
        const alertCritici = [];

        // =================================================================
        // INFERENZA 1: Protezione Morte vs Figli Minorenni
        // =================================================================
        if (twin.famiglia.haFigli && twin.famiglia.figliMinorenni > 0) {
            const anniAllaMaggiorEtaFiglioPiuPiccolo = Math.min(...twin.famiglia.lista
                .filter(f => f.tipo === 'minorenne')
                .map(f => f.anniAllaMaggiorEta));
            
            // Se ha figli piccoli e gap morte > 0
            if (twin.gap.morte > 0) {
                inferenze.push({
                    tipo: 'RISCHIO_FAMILIARE_CRITICO',
                    priorita: 'ALTA',
                    descrizione: `Con ${twin.famiglia.figliMinorenni} figli minori e gap capitale morte di €${twin.gap.morte.toLocaleString()}, in caso decesso il nucleo familiare perderebbe il ${twin.situazioneEconomica.percentualeContributo.toFixed(0)}% del reddito.`,
                    impatto: `Fino alla maggiore età del figlio più piccolo (${anniAllaMaggiorEtaFiglioPiuPiccolo} anni), la famiglia avrebbe bisogno di €${(twin.situazioneEconomica.redditoProprio * anniAllaMaggiorEtaFiglioPiuPiccolo).toLocaleString()} per mantenere il tenore di vita.`
                });

                // Caring Temporale: se ha TCM che scade prima che figli diventino maggiorenni
                const scadenzaTCM = this.portfolioAssicurativo.scadenzeProssime
                    .find(s => s.tipo === 'tcm');
                
                if (scadenzaTCM && scadenzaTCM.mesiRimanenti < (anniAllaMaggiorEtaFiglioPiuPiccolo * 12)) {
                    const etaFiglioAllaScadenza = 18 - anniAllaMaggiorEtaFiglioPiuPiccolo + (scadenzaTCM.mesiRimanenti / 12);
                    
                    alertCritici.push({
                        tipo: 'SCADENZA_TCM_PRECOCE',
                        severita: 'CRITICA',
                        messaggio: `ATTENZIONE: La polizza TCM scade tra ${scadenzaTCM.mesiRimanenti} mesi. Il figlio più piccolo avrà solo ${Math.floor(etaFiglioAllaScadenza)} anni. Se il capitale non viene rinnovato/adeguato, resteranno scoperti per ${Math.ceil(anniAllaMaggiorEtaFiglioPiuPiccolo - (scadenzaTCM.mesiRimanenti/12))} anni critici.`,
                        azione: `Rinnovo con capitale adeguato al reddito attuale (€${twin.situazioneEconomica.redditoProprio.toLocaleString()}/anno) oppure conversione in polizza a premio level con durata fino a 80 anni.`
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

        // =================================================================
        // INFERENZA 2: Mutuo e Copertura Quota Parte
        // =================================================================
        if (this.portfolioAssicurativo.coperture.casa?.attiva && 
            this.portfolioAssicurativo.coperture.casa.note?.toLowerCase().includes('mutuo')) {
            
            // Se ha mutuo coperto solo parzialmente (deduzione dalla nota o da campo specifico futuro)
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
                    azione: 'Integrare con TCM specifica per estinzione mutuo totale o assicurazione sul credito per la quota mancante.'
                });
            }
        }

        // =================================================================
        // INFERENZA 3: Lavoro Autonomo e Protezione Reddito
        // =================================================================
        if (twin.identita.situazioneLavorativa === 'Autonomo' || 
            twin.identita.situazioneLavorativa === 'Libero Professionista') {
            
            const coperturaReddito = twin.copertureAttuali.reddito.diariaMensile;
            const redditoMensile = twin.situazioneEconomica.redditoProprio / 12;
            
            if (coperturaReddito < (redditoMensile * 0.5)) {
                inferenze.push({
                    tipo: 'AUTONOMO_SENZA_PARACADUTE',
                    priorita: 'CRITICA',
                    descrizione: 'Lavoratore autonomo con protezione reddito insufficiente.',
                    impatto: `In caso di inabilità temporanea, la diaria attuale (€${coperturaReddito}) copre meno del 50% del reddito mensile (€${redditoMensile.toFixed(0)}).`
                });

                azioniConsigliate.push({
                    priorità: 2,
                    azione: 'PROT_REDDITO_AUTONOMO',
                    target: `Diaria €${(redditoMensile * 0.7).toFixed(0)}/mese`,
                    motivazione: 'Garantire continuità reddituale in caso di infortunio/malattia',
                    prodottoConsigliato: 'Protezione Reddito Generali con diaria indicizzata'
                });
            }

            // Se autonomo e non ha TCM o ha poca
            if (twin.gap.morte > twin.situazioneEconomica.redditoProprio * 2) {
                inferenze.push({
                    tipo: 'AUTONOMO_RISCHIO_ESTINZIONE',
                    priorita: 'ALTA',
                    descrizione: 'Lavoratore autonomo con elevata esposizione al rischio decesso.',
                    impatto: 'Oltre alla perdita del reddito, potrebbero esserci debiti aziendali non coperti.'
                });
            }
        }

        // =================================================================
        // INFERENZA 4: Incongruenza Percezionale (Anti-Bias)
        // =================================================================
        if (twin.percezioni.incongruenze.sovrastimaProtezione) {
            inferenze.push({
                tipo: 'BIAS_OTTIMISMO',
                priorita: 'MEDIA',
                descrizione: 'Il cliente percepisce un livello di protezione superiore alla realtà oggettiva.',
                impatto: 'Rischio di sottovalutazione della necessità di coperture aggiuntive.',
                azioneComportamentale: 'Mostrare il calcolo del gap reale vs percezione attraverso simulazione scenario.'
            });
        }

        // =================================================================
        // INFERENZA 5: Previdenza e Long Term Care (Età > 50)
        // =================================================================
        if (twin.identita.eta >= 50 && !twin.copertureAttuali.longTermCare.attiva) {
            const anniAllaPensione = twin.identita.anniAllaPensione;
            
            inferenze.push({
                tipo: 'LTC_FUTURA_NECESSITA',
                priorita: 'MEDIA',
                descrizione: `A ${twin.identita.eta} anni, con ${anniAllaPensione} anni alla pensione, la probabilità di eventi LTC aumenta.`,
                impatto: 'Costi sanitari non coperti da SSN potrebbero erodere il patrimonio familiare.'
            });

            if (twin.percezioni.profiloRischio.allarmeSanitario) {
                azioniConsigliate.push({
                    priorità: 3,
                    azione: 'LTC_PREVENTIVA',
                    target: 'Copertura LTC con capitale giornaliero',
                    motivazione: 'Esplicitata preoccupazione per malattia grave/cure lunghe',
                    prodottoConsigliato: 'General Long Term Care con premio agevolato per sottoscrizione anticipata'
                });
            }
        }

        // =================================================================
        // INFERENZA 6: Analisi Timeline Futura (Caring)
        // =================================================================
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
    // 6. CARING TEMPORALE (Timeline Eventi Futuri)
    // ========================================================================
    
    generaTimelineEventi() {
        const eventi = [];
        const oggi = new Date();
        const annoCorrente = oggi.getFullYear();
        
        // Eventi Figli
        this.datiFigli.lista.forEach((figlio, index) => {
            if (figlio.tipo === 'minorenne') {
                // Maggiore età
                const annoMaggiorEta = annoCorrente + figlio.anniAllaMaggiorEta;
                eventi.push({
                    anno: annoMaggiorEta,
                    eta: 18,
                    evento: `Figlio ${index + 1} raggiunge la maggiore età`,
                    tipo: 'FAMIGLIA',
                    implicazione: 'Fine obbligo mantenimento legale, ma possibile necessità supporto università',
                    checkAssicurativo: 'Verificare se TCM ancora necessaria per altri figli o per protezione patrimoniale'
                });
            }
        });

        // Scadenze Polizze
        this.portfolioAssicurativo.scadenzeProssime.forEach(scadenza => {
            const dataScadenza = new Date(scadenza.data);
            const annoScadenza = dataScadenza.getFullYear();
            const mesiMancanti = scadenza.mesiRimanenti;
            
            eventi.push({
                anno: annoScadenza,
                mesiDaOggi: mesiMancanti,
                evento: `Scadenza ${scadenza.tipo.toUpperCase()}`,
                tipo: 'SCADENZA',
                capitaleCoinvolto: scadenza.capitaleCoinvolto,
                implicazione: mesiMancanti < 12 ? 'URGENTE: Rinnovo immediato necessario' : 'Pianificare rinnovo o sostituzione',
                azioneConsigliata: this.generaAzioneScadenza(scadenza)
            });
        });

        // Pensione
        const annoPensione = annoCorrente + this.clientTwin.identita.anniAllaPensione;
        eventi.push({
            anno: annoPensione,
            evento: 'Pensione di vecchiaia',
            tipo: 'PREVIDENZA',
            implicazione: 'Riduzione reddito, necessità LTC aumenta',
            checkAssicurativo: 'Valutare conversione polizze vita in polizze LTC o rendite'
        });

        // Ordina per anno
        return eventi.sort((a, b) => a.anno - b.anno);
    }

    generaAzioneScadenza(scadenza) {
        const tipo = scadenza.tipo;
        const mesi = scadenza.mesiRimanenti;
        
        if (tipo === 'tcm') {
            if (this.datiFigli.figliMinorenni > 0) {
                return 'Rinnovare con capitale adeguato fino a copertura completa dipendenza figli';
            } else {
                return 'Valutare conversione in polizza a premio level per copertura perpetua eredi';
            }
        } else if (tipo === 'infortuni') {
            return 'Rinnovare solo se attività lavorativa rischiosa, altrimenti integrare in protezione reddito';
        } else if (tipo === 'sanitaria') {
            return 'Rinnovo obbligatorio, verificare se serve upgrade con copertura LTC integrata';
        }
        return 'Verificare condizioni di rinnovo e comparare mercato';
    }

    // ========================================================================
    // 7. UTILITY & CALCOLI
    // ========================================================================
    
    calcolaLiquiditaMensile() {
        // Stima semplificata: patrimonio / 12 per liquidità annuale ipotetica
        // + reddito mensile
        const redditoMensile = this.anagraficaCompleta.redditoAnnuoLordo / 12;
        const liquiditaPatrimonio = this.anagraficaCompleta.patrimonioFinanziario * 0.05 / 12; // 5% annuo utilizzabile
        return redditoMensile + liquiditaPatrimonio;
    }

    calcolaDipendenzaEconomica() {
        const componenti = this.anagraficaCompleta.componentiNucleo;
        const percettori = this.anagraficaCompleta.numPercettoriNucleo;
        const redditoTotale = this.anagraficaCompleta.redditoFamiliareAnnuo;
        const redditoQuesto = this.anagraficaCompleta.redditoAnnuoLordo;
        
        // Se è l'unico percettore, dipendenza massima
        if (percettori === 1 && componenti > 1) {
            return { livello: 'MASSIMA', percentuale: 100, descrizione: 'Unico percettore del nucleo familiare' };
        }
        
        // Se contribuisce per >70% del reddito familiare
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
        
        // Situazione lavorativa
        if (situazione === 'Autonomo' || situazione === 'Libero Professionista') {
            livello = 'ALTO';
            fattori.push('Lavoro autonomo senza tutela INPS');
        } else if (situazione === 'Committente') {
            livello = 'MEDIO';
            fattori.push('Committente con protezione limitata');
        }
        
        // Professioni ad alto rischio
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
        // Punteggio 0-100 della protezione attuale
        let punteggio = 0;
        const twin = this.clientTwin;
        
        // Morte (max 40 punti)
        const coperturaMorte = twin.copertureAttuali.morte.capitale;
        const necessarioMorte = twin.situazioneEconomica.redditoProprio * 5;
        punteggio += Math.min(40, (coperturaMorte / necessarioMorte) * 40);
        
        // Invalidità (max 30 punti)
        const coperturaInv = twin.copertureAttuali.invalidita.capitale;
        const necessarioInv = twin.situazioneEconomica.redditoProprio * 3;
        punteggio += Math.min(30, (coperturaInv / necessarioInv) * 30);
        
        // Reddito (max 20 punti)
        if (twin.copertureAttuali.reddito.diariaMensile > 0) punteggio += 20;
        
        // Sanitaria/LTC (max 10 punti)
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
            sintesiConsulente: this.generaSintesiPerConsulente()
        };
    }

    generaSintesiPerConsulente() {
        const twin = this.clientTwin;
        const fil = this.filRouge;
        
        let sintesi = `=== ANALISI CLIENTE ${twin.identita.nome} ${twin.identita.cognome} ===\n\n`;
        sintesi += `SITUAZIONE: ${twin.identita.eta} anni, ${twin.identita.situazioneLavorativa}, `;
        sintesi += `Reddito €${twin.situazioneEconomica.redditoProprio.toLocaleString()}/anno\n`;
        sintesi += `FAMIGLIA: ${twin.famiglia.componentiNucleo} componenti, ${twin.famiglia.figliMinorenni} figli minori\n`;
        sintesi += `PROTEZIONE ATTUALE: ${fil.punteggioProtezione}/100 punti\n\n`;
        
        sintesi += `ALERT CRITICI:\n`;
        fil.alertCritici.forEach(alert => {
            sintesi += `🚨 [${alert.severita}] ${alert.messaggio}\n`;
        });
        
        sintesi += `\nAZIONI PRIORITARIE:\n`;
        fil.azioniConsigliate.forEach((azione, idx) => {
            sintesi += `${idx+1}. ${azione.azione} - Target: ${azione.target}\n   Motivo: ${azione.motivazione}\n`;
        });
        
        sintesi += `\nTIMELINE PROSSIMA SCADENZA:\n`;
        const prossimiEventi = fil.timelineFutura.slice(0, 3);
        prossimiEventi.forEach(ev => {
            sintesi += `- ${ev.anno}: ${ev.evento} (${ev.tipo})\n`;
        });
        
        return sintesi;
    }

    // Metodo principale
    run() {
        this.analyze();
        this.buildClientTwin();
        this.generateFilRouge();
        return this.generateReport();
    }
}

// Export per utilizzo
export default AladdinCore;
