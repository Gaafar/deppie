[![npm](https://img.shields.io/npm/v/deppie.svg?maxAge=2592000)](https://www.npmjs.com/package/deppie)
[![Build Status](https://travis-ci.org/Gaafar/deppie.svg?branch=master)](https://travis-ci.org/Gaafar/deppie)
[![Dependency Status](https://david-dm.org/Gaafar/deppie.svg)](https://david-dm.org/Gaafar/deppie)
# deppie

The simple, elegant Dependency Injection framework for javascript.

## Introduction

deppie provides a dead simple way to set up an Inversion of Control (IoC) container. It was born out of the frustration my team and I had trying to find a Dependency Injection (DI) framework to use in our projects that we could adopt effortlessly in our existing and new projects without writing extra code or config; or creating our modules in a convoluted way that the framework dictates; or worrying about the blood magic the framework is doing to summon our code.

## Features

- Minimal API that can be learned in a few minutes
- No extra code/config/annotations required
- One to one [direct mapping to `require` modules](#mapping-to-require)
- Can be [adopted partially](#partial-adoption) to work with existing code

## Do we need Dependency Injection?

If you're not familiar with DI & IoC you can refer to [this article by Martin Fowler][1], but the basic idea is that you write your code that depends on a module, without knowing (or caring) where that module comes from as long as it has the interface you expect.

[This thread][2] has is a nice debate on whether we need DI or not, but, obviously, I believe we do for a few reasons

1. Inject dependencies without knowing their paths. This means that if you change a module location on disk or swap it with another, you don't need to touch every file that depends on it.

2. It makes it a lot easier to mock dependencies for testing without the pain of overriding the global `require` function in a way that works without problems.

3. It helps you organize and reason about you application as loosely coupled modules.

## Install

`npm install --save deppie`

## TLDR example

```javascript
const deppie = require("deppie")

// this module has no dependencies and returns 1
const module1 = () => 1;

// this module depends on module 1, and returns something based on it
const module2 = ({ module1 }) => module1 + 1;

// this module depends on both, and returns nothing
// as it is the entry point of the app, and no modules will depend on it
const main = ({ module1, module2 }) => {
    console.log(`module1 = ${module1}, module2 = ${module2}`)
}

// wire up all modules by calling the functions with the right dependencies passed
deppie({ main, module1, module2 })
// output to console: "module1 = 1, module2 = 2"
```

## What just happened?

Two things happened here

1. **Declare dependencies**

    Each of the modules (module1, module2, main) is defined as a "constructor function" that takes an object of all other modules and uses ES6/ES2015 destructuring to pick only the modules it depends on.

2. **Wire up**

    Now we need to invoke the constructor function of each module with the needed dependencies. All we have to do is to call `deppie` with an object that contains the name of each module as a key, and its constructor function as the corresponding value.

It is that simple. This is all it takes for deppie to create all your modules with the right dependencies. You don't have to write or maintain any special code or config.

## Examples

Check out the [examples folder](https://github.com/Gaafar/deppie/tree/master/examples) for more detailed demos.

## How it works

deppie works in a very straight-forward way. In fact, the core of it was written in one sitting for a few hours.

`deppie(modules)` parses the signatures of the constructor functions of all the passed modules and keeps track of what dependencies they need in order to be created.  

Then, deppie passes all the modules into a `reduce` function that goes through the  modules one by one, for each module it checks if its dependencies have been created or creates them if needed (recursively), then adds the created module(s) to the accumulator of the reduce function to be available for the next module.

## Mapping to require

It is extremely easy to convert existing modules that `require` their dependencies to modules that use dependency injection.

eg: `myModule.js` with require

```javascript
const dependency = require('path/to/dependency')

// do something here

//return something from this module
module.exports = 42;
```

Now to write the same module using dependency injection there are 3 steps:

1. Wrap every thing in a constructor function and export it.

2. The required modules become parameters in the constructor function (as a desctructured object).

3. The previous export of the module becomes the return.

```javascript
module.exports = ({ dependency }) => {
    // do something here

    //return something from this module
    return 42;
}
```

## Partial adoption

The full signature is of `deppie()` is
`const createdModules = deppie(moduleDefinitions, initialModules)`

It takes 2 parameters
- `moduleDefinitions`: object of module names as keys, and module constructors as values
- `initialModules`: object of module names as keys, and alread created modules as values. These modules will not be created by deppie, but will be passed (as is) as dependencies to the new modules that are created `moduleDefinitions`.

And returns
- `createdModules`: object of module names as keys, and created modules as values. It includes the `initialModules` passed as well.

At its heart, deppie is just a reduce function that is passed an initial state (modules), and returns the final state. Where the initial state comes from and what to do with the final state is up to you.

This means that you can create modules in any way you want outside deppie, use them as dependencies inside deppie, and use the returned modules outside deppie again seamlessly.

This is helpful if you want to use a DI framework in a large project without taking the time to convert all existing modules at once, so you can move modules into deppie gradually.

Check [this example](https://github.com/Gaafar/deppie/tree/master/examples/partial) for an implementation of partial adoption.

## Entry point(s)

You don't need to define any entry points explicitly to deppie. It can be any one of your modules, the only difference is that an entry point module will, naturally, have no return (void module). deppie will construct a void module just like any other module, except it will not allow you to inject it in other modules by throwing an error if you try to depend on a void module.

eg: `app.js`

```javascript
const bodyParser = require('body-parser');
const express = require('express');

module.exports = ({ getUsersRoute, config }) => {
    const app = express()
    .use(bodyParser.text())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({ extended: true }));

    // Add routes
    app.get('/api/users', getUsersRoute);

    app.listen(config.port);
    console.log(`listening on port ${config.port}`);
    // don't return anything
};
```

## Validations

deppie will check these rules for your modules when they are passed, and throw an error if they are violated
- no missing dependencies
- no circular dependencies
- no self dependencies
- can't depend on void modules
- can't depend on modules that are not defined
- can't modify properties of the returned object from calling `deppie`

and warn you about some other rules
- no unused modules (TODO)

## Design decisions

- The decision to use destructuring in the constructor function as opposed to ordered function parameters, means that you don't have to worry about an uglifier renaming your parameters and breaking injection (like AngularJS), or having to use string names of the dependencies then adding them as parameters with the same order as function parameters (like RequireJS).

## Roadmap

- Visualize dependency graph
- Optimize package size
- Add support for ES5
- Add tests for browsers

## Disclaimer

deppie is still in an early stage, and I wouldn't recommend using it in production just yet.

Before the first release (1.0), breaking changes will be marked by updating the minor version (eg: 0.1.8 to 0.2.0). However, owing to it's minimal API, I expect it to be relatively easy to modify your code for such changes if they happen.

After the first release, I will be following semantic versioning for future releases.

<!--
TODO:
- review other frameworks
- example for advanced composition of deppies
- design decision, no asynchrony
- Good Practices
    index, app, routes
- support returning promises?
-->


[1]: http://martinfowler.com/articles/injection.html
[2]: http://stackoverflow.com/questions/9250851/do-i-need-dependency-injection-in-nodejs-or-how-to-deal-with
