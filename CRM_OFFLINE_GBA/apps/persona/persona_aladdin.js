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
  }
  
};
