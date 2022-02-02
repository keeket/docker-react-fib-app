import React, { Component } from 'react';
import axios from 'axios';      // axios voor het doen van api calls

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: '',
  };

  // lifecycle callback wanneer component wordt gemount (copy paste van methodenaam mouse over)
  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data });
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({
      seenIndexes: seenIndexes.data,
    });
  }

  handleSubmit = async (event) => {
    // met event.preventDefault() wordt standaard gedrag van het formulier voorkomen, de payload wordt niet gesubmit want onchange triggert een state wijziging bij react
    // dit heeft tot gevolg dat render() wordt uitgevoerd en op die manier de laatste details laat zien bij een page refresh
    event.preventDefault();

    await axios.post('/api/values', {
      index: this.state.index,
    });
    this.setState({ index: '' });
  };

  renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(', ');
  }

  renderValues() {
    const entries = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }

    return entries;
  }

  // react roept deze methode aan wanneer state verandert
  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={(event) => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>

        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated Values:</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
