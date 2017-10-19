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
        binary: (...deps) => (a, b) => a + b,
        fake: (...deps) => 0,
      });
      di.setImplementation('adder', 'binary')
      const adderService = di.get('adder');
      expect(adderService).to.be.a('function');
      expect(adderService(5,7)).to.equal(12);
    });

    it('should be convinient to use with a single implementation', () => {
      const di = getDI();
      di.registerModule('adder', [],
        (...deps) => (...numbers) => numbers.reduce((sum, num) => sum + num, 0));
      expect(di.get).to.be.a('function');
      expect(di.get('adder')(3,5,17)).to.equal(25);
    })
  });
})