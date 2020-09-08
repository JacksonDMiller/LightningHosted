import React, { Component } from "react";
import { ServerRouter, Switch, Route } from "react-router-dom";
import Home from "./Home";
// import "materialize-css/dist/css/materialize.min.css";
import Profile from "./Profile";
import Share from "./Share";
import Navbar from "./Navbar";
import About from "./About";
import ContactUs from "./ContactUs";
import Login from "./Login";


export default class App extends Component {
  hydrate() {
    return (
      <ServerRouter>
        <Navbar></Navbar>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/profile" component={Profile} />
          <Route path="/s/:imageId" component={Share} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={ContactUs} />
        </Switch>
      </ServerRouter>
    );
  }
}
