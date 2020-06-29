import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './Components/Home'
import "materialize-css/dist/css/materialize.min.css";
import Profile from './Components/Profile';
import Share from './Components/Share';

ReactDOM.render(
    <BrowserRouter>
        <Switch>
            <Route exact path='/' component={Home} />
            <Route path='/profile' component={Profile} />
            <Route path="/s/:imageId" component={Share} />
        </Switch>

    </BrowserRouter >
    , document.getElementById('root'));
