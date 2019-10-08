[&#x2190; Back](/README.md)

# Ajax

### GET
```js
/**
 * @param {string/object} url
 * @return {object} data
 */
api.ajax.get(url, function(data) {
    console.log(data);
    // console: {key: values...}
});
```

### POST
```js
/**
 * @param {string/object} url
 * @param {object} post
 * @return {object} data
 */
api.ajax.post(get, post, function(data) {
    console.log(data);
    // console: {key: values...}
});
```