
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
 * Produces an array of the specified number of bytes to represent the integer
 * value. Default output encodes ints in little endian format. Handles signed
 * as well as unsigned integers. Due to limitations in JavaScript's number
 * format, x cannot be a true 64 bit integer (8 bytes).
 */
jsBytes.intToBytes_ = function(x, numBytes, unsignedMax, opt_bigEndian) {
  var signedMax = Math.floor(unsignedMax / 2);
  var negativeMax = (signedMax + 1) * -1;
  if (x != Math.floor(x) || x < negativeMax || x > unsignedMax) {
    throw new jsBytes.Error(
        x + ' is not a ' + (numBytes * 8) + ' bit integer');
  }
  var bytes = [];
  var current;
  // Number type 0 is in the positive int range, 1 is larger than signed int,
  // and 2 is negative int.
  var numberType = x >= 0 && x <= signedMax ? 0 :
      x > signedMax && x <= unsignedMax ? 1 : 2;
  if (numberType == 2) {
    x = (x * -1) - 1;
  }
  for (var i = 0; i < numBytes; i++) {
    if (numberType == 2) {
      current = 255 - (x % 256);
    } else {
      current = x % 256;
    }

    if (opt_bigEndian) {
      bytes.unshift(current);
    } else {
      bytes.push(current);
    }

    if (numberType == 1) {
      x = Math.floor(x / 256);
    } else {
      x = x >> 8;
    }
  }
  return bytes;

}

/**
 * Produces an array of four bytes to represent the integer value.
 * Default output encodes ints in little endian format. Handles signed
 * as well as unsigned integers.
 */
jsBytes.int32ToBytes = function(x, opt_bigEndian) {
  return jsBytes.intToBytes_(x, 4, 4294967295, opt_bigEndian);
};

jsBytes.int16ToBytes = function(x, opt_bigEndian) {
  return jsBytes.intToBytes_(x, 2, 65535, opt_bigEndian);
};

jsBytes.checkBytesToIntInput = function(bytes, numBytes, opt_startIndex) {
  var startIndex = opt_startIndex || 0;
  if (startIndex < 0) {
    throw new jsBytes.Error('Start index should not be negative');
  }
  if (bytes.length < startIndex + numBytes) {
    throw new jsBytes.Error('Need at least ' + numBytes +
                            ' bytes to convert to an integer');
  }
  return startIndex;
};

jsBytes.littleEndianBytesToSignedInt32 = function(bytes, opt_startIndex) {
  var index = jsBytes.checkBytesToIntInput(bytes, 4, opt_startIndex);
  value = bytes[index];
  value += bytes[index + 1] << 8;
  value += bytes[index + 2] << 16;
  value += bytes[index + 3] << 24;
  return value;
};

jsBytes.littleEndianBytesToUnsignedInt32 = function(bytes, opt_startIndex) {
  var index = jsBytes.checkBytesToIntInput(bytes, 4, opt_startIndex);
  var value = 0;
  jsBytes.checkBytesToIntInput(bytes, 4, index);
  for (var i = index, accum = 1; i < index + 4; i++, accum *= 256) {
    value += bytes[i] * accum;
  }
  return value;
};

jsBytes.bigEndianBytesToSignedInt32 = function(bytes, opt_startIndex) {
  var index = jsBytes.checkBytesToIntInput(bytes, 4, opt_startIndex);
  value = bytes[index + 3];
  value += bytes[index + 2] << 8;
  value += bytes[index + 1] << 16;
  value += bytes[index] << 24;
  return value;
};

jsBytes.bigEndianBytesToUnsignedInt32 = function(bytes, opt_startIndex) {
  var index = jsBytes.checkBytesToIntInput(bytes, 4, opt_startIndex);
  var value = 0;
  for (var i = index + 3, accum = 1; i >= index; i--, accum *= 256) {
    value += bytes[i] * accum;
  }
  return value;
};

jsBytes.littleEndianBytesToSignedInt16 = function(bytes, opt_startIndex) {
  var index = jsBytes.checkBytesToIntInput(bytes, 2, opt_startIndex);
  var isNegative = bytes[index + 1] > 127;
  var negativeShift = isNegative ? 255 : 0;
  value = bytes[index] - negativeShift - (isNegative ? 1 : 0);
  value += (bytes[index + 1] - negativeShift) << 8;
  return value;
};

