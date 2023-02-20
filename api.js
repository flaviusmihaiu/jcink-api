class api {
	constructor (dom = window.document, location = window.location.href) {
		this.dom = dom
		this.location = location
	}

	getDom () {
		return this.dom
	}

	setDom (dom = window.document) {
		this.dom = dom
	}

	getLocation () {
		return this.location
	}

	setLocation (location = location.href) {
		this.location = location
	}

	parse (dom = this.getDom(), location = this.getLocation(), data = {}) {
		// apiElements
		let apiObjectElements = dom.querySelectorAll('[data-api-object]')
		if (apiObjectElements) {
			apiObjectElements.forEach(apiObject => {
				let apiObjectKey = apiObject.dataset.apiObject
				// create Array if it does not exist
				!data.hasOwnProperty(apiObjectKey) ? data[apiObjectKey] = [] : null
				let dataPairs = {}
				let apiPairElements = apiObject.querySelectorAll('[data-api-pair')
				if(apiPairElements) {
					apiPairElements.forEach(apiPair => {
						// remove placeholder value
						apiPair.innerHTML = apiPair.innerHTML.replace(/<!--[^>]*-->/gm, '').replace(/^--$/, '')
						dataPairs[apiPair.dataset.apiPair] = !apiPair.innerHTML == '' ? apiPair.innerHTML : null
					})
					// push Object to Array when all keys and values set
					data[apiObjectKey].push(dataPairs)
				}
			})
		}

		// csrf
		data.csrf = dom.querySelector('[data-api-csrf]') ? dom.querySelector('[data-api-csrf]').innerHTML : null
	
		// url
		data.url = location

		// query
		data.query = data.hasOwnProperty('query') ? data.query[0] : null

		// user
		if(data.hasOwnProperty('user')) {
			data.user = data.user[0]
			// set avatar_url
			data.user.user_avatar_URL = data.user.user_avatar_IMG ? new DOMParser().parseFromString(data.user.user_avatar_IMG, 'text/html').querySelector('img').getAttribute('src') : null
		} else {
			data.user = null
		}
		
		// macro
		data.macro = data.hasOwnProperty('macro') ? data.macro[0] : null

		// errors
		data.errors = []
		if (dom.querySelector('#board-message')) {
			let errors = dom.querySelectorAll('#board-message span.postcolor')
			errors.forEach(error => {
				data.errors.push(error.textContent)
			})
		} else if (dom.querySelector('.postcolor') && dom.querySelectorAll('.postcolor').length == 1) {
			let error = dom.querySelector('.postcolor').textContent
			if (error.startsWith('Sorry,')) {
				data.errors.push(error)
			}
		} else if (dom.querySelector('#upccontent') && dom.querySelector('#ucpcontent > *:nth-child(2)').classList.contains('pformstrip')) {
			let error = dom.querySelector('#ucpcontent > *:nth-child(2)').classList.textContent
			if (error == 'No access permissions') {
				data.errors.push('Access is Denied')
			}
		}

		// page
		data.page = data.query != null && data.query.act == 'Pages' && !data.errors.length && dom.querySelector('[data-api-hidden=board]') ? dom.querySelector('[data-api-hidden=board]') : null
	
		// navigation
		data.navigations = []
		if (dom.querySelector('#navstrip')) {
			let navigationLinks = dom.querySelectorAll('#navstrip a')
			navigationLinks.forEach(navigationLink => {
				data.navigations.push({
					navigation_name: navigationLink.textContent,
					navigation_URL: navigationLink.getAttribute('href'),
					navigation_LINK: navigationLink.outerHTML
				})
			})
			let navigationLast = dom.querySelector('#navstrip').lastElementChild
			if (navigationLast.nodeType == 3) {
				data.navigations.push({
					navigation_name: navigationLast.nodeValue.substring(1),
					navigation_URL: null,
					navigation_LINK: null
				})
			}
		}

		// categories
		data.categories = []
		if (data.hasOwnProperty('category')) {
			data.categories = data.category
			delete data.category
			data.categories.forEach((category, categoryIndex, categories) => {
				data.categories[categoryIndex].category_URL = `/index.php?c=${category.category_id}`
				data.categories[categoryIndex].category_LINK = `<a href="/index.php?c=${category.category_id}">${category.category_name}</a>`
			})
		}

		// forums
		data.forums = []
		if (data.hasOwnProperty('forum')) {
			data.forums = data.forum
			delete data.forum
			data.forums.forEach((forum, forumIndex, forums) => {
				data.forums[forumIndex].forum_URL = forum.forum_URL || `/index.php?showforum=${forum.forum_id}`
				data.forums[forumIndex].forum_LINK = forum.forum_LINK || `<a href="/index.php?showforum=${forum.forum_id}">${forum.forum_name}</a>`
				data.forums[forumIndex].last_unread_URL = `/index.php?showtopic=${forum.last_topic_id}&view=getlastpost`
				// category_id, category_name, category_url, category_link
				if(!forum.category_id) {
					let category = data.navigations.slice(-2)[0]
					data.forums[forumIndex].category_id = new URL(category.navigation_URL).searchParams.get('showforum') || new URL(category.navigation_URL).searchParams.get('c')
					data.forums[forumIndex].category_name = category.navigation_name
					data.forums[forumIndex].category_URL = category.navigation_URL
					data.forums[forumIndex].category_LINK = category.navigation_LINK
				} else {
					let category = data.categories.filter(category => category.category_id == forum.category_id)[0]
					data.forums[forumIndex] = {...data.forums[forumIndex], ...category}
				}
				// subforum_list_ARRAY
				data.forums[forumIndex].subforums_list_ARRAY = []
				if(forum.subforums_list_HTML != null) {
					let subforumElements = new DOMParser().parseFromString(forum.subforums_list_HTML, 'text/html').querySelectorAll('a:not(.subforums-macro)')
					if(subforumElements) {
						subforumElements.forEach((subforum, subforumIndex, subforums) => {
							data.forums[forumIndex].subforums_list_ARRAY.push({
								subforum_id: new URL(subforum.getAttribute('href')).searchParams.get('showforum'),
								subforum_name: subforum.innerHTML,
								subforum_description: subforum.getAttribute('title'),
								subforum_URL: subforum.getAttribute('href'),
								subforum_LINK: subforum.outerHTML
							})
						})
					}
				}
				// moderators_list_ARRAY
				data.forums[forumIndex].moderators_list_ARRAY = []
				if(forum.moderators_list_HTML != null) {
					let moderatorElements = new DOMParser().parseFromString(forum.moderators_list_HTML, 'text/html').querySelectorAll('a')
					if(moderatorElements) {
						moderatorElements.forEach((moderator, moderatorIndex, moderators) => {
							data.forums[forumIndex].moderators_list_ARRAY.push({
								moderator_id: new URL(moderator.getAttribute('href')).searchParams.get('showuser'),
								moderator_name: moderator.innerHTML,
								moderator_URL: moderator.getAttribute('href'),
								moderator_LINK: moderator.outerHTML
							})
						})
					}
				}
				// active_user_list_ARRAY
				data.forums[forumIndex].active_user_list_ARRAY = []
				if(forum.active_user_list_HTML != null) {
					let activeUserElements = new DOMParser().parseFromString(forum.active_user_list_HTML, 'text/html').querySelectorAll('a')
					if(activeUserElements) {
						activeUserElements.forEach((activeUser, activeUserIndex, activeUsers) => {
							data.forums[forumIndex].active_user_list_ARRAY.push({
								active_user_id: new URL(activeUser.getAttribute('href')).searchParams.get('showuser'),
								active_user_name: activeUser.innerHTML,
								active_user_URL: activeUser.getAttribute('href'),
								active_user_LINK: activeUser.outerHTML
							})
						})
					}
				}
			})
		}
		// subscription-forums

		// topics
		data.topics = []
		// if view_forum > topics
		if (data.hasOwnProperty('topic')) {
			data.topics = data.topic
			delete data.topic
			data.topics.forEach((topic, topicIndex, topics) => {
				data.topics[topicIndex].stats_replies_LINK = topic.stats_replies_LINK.replace(/^\s*/, '')
				data.topics[topicIndex].stats_replies_URL = new DOMParser().parseFromString(topic.stats_replies_LINK, 'text/html').querySelector('a').getAttribute('href')
				data.topics[topicIndex].created_author_URL = `/index.php?showuser=${topic.created_author_id}`
				data.topics[topicIndex].last_post_author_name = new DOMParser().parseFromString(topic.last_post_author_LINK, 'text/html').querySelector('a').innerHTML
				data.topics[topicIndex].last_post_author_URL = `/index.php?showuser=${topic.last_post_author_id}`
			})
		}
		// if view_topic > posts
		else if (dom.querySelector('.topic-title')) {
			let topic_id = data.query.showtopic || data.query.t
			let topic_name = dom.querySelector('.topic-title').textContent
			data.topics.push({
				topic_id: topic_id,
				topic_name: topic_name,
				topic_description: dom.querySelector('.topic-desc') ? dom.querySelector('.topic-desc').textContent.substring(2) : null,
				topic_URL: `/index.php?showtopic=${topic_id}`,
				topic_LINK: `<a href="/index.php?showtopic=${topic_id}">${topic_name}</a>`
			})
		}
		// recent-topics
		if(dom.querySelector('#recent-topics')) {
			let topicElements = dom.querySelectorAll('#recent-topics tbody tr')
			topicElements.forEach((topic, topicIndex, topics) => {
				let topicElement = topic.querySelector('a[href*="showtopic"]')
				let topic_id = new URL(topicElement.getAttribute('href')).searchParams.get('showtopic')
				let forumElement = topic.querySelector('a[href*="showforum"]')
				let forum_id = new URL(forumElement.getAttribute('href')).searchParams.get('showforum')
				let forum = data.forums.filter(forum => forum.forum_id == forum_id)[0]
				data.topics.push({
					topic_id: topic_id,
					topic_name: topicElement.textContent,
					topic_URL: topicElement.getAttribute('href'),
					topic_LINK: topicElement.outerHTML,
					forum_id: forum_id,
					forum_name: forum?.forum_name || null,
					forum_URL: forum?.forum_URL || `/index.php?showforum=${forum_id}`,
					forum_LINK: forum?.forum_LINK || null,
				})
			})
		}
		// search-topics + active-topics
		if (document.querySelector('#search-topics, #active-topics')) {
			let topicElements = document.querySelectorAll('#search-topics tbody tr:not(:first-child), #active-topics tbody tr:not(:first-child)')
			topicElements.forEach((topic, topicIndex, topics) => {
				let icon = topic.querySelector('td:first-child').innerHTML
				let topic_LINK = topic.querySelector('td:nth-child(3) a')
					let topic_id = new URL(topic_LINK.getAttribute('href')).searchParams.get('showtopic')
					let topic_name = topic_LINK.textContent
				let forum_LINK = topic.querySelector('td:nth-child(4) a')
					let forum_id = new URL(forum_LINK.getAttribute('href')).searchParams.get('showforum')
					let forum_name = forum_LINK.textContent
				let created_author_LINK = topic.querySelector('td:nth-child(5) a')
					let created_author_id = new URL(created_author_LINK.getAttribute('href')).searchParams.get('showuser')
					let created_author_name = created_author_LINK.textContent
				let stats_replies_NUMBER = topic.querySelector('td:nth-child(6)').innerHTML
				let stats_views_NUMBER = topic.querySelector('td:nth-child(7)').innerHTML
				let last_post_author_LINK = topic.querySelector('td:nth-child(8) b a')
					let last_post_author_id = new URL(last_post_author_LINK.getAttribute('href')).searchParams.get('showuser')
					let last_post_author_name = last_post_author_LINK.textContent
				data.topics[topicIndex].push({
					topic_id: topic_id,
					topic_name: topic_name,
					topic_URL: `/index.php?showtopic=${topic_id}`,
					topic_HTML: `<a href="/index.php?showtopic=${topic_id}">${topic_name}</a>`,
					forum_id: forum_id,
					forum_name: forum_name,
					forum_URL: `/index.php?showforum=${forum_id}`,
					forum_LINK: `<a href="/index.php?showforum=${forum_id}">${forum_name}</a>`,
					stats_replies_NUMBER: stats_replies_NUMBER,
					stats_views_NUMBER: stats_views_NUMBER,
					created_author_id: created_author_id,
					created_author_name: created_author_name,
					created_author_URL: `/index.php?showuser=${created_author_id}`,
					created_author_LINK: `<a href="/index.php?showuser=${created_author_id}">${created_author_name}</a>`,
					last_post_DATE: topic.querySelector('td:nth-child(7)').innerHTML.split('<br>')[0].trim(),
					last_post_author_id: last_post_author_id,
					last_post_author_name: last_post_author_name,
					last_post_author_URL: `/index.php?showuser=${last_post_author_id}`,
					last_post_author_LINK: `<a href="/index.php?showuser=${last_post_author_id}">${last_post_author_name}</a>`,
				})
			})
		}
		// subscription-topics

		// posts
		data.posts = []
		if (data.hasOwnProperty('post')) {
			data.posts = data.post
			delete data.post
			let forumElement = dom.querySelectorAll('#navstrip a[href*="showforum]').lastElementChild
			let forum = forumElement ? {
				forum_id: new URL(forumElement.getAttribute('href')).searchParams.get('showforum'),
				forum_name: forumElement.innerHTML,
				forum_URL: forumElement.getAttribute('href'),
				forum_LINK: forumElement.outerHTML
			} : {forum_id: null, forum_name: null, forum_URL: null, forum_LINK: null}
			let topic = data.topics.length > 0 ? data.topics[0] : {topic_id: null, topic_name: null, topic_description: null, topic_URL: null, topic_LINK: null}
			data.posts.forEach((post, postIndex, posts) => {
				data.posts[postIndex].topic_id = topic.topic_id
				data.posts[postIndex].topic_name = topic.topic_name
				data.posts[postIndex].topic_description = topic.topic_description
				data.posts[postIndex].topic_URL = topic.topic_URL
				data.posts[postIndex].topic_LINK = topic.topic_LINK
				data.posts[postIndex].forum_id = forum.forum_id
				data.posts[postIndex].forum_name = forum.forum_name
				data.posts[postIndex].forum_URL = forum.forum_URL
				data.posts[postIndex].forum_LINK = forum.forum_LINK
				data.posts[postIndex].post_LINK = `<a href="${post.post_URL}">#${post.post_id}</a>`
                data.posts[postIndex].author_URL = `/index.php?showuser=${post.author_id}`
                // data.posts[postIndex].author_ip_STRING = null
				// post_attachments_ARRAY
				data.posts[postIndex].post_attachments_ARRAY = []
				if (post.post_attachments_HTML != null) {
					let postAttachmentElements = new DOMParser().parseFromString(post.post_attachments_HTML, 'text/html').querySelectorAll('a')
					postAttachmentElements.forEach((attachment, attachmentIndex, attachments) => {
						file_URL = attachment.getAttribute('href')
						file_name = new URL(file_URL).pathname.split('/').at(-1)
						file_type = file_name.split('.').at(-1)
						if(post.post_attachments_ARRAY.length && post.post_attachments_ARRAY[post.post_attachments_ARRAY.length - 1].file_url != file_URL) {
							data.posts[postIndex].post_attachments_ARRAY.push({
								file_name: file_name,
								file_type: file_type,
								file_URL: file_URL,
								file_HTML: `<a href="${file_URL}">${file_name}</a>`
							})
						}
					})
                }
			})
		}
		// search-posts
		if (dom.querySelector('form[action*="act=Search&CODE=show&searchid="]') && dom.querySelector('*[class^="post"]')) {
			let postElements = dom.querySelectorAll('form[action*="act=Search&CODE=show&searchid="] ~ div.tableborder > table.tablebasic')
			postElements.forEach((post, postIndex, posts) => {
				let forum_LINK = post.querySelector('tbody tr:last-child td:last-child a:first-child')
					let forum_id = new URL(forum_LINK.getAttribute('href')).searchParams.get('showforum')
					let forum_name = forum_LINK.textContent
				let topic_LINK = post.previousElementSibling.querySelector('a')
					let topic_id = new URL(topic_LINK.getAttribute('href')).searchParams.get('showtopic')
					let topic_name = topic_LINK.textContent
				let author_LINK = post.querySelector('tbody tr:first-child td:first-child a')
					let author_id = new URL(author_LINK.getAttribute('href')).searchParams.get('showuser')
					let author_name = author_LINK.textContent
				let topic_stats_replies_NUMBER = post.querySelector('tbody tr:nth-child(2) td:first-child b:first-of-type').textContent
				let topic_stats_views_NUMBER = post.querySelector('tbody tr:nth-child(2) td:first-child b:last-of-type').textContent
				let post_LINK = post.querySelector('tbody tr:last-child td:last-child a:last-child')
					let post_id = new URL(post_LINK.getAttribute('href')).searchParams.get('p')
				let search = new URL(post_LINK.getAttribute('href')).searchParams.get('hl')
				data.posts.push({
					forum_id: forum_id,
					forum_name: forum_name,
					forum_link: `/index.php?showforum=${forum_id}`,
					forum_URL: `<a href="/index.php?showforum=${forum_id}">${forum_name}</a>`,
					topic_id: topic_id,
					topic_name: topic_name,
					topic_URL: `/index.php?showtopic=${topic_id}`,
					topic_HTML: `<a href="/index.php?showtopic=${topic_id}">${topic_name}</a>`,
					topic_stats_replies_NUMBER: topic_stats_replies_NUMBER,
					topic_stats_views_NUMBER: topic_stats_views_NUMBER,
					author_id: author_id,
					author_name: author_name,
					author_URL: `/index.php?showuser=${author_id}`,
					author_LINK: `<a href="/index.php?showuser=${author_id}">${author_name}</a>`,
					post_id: post_id,
					post_content: post.querySelector('tbody tr:nth-child(2) > td:last-child').innerHTML,
					post_DATE: post.querySelector('tbody tr:first-child td:last-child').textContent.split(':')[1].trim(),
					post_URL: `/index.php?act=ST&f=${forum_id}&t=${topic_id}&hl=${search}&view=findpost&p=${post_id}`,
					post_LINK: `<a href="/index.php?act=ST&f=${forum_id}&t=${topic_id}&hl=${search}&view=findpost&p=${post_id}">${post_id}</a>`
				})
			})
		}

		// stats
		if (data.hasOwnProperty('stats')) {
			data.stats = data.stats[0]
			let newest_member = new DOMParser().parseFromString(data.stats.stats_newest_member_LINK, 'text/html').querySelector('a')
			data.stats.stats_newest_member_id = new URL(newest_member.getAttribute('id').getAttribute('href')).searchParams.get('showuser')
			data.stats.stats_newest_member_name = newest_member.innerHTML
			data.stats.stats_newest_member_URL = `/index.php?showuser=${data.stats.stats_newest_member_id}`
			// online_now_list_ARRAY
			data.stats.online_now_list_ARRAY = []
			if(data.stats.online_now_list_HTML != null) {
				// ...
			}
			// online_now_legend_ARRAY
			data.stats.online_now_legend_ARRAY = []
			if(data.stats.online_now_legend_ARRAY != null) {
				// ...
			}
			// online_today_list_ARRAY
			data.stats.online_today_list_ARRAY = []
			if(data.stats.online_today_list_ARRAY != null) {
				// ...
			}
		} else {
			data.stats = null
		}

		// members (member-list, main-profile, mini-profile)
		data.members = []
		if (data.hasOwnProperty('member')) {
			data.members = data.member
			delete data.member
			data.members.forEach((member, memberIndex, members) => {
				if (!member.member_URL) { data.members[memberIndex].member_URL = `/index.php?showuser=${member.member_id}` }
				if (!member.member_LINK) { data.members[memberIndex].member_LINK = `<a href="/index.php?showuser=${member.member_id}">${member.member_name}</a>` }
				data.members[memberIndex].member_website_URL = (member.member_website_LINK ? new DOMParser().parseFromString(member.member_website_LINK, 'text/html').querySelector('a')?.getAttribute('href') || null : null)
				// mini-profile topic
				if (member.hasOwnProperty('topic_id')) {
					let topic_name = dom.querySelector('.topic-title').innerHTML
					let topic_description = dom.querySelector('.topic-descriiption').innerHTML
					data.members[memberIndex].topic_name = topic_name
					data.members[memberIndex].topic_URL = `/index.php?showtopic=${member.topic_id}`
					data.members[memberIndex].topic_LINK = `<a href="/index.php?showtopic=${member.topic_id}">${topic_name}</a>`
					data.members[memberIndex].topic_description = (topic_description != '' ? topic_description : null)
				}
				// mini-profile forum
				if (member.hasOwnProperty('forum_id')) {
					let forum = dom.querySelector(`#navstrip a[href*="showforum=${member.forum_id}"]`)
					data.members[memberIndex].forum_name = forum.textContent
					data.members[memberIndex].forum_URL = forum.getAttribute('href')
					data.members[memberIndex].forum_LINK = `<a href="/index.php?showtopic=${member.forum_id}">${forum.textContent}</a>`
				}
				// visitors_JSON
				if(typeof visitors_JSON !== 'undefined') {
					data.members[memberIndex].visitors_JSON = visitors_JSON
					data.members[memberIndex].visitors_ARRAY = JSON.parse(data.members[memberIndex].visitors_JSON)
				} else {
					data.members[memberIndex].visitors_JSON = null
					data.members[memberIndex].visitors_ARRAY = []
				}
				// comments_JSON
				if(typeof comments_JSON !== 'undefined') {
					data.members[memberIndex].comments_JSON = comments_JSON
					data.members[memberIndex].comments_ARRAY = JSON.parse(data.members[memberIndex].comments_JSON)
				} else {
					data.members[memberIndex].comments_JSON = null
					data.members[memberIndex].comments_ARRAY = []
				}
				// friends_JSON
				if(typeof friends_JSON !== 'undefined') {
					data.members[memberIndex].friends_JSON = friends_JSON
					data.members[memberIndex].friends_ARRAY = JSON.parse(data.members[memberIndex].friends_JSON)
				} else {
					data.members[memberIndex].friends_JSON = null
					data.members[memberIndex].friends_ARRAY = []
				}
				// subaccounts_ARRAY
				data.members[memberIndex].subaccounts_ARRAY = []
				if(member.subaccounts_INPUT) {
					let subaccountElements = new DOMParser().parseFromString(member.subaccounts_INPUT, 'text/html').querySelectorAll('option')
					subaccountElements.forEach((subaccount, subaccountIndex, subaccounts) => {
						if (subaccountIndex != 0) {
							let member_id = subaccount.value
							let member_name = subaccount.textContent.replace('»', '').trim()
							data.members[memberIndex].subaccounts_ARRAY.push({
								member_id: subaccount.value,
								member_name: member_name,
								member_LINK: `<a href="/index.php?showuser=${member_id}">${member_name}</a>`,
								member_URL: `/index.php?showuser=${member_id}`
							})
						}
					})
				}
			})
		}

		// messages
		data.messages = []
		// inbox
		// if (dom.querySelector('...')) {
		// 	let messageElements = dom.querySelectorAll('...')
		// 	messageElements.forEach((message, messageIndex, messages) => {

		// 		data.messages.push({

		// 		})
		// 	})
		// }
		// single-message
		// if (dom.querySelector('...')) {
		// 	let messageElement = dom.querySelector('...')
		// 	data.messages.push({

		// 	})
		// }

		// alerts
		data.alerts = []
		if (dom.querySelector('form[action*="act=UserCP&CODE=alerts"]')) {
            let alertElements = dom.querySelectorAll('tr[class*="alert-"]')
            alertElements.forEach((alert, alert_index, alerts) => {

				data.alerts.push({

				})
            })
        } else if (dom.querySelector('.recent-alerts-msg')) {
            let alertElements = dom.querySelectorAll('.recent-alerts-msg')
            alertElements.forEach((alert, alert_index, alerts) => {
                
				data.alerts.push({
					
				})
            })
        }

		// pagination
		data.pagination = null
		if (dom.querySelector('span.pagination') && dom.querySelector('span.pagination').childNodes.length > 1) {
			let paginationElement = dom.querySelector('span.pagination')
			let current_page_NUMBER = paginationElement.querySelector('.pagination_current').textContent
			let page_NUMBER = Number(paginationElement.querySelector('.pagination_page').textContent)
			data.pagination = {
				total_pages_NUMBER: paginationElement.querySelector('.pagination_pagetxt').textContent.match(/\((\d+)\)/)[1],
				current_page_NUMBER: current_page_NUMBER,
				per_page_NUMBER: (page_NUMBER == 1 ? data.query.st / current_page_NUMBER - 1 : new URL(pageElement.getAttribute('href')).searchParams.get('st') / (page_NUMBER - 1))
			}
		}

		// no return value
		this.data = data
	}

	getData () {
		return this.data
	}
}