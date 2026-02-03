// CONTENITORE MAGICO - Qui mettiamo le cose che il cliente ci dice
const Aladdin = {
  
  // Funzione che prende la risposta A1 (reddito) e la mette nel contesto
  salvaReddito: function(appState, importoReddito) {
    // Controlla se esiste già il cassetto "fatti"
    if (!appState.fattiCliente) {
      appState.fattiCliente = {};
    }
    
    // Mettiamo il reddito nel cassetto giusto
    appState.fattiCliente.reddito = {
      valore: importoReddito,
      quando: new Date().toLocaleDateString('it-IT'),
      domanda: "A1"
    };
    
    console.log("💰 Reddito salvato:", importoReddito);
    return appState;
  },
  
  // Funzione che prende la risposta A2 (stato familiare) e la mette nel contesto  
  salvaStatoFamiliare: function(appState, statoFamiliare) {
    // Controlla se esiste già il cassetto "fatti"
    if (!appState.fattiCliente) {
      appState.fattiCliente = {};
    }
    
    // Mettiamo lo stato familiare nel cassetto giusto
    appState.fattiCliente.statoFamiliare = {
      valore: statoFamiliare,
      quando: new Date().toLocaleDateString('it-IT'),
      domanda: "A2"
    };
    
    console.log("👨‍👩‍👧‍👦 Stato familiare salvato:", statoFamiliare);
    
    // Ora collega i punti con il reddito!
    this.collegaPunti(appState);
    
    return appState;
  },

  // Funzione che collega i punti (Fil Rouge Decisionale)
  collegaPunti: function(appState) {
    const fatti = appState.fattiCliente || {};
    const connessioni = [];
    
    // Collegamento 1: Reddito + Famiglia = Necessità protezione
    if (fatti.reddito && fatti.statoFamiliare) {
      const reddito = fatti.reddito.valore;
      const famiglia = fatti.statoFamiliare.valore;
      
      // Se reddito è alto (4-5) e ha figli → protezione massima
      if (reddito >= 4 && famiglia === "con_figli") {
        connessioni.push({
          tipo: "protezione_critica",
          descrizione: "Famiglia con reddito elevato da proteggere",
          priorita: "massima"
        });
      }
      // Se reddito è medio (2-3) e ha figli → protezione standard
      else if (reddito >= 2 && famiglia === "con_figli") {
        connessioni.push({
          tipo: "protezione_standard",
          descrizione: "Famiglia con reddito medio da proteggere",
          priorita: "alta"
        });
      }
    }
    
    // Salva le connessioni nel contenitore
    appState.fattiCliente.connessioni = connessioni;
    
    console.log("🔗 Fil Rouge generato:", connessioni.length, "connessioni");
    if (connessioni.length > 0) {
      console.log("   →", connessioni[0].descrizione);
    }
    return appState;
  }
  
};
