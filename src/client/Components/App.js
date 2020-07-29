import React, { Component } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './Home'
import "materialize-css/dist/css/materialize.min.css";
import Profile from './Profile';
import Share from './Share';
import Navbar from './Navbar';
import About from './About';
import ContactUs from './ContactUs'
import Login from './Login'
export default class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Navbar></Navbar>
                <Switch>
                    <Route path='/login' component={Login} />
                    <Route exact path='/' component={Home} />
                    <Route path='/profile' component={Profile} />
                    <Route path="/s/:imageId" component={Share} />
                    <Route path="/about" component={About} />
                    <Route path="/contact" component={ContactUs} />
                </Switch>
            </BrowserRouter >
        )
    }
}



