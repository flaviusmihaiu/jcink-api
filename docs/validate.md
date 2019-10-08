[&#x2190; Back](/README.md)

# Validate

### Contents
* [String](#string)
* [Number](#number)
* [Array](#array)
* [Object](#object)
* [Function](#function)
* [Email](#email)
* [Min](#min)
* [Max](#max)
* [Range](#range)
* [Alphanumeric](#alphanumeric)
* [Slug](#slug)
* [Pattern](#pattern)

### String
```js
/**
 * @param {string} param
 * @return {boolean}
 */
let string = api.validate.string('string');
console.log(string);
// console: true
```

### Number
```js
/**
 * @param {number} param
 * @return {boolean}
 */
let number = api.validate.number(100);
console.log(number);
// console: true
```

### Array
```js
/**
 * @param {array} param
 * @return {boolean}
 */
let array = api.validate.array(['value']);
console.log(array);
// console: true
```

### Object
```js
/**
 * @param {object} param
 * @return {boolean}
 */
let object = api.validate.object({key: value});
console.log(object);
// console: true
```

### Function
```js
/**
 * @param {function} param
 * @return {boolean}
 */
let func = api.validate.function(function() {});
console.log(func);
// console: true
```

### URL
```js
/**
 * @param {string} param
 * @return {boolean}
 */
let url = api.validate.url('https://pro.jcink.net/');
console.log(url);
// console: true
```

### Email
* [MSDN Email Basic Validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#Basic_validation)
```js
/**
 * @param {string} param
 * @return {boolean}
 */
let email = api.validate.email('admin@jcink-pro.net');
console.log(email);
// console: true
```

### Min
```js
/**
 * @param {string/number} param
 * @param {number} min
 * @return {boolean}
 */
let minString = api.validate.min('string', 3);
console.log(minString);
// console: true
let minNumber = api.validate.min(100, 3);
console.log(minNumber);
```

### Max
```js
/**
 * @param {string/number} param
 * @param {number} max
 * @return {boolean}
 */
let maxString = api.validate.max('string', 100);
console.log(maxString);
// console: true
let maxNumber = api.validate.max(3, 100);
console.log(maxNumber);
// console: true
```

### Range
```js
/**
 * @param {string/number} param
 * @param {number} min
 * @param {number} max
 * @return {boolean}
 */
let rangeString = api.validate.range('string', 3, 100);
console.log(rangeString);
// console: true
let rangeNumber = api.validate.range(50, 3, 100);
console.log(rangeNumber);
// console: true
```

### Alphanumeric
```js
/**
 * @param {string} param
 * @return {boolean}
 */
let alphanumeric = api.validate.alphanumeric('a1_b2_c3');
console.log(alphanumeric);
// console: true
```

### Slug
```js
/**
 * @param {string} param
 * @return {boolean}
 */
let slug = api.validate.slug('this-is-a-slug');
console.log(slug);
```

### Pattern
```js
/**
 * @param {string} param
 * @param {regex} pattern
 * @return {boolean}
 */
let pattern = api.validate.pattern('string', /^string$/);
console.log(pattern);
// console: true
```