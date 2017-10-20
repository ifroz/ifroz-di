const { expect } = require('chai');
const getDI = require('.');

describe('DI', () => {
  let di;
  beforeEach(() => {
    di = getDI()
  });

  it('should work', () => {
    expect(di).to.be.an('object');
  });

  describe('#get', () => {
    it('should throw when a module name is unknown', () => {
      const name = 'whatever';
      expect(() => di.get(name)).to.throw(`Unknown module ${name}`);
    });

    it('should throw when an implementation is unknown', () => {
      di.registerService('none', [], {});
      expect(() => di.get('none')).to.throw(`Unknown implementation undefined`);
    })
  });

  describe('#registerFactory', () => {
    it('should make a factory accessible', () => {
      di.registerService('lowercase', [], () => s => s.toLowerCase());
      di.registerService('uppercase', [], () => s => s.toUpperCase());
      di.registerFactory('case', (_di) => _di.get('lowercase'))
      expect(di.get('case')('WhAT!?')).to.equal('what!?');
    });
    it('should regenerate the instance whenever it is accessed', () => {
      let count = 1;
      di.registerFactory('x', (_di) => ({count: count++}))
      expect(di.get('x')).not.to.equal(di.get('x'));
    });
  })

  describe('#registerConstant', () => {
    it('should register a constant value as is, without deps', () => {
      di.registerConstant('theAnswer', 42);
      expect(di.get('theAnswer')).to.equal(42);
    });
  })

  describe('#registerService', () => {
    it('should register a module', () => {
      di.registerService('adder', [], {
        binary: (...deps) => (a, b) => a + b,
        fake: (...deps) => 0,
      });
      di.setImplementation('adder', 'binary')
      const adderService = di.get('adder');
      expect(adderService).to.be.a('function');
      expect(adderService(5,7)).to.equal(12);
    });

    it('should register singletons', () => {
      it('should regenerate the instance whenever it is accessed', () => {
        let count = 1;
        di.registerModule('x', [], () => count++)
        expect(di.get('x')).to.equal(di.get('x'));
      })

    })

    it('should be convinient to use with a single implementation', () => {
      di.registerService('adder', [],
        (...deps) => (...numbers) => numbers.reduce((sum, num) => sum + num, 0));
      expect(di.get).to.be.a('function');
      expect(di.get('adder')(3,5,17)).to.equal(25);
    });

    it('should throw if a service is not a function', () => {
      expect(() => di.registerService('implementationsObject', [], {x: true}))
        .to.throw(`should be a function`);
    });

    it('should throw if the default service is not a function', () => {
      expect(() => di.registerService('singleImplementation', [], true))
        .to.throw(`Invalid implementation true`);
    })

    describe('#validateImplementation', () => {
      it('should check for arguments count', () => {
        expect(() => di.registerService('x', ['y', 'z'], () => {}))
          .to.throw(`fn(y, z) expected`);
      })
    })
  });

  describe('#addImplementation', () => {
    it('should throw if the getter is not a function', () => {
      di.registerService('x', [], {})
      expect(() => di.addImplementation('x', 'impl', 52)
      ).to.throw(`should be a function`);
    })

    it('should add a new implementation afterwards', () => {
      di.registerService('adder', []);
      di.addImplementation('adder', 'binary', () => (a, b) => a + b)
      di.setImplementation('adder', 'binary');
      expect(di.get('adder')(31, 17)).to.equal(48);
    });

    it('should throw if already set', () => {
      di.registerService('adder', []);
      di.addImplementation('adder', 'binary', () => (a, b) => a + b)
      expect(() => di.addImplementation('adder', 'binary', () => {})).to.throw(
        `Already registered binary`);
    });
  });

  describe('#setImplementation', () => {
    it('should throw if you want to set after instantiated', () => {
      di.registerService('x', [], () => 42)
      expect(di.get('x')).to.eq(42);
      expect(() => di.setImplementation('x', 'fails after get')).to.throw(
        `Already instantiated`);
    })
  })
})