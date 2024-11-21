/**
 * SSJS Testing library.
 * @param {object} logger - logger object
 */
function Tests(logger) {
	this.logger = logger;
	this.i = 0;
	this.oks = 0;
	this.errors = 0;

	/**
	 * Test if the condition is true.
	 * @param {*} condition
	 * @param {string} message - message to be logged in case of failure.
	 */
	this.assert = function(condition, message) {
		this.i++;
		if (!condition) {
			this.errors++;
			this.logger.error('Test #' + this.i + ' failed:\t' + (message || 'Assertion failed.'));
		} else {
			this.oks++;
			this.logger.debug('Test #' + this.i + ' passed.');
		}
	};

	/**
	 * Test if the expected value is equal to the actual value.
	 * @param {*} expected
	 * @param {*} actual
	 * @param {string} message - message to be logged in case of failure.
	 */
	this.equals = function(expected, actual, message) {
		this.assert(expected === actual, message);
	};

	/**
	 * Test if the expected value is not equal to the actual value.
	 * @param {*} expected
	 * @param {*} actual
	 * @param {string} message - message to be logged in case of failure.
	 */
	this.notEqual = function(expected, actual, message) {
		this.assert(expected !== actual, message);
	};

	/**
	 * Assert that the function fn throws an error.
	 * @param {function} fn - function to be tested.
	 * @param {array} args - array of arguments to be passed to the function.
	 * @param {string|error} err - expected error to be thrown - can be a string or an error object. 
	 * @param {string} message - message to be logged in case of failure.
	 * @example tests.throws(fn, [1, 2, 3], 'Error message', 'Does not throw error.');
	 * @example tests.throws(fn, [1, 2, 3], new Error('Error message'), 'Does not throw error.');
	 */
	this.throws = function(fn, args, err, message) {
		this.i++;
		try {
			fn.apply(null, args);
			this.errors++;
			this.logger.error('Test #' + this.i + ' failed:\t' + (message || 'Assertion failed.'));
		} catch (e) {
			if (typeof err === 'string') {
				this.assert(e.message === err, message);
			} else {
				if (e.name !== err.name) {
					this.errors++;
					this.logger.error('Test #' + this.i + ' failed:\t' + (message || 'Assertion failed.') + ' Wrong Error message.');
					return;
				}
			}
		}
		this.oks++;
		this.logger.debug('Test #' + this.i + ' passed.');
	}

	/**
	 * Log the test results.
	 */
	this.log = function() {
		this.logger.info('Tests run: ' + this.i + ', OK: ' + this.oks + ', Errors: ' + this.errors);
	}
}