import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter, Link, Switch, Route, useParams } from 'react-router-dom';
import Home from './Components/Home'
import "materialize-css/dist/css/materialize.min.css";
import Uploader from './Components/Uploader';
import Share from './Components/Share';

function BlogPost() {
    let { image } = useParams();
    return <div>Now showing post {image}</div>;
}

ReactDOM.render(
    <BrowserRouter>
        <App />
        <Switch>
            <Route exact path='/' component={Home} />
            <Route path='/uploader' component={Uploader} />
            <Route path="/blog/:image" component={Share} />
        </Switch>

    </BrowserRouter>
    , document.getElementById('root'));
