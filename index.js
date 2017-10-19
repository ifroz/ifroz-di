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

  return Object.freeze({
    get,
    registerService(name, dependencies, implementationGetters={}) {
      if (modules[name]) throw new Error(`Already registered ${name} module.`);
      if (typeof implementationGetters === 'function')
        implementationGetters = {undefined: implementationGetters};
      modules[name] = implementationGetters;
      dependencyNames[name] = dependencies;
    },
    addImplementation(name, implementationName, getImplementation) {
      if (modules[name][implementationName])
        throw new Error(`Already registered ${implementationName} implementation for ${name}`);
      else
        modules[name][implementationName] = getImplementation
    },
    setImplementation(name, implementationName) {
      if (instances[name])
        throw new Error(`Already instantiated ${name}'s ${implementationName} implementation`);
      implementationNames[name] = implementationName;
    }
  });
};
