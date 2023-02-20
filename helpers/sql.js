const { BadRequestError } = require("../expressError");

/**
 * A helper function for generating a SET clause in a SQL UPDATE statement.
 * The function takes an object of data to update and a mapping of JavaScript-style property names to database column names. It returns an object containing a string of SET clauses for each field to update and an array of corresponding values. The resulting object can be used as parameters in a SQL query.
 *
 * @param {Object} dataToUpdate - An object containing key-value pairs to update
 * @param {Object} jsToSql - An object mapping JavaScript property names to database column names
 * 
 * @returns {Object} An object with a `setCols` property containing a comma-separated string of SQL column and value pairs, and a `values` property containing an array of values to substitute into the SQL statement.
 * 
 * @example sqlForPartialUpdate({ firstName: 'Aliya', age: 32 }, { firstName: 'first_name', age: 'age' }) returns { setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32] }
 */


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
