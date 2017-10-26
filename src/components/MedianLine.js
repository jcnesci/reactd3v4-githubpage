// src/components/MedianLine.js
// Uses Swizec's react+D3 full-feature integration approach.
import React, { Component } from 'react';
import * as d3 from 'd3';

class MedianLine extends Component {
	componentWillMount() {
		this.yScale = d3.scaleLinear();

		this.updateD3(this.props);
	}

	componentWillReceiveProps(newProps) {
		this.updateD3(newProps);
	}

	updateD3(props) {
		this.yScale
				.domain([0,
									d3.max(props.data, props.value)])
				.range([0, props.height - props.y - props.bottomMargin]);
	}

	render() {
		const median = this.props.median || d3.median(this.props.data, this.props.value),
					// But how we get the d attribute for the path, that’s interesting. We use a line generator from D3.
					// It comes from the d3-shape55 package and generates splines, or polylines. By default, it takes an array of points and builds a line through all of them. A line from [0, 5] to [width, 5] in our case.
					line = d3.line()([[0, 5],
														[this.props.width, 5]]),
					tickFormat = this.yScale.tickFormat();								//?: what does running tickFormat function do again?

		const translate = `translate(${this.props.x}, ${this.yScale(median)})`,
					medianLabel = `Median household: $${tickFormat(median)}`;

		return (
			<g className="mean" transform={translate}>
				<text x={this.props.width - 5} y="0" textAnchor="end">		{/*?: why does "{this.props.width - 5}" not need backticks? Maybe basic arithmetic is OK in simple {} but calling JS funcs required backticks? */}
					{medianLabel}
				</text>
				<path d={line}></path>
			</g>
		);
	}
}

export default MedianLine;
