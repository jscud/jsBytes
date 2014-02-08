
/**
 * Namespace for functions to work with byte arrays.
 */
var jsBytes = {};

jsBytes.Error = function(msg) {
  this.message = msg;
};

jsBytes.Error.prototype.toString = function() {
  return 'jsBytes.Error: ' + this.message;
};

jsBytes.appendByte = function(bytes, b) {
  if (b >= 0 && b < 256) {
    bytes.push(b);
  } else {
    throw new jsBytes.Error('Byte ' + b + ' was not between 0 and 255');
  }
};
