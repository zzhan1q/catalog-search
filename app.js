'use strict';

const products = globalThis.BENCH_PRODUCTS;
const form = document.querySelector('#filters');
const query = form.elements.query;
const budget = form.elements.budget;
const category = form.elements.category;
const grid = document.querySelector('#results');
const statusLine = document.querySelector('#status');
const budgetError = document.querySelector('#budget-error');
const empty = document.querySelector('#empty');
const template = document.querySelector('#product');
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 });

for (const value of [...new Set(products.map(item => item.category))].sort()) {
  category.add(new Option(value, value));
}

function render() {
  const cap = parseMaxPrice(budget.value);
  const invalid = cap === null;
  budgetError.hidden = !invalid;
  budget.setAttribute('aria-invalid', String(invalid));
  if (invalid) {
    grid.replaceChildren();
    statusLine.textContent = '';
    empty.hidden = true;
    return;
  }
  const matches = searchProducts(products, query.value, { category: category.value, maxPrice: cap });
  grid.replaceChildren(...matches.map(item => {
    const node = template.content.cloneNode(true);
    for (const field of ['id', 'category', 'name', 'note', 'color']) {
      node.querySelector(`[data-field="${field}"]`).textContent = item[field];
    }
    node.querySelector('[data-field="price"]').textContent = money.format(item.price);
    node.querySelector('.swatch').dataset.color = item.color;
    return node;
  }));
  const limit = Number.isFinite(cap) ? ` · ${money.format(cap)} or less` : '';
  statusLine.textContent = `${matches.length} of ${products.length} items${limit}`;
  empty.hidden = matches.length > 0;
}

form.addEventListener('input', render);
form.addEventListener('change', render);
form.addEventListener('submit', event => { event.preventDefault(); render(); });
form.addEventListener('reset', () => requestAnimationFrame(render));
render();
