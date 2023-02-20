class string {
	constructor () {

	}

	// capitalize each word in a string
	capitalize (val) {
		return val.split(/[\s]/).filter(part => part.length > 0).map((part, index) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
	}

	// decapitalze each word in a string
	decapitalize (val) {
		return val.split(/[\s]/).filter(part => part.length > 0).map((part, index) => part.charAt(0).toLowerCase() + part.slice(1)).join(' ')
	}

	// camelCase
	camel (val) {
		return val.split(/[\s\-\_]/).filter(part => part.length > 0).map((part, index) => index > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part).join('')
	}

	// PascalCase
	pascal (val) {
		return val.split(/[\s\-\_]/).filter(part => part.length > 0).map(part => part.charAt(0).toUpperCase()  + part.slice(1)).join('')
	}

	// kebab-case
	kebab (val) {
		return val.split(/[\s\-\_]/).filter(part => part.length > 0).map((part) => part.toLowerCase()).join('-')
	}

	// snake_case
	snake (val) {
		return val.split(/[\s\-\_]/).filter(part => part.length > 0).map((part) => part.toLowerCase()).join('_')
	}

	// replace & " ' < > / \ `
	escape (val) {
		return val
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#x27;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\//g, '&#x2F;')
			.replace(/\\/g, '&#x5C;')
			.replace(/`/g, '&#96;')
	}

	// replace &amp; &quot; &#x27; &lt; &gt; &#x2F; &#x5C; &#96;
	unescape (val) {
		return val
			.replace(/&quot;/g, '"')
			.replace(/&#x27;/g, "'")
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&#x2F;/g, '/')
			.replace(/&#x5C;/g, '\\')
			.replace(/&#96;/g, '`')
			.replace(/&amp;/g, '&')
	}
}