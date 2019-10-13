const api = {
    ajax: {
        get: function(get, callback) {
            let url;
            if(api.validate.string(get) && api.validate.url(get)) {
                url = get;
            }
            else if(api.validate.object(get)) {
                url = window.location.origin + window.location.pathname + '?' + api.url.encode(get);
            }

            $.get(url, function(body) {
                let dom = new DOMParser().parseFromString(body, "text/html");
                if(dom.querySelectorAll('#board-message').length) {
                    api.log('error', ['api.ajax.get(' + url + ')']);
                    return;
                }
                
                callback(api.response(dom));
            });
        },
        post: function (get, post, callback) {
            let url;
            if(api.validate.string(get) && api.validate.url(get)) {
                url = get;
            }
            else if(api.validate.object(get)) {
                url = window.location.origin + window.location.pathname + '?' + api.url.encode(get);
            }

            $.get(url, function(body) {
                let dom = new DOMParser().parseFromString(body, "text/html");
                if(dom.querySelectorAll('#board-message').length) {
                    api.log('error', ['api.ajax.post(' + url + ')', '$.get(' + url + ')']);
                    return;
                }

                let form = $('form', dom).serializeArray();
                let object = {};
                form.forEach(function (value, key) {
                    object[key] = value;
                });
                Object.assign({}, object, post);

                let url = window.location.origin + window.location.pathname;
                $.post(url, object, function(body) {
                    let dom = new DOMParser().parseFromString(body, "text/html");
                    if(dom.querySelectorAll('#board-message').length) {
                        api.log('error', ['api.ajax.post(' + url + ')', '$.post(' + url + ')', object]);
                        return;
                    }

                    callback(api.response(dom));
                });
            });
        },
    },
    response: function(body = document) {
        // FIND API BLOCKS
        let elements = ['category', 'forum', 'topic', 'post', 'member', 'stats', 'profile'];
        let data = {};
        elements.forEach(element => {
            let DOMs = body.querySelectorAll('div[data-api="' + element + '"]');
            if(DOMs.length == 1) {
                data[element] = {};
                
                let blocks = DOMs[0].querySelectorAll('div[data-api]');
                blocks.forEach(block => {
                    let key = block.getAttribute('data-api');
                    let value = block.innerHTML;
                    data[element][key] = value;
                });
            }
            else if(DOMs.length > 1) {
                data[element] = [];

                DOMs.forEach(DOM => {
                    let object = {};

                    let blocks = DOM.querySelectorAll('div[data-api]');
                    blocks.forEach(block => {
                        let key = block.getAttribute('data-api');
                        let value = block.innerHTML;
                        object[key] = value;
                    });

                    data[element].push(object);
                });
            }
        });

        // ORGANISE RESPONSE OBJECT
        if(data.hasOwnProperty('category')) {
            if(data.hasOwnProperty('forum')) {
                data.forum.forEach(forum => {
                    // MOVE TO CATEGORY
                    data.category.forEach(category => {
                        if(!category.hasOwnProperty('forums')) {
                            category['forums'] = [];
                        }
                        if(forum.categoryId == category.id) {
                            category.forums.push(forum);
                            return;
                        }
                    });

                    // ORGANISE SUBFORUMS
                    if(forum.subforumsList !== '') {
                        forum.subforums = [];
                        let dom = new DOMParser().parseFromString(forum.subforumsList, "text/html");
                        let subforums = dom.querySelectorAll('a.tooltip');
                        if(subforums.length > 0) {
                            subforums.forEach(subforum => {
                                let url = subforum.getAttribute('href');
                                let name = subforum.innerHTML;
                                let id = api.url.decode(url).showforum;
                                forum.subforums.push({id: id, name: name, url: url});
                            });
                        }
                    }
                });
            }
            // REASSIGN CATEGORY to CATEGORIES
            data['categories'] = data.category;
            // DELETE UNREQUIRED KEYS
            delete data.category;
            delete data.forum;
        }
        else if(data.hasOwnProperty('forum')) {
            if(api.validate.array(data.forum)) {
                let forum = data.forum.pop();
                forum['subforums'] = data.forum;
                if(data.hasOwnProperty('topic')) {
                    forum['topics'] = data.topic;
                }
                data.forum = forum;
            } else {
                if(data.hasOwnProperty('topic')) {
                    data.forum['topics'] = data.topic;
                }
            }
            // DELETE UNREQUIRED KEYS
            delete data.topic;
        }
        else if(data.hasOwnProperty('topic')) {
            if(data.hasOwnProperty('post')) {
                data.topic['posts'] = data.post;
            }
            // DELETE UNREQUIRED KEYS
            delete data.post;
        }
        else if(data.hasOwnProperty('member')) {
            data['members'] = data.member;
            // DELETE UNREQUIRED KEYS
            delete data.member;
        }

        return data;
    },
    validate: {
        string: function(param) {
            return (param && (typeof param == 'string' || param instanceof String));
        },
        number: function(param) {
            return (
                param &&
                (
                    (typeof param == 'number' || param instanceof Number) ||
                    (api.validate.string(param) && api.validate.pattern(param, /^-?\d+$/))
                )
            );
        },
        array: function(param) {
            return (param && (Array.isArray(param) || param instanceof Array));
        },
        object: function(param) {
            return (param && (typeof param == 'object' || param instanceof Object) && !Array.isArray(param));
        },
        function: function(param) {
            return (param && (typeof param == 'function' || param instanceof Function))
        },
        url: function(param) {
            try {
                new URL(param);
                return true;
            }
            catch {
                return false;
            }
        },
        email: function(param) {
            return (
                param && 
                api.validate.string(param) &&
                api.validate.pattern(param, /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/)
            );
        },
        min: function(param, min) {
            return (
                param && min && api.validate.number(min) && 
                (
                    (api.validate.string(param) && param.length >= min) || 
                    (api.validate.number(param) && param >= min)
                )
            );
        },
        max: function(param, max) {
            return (
                param && max && api.validate.number(max) && 
                (
                    (api.validate.string(param) && param.length <= max) || 
                    (api.validate.number(param) && param <= max)
                )
            );
        },
        range: function(param, min, max) {
            return (param && min && max && api.validate.min(param, min) && api.validate.max(param, max));
        },
        alpha: function(param) {
            return (
                param && 
                api.validate.string(param) && 
                api.validate.pattern(param, /^[a-zA-Z]+$/)
            );
        },
        alphanumeric: function(param) {
            return (
                param && 
                api.validate.string(param) && 
                api.validate.pattern(param, /^\w+$/)
            );
        },
        slug: function(param) {
            return (
                param && 
                api.validate.string(param) &&
                api.validate.pattern(param, /^[a-z0-9-]+$/)
            );
        },
        pattern: function(param, pattern) {
            if(param && pattern && api.validate.string(param)) {
                let regex = new RegExp(pattern);
                return regex.test(param);
            } else {
                return false;
            }
        }
    },
    url: {
        encode: function(params) {
            let array = [];
            for (let [key, value] of Object.entries(params)) {
                array.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            }
            return array.join('&');
        },
        decode: function(param) {
            let url = new URL(param);
            let object = {};
            if(url.search !== '') {
                url.search.substr(1).split('&').forEach(query => {
                    let key = query.split('=')[0];
                    let value = query.split('=')[1];
                    if(key == '' && value == '') return;
                    object[key] = value;
                });
            }
            return object;
        }
    },
    log: function(type, messages) {
		console.group('Jcink API ' + type.charAt(0).toUpperCase() + type.slice(1))
		if(api.validate.array(messages)) {
			messages.forEach(message => {
				console.log(message);
			});
		} else {
			console.log(messages);
		}
		console.groupEnd();
    },
    form: {
        serialize: function(formElement) {
            // https://stackoverflow.com/a/44033425
            return Array.from(
                new FormData(formElement),
                e => e.map(encodeURIComponent).join('=')
            ).join('&');
        },
        unserialize: function(string) {
            let object = {};
            string.split('&').forEach(query => {
                let key = query.split('=')[0];
                let value = query.split('=')[1];
                if(key == '' && value == '') return;
                object[key] = value;
            });
            return object;
        },
        create: function(formObject, dataObject) {
            let defaultFormAttributes = ['accept-charset', 'action', 'autocapitalize', 'autocomplete', 'enctype', 'method', 'name', 'novalidate', 'target'];
            let defaultInputAttributes = ['autocomplete', 'autofocus', 'disabled', 'form', 'list', 'name', 'readonly', 'required', 'tabindex', 'type', 'value'];
            let extendedInputAttributes = {
                button: [],
                checkbox: ['checked', 'value'],
                color: [],
                date: ['max', 'min', 'step'],
                'datetime-local': ['max', 'min', 'step', 'readonly'],
                email: ['maxlength', 'minlength', 'multiple', 'pattern', 'placeholder', 'size', 'spellcheck', 'autocorrect', 'mozactionhint'],
                file: ['accept', 'capture', 'files', 'multiple', 'webkitdirectory'],
                hidden: [],
                image: ['alt', 'formataction', 'formenctype', 'formnovalidate', 'formtarget', 'height', 'src', 'width'],
                month: ['max', 'min', 'step'],
                number: ['max', 'min', 'placeholder', 'step'],
                password: ['maxlength', 'minlength', 'pattern', 'placeholder', 'size'],
                radio: ['checked', 'value'],
                range: ['max', 'min', 'step'],
                reset: [],
                search: ['maxlength', 'minlength', 'pattern', 'placeholder', 'size', 'spellcheck', 'autocorrect', 'incremental', 'mozactionhint', 'results'],
                submit: ['formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget'],
                tel: ['maxlength', 'minlength', 'pattern', 'placeholder', 'size', 'spellcheck', 'autocorrect', 'mozactionhint'],
                text: ['maxlength', 'minlength', 'pattern', 'placeholder', 'size', 'spellcheck', 'autocorrect', 'mozactionhint'],
                time: ['max', 'min', 'step'],
                url: ['maxlength', 'minlength', 'pattern', 'placeholder', 'size', 'spellcheck', 'autocorrect', 'mozactionhint'],
                week: ['max', 'min', 'step'],
                select: ['autocomplete', 'autofocus', 'disabled', 'form', 'multiple', 'name', 'required', 'size'],
                textarea: ['autocapitalize', 'autocomplete', 'autofocus', 'cols', 'disabled', 'form', 'maxlength', 'minlength', 'name', 'placeholder', 'readonly', 'required', 'rows', 'spellcheck', 'wrap'],
                option: ['disabled', 'label', 'selected', 'value']
            };
            let globalAttributes = ['accesskey', 'autocapitalize', 'class', 'contenteditable', 'dir', 'draggable', 'hidden', 'id', 'inputmode', 'is', 'itemid', 'itemprop', 'itemref', 'itemscope', 'itemtype', 'lang', 'slot', 'style', 'tabindex', 'title'];
            let eventHandlerAttributes = ['onabort', 'onautocomplete', 'onautocompleteerror', 'onblur', 'oncancel', 'oncanplay', 'oncanplaythrough', 'onchange', 'onclick', 'onclose', 'oncontextmenu', 'oncuechange', 'ondblclick', 'ondrag', 'ondragend', 'ondragenter', 'ondragexit', 'ondragleave', 'ondragover', 'ondragstart', 'ondrop', 'ondurationchange', 'onemptied', 'onended', 'onerror', 'onfocus', 'oninput', 'oninvalid', 'onkeydown', 'onkeypress', 'onkeyup', 'onload', 'onloadeddata', 'onloadedmetadata', 'onloadstart', 'onmousedown', 'onmouseenter', 'onmouseleave', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel', 'onpause', 'onplay', 'onplaying', 'onprogress', 'onratechange', 'onreset', 'onresize', 'onscroll', 'onseeked', 'onseeking', 'onselect', 'onshow', 'onsort', 'onstalled', 'onsubmit', 'onsuspend', 'ontimeupdate', 'ontoggle', 'onvolumechange', 'onwaiting']
            let inputTypes = ['button', 'checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'reset', 'search', 'submit', 'tel', 'text', 'time', 'url', 'week', 'select', 'textarea'];
    
            // BUILD FORM
            if(formObject && api.validate.object(formObject)) {
                console.log(formObject);
                // VALIDATE FORM ATTRIBUTES
                Object.entries(formObject).forEach(([attributeKey, attributeValue]) => {
                    if(
                        // DEFAULT
                        !defaultFormAttributes.includes(attributeKey) &&
                        // GLOBAL
                        !globalAttributes.includes(attributeKey) && 
                        // EVENT HANDLER
                        !eventHandlerAttributes.includes(attributeKey) && 
                        // DATA
                        attributeKey.lastIndexOf('data-', 0) !== 0 &&
                        // ARIA
                        attributeKey.lastIndexOf('aria-', 0) !== 0 &&
                        // CHILDREN
                        attributeKey !== 'children'
                    ) {
                        delete formObject.attributeKey;
                    }
                });
                // VALIDATE INPUT ATTRIBUTES
                if(formObject.hasOwnProperty('children') && api.validate.array(formObject.children)) {
                    formObject.children.forEach((child, index) => {
                        if(api.validate.object(child)) {
                            if(child.hasOwnProperty('type') && child.hasOwnProperty('name')) {
                                if(child.type === 'group' && child.hasOwnProperty('children') && api.validate.array(child.children)) {
                                    // VALIDATE GROUP
                                }
                                else if(
                                    inputTypes.includes(child.type)
                                ) {
                                    Object.entries(child).forEach(([attributeKey, attributeValue]) => {
                                        if(
                                            // DEFAULT
                                            !defaultInputAttributes.includes(attributeKey) && 
                                            // EXTENDED
                                            !extendedInputAttributes[child.type].includes(attributeKey) && 
                                            // GLOBAL
                                            !globalAttributes.includes(attributeKey) && 
                                            // EVENT HANDLER
                                            !eventHandlerAttributes.includes(attributeKey) && 
                                            // DATA
                                            attributeKey.lastIndexOf('data-', 0) !== 0 &&
                                            // ARIA
                                            attributeKey.lastIndexOf('aria-', 0) !== 0 &&
                                            // LABEL
                                            attributeKey !== 'label' &&
                                            // SELECT OPTIONS
                                            attributeKey !== 'options' && 
                                            // REPEATED
                                            attributeKey !== 'repeated' &&
                                            // DESCRIPTION
                                            attributeKey !== 'help'
                                        ) {
                                            delete attributeKey;
                                        }
    
                                        if(attributeKey === 'options') {
                                            attributeValue.forEach((option, index) => {
                                                if(option.hasOwnProperty('value')) {
                                                    Object.entries(option).forEach(([key, value]) => {
                                                        if(!extendedInputAttributes.option.includes(key)) {
                                                            delete option.key;
                                                        }
                                                    });
                                                } else {
                                                    delete option;
                                                }
                                            });
                                        }
                                    });
    
                                    if(dataObject.hasOwnProperty(child.name)) {
                                        child['value'] = dataObject[child.name];
                                    }
                                }
                                else {
                                    delete child;
                                }
                            } else {
                                api.log('warn', ['api.form.create()', 'Form.Children.Child Requires Type and Name']);
                                delete child;
                            }
                        } else {
                            api.log('error', ['api.form.create()', 'Form.Children.Child Object Expected']);
                            return false;
                        }
                    });
                } else {
                    api.log('error', ['api.form.create()', 'Form.Children Array Required']);
                    return false;
                }
            } else {
                api.log('error', ['api.form.create()', 'Form Object Required']);
                return false;
            }
    
            // BUILD TEMPLATE
            formDOM = api.form.template(formObject);

            formObject.children.forEach(child => {
                if(child.type === 'group') {
                    child.children.forEach(input => {
                        api.form.events(input, formDOM);
                    });
                }
                else {
                    api.form.events(child, formDOM);
                }
            });
    
            return formDOM;
        },
        events: function(child, body = document) {
            let element = body.querySelector('form *[name="' + child.name + '"]');
    
            if(element) {
                child.errors = [];
                if(
                    child.hasOwnProperty('required') || 
                    child.hasOwnProperty('minlength') || 
                    child.hasOwnProperty('maxlength') || 
                    child.type === 'email'
                ) {
                    element.addEventListener('keyup', function(e) {
                        if(child.hasOwnProperty('required') && child.required == 'true') {
                            if(element.value) {
                                if(child.errors.includes('required')) {
                                    child.errors.splice(child.errors.indexOf('required'));
                                }
                            } else {
                                if(!child.errors.includes('required')) {
                                    child.errors.push('required');
                                }
                            }
                        }
    
                        if(child.hasOwnProperty('minlength')) {
                            console.log(element.value, api.validate.min(element.value, child.minlength));
                            if(element.value && api.validate.min(element.value, child.minlength)) {
                                if(child.errors.includes('minlength')) {
                                    child.errors.splice(child.errors.indexOf('minlength'));
                                }
                            } else {
                                if(!child.errors.includes('minlength')) {
                                    child.errors.push('minlength');
                                }
                            }
                        }
    
                        if(child.hasOwnProperty('maxlength')) {
                            if(element.value && api.validate.max(element.value, child.maxlength)) {
                                if(child.errors.includes('maxlength')) {
                                    child.errors.splice(child.errors.indexOf('maxlength'));
                                }
                            } else {
                                if(!child.errors.includes('maxlength')) {
                                    child.errors.push('maxlength');
                                }
                            }
                        }
    
                        if(child.type === 'email') {
                            if(element.value && api.validate.email(element.value)) {
                                if(child.errors.includes('email')) {
                                    child.errors.splice(child.errors.indexOf('email'));
                                }
                            } else {
                                if(!child.errors.includes('email')) {
                                    child.errors.push('email');
                                }
                            }
                        }
    
                        let errorTemplate = `
                            ${Object.entries(child.errors).length > 0 ? `
                                <ul class="input-errors">
                                    ${Object.entries(child.errors).map(([key, value]) => `
                                        <li class="input-errors-item">
                                            ${value == 'required' ? `Value is Required` : ``}
                                            ${value == 'minlength' ? `Minimum length of ${child.minlength}`: ``}
                                            ${value == 'maxlength' ? `Maximum length of ${child.maxlength}`: ``}
                                            ${value == 'email' ? `Invalid Email` : ``}
                                        </li>
                                    `).join('')}
                                </ul>
                            `: ``}
                        `;
    
                        if(!element.parentNode.querySelector('ul.input-errors')) {
                            element.insertAdjacentHTML('afterend', errorTemplate);
                        } else {
                            element.parentNode.querySelector('ul.input-errors').remove();
                            element.insertAdjacentHTML('afterend', errorTemplate);
                        }
                    });
                }
            }
        },
        template: function(formObject) {
            let template = `
            <form
                ${Object.entries(formObject).map((attribute) => `
                    ${attribute[0] !== 'children' ? `${attribute[0]}="${attribute[1]}"` : ``}
                `).join(' ')}
            >
                ${formObject.hasOwnProperty('name') || formObject.hasOwnProperty('title') ? `
                    <div class="form-title">${formObject.hasOwnProperty('title') ? `${formObject.title}` : `${formObject.name}`}</div>
                `: ``}
                ${formObject.children.map((child) => `
                    ${child.type == 'group' ? `
                        <div class="form-group">
                            ${child.children.map((child) => `
                                <div class="form-row${child.type == 'hidden' ? ` form-row--hidden hidden` : ``}" ${child.type == 'hidden' ? `hidden` : ``}>
    
                                </div>
                            `)}
                        </div>
                    ` : `
                        <div class="form-row${child.type == 'hidden' ? ` form-row--hidden hidden` : ``}" ${child.type == 'hidden' ? `hidden` : ``}>
                            ${child.type !== 'select' && child.type !== 'textarea' && child.type !== 'submit' && child.type !== 'button' ? `
                                <label for="${child.hasOwnProperty('id') ? `${child.id}` : `${child.name}`}">${child.hasOwnProperty('label') ? `${child.label}` : `${child.name}`}</label>
                                <input 
                                    ${Object.entries(child).map((attribute) => `
                                        ${attribute[0] !== 'options' ? `${attribute[0]}="${attribute[1]}"` : ``}
                                    `).join(' ')}
                                    ${child.hasOwnProperty('options') ? `
                                        list="
                                            ${child.hasOwnProperty('id') ? `${child.id}-options` : `${child.name}-options`}
                                        "
                                    ` : ``}
                                >
                                ${child.hasOwnProperty('options') ? `
                                    <datalist 
                                        list="${child.hasOwnProperty('id') ? `${child.id}-options` : `${child.name}-options`}"
                                    >
                                        ${child.options.map((option) => `
                                            <option value="${option.value}">
                                        `).join('')}
                                    </datalist>
                                ` : ``}
                                ${child.hasOwnProperty('help') ? `<div class="input-help">${child.help}</div>` : ``}
                            ` : ``}
                            ${child.type == 'submit' || child.type == 'button' ? `
                                <input 
                                    ${Object.entries(child).map((attribute) => `
                                        ${attribute[0] !== 'options' ? `${attribute[0]}="${attribute[1]}"` : ``}
                                    `).join(' ')}
                                    ${child.hasOwnProperty('options') ? `
                                        list="
                                            ${child.hasOwnProperty('id') ? `${child.id}-options` : `${child.name}-options`}
                                        "
                                    ` : ``}
                                >
                            ` : ``}
                            ${child.type == 'select' ? `
                                <label for="${child.hasOwnProperty('id') ? `${child.id}` : `${child.name}`}">${child.hasOwnProperty('label') ? `${child.label}` : `${child.name}`}</label>
                                <select
                                    ${Object.entries(child).map((attribute) => `
                                        ${attribute[0] !== 'options' ? `${attribute[0]}="${attribute[1]}"` : ``}
                                    `).join(' ')}
                                >
                                    ${child.options.map((option) => `
                                        <option 
                                            ${Object.entries(option).map((attribute) => `
                                                ${attribute[0] !== 'label' ? `${attribute[0]}="${attribute[1]}"` : ``}
                                            `).join(' ')}
                                        >${option.hasOwnProperty('label') ? `${option.label}` : `${option.value}`}</option>
                                    `).join('')}
                                </select>
                                ${child.hasOwnProperty('help') ? `<div class="input-help">${child.help}</div>` : ``}
                            ` : ``}
                            ${child.type == 'textarea' ? `
                                <label for="${child.hasOwnProperty('id') ? `${child.id}` : `${child.name}`}">${child.hasOwnProperty('label') ? `${child.label}` : `${child.name}`}</label>
                                <textarea 
                                    ${Object.entries(child).map((attribute) => `
                                        ${attribute[0] !== 'value' ? `${attribute[0]}="${attribute[1]}"` : ``}
                                    `).join(' ')}
                                >${child.hasOwnProperty('value') ? `${child.value}` : ``}</textarea>
                                ${child.hasOwnProperty('help') ? `<div class="input-help">${child.help}</div>` : ``}
                            ` : ``}
                        </div>
                    `}
                `).join('')}
            </form>
            `;
    
            return new DOMParser().parseFromString(template, 'text/html').body.querySelector('form');
        }
    }
};