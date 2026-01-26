// ============================================================
// GENERAZIONE INCONGRUENZE - VERSIONE PREMIUM VISUALE
// Generali Business Advisor
// ============================================================

/**
 * Genera visualizzazione premium delle incongruenze nel report
 * Con design accattivante, animazioni e statistiche
 */
function generaIncongruenzePremium(data) {
    console.log("🎨 Generazione incongruenze PREMIUM...");
    
    // 1. Analizza incongruenze
    const lista = window.analizzaIncongruenze(data);
    const container = document.getElementById("incongruenzeContainer");
    
    if (!container) {
        console.warn("⚠️ Container #incongruenzeContainer non trovato");
        return;
    }
    
    container.innerHTML = "";
    
    // 2. Se ZERO incongruenze → Success state bellissimo
    if (lista.length === 0) {
        container.innerHTML = `
            <div class="incongruenze-success">
                <div class="incongruenze-success-icon">✨</div>
                <div class="incongruenze-success-title">Nessuna Incongruenza Rilevata!</div>
                <div class="incongruenze-success-text">
                    L'analisi non ha rilevato anomalie nei dati forniti. Ottimo lavoro!
                </div>
            </div>
        `;
        return;
    }
    
    // 3. Calcola statistiche per livello
    const stats = {
        altissimo: lista.filter(i => i.livello === "altissimo").length,
        alto: lista.filter(i => i.livello === "alto").length,
        medio: lista.filter(i => i.livello === "medio").length,
        basso: lista.filter(i => i.livello === "basso").length
    };
    
    // 4. Genera summary box con statistiche
    const summaryHTML = `
        <div class="incongruenze-summary">
            ${stats.altissimo > 0 ? `
                <div class="incongruenze-stat altissimo">
                    <div class="incongruenze-stat-number">${stats.altissimo}</div>
                    <div class="incongruenze-stat-label">Critiche</div>
                </div>
            ` : ''}
            ${stats.alto > 0 ? `
                <div class="incongruenze-stat alto">
                    <div class="incongruenze-stat-number">${stats.alto}</div>
                    <div class="incongruenze-stat-label">Alte</div>
                </div>
            ` : ''}
            ${stats.medio > 0 ? `
                <div class="incongruenze-stat medio">
                    <div class="incongruenze-stat-number">${stats.medio}</div>
                    <div class="incongruenze-stat-label">Medie</div>
                </div>
            ` : ''}
            ${stats.basso > 0 ? `
                <div class="incongruenze-stat basso">
                    <div class="incongruenze-stat-number">${stats.basso}</div>
                    <div class="incongruenze-stat-label">Basse</div>
                </div>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = summaryHTML;
    
    // 5. Ordina per priorità (altissimo → basso)
    const priorita = { "altissimo": 4, "alto": 3, "medio": 2, "basso": 1 };
    lista.sort((a, b) => priorita[b.livello] - priorita[a.livello]);
    
    // 6. Mappa icone per livello
    const icone = {
        altissimo: "🚨",
        alto: "⚠️",
        medio: "⚡",
        basso: "ℹ️"
    };
    
    // 7. Genera card per ogni incongruenza
    lista.forEach((inc, index) => {
        const card = document.createElement("div");
        card.className = `incongruenza-card ${inc.livello}`;
        
        // Categoria label friendly
        const categoriaLabel = {
            "azienda": "Dati Azienda",
            "domande_vs_domande": "Coerenza Risposte",
            "polizze_vs_domande": "Coperture Assicurative",
            "gap_vs_rischi": "Gap Analysis"
        }[inc.categoria] || inc.categoria;
        
        card.innerHTML = `
            <div class="incongruenza-icon">
                ${icone[inc.livello] || "❗"}
            </div>
            <div class="incongruenza-content">
                <span class="incongruenza-level">
                    ${inc.livello.toUpperCase()}
                </span>
                <div class="incongruenza-message">
                    ${inc.messaggio}
                </div>
                <span class="incongruenza-categoria">
                    📁 ${categoriaLabel}
                </span>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    console.log(`✅ Incongruenze PREMIUM generate: ${lista.length}`);
}

/**
 * Inizializza sezione incongruenze premium nel report
 * Crea la struttura HTML base con stile
 */
function inizializzaSezioneIncongruenzePremium() {
    // Cerca sezione esistente o creala
    let section = document.getElementById("incongruenzeSection");
    
    if (!section) {
        // Crea nuova sezione dopo gap analysis
        const gapSection = document.querySelector(".gap-analysis-section");
        if (gapSection) {
            section = document.createElement("div");
            section.id = "incongruenzeSection";
            gapSection.after(section);
        }
    }
    
    if (section) {
        section.innerHTML = `
            <h3>Analisi Incongruenze</h3>
            <p class="incongruenze-subtitle">
                Rilevamento automatico di anomalie, incoerenze e aree di attenzione nei dati forniti
            </p>
            <div id="incongruenzeContainer"></div>
        `;
    }
}

/**
 * Genera report con effetto loading premium
 * Mostra skeleton cards durante il caricamento
 */
function generaIncongruenzeConLoading(data) {
    const container = document.getElementById("incongruenzeContainer");
    
    if (!container) return;
    
    // 1. Mostra loading skeleton
    container.innerHTML = `
        <div class="incongruenza-card loading" style="height: 100px;"></div>
        <div class="incongruenza-card loading" style="height: 100px;"></div>
        <div class="incongruenza-card loading" style="height: 100px;"></div>
    `;
    
    // 2. Dopo 500ms genera contenuto reale
    setTimeout(() => {
        generaIncongruenzePremium(data);
    }, 500);
}

/**
 * Esporta incongruenze in formato Excel
 * Con formattazione colorata per livello
 */
function esportaIncongruenzeExcel(data) {
    const lista = window.analizzaIncongruenze(data);
    
    if (lista.length === 0) {
        alert("Nessuna incongruenza da esportare!");
        return;
    }
    
    // Prepara dati per Excel
    const excelData = [
        ["Livello", "Categoria", "Messaggio"]
    ];
    
    lista.forEach(inc => {
        excelData.push([
            inc.livello.toUpperCase(),
            inc.categoria,
            inc.messaggio
        ]);
    });
    
    // Crea workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Styling header
    ws['A1'].s = { font: { bold: true }, fill: { fgColor: { rgb: "D71920" } } };
    
    XLSX.utils.book_append_sheet(wb, ws, "Incongruenze");
    
    // Download
    XLSX.writeFile(wb, `Incongruenze_${data.nomeAzienda || 'Report'}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    console.log("📊 Excel incongruenze esportato");
}

/**
 * Filtra incongruenze per livello
 * Utile per UI con filtri
 */
function filtraIncongruenzePerLivello(livello) {
    const cards = document.querySelectorAll('.incongruenza-card');
    
    cards.forEach(card => {
        if (livello === 'tutti' || card.classList.contains(livello)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/**
 * Aggiungi filtri UI (opzionale)
 * Pulsanti per filtrare per livello di gravità
 */
function aggiungiFiltrirIncongruenze() {
    const section = document.getElementById("incongruenzeSection");
    
    if (!section) return;
    
    const filtriHTML = `
        <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
            <button class="filtro-btn active" data-livello="tutti" 
                    style="padding: 8px 16px; border-radius: 20px; border: 2px solid #d71920; 
                           background: #d71920; color: white; font-weight: 600; cursor: pointer;">
                Tutti
            </button>
            <button class="filtro-btn" data-livello="altissimo"
                    style="padding: 8px 16px; border-radius: 20px; border: 2px solid #dc2626; 
                           background: white; color: #dc2626; font-weight: 600; cursor: pointer;">
                Critiche
            </button>
            <button class="filtro-btn" data-livello="alto"
                    style="padding: 8px 16px; border-radius: 20px; border: 2px solid #ea580c; 
                           background: white; color: #ea580c; font-weight: 600; cursor: pointer;">
                Alte
            </button>
            <button class="filtro-btn" data-livello="medio"
                    style="padding: 8px 16px; border-radius: 20px; border: 2px solid #d97706; 
                           background: white; color: #d97706; font-weight: 600; cursor: pointer;">
                Medie
            </button>
            <button class="filtro-btn" data-livello="basso"
                    style="padding: 8px 16px; border-radius: 20px; border: 2px solid #2563eb; 
                           background: white; color: #2563eb; font-weight: 600; cursor: pointer;">
                Basse
            </button>
        </div>
    `;
    
    // Inserisci prima del container
    const container = document.getElementById("incongruenzeContainer");
    if (container) {
        container.insertAdjacentHTML('beforebegin', filtriHTML);
        
        // Event listeners
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Toggle active
                document.querySelectorAll('.filtro-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'white';
                });
                this.classList.add('active');
                
                // Update style
                const colore = this.style.borderColor;
                this.style.background = colore;
                this.style.color = 'white';
                
                // Filtra
                filtraIncongruenzePerLivello(this.dataset.livello);
            });
        });
    }
}

// ============================================================
// AUTO-INIT quando il documento è pronto
// ============================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inizializzaSezioneIncongruenzePremium);
} else {
    inizializzaSezioneIncongruenzePremium();
}

console.log("🎨 Modulo Incongruenze PREMIUM caricato");