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
  const enforceImplementationsObject = (oneOrMoreGetters) =>
    typeof oneOrMoreGetters === 'function' ?
      { [defaultImplementation]: oneOrMoreGetters } : oneOrMoreGetters;

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
      modules[name] = enforceImplementationsObject(implementationGetters);
      dependencyNames[name] = dependencies;
    },
    addImplementation(name, implementationName, getImplementation) {
      validateImplementationNotRegistered(name, implementationName);
      validateNotInstantiated(name);
      modules[name][implementationName] = getImplementation
    },
    setImplementation(name, implementationName) {
      validateNotInstantiated(name);
      implementationNames[name] = implementationName;
    }
  });
};
