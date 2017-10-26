// src/components/Controls/Toggle.js
import React, { Component } from 'react';

class Toggle extends Component {
	
	/*
	handleClick calls the onClick callback given in props, 
	using the name and !value to identify this button and toggle its value.
	*/
	handleClick(event) {
		this.props.onClick(this.props.name, !this.props.value);
	}

	render() {
		let className = "btn btn-default";

		if (this.props.value) {
			className += " btn-primary";
		}

		return (
			<button className={className} onClick={this.handleClick.bind(this)}>
				{this.props.label}
			</button>
		);
	}
}

export default Toggle;
