const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const typeInput = document.getElementById("type");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const listEl = document.getElementById("transaction-list");

const modal = document.getElementById("startupModal");
const startingBalanceInput = document.getElementById("startingBalance");

let chart = null;

let transactions = loadData("transactions", []);
let startingBalance = loadData("startingBalance", null);

/* =====================
   INIT
===================== */
init();

function init() {
  checkStartingBalance();
  renderAll();

  form.addEventListener("submit", addTransaction);
}

/* =====================
   STORAGE
===================== */
function loadData(key, fallback) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =====================
   STARTING BALANCE
===================== */
function checkStartingBalance() {
  if (startingBalance === null) {
    modal.style.display = "flex";
  }
}

function saveStartingBalance() {
  const value = Number(startingBalanceInput.value);

  if (isNaN(value) || value < 0) {
    alert("Masukkan saldo valid.");
    return;
  }

  startingBalance = value;
  saveData("startingBalance", value);

  modal.style.display = "none";
  renderAll();
}

/* =====================
   TRANSACTION
===================== */
function addTransaction(e) {
  e.preventDefault();

  const desc = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (!desc || amount <= 0) {
    alert("Isi data dengan benar.");
    return;
  }

  const transaction = {
    id: Date.now(),
    desc: desc,
    amount: amount,
    category: categoryInput.value,
    type: typeInput.value
  };

  transactions.push(transaction);

  saveData("transactions", transactions);

  form.reset();

  renderAll();
}

function deleteTransaction(id) {
  transactions = transactions.filter(item => item.id !== id);

  saveData("transactions", transactions);

  renderAll();
}

/* =====================
   CALCULATION
===================== */
function calculateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(item => {
    if (item.type === "income") {
      income += item.amount;
    } else {
      expense += item.amount;
    }
  });

  const balance = startingBalance + income - expense;

  return {
    income,
    expense,
    balance
  };
}

/* =====================
   RENDER
===================== */
function renderAll() {
  renderSummary();
  renderTransactions();
  renderChart();
}

function renderSummary() {
  if (startingBalance === null) return;

  const summary = calculateSummary();

  balanceEl.textContent = formatCurrency(summary.balance);
  incomeEl.textContent = formatCurrency(summary.income);
  expenseEl.textContent = formatCurrency(summary.expense);
}

function renderTransactions() {
  listEl.innerHTML = "";

  transactions
    .slice()
    .reverse()
    .forEach(item => {
      const li = document.createElement("li");

      li.innerHTML = `
        <div class="transaction-info">
          <span class="transaction-title">${item.desc}</span>

          <span class="transaction-meta">
            ${formatCurrency(item.amount)}
            <span class="category-tag">${item.category}</span>
          </span>
        </div>

        <button class="delete-btn" onclick="deleteTransaction(${item.id})">
          X
        </button>
      `;

      listEl.appendChild(li);
    });
}

/* =====================
   CHART
===================== */
function renderChart() {
  const expenseData = {};

  transactions.forEach(item => {
    if (item.type === "expense") {
      if (!expenseData[item.category]) {
        expenseData[item.category] = 0;
      }

      expenseData[item.category] += item.amount;
    }
  });

  const labels = Object.keys(expenseData);
  const values = Object.values(expenseData);

  const ctx = document.getElementById("expenseChart");

  if (chart) {
    chart.destroy();
  }

  if (labels.length === 0) return;

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: values,
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

/* =====================
   SETTINGS
===================== */
function resetApp() {
  const confirmReset = confirm("Hapus semua data?");

  if (!confirmReset) return;

  localStorage.clear();
  location.reload();
}

function changeBalance() {
  const input = prompt("Masukkan saldo baru:", startingBalance);

  if (input === null) return;

  const value = Number(input);

  if (isNaN(value) || value < 0) {
    alert("Nominal tidak valid.");
    return;
  }

  startingBalance = value;

  saveData("startingBalance", value);

  renderAll();
}

/* =====================
   HELPERS
===================== */
function formatCurrency(number) {
  return "Rp " + number.toLocaleString("id-ID");
}