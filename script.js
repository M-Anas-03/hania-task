// App State tracking variables initialized from LocalStorage
let totalBudget = parseFloat(localStorage.getItem('totalBudget')) || 1000;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// App Boot-up / UI Initialization when file reads
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('budget-input').value = totalBudget;
    updateUI();
});

// Update the global monthly allowance limits
function updateBudget() {
    const inputVal = parseFloat(document.getElementById('budget-input').value);
    if (isNaN(inputVal) || inputVal <= 0) {
        alert("Please enter a valid positive budget amount.");
        return;
    }
    totalBudget = inputVal;
    localStorage.setItem('totalBudget', totalBudget);
    updateUI();
}

// Add a new log entry to tracking database
function addExpense() {
    const titleInput = document.getElementById('expense-title');
    const amountInput = document.getElementById('expense-amount');
    const categoryInput = document.getElementById('expense-category');

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (!title || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid description and positive numerical amount.");
        return;
    }

    const newExpense = {
        id: Date.now(), // unique timestamp ID
        title: title,
        amount: amount,
        category: category
    };

    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    
    // Reset input values
    titleInput.value = "";
    amountInput.value = "";
    
    updateUI();
}

// Delete an entry from the tracking list
function deleteExpense(id) {
    expenses = expenses.filter(exp => exp.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateUI();
}

// Wipe out the database clear
function clearAllExpenses() {
    if (confirm("Are you sure you want to delete all entries?")) {
        expenses = [];
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateUI();
    }
}

// Main Interface Render Orchestration Loop
function updateUI() {
    const tableBody = document.getElementById('expense-table-body');
    if(!tableBody) return;
    
    tableBody.innerHTML = ""; // reset table UI
    let totalSpent = 0;
    
    if (expenses.length === 0) {
        document.getElementById('no-expenses-msg').classList.remove('d-none');
    } else {
        document.getElementById('no-expenses-msg').classList.add('d-none');
        expenses.forEach(exp => {
            totalSpent += exp.amount;
            tableBody.innerHTML += `
                <tr>
                    <td class="fw-bold">${exp.title}</td>
                    <td><span class="badge bg-secondary">${exp.category}</span></td>
                    <td class="text-danger fw-bold">$${exp.amount.toFixed(2)}</td>
                    <td class="text-center">
                        <button onclick="deleteExpense(${exp.id})" class="btn btn-sm btn-danger">❌ Delete</button>
                    </td>
                </tr>
            `;
        });
    }

    const balance = totalBudget - totalSpent;

    // Render numbers onto screen panels
    document.getElementById('display-budget').innerText = totalBudget.toFixed(2);
    document.getElementById('display-expenses').innerText = totalSpent.toFixed(2);
    document.getElementById('display-balance').innerText = balance.toFixed(2);

    // Calculate progress threshold metrics
    let percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const progressBar = document.getElementById('budget-progress-bar');
    const statusText = document.getElementById('budget-status-text');

    progressBar.style.width = `${Math.min(percentUsed, 100)}%`;
    progressBar.innerText = `${Math.round(percentUsed)}% Used`;

    // Visual feedback: Change color of progress tracking if over budget
    if (percentUsed >= 100) {
        progressBar.className = "progress-bar bg-danger";
        statusText.innerText = "⚠️ Alert: You have exceeded your designated budget limit!";
        statusText.className = "text-danger fw-bold";
    } else if (percentUsed >= 80) {
        progressBar.className = "progress-bar bg-warning text-dark";
        statusText.innerText = "Warning: You have used up over 80% of your allowed budget.";
        statusText.className = "text-warning fw-bold";
    } else {
        progressBar.className = "progress-bar bg-success";
        statusText.innerText = "You are safely within your budget limit.";
        statusText.className = "text-muted";
    }
}
