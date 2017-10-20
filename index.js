module.exports = function getDI({defaultImplementation}={}) {
  const modules = {};
  const dependencyNames = {};
  const implementationNames = {};
  const instances = {};

  function get(name) {
    const implementationName = implementationNames[name] || defaultImplementation;
    validateModuleProperlyConfigured(name, implementationName)
    return getInstance(name, implementationName);
  }

  const validateModuleProperlyConfigured = (name, implementationName) => {
    if (!modules[name]) throw new Error(`Unknown module ${name}`);
    if (!modules[name][implementationName]) throw new Error(
      `Unknown implementation ${implementationName} for module ${name}`);
  };

  const getInstance = (name, implementationName) => {
    instances[name] = instances[name] || {};
    instances[name][implementationName] = instances[name][implementationName] ||
      modules[name][implementationName](...(dependencyNames[name] || []).map(get));
    return instances[name][implementationName];
  }

  const validateModuleNotRegistered = (name) => {
    if (modules[name]) throw new Error(`Already registered ${name} module.`);
  };
  const validateImplementationNotRegistered = (name, implementationName) => {
    if (modules[name][implementationName])
      throw new Error(`Already registered ${implementationName} implementation for ${name}`);
  }
  const validateNotInstantiated = (name) => {
    if (instances[name])
      throw new Error(`Already instantiated ${name}'s ${implementationNames[name]} implementation`);
  }
  const validateImplementation = (implementationGetter, deps) => {
    if (typeof implementationGetter !== 'function')
      throw new Error(`An implementation getter should be a function`);
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
  }

  return Object.freeze({
    get,
    registerFactory(name, factory) {
      validateModuleNotRegistered(name);
      modules[name] = {
        [defaultImplementation]: () => factory({ get })
      };
    },
    registerService(name, dependencies, implementationGetters={}) {
      validateModuleNotRegistered(name);
      const sanitizedModule = sanitizeImplementationsObject(implementationGetters);
      dependencyNames[name] = dependencies;
      Object.values(sanitizedModule).forEach(module =>
        validateImplementation(module, dependencies));
      modules[name] = sanitizedModule;
    },
    addImplementation(name, implementationName, getImplementation) {
      validateImplementationNotRegistered(name, implementationName);
      validateNotInstantiated(name);
      validateImplementation(getImplementation, dependencyNames[name]);
      modules[name][implementationName] = getImplementation
    },
    setImplementation(name, implementationName) {
      validateNotInstantiated(name);
      implementationNames[name] = implementationName;
    }
  });
};
