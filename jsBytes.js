
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
    throw new jsBytes.Error('Byte ' + b + ' is not between 0 and 255');
  }
};

jsBytes.HALF_BYTE_HEX_MAP = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
 10: 'A',
 11: 'B',
 12: 'C',
 13: 'D',
 14: 'E',
 15: 'F'
};

/**
 * Produces a text string of hexadecimal digits from an array of bytes.
 */
jsBytes.bytesToHex = function(bytes) {
  var s = '';
  for (var i = 0; i < bytes.length; i++) {
    s += jsBytes.HALF_BYTE_HEX_MAP[bytes[i] >> 4];
    s += jsBytes.HALF_BYTE_HEX_MAP[bytes[i] % 16];
  }
  return s;
};

jsBytes.HEX_TO_HALF_BYTE_MAP = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'A': 10,
  'B': 11,
  'C': 12,
  'D': 13,
  'E': 14,
  'F': 15
};

/**
 * Produces an array of bytes from a string of hexadecimal digits.
 */
jsBytes.hexToBytes = function(hexString) {
  var bytes = [];
  for (var i = 0; i < hexString.length - 1; i += 2) {
    bytes.push(jsBytes.HEX_TO_HALF_BYTE_MAP[hexString[i+1]] + 
               (jsBytes.HEX_TO_HALF_BYTE_MAP[hexString[i]] << 4));
  }
  return bytes;
};

/**
 * Produces an array of four bytes to represent the integer value.
 * Default output encodes ints in little endian format. Handles signed
 * as well as unsigned integers.
 */
jsBytes.int32ToBytes = function(x, opt_bigEndian) {
  if (x != Math.floor(x)) {
    throw new jsBytes.Error(x + ' is not a 32 bit integer');
  }
  var bytes = [];
  if (x >= 0 && x <= 2147483647) {
    for (var i = 0; i < 4; i++) {
      bytes.push(x % 256);
      x = x >> 8;
    }
  } else if (x > 2147483647 && x <= 4294967295) {
    for (var i = 0; i < 4; i++) {
      bytes.push(x % 256);
      x = Math.floor(x / 256);
    }
  } else if (x < 0 && x >= -2147483648) {
    x = (x * -1) - 1;
    for (var i = 0; i < 4; i++) {
      bytes.push(255 - (x % 256));
      x = x >> 8;
    }
  } else {
    throw new jsBytes.Error(x + ' is not a 32 bit integer');
  }
  return bytes;
};

