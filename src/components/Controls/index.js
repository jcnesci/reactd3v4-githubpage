// src/components/Controls/index.js
import React, { Component } from 'react';
import _ from 'lodash';

import ControlRow from './ControlRow';

class Controls extends Component {
	state = {
		yearFilter: () => true,
		year: '*',
		jobTitleFilter: () => true,
		jobTitle: '*',
		USstateFilter: () => true,
		USstate: '*'
	}

	updateYearFilter(year, reset) {
		// The App component will use this filter func inside a .filter call, so we have to return true for elements we want to keep and false for elements we don’t. Comparing submit_date.getFullYear() with year achieves that.
		let filter = (d) => d.submit_date.getFullYear() === year;

		// If reset is T or year is F or zero, reset the filter and year to be everything.
		// reset filters back to defaults, which allows users to unselect an option.
		if (reset || !year) {
			filter = () => true;
			year = '*';
		}

		// When we have the year and filter, we update component state with this.setState. 
		// This triggers a re-render and calls the componentDidUpdate method, which calls reportUpdateUpTheChain.
		this.setState({
			yearFilter: filter,
			year: year
		});
	}

	// Same as above.
	updateJobTitleFilter(title, reset) {
		let filter = (d) => d.clean_job_title === title;

		if (reset || !title) {
			filter = () => true;
			title = '*';
		}

		this.setState({
			jobTitleFilter: filter,
			jobTitle: title
		});
	}

	// Same as above.
	updateUSstateFilter(USstate, reset) {
		let filter = (d) => d.USstate === USstate;

		if (reset || !USstate) {
			filter = () => true;
			USstate = '*';
		}

		this.setState({
			USstateFilter: filter,
			USstate: USstate
		});
	}

	/*
	We use the componentDidMount lifecycle hook to read the URL when our component first renders on the page. Presumably when the page loads, but it could be later. It doesn’t really matter when, just that we update our filter the first chance we get.
	window.location.hash gives us the hash part of the URL and we clean it up and split it into three parts: year, USstate, and jobTitle. If the URL is localhost:3000/#2013-CA-manager, then year becomes 2013, USstate becomes CA, and jobTitle becomes manager.
	We make sure each value is valid and use our existing filter update callbacks to update the visualization. Just like it was the user clicking a button.
	*/
	componentDidMount() {
		let [ year, USstate, jobTitle ] = window.location
																						.hash
																						.replace('#', '')
																						.split('-');

		if (year !== '*' && year) {
			this.updateYearFilter(Number(year));
		}
		if (USstate !== '*' && USstate) {
			this.updateUSstateFilter(USstate);
		}
		if (jobTitle !== '*' && jobTitle) {
			this.updateJobTitleFilter(jobTitle);
		}
	}

	componentDidUpdate() {
		/*
		In componentDidUpdate, we now update the URL hash as well as call reportUpdateUpTheChain. Updating the hash just takes assigning a new value to window.location.hash.
		*/
		window.location.hash = [this.state.year || '*',
														this.state.USstate || '*',
														this.state.jobTitle || '*'].join("-");

		this.reportUpdateUpTheChain();
	}

	// Yes, we could have put everything in reportUpdateUpTheChain into componentDidUpdate. It’s separate because the name is more descriptive that way. I was experimenting with some optimizations that didn’t pan out, but I decided to keep the name.
	reportUpdateUpTheChain() {
		// updateDataFilter() in App.js needs a new filter method and a filteredBy dictionary.
		this.props.updateDataFilter(
			// The code looks tricky because we’re playing with higher order functions. 
			// We’re making a new arrow function that takes a dictionary of filters as an argument and returns a new function that &&s them all. 
			// We invoke it immediately with this.state as the argument.
			((filters) => {
				return (d) => filters.yearFilter(d)
											&& filters.jobTitleFilter(d)
											&& filters.USstateFilter(d);
			})(this.state),
			{
				year: this.state.year,
				jobTitle: this.state.jobTitle,
				USstate: this.state.USstate
			}
		);
	}

	// Now, because we used this.setState to trigger a callback up component stack, and because that callback triggers a re-render in App, 
	// which might trigger a re-render down here... because of that, we need shouldComponentUpdate. 
	// It prevents infinite loops. React isn’t smart enough on its own because we’re using complex objects in state.
	shouldComponentUpdate(nextProps, nextState) {
		// We use _.isEqual() because JavaScript’s equality check compares objects on the reference level. So {a: 1} == {a: 1} returns false because the operands are different objects even though they look the same.
		return !_.isEqual(this.state, nextState);
	}

	render() {
		const data = this.props.data;

		const years = new Set(data.map(d => d.submit_date.getFullYear())),
					jobTitles = new Set(data.map(d => d.clean_job_title)),
					USstates = new Set(data.map(d => d.USstate));

		return (
			<div>
				{/* Row for Year filter. */}
				{/* We build a Set of years in our dataset, then render a ControlRow using props to give it our data, 
				a set of toggleNames, a callback to update the filter, and which entry is picked right now. 
				This enables us to maintain the data-flows-down, events-bubble-up architecture we’ve been using. */}
				{/* If you don’t know about Sets, they’re new ES6 data structures that ensure every entry is unique. Just like a mathematical set. They’re supposed to be pretty fast. */}
				<ControlRow data={data}
										toggleNames={Array.from(years.values())}		//!: Awesome!
										picked={this.state.year}
										updateDataFilter={this.updateYearFilter.bind(this)} />

				<ControlRow data={data}
										toggleNames={Array.from(jobTitles.values())}
										picked={this.state.jobTitle}
										updateDataFilter={this.updateJobTitleFilter.bind(this)} />
				
				<ControlRow data={data}
										toggleNames={Array.from(USstates.values())}
										picked={this.state.USstate}
										updateDataFilter={this.updateUSstateFilter.bind(this)}
										capitalize="true" />
			</div>
		);
	}
}

export default Controls;