jsBytes.littleEndianBytesToUnsignedInt16 = function(bytes, opt_startIndex) {
  var index = jsBytes.checkBytesToIntInput(bytes, 2, opt_startIndex);
  var value = 0;
  for (var i = index, accum = 1; i < index + 2; i++, accum *= 256) {
    value += bytes[i] * accum;
  }
  return value;
};

jsBytes.bigEndianBytesToSignedInt16 = function(bytes, opt_startIndex) {
  var index = jsBytes.checkBytesToIntInput(bytes, 2, opt_startIndex);
  var isNegative = bytes[index] > 127;
  var negativeShift = isNegative ? 255 : 0;
  value = bytes[index + 1] - negativeShift - (isNegative ? 1 : 0);
  value += (bytes[index] - negativeShift) << 8;
  return value;
};

jsBytes.bigEndianBytesToUnsignedInt16 = function(bytes, opt_startIndex) {
  var index = jsBytes.checkBytesToIntInput(bytes, 2, opt_startIndex);
  var value = 0;
  for (var i = index + 1, accum = 1; i >= index; i--, accum *= 256) {
    value += bytes[i] * accum;
  }
  return value;
};

jsBytes.stringToUtf8Bytes = function(uniString) {
  var codePoint;
  var bytes = [];
  for (var i = 0; i < uniString.length; i++) {
    codePoint = uniString.charCodeAt(i);
    if (codePoint >= 0 && codePoint < 128) {
      bytes.push(codePoint);
    } else if (codePoint >= 128 && codePoint < 2048) {
      bytes.push(192 + ((codePoint >>> 6) & 31));
      bytes.push(128 + (codePoint & 63));
    } else if (codePoint >= 2048 && codePoint < 65536) {
      // Original aaaabbbb bbcccccc
      // Becomes  1110aaaa 10bbbbbb 10cccccc
      bytes.push(224 + ((codePoint >>> 12) & 15));
      bytes.push(128 + ((codePoint >>> 6) & 63));
      bytes.push(128 + (codePoint & 63));
    } else if (codePoint >= 65536 && codePoint < 2097152) {
      // Original 000aaabb bbbbcccc ccdddddd 
      // Becomes  11110aaa 10bbbbbb 10cccccc 10dddddd
      bytes.push(240 + ((codePoint >>> 18) & 7));
      bytes.push(128 + ((codePoint >>> 12) & 63));
      bytes.push(128 + ((codePoint >>> 6) & 63));
      bytes.push(128 + (codePoint & 63));
    } else {
      // Higher codepoints are not supported in UTF-8 following RFC 3629.
      throw new jsBytes.Error(
          'Code point ' + codePoint + ' for character ' +
          uniString.charAt(i) + ' cannot be converted to UTF-8');
    }
  }
  return bytes;
};

jsBytes.utf8BytesToString = function(bytes) {
  var i = 0;
  var s = '';
  var currentByte;
  var bytesToProcess = 0;
  var charCode;
  while (i < bytes.length) {
    currentByte = bytes[i];
    if (currentByte < 128) {
      charCode = currentByte;
    } else if (currentByte >= 192 && currentByte < 224) {
      charCode = (currentByte & 31) << 6;
      bytesToProcess = 1;
    } else if (currentByte >= 224 && currentByte < 240) {
      charCode = (currentByte & 15) << 12;
      bytesToProcess = 2;
    } else if (currentByte >= 240 && currentByte < 248) {
      charCode = (currentByte & 7) << 18;
      bytesToProcess = 3;
    } else {
      throw new jsBytes.Error(
          'First byte of UTF-8 string outside of expected range' + currentByte);
    } 
    i++;

    while (bytesToProcess > 0) {
      if (i < bytes.length) {
        if (bytes[i] > 191) {
          throw new jsBytes.Error('Invalid UTF-8 byte at position ' + i);
        }
        charCode += (bytes[i] & 63) << ((bytesToProcess - 1) * 6); 
      } else {
        throw new jsBytes.Error('Fewer than expected bytes for UTF-8 string.');
      }
      bytesToProcess--;
      i++;
    }

    s += String.fromCharCode(charCode);
  }
  return s;
};
