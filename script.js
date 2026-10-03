// ---------- 1. Data (loaded from localStorage) ----------
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentFilter = "all";
let currentType = "expense";

const icons = {
  Food: "🍔", Travel: "🚌", Study: "📚",
  Bills: "💡", Salary: "💰", Savings: "🏦", Other: "📝"
};

// ---------- 2. Element references ----------
const form = document.getElementById("tx-form");
const list = document.getElementById("list");
const errorBox = document.getElementById("error");

// Format numbers Indian style: 12500 -> ₹12,500
function money(n) {
  return "₹" + n.toLocaleString("en-IN");
}

// ---------- 3. Save to localStorage ----------
function save() {
  // localStorage stores only text, so array -> string
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ---------- 4. Expense / Income toggle ----------
document.getElementById("type-toggle").addEventListener("click", function (e) {
  if (e.target.dataset.type) {
    currentType = e.target.dataset.type;
    renderToggle();
  }
});

function renderToggle() {
  document.querySelectorAll(".type-btn").forEach((btn) => {
    const active = btn.dataset.type === currentType;
    btn.classList.toggle("bg-white", active);
    btn.classList.toggle("shadow-sm", active);
    btn.classList.toggle("text-slate-500", !active);
  });
}

renderToggle(); // run once so the default button looks selected

// ---------- 5. Add transaction ----------
form.addEventListener("submit", function (e) {
  e.preventDefault(); // stop page reload

  const title = document.getElementById("title").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value || new Date().toISOString().slice(0, 10);

  // Validation
  if (title === "" || amount <= 0) {
    errorBox.textContent = "Enter a title and an amount greater than 0.";
    errorBox.classList.remove("hidden");
    return;
  }
  errorBox.classList.add("hidden");

  transactions.push({ id: Date.now(), title, amount, type: currentType, category, date });
  save();
  form.reset();
  render();
});

// ---------- TEMPORARY render (we replace this in Step 6) ----------
function render() {
  console.log(transactions);
}

// ---------- 6. Delete transaction ----------
function deleteTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id); // keep all except this id
  save();
  render();
}

// ---------- 7. Totals ----------
function updateTotals() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = income - expense;

  document.getElementById("income").textContent = money(income);
  document.getElementById("expense").textContent = money(expense);
  document.getElementById("balance").textContent = (balance < 0 ? "-" : "") + money(Math.abs(balance));
}

// ---------- 8. Render list ----------
function render() {
  updateTotals();
  list.innerHTML = "";

  const visible = transactions.filter(
    (t) => currentFilter === "all" || t.type === currentFilter
  );

  if (visible.length === 0) {
    list.innerHTML =
      '<li class="bg-white rounded-2xl p-6 text-center text-slate-500 text-sm">Nothing here yet. Add your first transaction above.</li>';
  }

  visible.slice().reverse().forEach((t) => {
    const li = document.createElement("li");
    li.className = "bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3";

    const icon = document.createElement("div");
    icon.className = "w-11 h-11 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center text-xl";
    icon.textContent = icons[t.category] || "📝";

    const info = document.createElement("div");
    info.className = "flex-1 min-w-0";
    const name = document.createElement("p");
    name.className = "font-semibold truncate";
    name.textContent = t.title; // textContent keeps user input safe
    const meta = document.createElement("p");
    meta.className = "text-xs text-slate-500";
    meta.textContent = t.category + " · " + t.date;
    info.append(name, meta);

    const amt = document.createElement("span");
    amt.className = "font-bold " + (t.type === "income" ? "text-emerald-600" : "text-rose-600");
    amt.textContent = (t.type === "income" ? "+" : "-") + money(t.amount);

    const del = document.createElement("button");
    del.className = "text-slate-400 hover:text-rose-600 text-lg px-1";
    del.textContent = "✕";
    del.setAttribute("aria-label", "Delete " + t.title);
    del.addEventListener("click", () => deleteTransaction(t.id));

    li.append(icon, info, amt, del);
    list.appendChild(li);
  });

  // Highlight active filter button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    const active = btn.dataset.filter === currentFilter;
    btn.classList.toggle("bg-indigo-700", active);
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("text-slate-500", !active);
  });
}

// ---------- 9. Filters ----------
document.getElementById("filters").addEventListener("click", function (e) {
  if (e.target.dataset.filter) {
    currentFilter = e.target.dataset.filter;
    render();
  }
});

// ---------- 10. First load ----------
render();

