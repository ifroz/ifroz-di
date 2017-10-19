module.exports = function getDI({}={}) {
  const modules = {};
  const implementationNames = {}
  return Object.freeze({
    get(name) {
      return modules[name]();
    },
    registerModule(name, dependencies, implementations) {
      if (modules[name])
        throw new Error(`Already registered ${name} module.`);
      modules[name] = () =>
        implementations[implementationNames[name]](...dependencies);
    },
    setImplementation(name, implementationName) {
      if (implementationNames[name])
        throw new Error(`Implementation of ${name} is already set.`);
      implementationNames[name] = implementationName;
    }
  });
};
