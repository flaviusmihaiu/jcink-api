class dom {
	constructor (dom = window.document, settings = {}) {
		this.dom = dom
		this.settings = {
			...{
				insert: 'beforeend'
			},
			...settings
		}
	}

	get (val) {
		return this.dom.querySelector(val)
	}

	getAll (val) {
		return this.dom.querySelectorAll(val)
	}

	getID (val) {
		return this.dom.getElementById(val)
	}

	getClass (val) {
		return this.dom.getElementsByClassName(val)
	}

	getTag (val) {
		return this.dom.getElementsByTagName(val)
	}

	getName (val) {
		return this.dom.getElementsByName(val)
	}

	parse (string) {
		return new DOMParser().parseFromString(string, "text/html")
	}

	render(string, parent) {
		return parent.insertAdjacentHTML(this.settings.insert, string)
	}
}