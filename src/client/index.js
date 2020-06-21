import React from 'react';
import ReactDOM from 'react-dom';
import Navbar from './Components/Navbar';
import { BrowserRouter, Link, Switch, Route, useParams } from 'react-router-dom';
import Home from './Components/Home'
import "materialize-css/dist/css/materialize.min.css";
import Profile from './Components/Profile';
import Share from './Components/Share';

function BlogPost() {
    let { image } = useParams();
    return <div>Now showing post {image}</div>;
}

ReactDOM.render(
    <BrowserRouter>
        <Navbar />
        <Switch>
            <Route exact path='/' component={Home} />
            <Route path='/profile' component={Profile} />
            <Route path="/s/:imageId" component={Share} />
        </Switch>

    </BrowserRouter >
    , document.getElementById('root'));
