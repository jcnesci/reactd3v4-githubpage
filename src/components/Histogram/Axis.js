// src/component/Histogram/Axis.js
import * as d3 from 'd3';
import D3blackbox from '../D3blackbox';

const Axis = D3blackbox(function() {
	const axis = d3.axisLeft()
									.tickFormat(d => `${d3.format(".2s")(d)}`)			//?: why does this need to use ES6 string templating?
									.scale(this.props.scale)
									.ticks(this.props.data.length);

	d3.select(this.refs.anchor)
		.call(axis);
});

export default Axis;
