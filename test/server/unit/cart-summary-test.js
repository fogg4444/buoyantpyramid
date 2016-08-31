// tests/part1/cart-summary-test.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var CartSummary = require('./cart-summary');

console.log('RUNS AGAIN =========================================');


describe('CartSummary', function() {
  
  it('true should equal true', function() {
    expect(true).to.equal(true);
  });

  console.log(CartSummary);

  it('getSubtotal() should return 0 if no items are passed in', function() {
    var cartSummary = new CartSummary([]);
    expect(cartSummary.getSubtotal([])).to.equal(0);
  });

  it('getSubtotal() should return total if items are passed it', function() {
    var cartSummary = new CartSummary([
      {
        id: 1,
        quantity: 4,
        price: 50
      },
      {
        id: 2,
        quantity: 2,
        price: 30
      }, {
        id: 3,
        quantity: 1,
        price: 40
      }
    ]);

    expect(cartSummary.getSubtotal()).to.equal(300);


  });
});