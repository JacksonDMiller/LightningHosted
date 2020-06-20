import React from 'react'
import M from 'materialize-css/dist/js/materialize.min.js';
import { BrowserRouter, Link } from 'react-router-dom';
import '../app.css';
import "materialize-css/dist/css/materialize.min.css";

const Navbar = () => {
    document.addEventListener('DOMContentLoaded', function () {
        var elems = document.querySelectorAll('.sidenav');
        var instances = M.Sidenav.init(elems, { closeOnClick: true });
    });

    return (
        <div>
            <nav>
                <div className="nav-wrapper">
                    <Link to="/" className="brand-logo">LightningHosted</Link>
                    <a href="#!" data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li> <Link to="/about">About</Link> </li>
                        <li> <Link to="/">Home</Link> </li>
                        <li> <Link to="/Uploader">Uploader</Link> </li>
                    </ul>
                </div>

            </nav>
            <ul id="slide-out" className="sidenav">
                <li className="sidenav-close"> <Link to="/about">About</Link> </li>
                <li className="sidenav-close"> <Link to="/">Home</Link> </li>
                <li className="sidenav-close"> <Link to="/Uploader">Uploader</Link> </li>
            </ul>

        </div>
    )
}

export default Navbar
