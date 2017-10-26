// src/components/Controls/ControlRow.js
import React, { Component } from 'react';
import _ from 'lodash';

import Toggle from './Toggle';

class ControlRow extends Component {
	/*
	React triggers the componentWillMount lifecycle hook right before it first renders our component.
	Mounts it into the DOM, if you will. This is a opportunity for any last minute state setup.
	We take the list of toggleNames from props and use Lodash’s zipObject function to create a dictionary that we save in state. Keys are toggle names, and values are booleans that tell us whether a particular toggle is currently picked.
	You might think this is unnecessary, but it makes our app faster. Instead of running the comparison function for each toggle on every render, we build the dictionary, then perform quick lookups when rendering. Yes, === is a fast operator even with the overhead of a function call, but what if it was more complex?
	Using appropriate data structures is a good habit. :smile:
	*/
	componentWillMount() {
		let toggles = this.props.toggleNames,
				toggleValues = _.zipObject(
					toggles, 
					toggles.map((name) => name === this.props.picked)
				);

		this.setState({
			toggleValues: toggleValues
		});
	}

	/*
	In componentWillReceiveProps, we check if the picked value has changed, and if it has, we call makePick to mimic user action. 
	This allows global app state to override local component state. 
	It’s what you’d expect in a unidirectional data flow architecture like the one we’re using.
	*/
	//?: ^ about global app state VS local
	componentWillReceiveProps(nextProps) {
		if (this.props.picked !== nextProps.picked) {
			this.makePick(nextProps.picked, true);
		}
	}

	/*
	makePick changes state.toggleValues when the user clicks a toggle. 
	It takes two arguments: a toggle name and the new value.
	*/
	makePick(picked, newState) {
		let toggleValues = this.state.toggleValues;

		/*
		We use Lodash’s mapValues to iterate the name: boolean dictionary and construct a new one with updated values. 
		Everything that isn’t picked gets set to false, and the one picked item becomes true if newState is true.
		*/
		/*
		You’re right if you think this is unnecessary. We could have just changed the current picked element to 
		false and the new one to true. But I’m not entirely certain React would pick up on that. 
		Play around and test it out :)
		*/
		toggleValues = _.mapValues(
			toggleValues,
			(value, key) => newState && key == picked			// es-lint-disable-line
		);

		// If newState is F, we want to reset.
		/*
		Next, we have a case of a misleading comment. 
		We’re calling props.updateDataFilter to com- municate filter changes up the chain. 
		The comment is talking about !newState and why it’s not newState. → because the 2nd argument in 
		updateDataFilter is called reset. We’re only resetting filters if newState is false since that means a 
		toggle was unclicked without a new one being selected.
		Does that make sense? It’s hard to explain without waving my arms around.
		*/
		this.props.updateDataFilter(picked, !newState);

		/*
		With this.setState, we update state and trigger a re-render, which highlights a new button as being selected.
		*/
		this.setState({
			toggleValues: toggleValues
		});
	}

	/*
	_addToggle renders a Toggle component with a label, name, value and onClick callback. 
	The label is just a prettier version of the name, which also serves as a key in our toggleValues dictionary. 
	It’s going to be the picked attribute in makePick.
	*/
	_addToggle(name) {
		let key = `toggle-${name}`,
				label = name;

		if (this.props.capitalize) {
			label = label.toUpperCase();
		}

		return (
			<Toggle label={label}
							name={name}
							key={key}
							value={this.state.toggleValues[name]}
							onClick={this.makePick.bind(this)} />
		);
	}

	render() {
		return (
			<div className="row">
				<div className="col-md-12">
					{this.props.toggleNames
											.map(name => this._addToggle(name))}
				</div>
			</div>
		);
	}
}

export default ControlRow;
