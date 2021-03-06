module.exports = function getDI({defaultImplementation}={}) {
  const modules = {};
  const moduleTypes = {};
  const dependencyNames = {};
  const implementationNames = {};
  const instances = {};

  function get(name, explictlySetImplementationName) {
    const implementationName =
      explictlySetImplementationName ||
      implementationNames[name] ||
      defaultImplementation;

    validateModuleProperlyConfigured(name, implementationName);
    switch (moduleTypes[name]) {
      case 'service':
      case 'constant':
        return getOrCreateInstance(name, implementationName);
      case 'factory':
        return createInstance(name, implementationName)
      default:
        throw new Error(`Unkonwn module type ${moduleTypes[name]}.`);
    }
  }

  const getOrCreateInstance = (name, implementationName) => {
    instances[name] = instances[name] || {};
    instances[name][implementationName] =
      instances[name][implementationName] ||
      createInstance(name, implementationName)
    return instances[name][implementationName];
  }
  const createInstance = (name, implementationName) => {
    return modules[name][implementationName](...(dependencyNames[name] || [])
        .map(moduleName => get(moduleName)));
  }

  const validateModuleProperlyConfigured = (name, implementationName) => {
    if (!modules[name]) throw new Error(`Unknown module ${name}`);
    if (!modules[name][implementationName]) throw new Error(
      `Unknown implementation ${implementationName} for module ${name}`);
  };

  const validateModuleNotRegistered = (name) => {
    if (modules[name]) throw new Error(`Already registered ${name} module.`);
  };
  const validateImplementationNotRegistered = (name, implementationName) => {
    if (modules[name][implementationName])
      throw new Error(`Already registered ${implementationName} implementation for ${name}`);
  };
  const validateNotInstantiated = (name) => {
    if (instances[name])
      throw new Error(`Already instantiated ${name}'s ${implementationNames[name]} implementation`);
  };
  const validateImplementation = (implementationGetter, deps) => {
    if (typeof implementationGetter !== 'function')
      throw new Error(`An implementation getter should be a function`);
    if (deps.length !== implementationGetter.length) {
      throw new Error(`Invalid signature, fn(${deps.join(', ')}) expected`);
    }
  };

  const sanitizeImplementationsObject = (oneOrMoreGetters) => {
    switch (typeof oneOrMoreGetters) {
      case 'function':
        return { [defaultImplementation] : oneOrMoreGetters };
      case 'object':
        return oneOrMoreGetters;
      default:
        throw new Error(`Invalid implementation ${oneOrMoreGetters}`);
    }
  };

  return Object.freeze({
    get,

    registerService(name, dependencies, implementationGetters={}, defaultImpl) {
      validateModuleNotRegistered(name);
      const sanitizedModule = sanitizeImplementationsObject(implementationGetters);
      dependencyNames[name] = dependencies;
      Object.values(sanitizedModule).forEach(module =>
        validateImplementation(module, dependencies));
      modules[name] = sanitizedModule;
      moduleTypes[name] = 'service';
      if (defaultImpl) this.setImplementation(name, defaultImpl);
      return Object.freeze({
        add: (...rest) => this.addImplementation(name, ...rest),
        use: (...rest) => this.setImplementation(name, ...rest),
      });
    },

    addImplementation(name, implementationName, getImplementation) {
      validateImplementationNotRegistered(name, implementationName);
      validateNotInstantiated(name);
      validateImplementation(getImplementation, dependencyNames[name]);
      modules[name][implementationName] = getImplementation;
      return Object.freeze({
        add: (...rest) => this.addImplementation(name, ...rest),
        use: (...rest) => this.setImplementation(name, ...rest),
      });
    },
    setImplementation(name, implementationName) {
      validateNotInstantiated(name);
      implementationNames[name] = implementationName;
      return Object.freeze({
        add: (...rest) => this.addImplementation(name, ...rest),
        use: (...rest) => this.setImplementation(name, ...rest),
      });
    },

    registerFactory(name, factory) {
      validateModuleNotRegistered(name);
      modules[name] = {
        [defaultImplementation]: () => factory({ get })
      };
      moduleTypes[name] = 'factory';
      return this;
    },

    registerConstant(name, value) {
      validateModuleNotRegistered(name);
      modules[name] = {
        [defaultImplementation]: () => value
      };
      moduleTypes[name] = 'constant';
      return this;
    }
  });
};
