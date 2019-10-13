[&#x2190; Back](/README.md)

# Form

### Contents
* [Form Object](#form-object)
* [Form Data](#form-data)
* [Usage](#usage)
* [Extended](#extended)
    * [Serialize and Unserialize](#serialize-and-unserialize)
    * [Grouping Inputs](#grouping-inputs)

---

### Form Object

#### Available Form Attributes
- [MDN Form](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form)
- [MDN Global Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes)
- **Extra** &mdash; `children`

#### Available Input Types
- [MDN Inputs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
- `select`, `textarea`

#### Available Input Attributes
- [MDN Inputs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
- [MDN Global Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes)
- **Extra** &mdash; `label`, `help`

```js
let formObject = {
    'name': 'formName',
    'method': 'POST',
    'tager': '_blank',
    'children': [
        {
            'name': 'inputName',
            'type': 'text',
            'label': 'Label Text for this Input',
            'help': 'This is a Text Input',
            'maxlength': 100
        },
        {
            'name': 'textareaName',
            'type': 'textarea',
            'label': 'Label Text for this Input',
            'help': 'This is a Textarea Input',
            'maxlength': 1000
        },
        {
            'name': 'emailName',
            'type': 'email',
            'label': 'Label Email for this Input',
            'help': 'This is an Email Input'
        },
        {
            'name': 'submit',
            'type': 'submit',
            'value': 'Button Text'
        }
    ]
}
```

### Form Data

```js
let formDataObject = {
    'inputName': 'Some value for the text field',
    'textareaName': 'Some value for the textarea field'
}
```

### Usage

```js
let formHTML = api.form.create(formObject, formDataObject);
document.body.appendChild(formHTML);
// innerHTML will not work as 'api.form.create()' returns [object HTMLFormElement]
```

---

## Extended

### Serialize and Unserialize

1. Serialize data from and existing form.

```js
let formElement = document.querySelector('form');
let serialized = api.form.serialize(formElement);
console.log(serialized);
// console: inputName=some+value&otherInputName=some+other+value
```

2. Unserialize the data from the grabbed form after you have serialized it.

```js
let unserialized = api.form.unserialize(serialized);
console.log(unserialized);
// console: {inputName: 'some value', otherInputName: 'some other value'}
```

3. Pass it into your form so it has preset data.

```js
let formDataFromPage = unserialized;
let formHTML = api.form.create(formObject, formDataFromPage);
document.body.appendChild(formHTML);
// form will be set with pre-existing data from the page
```

### Grouping Inputs

> under development

Using `{type: 'group'}` on the `forum.children` will allow you to create grouped inputs. This is acheived in the following way:

```js
let formObject = {
    'children': [
        {
            'type': 'group',
            'name': 'groupName',
            'children': [
                {
                    'type': 'text',
                    'name': 'inputName'
                },
                {
                    'type': 'email',
                    'name': 'inputEmailName'
                }
            ]
        }
    ]
}