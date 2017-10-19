module.exports = function getDI({}={}) {
  const modules = {};
  const implementationNames = {};
  const instances = {};
  return Object.freeze({
    get(name) {
      instances[name] = instances[name] || modules[name]();
      return instances[name];
    },
    registerModule(name, dependencies, implementations) {
      if (modules[name]) {
        throw new Error(`Already registered ${name} module.`);
      }

      if (typeof implementations === 'function')
        implementations = {undefined: implementations};
      modules[name] = () =>
        implementations[implementationNames[name]](...dependencies);
    },
    setImplementation(name, implementationName) {
      if (instances[name])
        throw new Error(`Already instantiated ${name}'s ${implementationName} implementation`);
      implementationNames[name] = implementationName;
    }
  });
};
