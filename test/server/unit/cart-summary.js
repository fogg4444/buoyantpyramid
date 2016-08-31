
var CartSummary = function(items) {
  this._items = items;
};

CartSummary.prototype.getSubtotal = function() {
  var total = 0;
  for (var item in this._items) {
    var thisItem = this._items[item];
    total = total + thisItem.price * thisItem.quantity;
  }
  return total
};

module.exports = CartSummary;