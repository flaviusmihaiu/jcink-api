# Jquery API

### Contents
* [Querying](docs/ajax.md) &mdash; AJAX with Power
* [Validating](docs/validate.md) &mdash; Functions for Validation
* [Templates](docs/templates.md) &mdash; API HTML Snippets
* [Database](docs/database.md) &mdash; IndexedDB Storage Layer

### To Do
1. **Organise**
    * Member List `data-api="member"` and `data-api="user"` as `member: {users: [...]}`
    * Forum View (ie. Topic List) `data-api="forum"` and `data-api="topic"` as `forum: {topics: [...]}` taking into account subforums listed above
    * `data-api="...JSON"` should be decoded and transformed to `javascript object`
2. **Validate**
    * `ajax.get` and `ajax.post` should be validated in terms of `CODE` and `act` meaning that they can only be alphanumeric for `CODE` and `act` can only be a set of preset `acts` or `alpha` only