const { expect } = require('chai');
const getDI = require('.');

describe('DI', () => {
  it('should work', () => {
    const di = getDI();
    expect(di).to.be.an('object');
  });
})