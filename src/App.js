// src/App.js
import React, { Component } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';

import './App.css';             // we can import CSS in JavaScript thanks to webpack via create-react-app.

import Preloader from './components/Preloader';
import { loadAllData } from './DataHandling';     // Importing with {} is how we import named exports, which lets us get multiple things from the same file.

import CountyMap from './components/CountyMap';
import Histogram from './components/Histogram';
import { Title, Description, GraphDescription } from './components/Meta';
import MedianLine from './components/MedianLine';

import Controls from './components/Controls';

class App extends Component {
  state = {
    techSalaries: [],
    countyNames: [],
    medianIncomes: [],
    salariesFilter: () => true,       // default salariesFilter function
    filteredBy: {
      USstate: '*',
      year: '*',
      jobTitle: '*'
    }
  }

  // Takes a county entry and a map of tech salaries, and it returns the delta between median household income and a single tech salary.
  countyValue(county, techSalariesMap) {
    const medianHousehold = this.state.medianIncomes[county.id],
          salaries = techSalariesMap[county.name];

    if (!medianHousehold || !salaries) {
      return null;
    }

    const median = d3.median(salaries, d => d.base_salary);

    return {
      countyID: county.id,
      value: median - medianHousehold.medianIncome
    };
  }

  componentWillMount() {
    loadAllData(data => this.setState(data));
  }

  // We’ll use this as a callback in Controls.
  updateDataFilter(filter, filteredBy) {
    // setState() triggers a re-render in App.
    this.setState({
      salariesFilter: filter,
      filteredBy: filteredBy
    });
  }

  /*
  We take current salaries and filters from state and compare them with future state, nextState. 
  To guess changes in the salary data, we compare lengths, and to see changes in filters, 
  we compare values for each key.
  This comparison works well enough and makes the visualization faster by avoiding unnecessary re-renders.
  */
  shouldComponentUpdate(nextProps, nextState) {
    const { techSalaries, filteredBy } = this.state;

    const changedSalaries = 
      (techSalaries && techSalaries.length)
        !== (nextState.techSalaries && nextState.techSalaries.length);

    const changedFilters = Object.keys(filteredBy)
                                  .some(
                                    k => filteredBy[k]
                                    !== nextState.filteredBy[k]
                                  );

    return changedSalaries || changedFilters;
  }

  render() {
    if (this.state.techSalaries.length < 1) {
      return (
        <Preloader />
      );
    }

    // Create list of county values (ie. the delta between median household income and tech salaries in said county).
    const filteredSalaries = this.state.techSalaries
                                        .filter(this.state.salariesFilter),
          filteredSalariesMap = _.groupBy(filteredSalaries, 'countyID'),
          countyValues = this.state.countyNames.map(county => this.countyValue(county, filteredSalariesMap))
                                                .filter(d => !_.isNull(d));

    let zoom = null,
        // Comes from loadAllData(), groups our salary data by US state.
        medianHousehold = this.state.medianIncomesByUSState['US'][0]
                              .medianIncome;        //?: log this, whats it look like?
    if (this.state.filteredBy.USstate !== '*') {
      zoom = this.state.filteredBy.USstate;
      medianHousehold = d3.mean(this.state.medianIncomesByUSState[zoom],    //!: is each item under 'medianIncomesByUSState[zoom]' is a county with its own medianIncome.
                                d => d.medianIncome);
      console.log('1', this.state.medianIncomesByUSState[zoom])
    }

    return (
      <div className="App container">
        <Title  data={filteredSalaries}
                filteredBy={this.state.filteredBy} />
        <Description  data={filteredSalaries}
                      allData={this.state.techSalaries}
                      medianIncomesByCounty={this.state.medianIncomesByCounty}    //BUG: does 'medianIncomesByCounty' really exist?
                      filteredBy={this.state.filteredBy} />
        <GraphDescription data={filteredSalaries}
                          filteredBy={this.state.filteredBy} />
        <svg width="1100" height="500">
          <CountyMap  usTopoJson={this.state.usTopoJson}
                      USstateNames={this.state.USstateNames}
                      values={countyValues}
                      x={0}
                      y={0}
                      width={500}
                      height={500}
                      zoom={zoom} />
          <rect x={500} y={0}                   //?: this is weird, a white bg rect to hide map going under hitogram. Can't we just set the width & height of the map <g> to restrict its size?
                width={600}
                height={500}
                style={{fill: 'white'}} />
          <Histogram  bins={10}
                      width={500}
                      height={500}
                      x="500"
                      y="10"
                      data={filteredSalaries}
                      axisMargin={83}
                      bottomMargin={5}
                      value={d => d.base_salary} />
          <MedianLine data={filteredSalaries}
                      x={500}
                      y={10}
                      width={600}
                      height={500}
                      bottomMargin={5}
                      median={medianHousehold}
                      value={d => d.base_salary} />
        </svg>
        <Controls data={this.state.techSalaries}
                  updateDataFilter={this.updateDataFilter.bind(this)} />    {/*?: why is bind() nec again?  */}
      </div>
    );
  }
}

export default App;
