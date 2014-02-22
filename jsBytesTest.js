/**
 * @fileoverview Unit testing library.
 *
 * Usage example:
 *    suite = new jsBytesTest.TestSuite();
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
 */

/**
 * Namespace for testing utility for jsBytes.
 */
var jsBytesTest = {};

/**
 * @constructor
 */
jsBytesTest.TestCase = function(name, testFunction) {
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
jsBytesTest.TestExecution = function(testCaseName, failureMessages) {
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
jsBytesTest.TestExecution.prototype.assertTrue = function(message, condition) {
  if (!condition) {
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
jsBytesTest.TestExecution.prototype.assertEqual = function(
    message, expected, actual) {
  this.assertTrue(message + ': expected ' + expected + ' but got ' + actual,
                  expected == actual);
};

jsBytesTest.TestExecution.prototype.recordFailure_ = function(message) {
  if (this.assertsPassed) {
    this.failureMessages_.push('FAILED: ' + this.testCaseName_);
  }
  this.failureMessages_.push('- ' + message);
  this.assertsPassed = false;
};

/**
 * @constructor
 */
jsBytesTest.TestSuite = function() {
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
jsBytesTest.TestSuite.prototype.addTest = function(name, testFunction) {
  this.tests.push(new jsBytesTest.TestCase(name, testFunction));
};

/**
 * Executes all test cases and appends the results to the output node.
 * @param {Element} outputNode Node to which results should be appended.
 */
jsBytesTest.TestSuite.prototype.runTests = function(outputNode) {
  var passedCount = 0;
  var failureMessages = [];
  var i;

  // Run all test cases.
  for (i = 0; i < this.tests.length; i++) {
    var testExecutor = new jsBytesTest.TestExecution(
        this.tests[i].name, failureMessages);
    this.tests[i].testFunction(testExecutor);
    if (testExecutor.assertsPassed) {
      passedCount++;
    }
  }

  // Report results.
  jsBytesTest.appendMessageNode_(
      outputNode,
      passedCount + '/' + this.tests.length + ' passed',
      passedCount != this.tests.length);
  for (i = 0; i < failureMessages.length; i++) {
    jsBytesTest.appendMessageNode_(outputNode, failureMessages[i], true);
  }
};

jsBytesTest.appendMessageNode_ = function(container, message, failure) {
  if (container) {
    var messageNode = document.createElement('div');
    messageNode.style.color = failure ? 'red' : 'green';
    messageNode.appendChild(document.createTextNode(message));
    container.appendChild(messageNode);
  }
};
