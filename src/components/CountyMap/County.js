// src/components/CountyMap/County.js
import React, { Component } from 'react';
import _ from 'lodash';

const ChoroplethColors = _.reverse([
	'rgb(247,251,255)',
	'rgb(222,235,247)',
	'rgb(198,219,239)',
	'rgb(158,202,225)',
	'rgb(107,174,214)',
	'rgb(66,146,198)',
	'rgb(33,113,181)',
	'rgb(8,81,156)',
	'rgb(8,48,107)'
]);

const BlankColor = 'rgb(240, 240, 240)';
class County extends Component {
	// Returns T or F.
	/*
	shouldComponentUpdate is more interesting. It’s a React lifecycle method that lets us specify which prop changes are relevant to our component re-rendering.
	CountyMap passes complex props - quantize, geoPath, and feature - which are pass-by-reference instead of pass-by-value. That means React can’t see when they produce different values, just when they are different instances.
	This can lead to all 3,220 counties re-rendering every time a user does anything. But they only have to re-render if we change the map zoom or if the county gets a new value.
	Using shouldComponentUpdate like this we can go from 3,220 DOM updates to the order of a few hundred. Big improvement in speed.
	*/
	shouldComponentUpdate(nextProps, nextState) {
		// ES6 object destructuring: pulls properties 'zoom' and 'value' from 'this.props' and creates variables with same names.
		const { zoom, value } = this.props;

		// Update if 1 of the 2 values in this.props is not equal to its homologue in nextProps.
		return zoom !== nextProps.zoom || value !== nextProps.value;
	}

	render() {
		const { value, geoPath, feature, quantize } = this.props;

		let color = BlankColor;

		if (value) {
			color = ChoroplethColors[quantize(value)];
		}

		return (
			//?: what is the result of 'geoPath(feature)' ?
			<path d={geoPath(feature)}
						style={{fill: color}}
						title={feature.id} />
		);
	}
}

export default County;
