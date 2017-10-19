module.exports = function getDI({}={}) {
  const modules = {};
  const dependencyNames = {};
  const implementationNames = {};
  const instances = {};

  function get(name) {
    const implementationName = implementationNames[name];
    if (!modules[name]) throw new Error(`Unknown module ${name}`);
    if (!modules[name][implementationNames[name]]) throw new Error(
      `Unknown implementation ${implementationNames[name]} for module ${name}`);
    instances[name] = instances[name] || {};
    instances[name][implementationName] = instances[name][implementationName] ||
      modules[name][implementationName](...dependencyNames[name].map(get));
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
      { undefined: oneOrMoreGetters } : oneOrMoreGetters;

  return Object.freeze({
    get,
    registerService(name, dependencies, implementationGetters={}) {
      validateModuleNotRegistered(name);
      modules[name] = enforceImplementationsObject(implementationGetters);
      dependencyNames[name] = dependencies;
    },
    addImplementation(name, implementationName, getImplementation) {
      validateImplementationNotRegistered(name, implementationName);
      modules[name][implementationName] = getImplementation
    },
    setImplementation(name, implementationName) {
      validateNotInstantiated(name);
      implementationNames[name] = implementationName;
    }
  });
};
