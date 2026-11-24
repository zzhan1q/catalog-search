'use strict';

function words(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

// A single insertion, deletion or substitution; short tokens require exact prefixes.
function oneEdit(a, b) {
  if (a.length > b.length) return oneEdit(b, a);
  if (b.length - a.length > 1) return false;
  let j = 0;
  let edits = 0;
  for (let i = 0; i < a.length; i++, j++) {
    if (a[i] === b[j]) continue;
    if (++edits > 1) return false;
    if (a.length !== b.length) i--;
  }
  return edits + b.length - j === 1;
}

// A blank field clears the limit; invalid text does not.
function parseMaxPrice(text) {
  const value = text.trim();
  if (!value) return Infinity;
  const amount = value.replace(/^\$\s*/, '');
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(amount)) return null;
  const number = Number(amount.replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function searchProducts(products, query, { category = '', maxPrice = Infinity } = {}) {
  const terms = words(query);
  const matches = [];
  for (const item of products) {
    if ((category && item.category !== category) || item.price > maxPrice) continue;
    const name = words(item.name);
    const details = words(`${item.category} ${item.color} ${item.note}`);
    const scores = terms.map(term => {
      if (name.includes(term)) return 4;
      if (name.some(token => token.startsWith(term))) return 3;
      if (details.includes(term)) return 2;
      if (term.length >= 4 && name.some(token => oneEdit(term, token))) return 1;
      return 0;
    });
    if (scores.every(Boolean)) matches.push({ item, score: scores.reduce((a, b) => a + b, 0) });
  }
  return matches.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'en'))
    .map(({ item }) => item);
}

if (typeof module === 'object') module.exports = { oneEdit, parseMaxPrice, searchProducts };
