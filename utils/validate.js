class validate {
	constructor (patterns = {}) {
		this.patterns = {
			...{
				alpha: /^[a-zA-Z]+$/u,
				alphanumeric: /^\w+$/u,
				email: /^[a-z0-9!#$%&'*+/=?^_‘{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_‘{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
				ipV4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
				ipV6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
				hex: /^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/
			},
			...patterns
		}
	}

	string (val) {
		return (typeof val == 'string' || val instanceof String) ? true : false
	}

	number (val) {
		return (typeof val == 'number' || val instanceof Number) ? true : false
	}

	array (val) {
		return (Array.isArray(val) || val instanceof Array) ? true : false
	}

	object (val) {
		return ((typeof val == 'object' || val instanceof Object) && !Array.isArray(val)) ? true : false
	}

	function (val) {
		return (typeof val == 'function' || val instanceof Function) ? true : false
	}

	min (val, min = 0) {
		return (this.number(val) && val >= min) || (this.string(val) && val.length >= min) ? true : false
	}

	max (val, max = 1) {
		return (this.number(val) && val <= max) || (this.string(val) && val.length <= max) ? true : false
	}

	range (val, min = 0, max = 1) {
		return this.min(val, min) && this.max(val, max) ? true : false
	}

	alpha () {
		return new RegExp(this.patterns.alpha).test(val)
	}

	alphanumeric () {
		return new RegExp(this.patterns.alphanumeric).test(val)
	}

	url (val) {
		try {
			new URL(val)
			return true
		} catch (error) {
			return false
		}
	}

	email (val) {
		return new RegExp(this.patterns.email).test(val)
	}

	ipV4 (val) {
		return new RegExp(this.patterns.ipV4).test(val) 
	}

	ipV6 (val) {
		return new RegExp(this.patterns.ipV6).test(val) 
	}

	// deg, rad, grad, turn
	angle () {
		return ['deg', 'rad', 'grad', 'turn'].filter(suffix => val.toString().endsWith(suffix) == true).length > 0 ? true : false
	}

	// em, rem, vw, vh, vmin, vmax, ex, ch
	lengthRelative (val) {
		return ['em', 'rem', 'vw', 'vh', 'vmin', 'vmax', 'ex', 'ch'].filter(suffix => val.toString().endsWith(suffix) == true).length > 0 ? true : false
	}

	// px, pt, mm, cm, in, pc
	lengthAbsolute (val) {
		return ['px', 'pt', 'mm', 'cm', 'in', 'pc'].filter(suffix => val.toString().endsWith(suffix) == true).length > 0 ? true : false
	}

	// #000000
	hex (val) {
		return new RegExp(this.patterns.hex).test(val)
	}

	// rgb(0,0,0) > rgb(255,255,255)
	rgb () {

	}

	// rgba(0,0,0,0) > rgba(255,255,255,1)
	rgba () {

	}

	// hsl(0 0% 0%, 0) > hsl(360deg 100% 100% / 1)
	// hue <number> + <angle (deg, rad, grad, turn) or blank>
	// either spaces for values and slash for alpha or all commas
	hsl () {

	}

	hsv () {

	}

	// hex, rgb, rgba, hsl, hsv
	color () {

	}
}