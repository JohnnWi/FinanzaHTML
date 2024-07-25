// Utilizziamo Luxon per la gestione delle date
const DateTime = luxon.DateTime;

// Stato dell'applicazione
let state = {
    liquidity: 0,
    crypto: 0,
    history: []
};

// Elementi DOM
const totalAssetsElement = document.getElementById('total-assets');
const totalLiquidityElement = document.getElementById('total-liquidity');
const totalCryptoElement = document.getElementById('total-crypto');
const assetCompositionChart = document.getElementById('asset-composition-chart');
const assetTrendChart = document.getElementById('asset-trend-chart');

// Configurazione dei grafici
const compositionChartConfig = {
    type: 'pie',
    data: {
        labels: ['Liquidità', 'Crypto'],
        datasets: [{
            data: [0, 0],
            backgroundColor: ['#3B82F6', '#F59E0B']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Composizione Patrimonio'
            },
            legend: {
                position: 'bottom'
            }
        }
    }
};

const trendChartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Patrimonio Totale',
            data: [],
            borderColor: '#10B981',
            fill: false
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Andamento Patrimonio'
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Valore (€)'
                }
            }
        }
    }
};

// Inizializza i grafici
let compositionChart;
let trendChart;

// Funzione per formattare le somme di denaro
function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Funzione per aggiornare il totale degli asset
function updateTotalAssets() {
    const total = state.liquidity + state.crypto;
    if (totalAssetsElement) totalAssetsElement.textContent = formatCurrency(total);
    if (totalLiquidityElement) totalLiquidityElement.textContent = formatCurrency(state.liquidity);
    if (totalCryptoElement) totalCryptoElement.textContent = formatCurrency(state.crypto);
    
    // Aggiorna il grafico della composizione
    if (compositionChart) {
        compositionChart.data.datasets[0].data = [state.liquidity, state.crypto];
        compositionChart.update();
    }

    // Aggiorna il grafico dell'andamento
    const now = DateTime.now().toISO();
    state.history.push({ date: now, total });
    
    // Mantieni solo gli ultimi 30 giorni di storia
    if (state.history.length > 30) {
        state.history = state.history.slice(-30);
    }
    
    if (trendChart) {
        trendChart.data.labels = state.history.map(entry => entry.date);
        trendChart.data.datasets[0].data = state.history.map(entry => entry.total);
        trendChart.update();
    }

    saveData();
}

// Funzione per caricare i dati dal localStorage
function loadData() {
    const savedState = localStorage.getItem('portfolioState');
    if (savedState) {
        state = JSON.parse(savedState);
        updateTotalAssets();
    }
}

// Funzione per salvare i dati nel localStorage
function saveData() {
    localStorage.setItem('portfolioState', JSON.stringify(state));
}

// Funzione per resettare tutti i dati
function resetAllData() {
    if (confirm("Sei sicuro di voler resettare tutti i dati? Questa azione non può essere annullata.")) {
        state = {
            liquidity: 0,
            crypto: 0,
            history: []
        };
        localStorage.removeItem('portfolioState');
        localStorage.removeItem('liquidityState');
        localStorage.removeItem('cryptoState');
        updateTotalAssets();
        alert("Tutti i dati sono stati resettati.");
        window.location.reload(); // Ricarica la pagina per aggiornare tutti i componenti
    }
}

// Funzione per resettare solo i dati di liquidità
function resetLiquidityData() {
    if (confirm("Sei sicuro di voler resettare i dati di liquidità? Questa azione non può essere annullata.")) {
        state.liquidity = 0;
        localStorage.removeItem('liquidityState');
        updateTotalAssets();
        alert("I dati di liquidità sono stati resettati.");
        window.location.reload(); // Ricarica la pagina per aggiornare tutti i componenti
    }
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    if (assetCompositionChart) {
        compositionChart = new Chart(assetCompositionChart.getContext('2d'), compositionChartConfig);
    }

    if (assetTrendChart) {
        trendChart = new Chart(assetTrendChart.getContext('2d'), trendChartConfig);
    }

    updateTotalAssets();

    const resetButton = document.getElementById('reset-all');
    if (resetButton) {
        resetButton.addEventListener('click', resetAllData);
    }

    const resetLiquidityButton = document.getElementById('reset-liquidity');
    if (resetLiquidityButton) {
        resetLiquidityButton.addEventListener('click', resetLiquidityData);
    }
});

// Esporta le funzioni necessarie per le altre pagine
window.portfolioUtils = {
    updateFromLiquidity: function(amount) {
        state.liquidity += amount;
        updateTotalAssets();
    },
    updateFromCrypto: function(amount) {
        state.crypto = amount;
        updateTotalAssets();
    },
    updateTotalCrypto: function(totalValue) {
        state.crypto = totalValue;
        updateTotalAssets();
    },
    loadData,
    updateTotalAssets
};