import React, { Component } from 'react';
import './App.css';

const phrasesEndpoint = process.env.REACT_APP_SERVER || 'http://192.168.1.8:3000/phrases';
const notReady = process.env.REACT_APP_NOT_READY || 'Hello, World!';
const switchTime = process.env.REACT_APP_SWITCH_TIME || 20000;
const fetchTime = process.env.REACT_APP_FETCH_TIME || 120000;
const minPhraseLenght = 3;

const getPhrases = () => {
  return fetch(phrasesEndpoint,
      {
      method: 'GET',
      headers: buildHeaders()  
      }
    )
    .then(res => res.json())
    .then(o => Object.keys(o).map(k => o[k].text));
}

const postPhrase = (phrase) => {
  return fetch(phrasesEndpoint,
      {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify({
        text: phrase, 
        date: new Date()
      }) 
      }
    )
}

const buildHeaders = () => {
  return new Headers({
  "Content-Type":"application/json"
  })
};

const buildColor = () => {
  return { backgroundColor: `rgba(${buildColorComponent()}, ${buildColorComponent()}, ${buildColorComponent()}, 0.8)`};
}
const buildColorComponent = () => {
  return Math.floor(Math.random() * 255);
}

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      phrases : [],
      current: undefined
    }
    this.fetch()
    .then(() => this.switch());
  }
  fetch = () => {
    return getPhrases()
      .then(p => this.setState({phrases: p}));
  }
  switch = () => {
    this.setState ({ current: Math.round(Math.random() * (this.state.phrases.length-1))});
  }
  componentDidMount = () => {
    this.switchTimer = setInterval( () => this.switch(), switchTime );
    this.fetchTimer = setInterval( () => this.fetch(), fetchTime );
  }
  render = () => {
    return (
      <div className="App" style={buildColor()}>
        <Phrase text={this.state.phrases[this.state.current] ? this.state.phrases[this.state.current] : notReady}/>
        <AddPhrase/>
      </div>
    );
  }
}

class Phrase extends Component {
  render = () => {
    return <div className='phrase'>
      {this.props.text}
      </div>
  }
}

class AddPhrase extends Component {
  constructor(props){
    super(props);
    this.state={
      display: false
    }
  }
  toggleDisplay = () => {
    this.setState(prevState => ({
      display: !prevState.display
    }))
  }
  cancelPhrase = () => {
    this.toggleDisplay();
  }
  submitPhrase = (phrase) => {
    return phrase.length>minPhraseLenght && postPhrase(phrase)
      .then (res => this.toggleDisplay());
    
  }
  render = () => {
    return this.state.display ? 
      <PhraseForm submitHandler={this.submitPhrase} cancelHandler={this.cancelPhrase} /> 
      : <input type="button" value="+" className="plus" onClick={this.toggleDisplay}/>;
  }
}

class PhraseForm extends Component {
  constructor(props){
    super(props);
    this.state={
      text: ''
    }
  }
  render = () => {
    return (
      <form className="phraseForm" onSubmit={(e) => e.preventDefault() & this.props.submitHandler(this.state.text)}>
        <input type="text" minLength="3" autoComplete="off" className="newPhrase" onChange={(e)=>this.setState({text: e.target.value})} autoFocus="true" id="input" tabIndex="1" placeholder="Write your phrase here..."/>
        <input type="button" value="Cancel" className="cancel" onClick={this.props.cancelHandler}  tabIndex="2"/>
      </form>
    )
  }
}

export default App;
