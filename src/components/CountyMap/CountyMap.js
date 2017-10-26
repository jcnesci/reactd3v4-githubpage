// src/components/CountyMap/CountyMap.js
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import _ from 'lodash';

import County from './County';

class CountyMap extends Component {
	constructor(props) {
		super(props);
		// Items needed to build a choropleth map.
		this.projection = d3.geoAlbersUsa().scale(1280);
		this.geoPath = d3.geoPath().projection(this.projection);
		this.quantize = d3.scaleQuantize().range(d3.range(9));
		// 
		this.updateD3(props);
	}
	componentWillReceiveProps(newProps) {
		this.updateD3(newProps);
	}
	updateD3(props) {
		// It translates (moves) the projection to the center of our drawing area and sets a scale property. The value was discovered experimentally and is different for every projection.
		this.projection
				.translate([props.width / 2, props.height / 2])
				.scale(props.width * 1.3);
		
		// If zoom is defined, do stuff.
		if (props.zoom && props.usTopoJson) {
			// We get the list of all US state features in our geo data, find the one we’re zoom-ing on, and use the geoPath.centroid method to calculate its center point. This gives us a new coordinate to translate our projection onto.
			const us = props.usTopoJson,
						statePaths = topojson.feature(us, us.objects.states).features,
						id = _.find(props.USstateNames, {code: props.zoom}).id;
			this.projection.scale(props.width * 4.5);
			const centroid = this.geoPath.centroid(_.find(statePaths, {id: id})),
						translate = this.projection.translate();
			// The calculation in .translate() helps us align the center point of our zoom US state with the center of the drawing area.
			this.projection.translate([
				translate[0] - centroid[0] + props.width / 2,				//?: how does this work exactly?
				translate[1] - centroid[1] + props.height / 2
			]);
		}

		if (props.values) {
			// we update the quantize scale’s domain with new values. Using d3.quantile lets us offset the scale to produce a more interesting map. The values were discovered experimentally - they cut off the top and bottom of the range because there isn’t much there. This brings higher contrast to the richer middle of the range.
			this.quantize.domain([
				d3.quantile(props.values, 0.15, d => d.value),			//?: how does this work exactly?
				d3.quantile(props.values, 0.85, d => d.value)
			]);
		}
	}
	render() {
		if (!this.props.usTopoJson) {
			return null;
		} else {
			const us = this.props.usTopoJson,
						// calculates a mesh for US states - a thin line around the edges.
						statesMesh = topojson.mesh(us, us.objects.states,
																			(a, b) => a !== b),						//?: how does this work exactly?
						// .feature calculates the features for each county - fill in with color.
						counties = topojson.feature(us, us.objects.counties).features;

			const countyValueMap = _.fromPairs(
				this.props.values.map(d => [d.countyID, d.value])			//?: how does this work exactly?
			);

			return (
				<g transform={`translate(${this.props.x}, ${this.props.y})`}>
					{/* loop through the list of counties and render County components. Each gets a bunch of attributes and will return a <path> element that looks like a specific county. */}
					{counties.map((feature) => (
						<County geoPath={this.geoPath}
										feature={feature}
										zoom={this.props.zoom}
										key={feature.id}
										quantize={this.quantize}
										value={countyValueMap[feature.id]} />
					))}
					{/* For the US state borders, we use a single <path> element and use this.geoPath to generate the d property. */}
					<path d={this.geoPath(statesMesh)}
								style={{fill: 'none',
												stroke: '#fff',
												strokeLineJoin: 'round'}} />
				</g>
			);
		}
	}
}

export default CountyMap;