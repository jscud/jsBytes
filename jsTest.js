/**
 * @fileoverview Unit testing library.
 *
 * Usage example:
 *    suite = new jsTest.TestSuite();
 *
 *    suite.addTest('should fail', function(test) {
 *      test.assertTrue('false should equal true', false == true);
 *      test.assertEqual('5 should equal 6', 5, 6);
 *    });
 *
 *    suite.addTest('should pass', function(test) {
 *      test.assertTrue('true should equal true', true == true);
 *      test.assertEqual('5 should equal 5', 5, 5);
 *    });
 *
 *    suite.runTests(document.getElementById('results'));
 *
 * Which should display the following in the browser in the results node.
 *    1/2 passed
 *    FAILED: should fail
 *    - false should equal true
 *    - 5 should equal 6: expected 5 but got 6
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Namespace for testing utility for jsBytes.
 */
var jsTest = {};

/**
 * @constructor
 */
jsTest.TestCase = function(name, testFunction) {
  this.name = name;
  this.testFunction = testFunction;
};

/**
 * @constructor
 * @param {string} testCaseName The name of this test case function to report
 *     should one of the asserts in this case case fail.
 * @param {Array} failureMessages Append a message to this array should an
 *     assert fail.
 */
jsTest.TestExecution = function(testCaseName, failureMessages) {
  this.assertsPassed = true;
  this.testCaseName_ = testCaseName;
  this.failureMessages_ = failureMessages;
};

/**
 * Check that a condition is true as expected.
 * @param {string} message Description of the expectation to show to the user
 *     if the condition is false.
 * @param {Object} condition Report test case failure if condition is not true.
 */
jsTest.TestExecution.prototype.assertTrue = function(message, condition) {
  if (!condition) {
    this.recordFailure_(message);
  }
};

/**
 * Check that a condition is false as expected.
 * @param {string} message Description of the expectation to show to the user
 *     if the condition is true instead of false.
 * @param {Object} condition Report test case failure if condition is true.
 */
jsTest.TestExecution.prototype.assertFalse = function(message, condition) {
  if (condition) {
    this.recordFailure_(message);
  }
};

/**
 * Check that the two items are equivalent.
 * @param {string} message Description of the expectation to show to the user
 *     if the items are not equal.
 * @param {Object} expected The expected value for the item.
 * @param {Object} actual The calculated value which should match expected.
 */
jsTest.TestExecution.prototype.assertEqual = function(
    message, expected, actual) {
  this.assertTrue(message + ': expected ' + expected + ' but got ' + actual,
                  expected == actual);
};

/**
 * Check that the two arrays are the same size and contain equivalent items.
 * @param {string} message Description of the expectation to show to the user
 *     if the arrays are not equal.
 * @param {Object} expected The expected array of values.
 * @param {Object} actual The generated array which should match expected.
 */
jsTest.TestExecution.prototype.assertArraysEqual = function(
    message, expected, actual) {
  if (expected.length != actual.length) {
    this.recordFailure_(message + ': expected array of length ' +
                        expected.length + ' but got array length of ' +
                        actual.length);
    return;
  }
  for (var i = 0; i < expected.length; i++) {
    if (expected[i] != actual[i]) {
      this.recordFailure_(message + ': arrays differed at index ' + i +
                          ' expected ' + expected[i] + ' but got ' + actual[i]);
      return;
    }
  }
};

/**
 * Checks that executing the given function causes an exception to be thrown.
 * @param {string} message Description of the expectation to show to the user
 *     if the function does not throw an exception when run.
 * @param {Function} closure A function which is expected to throw an
 *     exception when executed. This function is called with no arguments.
 *     Any context needed can be provided through a closure.
 */
jsTest.TestExecution.prototype.assertThrows = function(message, closure) {
  try {
    closure();
    // Mark failure since executing the closure did not throw an exception.
    this.recordFailure_(message + ': exception not thrown');
  } catch(e) {
    return;
  }
};

jsTest.TestExecution.prototype.recordFailure_ = function(message) {
  if (this.assertsPassed) {
    this.failureMessages_.push('FAILED: ' + this.testCaseName_);
  }
  this.failureMessages_.push('- ' + message);
  this.assertsPassed = false;
};

/**
 * @constructor
 */
jsTest.TestSuite = function() {
  this.tests = [];
};

/**
 * Registers a new unit test as part of the test suite.
 * The test function must take a test helper as its only argument.
 * Example:
 * suite.addTest('testFooNumerMatchesInputs', function(test) {
 *   var foo = new Foo();
 *   test.assertEquals(5, foo.calculate(2, 3), 'sum should be 5');
 * });
 */
jsTest.TestSuite.prototype.addTest = function(name, testFunction) {
  this.tests.push(new jsTest.TestCase(name, testFunction));
};

/**
 * Executes all test cases and appends the results to the output node.
 * @param {Element} outputNode Node to which results should be appended.
 */
jsTest.TestSuite.prototype.runTests = function(outputNode) {
  var passedCount = 0;
  var failureMessages = [];
  var i;

  // Run all test cases.
  for (i = 0; i < this.tests.length; i++) {
    var testExecutor = new jsTest.TestExecution(
        this.tests[i].name, failureMessages);
    this.tests[i].testFunction(testExecutor);
    if (testExecutor.assertsPassed) {
      passedCount++;
    }
  }

  // Report results.
  jsTest.appendMessageNode_(
      outputNode,
      passedCount + '/' + this.tests.length + ' passed',
      passedCount != this.tests.length);
  for (i = 0; i < failureMessages.length; i++) {
    jsTest.appendMessageNode_(outputNode, failureMessages[i], true);
  }
};

jsTest.appendMessageNode_ = function(container, message, failure) {
  if (container) {
    var messageNode = document.createElement('div');
    messageNode.style.color = failure ? 'red' : 'green';
    messageNode.appendChild(document.createTextNode(message));
    container.appendChild(messageNode);
  }
};
