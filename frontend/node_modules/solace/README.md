# solace [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Alternative to the console log which automatically beautifies the output

Solace is particularly useful if you intend:
* to debug some data.
* to display some data for a CLI.

Solace has a specific support for string, boolean, number, date, regex, null, void, error, NaN, object, array and will deal with these types in a pleasant way.

By default, the output is expected to be stdout/stderr, but you can override this to implement more advanced logging.

The theme (machine, beautiful, outline) can be changed at runtime, which can be a handy option for the user of a CLI.

## Installation

```sh
$ npm install --save solace
```

## Usage

```js
import solaceCreator from 'solace';

const solace = solaceCreator({
  //standardOut: process.stdout,
  //standardErr: process.stderr,
  //defaultTheme: 'beautiful'
});

const value = {
  a: 12
  b: ['jan', 'feb', 'mar'],
  c: true,
  d: new Date()
};

solace.log('Some data nicely arranged:');
solace.log(value, {title: 'title', theme: 'outline'});

```

### Themes

* machine: Format the output in a compact manner easily readable by a machine.
* beautiful: Format the output in a beautiful manner.
* outline: Format the output with the main outlines. If the data is an array of objects, it may be displayed as a table.

Example of beautiful output:

![Beautiful theme](/screenshots/solace-beautiful.png)

Example of outline output:

![Outline theme](/screenshots/solace-outline.png)


## License

MIT © [flarebyte](https://github.com/flarebyte)


[npm-image]: https://badge.fury.io/js/solace.svg
[npm-url]: https://npmjs.org/package/solace
[travis-image]: https://travis-ci.org/flarebyte/solace.svg?branch=master
[travis-url]: https://travis-ci.org/flarebyte/solace
[daviddm-image]: https://david-dm.org/flarebyte/solace.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/flarebyte/solace
[coveralls-image]: https://coveralls.io/repos/github/flarebyte/solace/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/flarebyte/solace?branch=master
