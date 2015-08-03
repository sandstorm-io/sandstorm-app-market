# [![Build Status](https://secure.travis-ci.org/huang47/nodejs-html-truncate.png?branch=master)](http://travis-ci.org/huang47/nodejs-html-truncate)
[![Coverage Status](https://img.shields.io/coveralls/huang47/nodejs-html-truncate.svg)](https://coveralls.io/r/huang47/nodejs-html-truncate?branch=master)

# Motivation
Truncate HTML text and also keep tag safe.

## NOTICE
Given string is expected to be well-formatted HTML.

## TODO
1. use more robust html parser instead of custom regex
1. move to es6, probably babel/babelify with decorator if needed.

## CHANGELOG

| Version | Logs |
|:--|:--|
| 1.2.0 | <3 browserify |
| 1.1.0 | bug fixes |
| 1.0.3 | support browser |
| 1.0.0 | deprecated: truncateLastWord. Also, exports function directly |
| 0.3.1 | features done |

## build parameter

```
# install prerequisites and build `truncate` library
npm start

# test, which use travis-ci and coveralls.io to show test results and coverage information
npm test
```

## API
```javascript
/**
 * @static
 * @method truncate
 * @param {String} string string needs to be truncated
 * @param {Number} maxLength length of truncated string
 * @param {Object} options (optional)
 * @param {Boolean} [options.keepImageTag] flag to specify if keep image tag, false by default
 * @param {Boolean|String} [options.ellipsis] omission symbol for truncated string, '...' by default
 * @return {String} truncated string
 */
truncate(string, length, options);
```

## usage
```javascript
var truncate = require('html-truncate');
```

### truncate text
```javascript
truncate('hello world', 4)

// hell...
```

```javascript
truncate('hello world', 6)

// hello ...
```

### keep tag safe
```javascript
truncate('<p><div>hello world</div></p>', 4)

// <p><div>hell...</div></p> 
```

### keep image tag (if any)
#### non-closed
```javascript
truncate('<p><div><img class="yahoo" src="#" alt="yahoo logo">Do you <b>think</b> it is useful</div></p>', 3, { keepImageTag: true })

// <p><div><img class="yahoo" src="#" alt="yahoo logo">Do ...</div></p>
```

```javascript
truncate('<p><div><img class="yahoo" src="#" alt="yahoo logo">Do you <b>think</b> it is useful</div></p>', 10, { keepImageTag: true })

// <p><div><img class="yahoo" src="#" alt="yahoo logo">Do you <b>thi...</b></div></p>
```


#### self-closed
```javascript
truncate('<p><div><img class="yahoo" src="#" alt="yahoo logo" />Do you <b>think</b> it is useful</div></p>', 3, { keepImageTag: true })
// <p><div>Do ...</div></p>
```

```javascript
truncate('<p><div><img class="yahoo" src="#" alt="yahoo logo" />Do you <b>think</b> it is useful</div></p>', 10, { keepImageTag: true })
// <p><div><img class="yahoo" src="#" alt="yahoo logo" />Do you <b>thi...</b></div></p>
```

### customize suffix
```javascript
truncate('<p><div>hello world</div></p>', 4, { ellipsis: '###' })

// <p><div>hell###</div></p> 
```

```javascript
truncate('<p><div>hello world</div></p>', 4, { ellipsis: '' })

// <p><div>hell</div></p> 
```

## NOTICE


## Appendix
[npm: html-truncate](https://www.npmjs.com/package/html-truncate)

## dependencies

### unit test
[npm: mocha](https://npmjs.org/package/mocha)

### documentation
[npm: yuidocjs](https://npmjs.org/package/yuidocjs)

## LICENSE
Copyrights for code authored by Yahoo! Inc. is licensed under the following terms:
MIT License
Copyright (c) 2012 Yahoo! Inc. All Rights Reserved.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
