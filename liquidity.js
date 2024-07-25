// Stato della liquidità
let liquidityState = {
    transactions: []
};

// Elementi DOM
const liquidityForm = document.getElementById('liquidity-form');
const liquidityTransactionsList = document.getElementById('liquidity-transactions');
const totalLiquidityElement = document.getElementById('total-liquidity');
const totalCryptoElement = document.getElementById('total-crypto');

// Funzione per formattare le somme di denaro
function formatCurrency(amount) {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Aggiungi una nuova transazione di liquidità
liquidityForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    const type = document.getElementById('type').value;
    
    if (isNaN(amount) || amount <= 0) {
        alert("Per favore, inserisci un importo valido maggiore di zero.");
        return;
    }
    
    const transaction = { 
        amount: Number(amount.toFixed(2)),
        description, 
        date, 
        type 
    };
    liquidityState.transactions.unshift(transaction);
    const actualAmount = type === 'income' ? transaction.amount : -transaction.amount;
    window.portfolioUtils.updateFromLiquidity(actualAmount);
    
    renderLiquidityTransactions();
    saveLiquidityData();
    
    // Reset form
    liquidityForm.reset();
});

// Renderizza la lista delle transazioni di liquidità
function renderLiquidityTransactions() {
    liquidityTransactionsList.innerHTML = '';
    liquidityState.transactions.forEach((transaction, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="border px-4 py-2">${transaction.date}</td>
            <td class="border px-4 py-2">${transaction.type === 'income' ? 'Entrata' : 'Uscita'}</td>
            <td class="border px-4 py-2 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                ${formatCurrency(transaction.amount)}
            </td>
            <td class="border px-4 py-2">${transaction.description}</td>
            <td class="border px-4 py-2">
                <button class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600" onclick="removeLiquidityTransaction(${index})">
                    Rimuovi
                </button>
            </td>
        `;
        liquidityTransactionsList.appendChild(tr);
    });
    updateTotals();
}

// Rimuovi una transazione di liquidità
function removeLiquidityTransaction(index) {
    const transaction = liquidityState.transactions[index];
    const amount = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    window.portfolioUtils.updateFromLiquidity(amount);
    liquidityState.transactions.splice(index, 1);
    renderLiquidityTransactions();
    saveLiquidityData();
}

// Carica i dati di liquidità dal localStorage
function loadLiquidityData() {
    const savedLiquidityState = localStorage.getItem('liquidityState');
    if (savedLiquidityState) {
        liquidityState = JSON.parse(savedLiquidityState);
        renderLiquidityTransactions();
    }
}

// Salva i dati di liquidità nel localStorage
function saveLiquidityData() {
    localStorage.setItem('liquidityState', JSON.stringify(liquidityState));
}

// Aggiorna i totali visualizzati
function updateTotals() {
    const totalLiquidity = liquidityState.transactions.reduce((total, transaction) => {
        return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
    }, 0);
    
    totalLiquidityElement.textContent = formatCurrency(totalLiquidity);
    
    // Aggiorna il totale delle crypto dalla dashboard
    const portfolioState = JSON.parse(localStorage.getItem('portfolioState') || '{"crypto": 0}');
    totalCryptoElement.textContent = formatCurrency(portfolioState.crypto);
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioUtils.loadData();
    loadLiquidityData();
    updateTotals();
});