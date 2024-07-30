"use strict";

const errorMesgEl = document.querySelector(".error_message");
const budgetInputEl = document.querySelector(".budget_input");
const expenseDelEl = document.querySelector(".expensess_input");
const expenseAmountEl = document.querySelector(".expensess_amount");
const tblRecordEl = document.querySelector(".tbl_data");
const budgetCardEl = document.querySelector(".budget_card");
const expensesCardEl = document.querySelector(".expenses_card");
const balanceCardEl = document.querySelector(".balance_card");

let itemList = [];
let itemID = 0;

function btnEvents() {
  const btnBudgetCal = document.querySelector("#btn_budget");
  const btnExpensesCal = document.querySelector("#btn_expenses");
  
  btnBudgetCal.addEventListener("click", (e) => {
    e.preventDefault();
    budgetFun();
  });

  btnExpensesCal.addEventListener("click", (e) => {
    e.preventDefault();
    expensesFun();
  });

  document.querySelector("#login-form").addEventListener("submit", loginUser);
  document.querySelector("#register-form").addEventListener("submit", registerUser);
}

document.addEventListener("DOMContentLoaded", btnEvents);

function loginUser(e) {
  e.preventDefault();
  const username = document.querySelector("#login-username").value;
  const password = document.querySelector("#login-password").value;

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      showError(data.error);
    } else {
      loadUserData();
    }
  });
}

function registerUser(e) {
  e.preventDefault();
  const username = document.querySelector("#register-username").value;
  const password = document.querySelector("#register-password").value;

  fetch('/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      showError(data.error);
    } else {
      alert('Registration successful!');
    }
  });
}

function loadUserData() {
  fetch('/expenses')
    .then(res => res.json())
    .then(data => {
      itemList = data;
      itemList.forEach(addExpenses);
      showBalance();
    });
}

function expensesFun(){
  let expensesDescValue = expenseDelEl.value;
  let espensesAmountValue = expenseAmountEl.value;
  
  if(expensesDescValue == "" || espensesAmountValue == "" || budgetInputEl < 0){
    showError("Please Enter Expenses Desc or Expense Amount!");
  } else {
    let amount = parseInt(espensesAmountValue);
    expenseAmountEl.value = "";
    expenseDelEl.value = "";

    let expenses = {
      id: itemID,
      title: expensesDescValue,
      amount: amount
    };
    itemID++;
    itemList.push(expenses);

    addExpenses(expenses);
    saveExpense(expenses);
    showBalance();
  }
}

function addExpenses(expensesPara) {
  const html = `
    <ul class="tbl_tr_content">
      <li data-id=${expensesPara.id}>${expensesPara.id}</li>
      <li>${expensesPara.title}</li>
      <li><span>$</span>${expensesPara.amount}</li>
      <li>
        <button type="button" class="btn_edit">Edit</button>
        <button type="button" class="btn_delete">Delete</button>
      </li>
    </ul>
  `;

  tblRecordEl.insertAdjacentHTML("beforeend", html);

  const btnEdit = document.querySelectorAll(".btn_edit");
  btnEdit.forEach((btnedit) => {
    btnedit.addEventListener("click", (el) => {
      const element = el.target.parentElement.parentElement;
      const id = parseInt(element.querySelector("li").dataset.id);

      element.remove();

      const expenses = itemList.find(item => item.id === id);
      if (expenses) {
        expenseDelEl.value = expenses.title;
        expenseAmountEl.value = expenses.amount;
      }

      itemList = itemList.filter(item => item.id !== id);
    });
  });

  const btnDelete = document.querySelectorAll(".btn_delete");
  btnDelete.forEach((btndelete) => {
    btndelete.addEventListener("click", (el) => {
      const element = el.target.parentElement.parentElement;
      const id = parseInt(element.querySelector("li").dataset.id);

      element.remove();
      itemList = itemList.filter(item => item.id !== id);
      showBalance();
    });
  });
}

function saveExpense(expense) {
  fetch('/expenses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(expense)
  });
}

function budgetFun() {
  const budgetValue = budgetInputEl.value;

  if (budgetValue === "" || budgetValue < 0) {
    showError("Please Enter Budget Amount | More Than 0");
  } else {
    budgetCardEl.textContent = budgetValue;
    budgetInputEl.value = "";
    showBalance();
  }
}

function showBalance(){
  const expenses = totalExpenses();
  const total = parseInt(budgetCardEl.textContent) - expenses;
  balanceCardEl.textContent = total;
}

function totalExpenses(){
  let total = 0;
  if(itemList.length > 0){
    total = itemList.reduce((acc, curr) => {
      acc += curr.amount;
      return acc;
    }, 0);
  }
  expensesCardEl.textContent = total;
  return total;
}

function showError(message) {
  errorMesgEl.style.display = 'block';
  errorMesgEl.textContent = message;
  setTimeout(() => {
    errorMesgEl.style.display = 'none';
  }, 2500);
}

