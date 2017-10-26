// src/components/Meta/Title.js
import React, { Component } from 'react';
import { scaleLinear } from 'd3-scale';
import { mean as d3mean, extent as d3extent } from 'd3-array';

import USStatesMap from './USStatesMap';

class Title extends Component {
	get yearsFragment() {
		const year = this.props.filteredBy.year;

		return year === '*' ? "" : `in ${year}`;
	}

	get USstateFragment() {
		const USstate = this.props.filteredBy.USstate;

		return USstate === '*' ? "" : USStatesMap[USstate.toUpperCase()];
	}

	get jobTitleFragment() {
		const { jobTitle, year } = this.props.filteredBy;
		let title = "";

		if (jobTitle === '*') {
			if (year === '*') {
				title = "The average H1B in tech pays";
			} else {
				title = "The average tech H1B paid";
			}
		} else {
			if (jobTitle === '*') {
				title = "H1Bs in tech pay";
			} else {
				title = `Software ${jobTitle}s on an H1B`;

				if (year === '*') {
					title += " make";
				} else {
					title += " made";
				}
			}
		}

		return title;
	}

	// We rely on D3’s built-in number formatters to build format. Linear scales have the one that turns 10000 into 10,000. Tick formatters don’t work well without a domain, so we define it. We don’t need a range because we never use the scale itself.
	// format returns a function, which makes it a higher order function. Being a getter makes it really nice to use: this.format(). Looks just like a normal function call.
	get format() {
		return scaleLinear()
						.domain(d3extent(this.props.data, d => d.base_salary))
						.tickFormat();
	}

	render() {
		const mean = this.format(d3mean(this.props.data, d => d.base_salary));	//!: very interesting how format() is used here, as a higher-order function.

		let title;

		if (this.yearsFragment && this.USstateFragment) {			//!: I didn't know "" was equivalent to False, interesting.
			title = (
				<h2>
					In {this.USstateFragment}, {this.jobTitleFragment} ${mean}/year {this.yearsFragment}
				</h2>
			);
		} else {
			title = (
				<h2>
					{/* 
					Many weird things happening here:
					- why does this.jobTitleFragment only need {} but mean needs ${}?
					- what is stateFragment? its not defined anywhere...
					- are string templates (``) only used inside {} because that's where JS is written? Confused...
					*/}
					{this.jobTitleFragment} ${mean}/year {this.USstateFragment ? `in ${this.stateFragment}` : ''} {this.yearsFragment}
				</h2>
			);
		}

		return title;
	}
}

export default Title;
