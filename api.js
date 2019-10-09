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
                if(body.querySelectAll('#board-message').length) {
                    api.log('error', ['api.ajax.get(' + url + ')']);
                    return;
                }
                
                callback(api.response(body));
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
                if(body.querySelectAll('#board-message').length) {
                    api.log('error', ['api.ajax.post(' + url + ')', '$.get(' + url + ')']);
                    return;
                }

                let form = $('form', body).serializeArray();
                let object = {};
                form.forEach(function (value, key) {
                    object[key] = value;
                });
                Object.assign({}, object, post);

                let url = window.location.origin + window.location.pathname;
                $.post(url, object, function(body) {
                    if(body.querySelectAll('#board-message').length) {
                        api.log('error', ['api.ajax.post(' + url + ')', '$.post(' + url + ')', object]);
                        return;
                    }

                    callback(api.response(body));
                });
            });
        },
    },
    response: function(body = document) {
        // FIND API BLOCKS
        let elements = ['category', 'forum', 'topic', 'post', 'member'];
        let data = {};
        elements.forEach(element => {
            let DOMs = body.querySelectorAll('div[data-api="' + element + '"]');
            if(DOMs.length == 1) {
                data[element] = {};

                let blocks = DOM.querySelectorAll('div[data-api]');
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
                    console.log(forum.subforumsList)
                    if(forum.subforumsList !== '') {
                        forum.subforums = [];
                        let dom = new DOMParser().parseFromString(forum.subforumsList, "text/html")
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
            return(
                param &&
                (
                    (typeof param == 'number' || param instanceof Number) ||
                    (api.validate.string(param) && api.validate.pattern(param, /^\d+$/))
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
            return(
                param && 
                api.validate.string(param) && 
                api.validate.pattern(param, /^\w+$/)
            );
        },
        slug: function(param) {
            return(
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
	}
};