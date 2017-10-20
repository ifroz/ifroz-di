const { expect } = require('chai');
const getDI = require('.');

describe('DI', () => {
  it('should work', () => {
    const di = getDI();
    expect(di).to.be.an('object');
  });

  describe('#get', () => {
    it('should throw when a module name is unknown', () => {
      const name = 'whatever';
      expect(() => getDI().get(name)).to.throw(`Unknown module ${name}`);
    });

    it('should throw when an implementation is unknown', () => {
      const di = getDI();
      di.registerService('none', [], {});
      expect(() => di.get('none')).to.throw(`Unknown implementation undefined`);
    })
  });

  describe('#registerFactory', () => {
    it('should make a factory accessible', () => {
      const di = getDI();
      di.registerService('lowercase', [], () => s => s.toLowerCase());
      di.registerService('uppercase', [], () => s => s.toUpperCase());
      di.registerFactory('case', (_di) => _di.get('lowercase'))
      expect(di.get('case')('WhAT!?')).to.equal('what!?');
    })
  })

  describe('#registerService', () => {
    it('should register a module', () => {
      const di = getDI();
      di.registerService('adder', [], {
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
      di.registerService('adder', [],
        (...deps) => (...numbers) => numbers.reduce((sum, num) => sum + num, 0));
      expect(di.get).to.be.a('function');
      expect(di.get('adder')(3,5,17)).to.equal(25);
    });

    it('should throw if a service is not a function', () => {
      const di = getDI();
      expect(() => di.registerService('implementationsObject', [], {x: true}))
        .to.throw(`should be a function`);
    });

    it('should throw if the default service is not a function', () => {
      const di = getDI();
      expect(() => di.registerService('singleImplementation', [], true))
        .to.throw(`Invalid implementation true`);
    })
  });

  describe('#addImplementation', () => {
    it('should throw if the getter is not a function', () => {
      const di = getDI();
      di.registerService('x', [], {})
      expect(() => di.addImplementation('x', 'impl', 52)
      ).to.throw(`should be a function`);
    })

    it('should add a new implementation afterwards', () => {
      const di = getDI();
      di.registerService('adder', []);
      di.addImplementation('adder', 'binary', () => (a, b) => a + b)
      di.setImplementation('adder', 'binary');
      expect(di.get('adder')(31, 17)).to.equal(48);
    });

    it('should throw if already set', () => {
      const di = getDI();
      di.registerService('adder', []);
      di.addImplementation('adder', 'binary', () => (a, b) => a + b)
      expect(() => di.addImplementation('adder', 'binary', () => {})).to.throw(
        `Already registered binary`);
    });
  });

  describe('#setImplementation', () => {
    it('should throw if you want to set after instantiated', () => {
      const di = getDI();
      di.registerService('x', [], () => 42)
      expect(di.get('x')).to.eq(42);
      expect(() => di.setImplementation('x', 'fails after get')).to.throw(
        `Already instantiated`);
    })
  })
})