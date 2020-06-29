import React from 'react'
import M from 'materialize-css/dist/js/materialize.min.js';
import { Link } from 'react-router-dom';
import '../app.css';
import "materialize-css/dist/css/materialize.min.css";

const Navbar = ({ auth }) => {
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
                        {auth ? <li> <Link to="/Profile">Profile</Link> </li>
                            : <li> <a href="/api/google">Profile</a> </li>}
                        {auth ? <li> <a href="/api/logout">Log out</a> </li>
                            : <li> <a href="/api/Google">Login in</a> </li>}
                        <li> <Link to="/contact">Contact Us</Link> </li>

                    </ul>
                </div>

            </nav>
            <ul id="slide-out" className="sidenav">
                <li className="sidenav-close"> <Link to="/about">About</Link> </li>
                <li className="sidenav-close"> <Link to="/">Home</Link> </li>
                {auth ? <li className="sidenav-close"> <Link to="/Profile">Profile</Link> </li>
                    : <li className="sidenav-close"> <a href="/api/google">Profile</a> </li>}
                {auth ? <li className="sidenav-close"> <a to="/api/logout">Log out</a> </li>
                    : <li className="sidenav-close"> <a to="/api/google">Login in</a> </li>}

                <li className="sidenav-close"> <Link to="/contact">Contact Us</Link> </li>
            </ul>

        </div>
    )
}

export default Navbar
