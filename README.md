# Jquery API

### Contents
* [Querying](docs/ajax.md) &mdash; AJAX with Power
* [Validating](docs/validate.md) &mdash; Functions for Validation
* [Templates](docs/templates.md) &mdash; API HTML Snippets
* [Forms](docs/form.md) &mdash; Create froms from JS Objects
* [Database](docs/database.md) &mdash; IndexedDB Storage Layer

### To Do
1. **Organise**
    * Member List `data-api="member"` and `data-api="user"` as `member: {users: [...]}`
    * `data-api="...JSON"` should be decoded and transformed to `javascript object`
2. **Validate**
    * `ajax.get` and `ajax.post` should be validated in terms of `CODE` and `act` meaning that they can only be alphanumeric for `CODE` and `act` can only be a set of preset `acts` or `alpha` only
    * `api.validate['number'/'min'/'max'/'range']` returns `false` if one of the values is 0, even though it should return `true`
3. **Forms**
    * Add `{type: 'group'}`
    * Validate inputs correctly