class math {
	constructor () {

	}

	degToRad (val) {
		return val * Math.PI / 180
	}

	radToDeg (val) {
		return val * 180 / Math.PI
	}

	degToGrad (val) {
		return val * 200 / 180
	}

	gradToDeg (val) {
		return val * 180 / 200
	}

	celsiusToFahrenheit (val) {
		return val * 9 / 5 + 32
	}

	fahrenheitToCelsius (val) {
		return (val - 32) * 5 / 9
	}
}