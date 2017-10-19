const { expect } = require('chai');
const getDI = require('.');

describe('DI', () => {
  it('should work', () => {
    const di = getDI();
    expect(di).to.be.an('object');
  });

  describe('#registerModule', () => {
    it('should register a module', () => {
      const di = getDI();
      di.registerModule('adder', [], {
        binary: () => (a, b) => a + b
      });
      di.setImplementation('adder', 'binary')
      const adderService = di.get('adder');
      expect(adderService).to.be.a('function');
      expect(adderService(5,7)).to.equal(12);
    });
  })
})