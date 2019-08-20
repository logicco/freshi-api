/**
 * Check whether tokens match
 * @param token1
 * @param token2
 * @returns {boolean}
 */
exports.match = function(token1,token2){
  return token1 == token2;
};

/**
 * Generate Date, Set time from curr time + minutes
 * @param {int} minute
 * @returns {Date}
 */
exports.generateSafeExpDate = function(minutes) {
    var date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  /**
   * Check if token has expired
   * @param {Date} date
   * @returns {Boolean}
   */
exports.isExpired = function(tokenDate) {
    var now = new Date();
    return tokenDate < now;
  }
  