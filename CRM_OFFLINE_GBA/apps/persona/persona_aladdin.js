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
    return appState;
  }
  
};
