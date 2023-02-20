class debug {
	constructor (settings = {}) {
		this.settings = {
			...{
				name: 'Debug',
				type: 'log'
			},
			...settings
		}
	}

	run (val, type = this.settings.type) {
		console[type](`${this.settings.name} [${type.charAt(0).toUpperCase() + type.slice(1)}]: ${val}`)
	}

	log (val) {
		console.log(`${this.settings.name} [Log]: ${val}`)
	}

	info (val) {
		console.info(`${this.settings.name} [Info]: ${val}`)
	}

	warn () {
		console.warn(`${this.settings.name} [Warn]: ${val}`)
	}

	error () {
		console.error(`${this.settings.name} [Error]: ${val}`)
	}

	trace () {
		console.trace(`${this.settings.name} [Trace]: ${val}`)
	}
}