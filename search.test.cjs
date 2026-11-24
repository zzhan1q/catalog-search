const assert = require('node:assert/strict');
const test = require('node:test');
require('./products.js');
const { searchProducts, oneEdit, parseMaxPrice } = require('./search.js');
const products = globalThis.BENCH_PRODUCTS;
const ids = (query, filters) => searchProducts(products, query, filters).map(row => row.id);

test('empty query shows the whole catalog', () => assert.equal(ids('  ').length, 12));
test('adjacent transpositions are not treated as one edit', () => assert.deepEqual(ids('pivto'), []));
test('insertion, deletion and replacement work', () => {
  assert.equal(oneEdit('piivot','pivot'), true);
  assert.equal(oneEdit('pivt','pivot'), true);
  assert.deepEqual(ids('desk lamq'), ['L01']);
});
test('price ceiling includes equal prices and combines with category', () => {
  assert.deepEqual(ids('light', { maxPrice: 30, category: 'Lighting' }), ['L03']);
  assert.deepEqual(ids('light', { maxPrice: 29, category: 'Lighting' }), []);
});
test('blank price means no cap, but zero stays active', () => {
  assert.equal(parseMaxPrice('  '), Infinity);
  assert.equal(parseMaxPrice('0'), 0);
  assert.deepEqual(ids('', { maxPrice: parseMaxPrice('0') }), []);
});
test('accepts dollar symbol, decimal point and decimal comma', () => {
  for (const input of ['30', '$30', ' 30.00 ', '$ 30,00']) {
    assert.equal(parseMaxPrice(input), 30);
    assert.equal(ids('', { maxPrice: parseMaxPrice(input) }).length, 8);
  }
  assert.equal(ids('', { maxPrice: parseMaxPrice('29,99') }).length, 6);
});
test('invalid price never becomes an unlimited price', () => {
  for (const input of ['e', '1e', 'abc', '-1', '30 USD', '30.123', '$', 'Infinity']) {
    assert.equal(parseMaxPrice(input), null, input);
  }
});
test('unknown word produces an empty state', () => assert.deepEqual(ids('zzzzzzz'), []));
test('exact name token outranks a tolerated typo', () => {
  const sample = [
    { id: 'a', name: 'Lamo', category: '', color: '', note: '' },
    { id: 'b', name: 'Lamp', category: '', color: '', note: '' },
  ];
  assert.equal(searchProducts(sample, 'lamp')[0].id, 'b');
});
