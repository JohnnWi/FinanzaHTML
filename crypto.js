// Stato delle crypto
let cryptoState = {
    portfolio: [],
    history: []
};

// Elementi DOM
const cryptoForm = document.getElementById('crypto-form');
const cryptoPortfolioList = document.getElementById('crypto-portfolio');
const totalCryptoValue = document.getElementById('total-crypto-value');
const cryptoTrendChart = document.getElementById('crypto-trend-chart');

// Configurazione del grafico
const cryptoTrendChartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Valore Totale Crypto',
            data: [],
            borderColor: '#F59E0B',
            fill: false
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'day'
                }
            },
            y: {
                beginAtZero: true
            }
        }
    }
};

let chart;

// Funzione per formattare le somme di denaro
function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Aggiungi o modifica una crypto
cryptoForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const index = document.getElementById('crypto-index').value;
    const name = document.getElementById('crypto-name').value;
    const amount = parseFloat(document.getElementById('crypto-amount').value);
    const buyPrice = parseFloat(document.getElementById('crypto-buy-price').value);
    const currentPrice = parseFloat(document.getElementById('crypto-current-price').value);
    const purchaseDate = document.getElementById('crypto-purchase-date').value;
    
    if (isNaN(amount) || amount <= 0 || isNaN(buyPrice) || buyPrice <= 0 || isNaN(currentPrice) || currentPrice <= 0) {
        alert("Per favore, inserisci valori validi maggiori di zero.");
        return;
    }
    
    const crypto = { name, amount, buyPrice, currentPrice, purchaseDate };
    
    if (index === '') {
        cryptoState.portfolio.push(crypto);
    } else {
        cryptoState.portfolio[parseInt(index)] = crypto;
    }
    
    renderCryptoPortfolio();
    updateCryptoTrendChart();
    saveCryptoData();
    
    // Reset form
    cryptoForm.reset();
    document.getElementById('crypto-index').value = '';
});

// Renderizza il portfolio crypto
function renderCryptoPortfolio() {
    cryptoPortfolioList.innerHTML = '';
    let totalValue = 0;
    cryptoState.portfolio.forEach((crypto, index) => {
        const cryptoTotalValue = crypto.amount * crypto.currentPrice;
        const profitLoss = cryptoTotalValue - (crypto.amount * crypto.buyPrice);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="border px-4 py-2">${crypto.name}</td>
            <td class="border px-4 py-2">${crypto.amount}</td>
            <td class="border px-4 py-2">${formatCurrency(crypto.buyPrice)}</td>
            <td class="border px-4 py-2">${formatCurrency(crypto.currentPrice)}</td>
            <td class="border px-4 py-2">${formatCurrency(cryptoTotalValue)}</td>
            <td class="border px-4 py-2 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${formatCurrency(profitLoss)}
            </td>
            <td class="border px-4 py-2">${crypto.purchaseDate}</td>
            <td class="border px-4 py-2">
                <button class="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2" onclick="editCrypto(${index})">
                    Modifica
                </button>
                <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="removeCrypto(${index})">
                    Rimuovi
                </button>
            </td>
        `;
        cryptoPortfolioList.appendChild(tr);
        totalValue += cryptoTotalValue;
    });
    
    totalCryptoValue.textContent = formatCurrency(totalValue);
    window.portfolioUtils.updateTotalCrypto(totalValue);
}

// Aggiorna il grafico dell'andamento crypto
function updateCryptoTrendChart() {
    const now = new Date().toISOString();
    const totalValue = cryptoState.portfolio.reduce((total, crypto) => total + crypto.amount * crypto.currentPrice, 0);
    
    cryptoState.history.push({ date: now, value: totalValue });
    
    // Mantieni solo gli ultimi 30 giorni di storia
    if (cryptoState.history.length > 30) {
        cryptoState.history = cryptoState.history.slice(-30);
    }
    
    chart.data.labels = cryptoState.history.map(entry => entry.date);
    chart.data.datasets[0].data = cryptoState.history.map(entry => entry.value);
    chart.update();
}

// Modifica una crypto
function editCrypto(index) {
    const crypto = cryptoState.portfolio[index];
    document.getElementById('crypto-index').value = index;
    document.getElementById('crypto-name').value = crypto.name;
    document.getElementById('crypto-amount').value = crypto.amount;
    document.getElementById('crypto-buy-price').value = crypto.buyPrice;
    document.getElementById('crypto-current-price').value = crypto.currentPrice;
    document.getElementById('crypto-purchase-date').value = crypto.purchaseDate;
}

// Rimuovi una crypto
function removeCrypto(index) {
    if (confirm('Sei sicuro di voler rimuovere questa crypto?')) {
        cryptoState.portfolio.splice(index, 1);
        renderCryptoPortfolio();
        updateCryptoTrendChart();
        saveCryptoData();
    }
}

// Carica i dati crypto dal localStorage
function loadCryptoData() {
    const savedCryptoState = localStorage.getItem('cryptoState');
    if (savedCryptoState) {
        cryptoState = JSON.parse(savedCryptoState);
        renderCryptoPortfolio();
        updateCryptoTrendChart();
    }
}

// Salva i dati crypto nel localStorage
function saveCryptoData() {
    localStorage.setItem('cryptoState', JSON.stringify(cryptoState));
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    chart = new Chart(cryptoTrendChart.getContext('2d'), cryptoTrendChartConfig);
    window.portfolioUtils.loadData();
    loadCryptoData();
});