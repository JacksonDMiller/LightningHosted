import React, { Component } from 'react';
import './app.css';
import Navbar from './Components/Navbar';
import Home from './Components/Home'
import "materialize-css/dist/css/materialize.min.css";
import { Switch, Route } from 'react-router-dom'
import Uploader from './Components/Uploader';

export default class App extends Component {

  render() {

    return (

      <div>
        <Navbar />
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/Uploader' component={Uploader} />
        </Switch>

      </div >
    );
  }
}
