const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
  test("works: dataToUpdate has one key", () => {
    const result = sqlForPartialUpdate({ firstName: 'Aliya' }, { firstName: 'first_name', age: 'age' });
    expect(result).toEqual({ setCols: '"first_name"=$1', values: ['Aliya'] });
  });

  test("works: dataToUpdate has multiple keys", () => {
    const result = sqlForPartialUpdate({ firstName: 'Aliya', age: 32 }, { firstName: 'first_name', age: 'age' });
    expect(result).toEqual({ setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32] });
  });

  test("throws BadRequestError if dataToUpdate is empty", () => {
    expect(() => sqlForPartialUpdate({}, { firstName: 'first_name', age: 'age' })).toThrow(BadRequestError);
  });

  test("works: jsToSql maps JavaScript property names to database column names", () => {
    const result = sqlForPartialUpdate({ firstName: 'Aliya', age: 32 }, { firstName: 'first_name' });
    expect(result).toEqual({ setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32] });
  });
});
