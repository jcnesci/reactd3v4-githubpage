// src/components/Histogram/Histogram.js
import React, { Component } from 'react';
//!: A note about D3 imports: D3v4 is split into multiple packages. We’re using a * import here to get everything because that’s easier to use. You should import specific packages when possible. It leads to smaller compiled code sizes and makes it easier for you and others to see what each file is using.
import * as d3 from 'd3';

import Axis from './Axis';

class Histogram extends Component {
	constructor(props) {
		super();

		// D3 object initialization.
		this.histogram = d3.histogram();
		this.widthScale = d3.scaleLinear();
		this.yScale = d3.scaleLinear();

		this.updateD3(props);
	}
	
	componentWillReceiveProps(newProps) {
		this.updateD3(newProps);
	}
	
	updateD3(props) {
		// We use thresholds to specify how many bins we want and value to specify a value accessor function. We get both from props passed into the Histogram component.
		// In our case, that’s 20 bins, and the value accessor returns each data point’s base_salary.
		this.histogram
					.thresholds(props.bins)
					.value(props.value);

		// Then we call this.histogram on our dataset and use a .map to get an array of bins and count how many values went in each. We need them to configure our scales.
		const bars = this.histogram(props.data),
					counts = bars.map((d) => d.length);

		// console.log("bars", bars);		//?: see if each bar obj really contains all values that go into that bin.

		this.widthScale
				.domain([d3.min(counts), d3.max(counts)])
				.range([0, props.width - props.axisMargin]);

		this.yScale
				.domain([0, d3.max(bars, (d) => d.x1)])				//?: inspect this, to know what d.x1 looks like.
				.range([0, props.height - props.y - props.bottomMargin]);
	}

	// makeBar is a function that takes a histogram bar’s metadata and returns a HistogramBar component. We use it to make the declarative loop more readable.
	makeBar(bar) {
		let percent = bar.length / this.props.data.length * 100;

		let props = {percent: percent,
									x: this.props.axisMargin,
									y: this.yScale(bar.x0),				//?: how does this work?
									width: this.widthScale(bar.length),
									height: this.yScale(bar.x1 - bar.x0),		//BUG: bar height isn't always the same.
									key: "histogram-bar-" + bar.x0};				//!: Setting the key prop is important. React uses it to tell the bars apart and only re-render those that change.

		// console.log("props", props);

		return (
			<HistogramBar {...props} />
		);
	}

	render() {
		const translate = `translate(${this.props.x}, ${this.props.y})`,
					bars = this.histogram(this.props.data);					// We run our histogram generator. Yes, that means we’re running it twice for every update, once in updateD3 and once in render. I tested making it more efficient, and I didn’t see much improvement in overall performance. It did make the code more complex, though.

		return (
			<g className="histogram" transform={translate}>
				<g className="bars">
					{/*This is a great example of React’s declarativeness. We have a bunch of stuff, and all it takes to render is a loop. No worrying about how it renders, where it goes, or anything like that. Walk through data, render, done.*/}
					{bars.map(this.makeBar.bind(this))}
				</g>
				<Axis x={this.props.axisMargin - 3}
							y={0}
							data={bars}
							scale={this.yScale} />
			</g>
		);
	}
}

const HistogramBar = ({ percent, x, y, width, height }) => {
	let translate = `translate(${x}, ${y})`,
			label = percent.toFixed(0)+'%';

	if (percent < 1) {
		label = percent.toFixed(2)+'%';
	}

	if (width < 20) {
		label = label.replace('%', '');
	}

	if (width < 10) {
		label = '';
	}

	return (
		<g transform={translate} className="bar">
			<rect width={width}
						height={height - 2}
						transform="translate(0, 1)">
			</rect>
			<text textAnchor="end"
						x={width - 5}
						y={height / 2 + 3}>
				{label}
			</text>
		</g>
	);
}

export default Histogram;
