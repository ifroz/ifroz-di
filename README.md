# ifroz-di

Dependency injection for `node >= 8`.

## Install

```
$ yarn add ifroz/ifroz-di
```

```javascript
const getDI = require('.');
const di = getDI();
```

## Usage

### `di.get(name, explicitlySetImplementationName = undefined)`

### Services

#### `di.registerService(name, dependencies, implementationGetters)`

Services are functions accepting a pre-defined list of dependencies, returning
a singleton, which will not be re-evaluated afterwards.

```javascript
di.registerService('multiply', [], () => (a, b) => a * b);
di.registerService('multiplyBy', ['multiply'], {
  byTwo: multiply => x => multiply(x, 2),
  byThree: multiply => x => multiply(x, 3)
});
````

Then you can use them like this:

```javascript
di.get('multiplyBy', 'byTwo')(10) === 20
di.get('multiplyBy', 'byThree')(10) === 30
di.get('multiplyBy') // ==> Error, no implementation specified

di.setImplementation('multiplyBy', 'byThree');
di.get('multiplyBy')(10) === 30
```

##### Single implementation

When you only have one implementation of a service, set `implementationGetters` 
directly to a service getter function in order to set the default implementation 

```javascript
di.registerService('myService', [/* no dependencies */], () => {
  return Object.freeze({
    someFunctionality: (a, b) => a - b
  });
})
di.get('myService').someFunctionality(a, b);
```

##### `di.addImplementation(name, implementationName, getImplementation)`
##### `di.setImplementation(name, implementationName)`

### `di.registerFactory(name, ({get}) => ({}))`

Factories are not singletons, 
they are re-evaluated every time they have been `get(...)`.  

```javascript
let called = 0; 
di.registerService('config', [], () => Object.freeze({ get: () => 's2' }))
di.registerService('f#s1', [], () => 'service1');
di.registerService('f#s2', [], () => 'service2')
di.registerFactory('f', (di) => {
  const implementation = di.get('config').get('implementation') // => s1
  return di.get(`f#${someConfig}`)
})
```

### `di.registerConstant(name, ({get}) => ({}))`
