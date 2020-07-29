import React, { useContext, useEffect } from 'react';
import M from 'materialize-css/dist/js/materialize.min.js';
import { Link } from 'react-router-dom';
import '../app.css';
import "materialize-css/dist/css/materialize.min.css";
import { store } from '../Context/Store';



const Navbar = () => {
    const globalState = useContext(store);
    const { dispatch } = globalState;
    document.addEventListener('DOMContentLoaded', function () {
        var elems = document.querySelectorAll('.sidenav');
        var instances = M.Sidenav.init(elems, { closeOnClick: true });
    });

    const isLoggedIn = async () => {
        const res = await fetch('/api/checkifauthorized/');
        let user = await res.json()
        if (user !== false) {
            dispatch({ type: 'LOGIN', payload: user })
        }
    };

    useEffect(() => {
        if (globalState.state.auth === false) {
            isLoggedIn();
        }

    }, [])


    const user = globalState.state
    return (
        <div>
            <div className="navbar-fixed">
                <nav>
                    <div className="nav-wrapper">
                        <Link to="/" className="brand-logo">LightningHosted</Link>
                        <a href="#!" data-target="slide-out" className="sidenav-trigger"><i className="material-icons">menu</i></a>
                        <ul id="nav-mobile" className="right hide-on-med-and-down">
                            <li> <Link to="/about">About</Link> </li>
                            <li> <Link to="/">Home</Link> </li>
                            {user.auth ? <li> <Link to="/Profile">Profile</Link> </li>
                                : <li> <a href="/login">Profile</a> </li>}
                            {user.auth ? <li> <a href="/api/logout">Log out</a> </li>
                                : <li> <Link to="/login">Login in</Link> </li>}
                            <li> <Link to="/contact">Contact Us</Link> </li>

                        </ul>
                    </div>

                </nav>
            </div>
            <ul id="slide-out" className="sidenav">
                <li className="sidenav-close"> <Link to="/about">About</Link> </li>
                <li className="sidenav-close"> <Link to="/">Home</Link> </li>
                {user.auth ? <li className="sidenav-close"> <Link to="/Profile">Profile</Link> </li>
                    : <li className="sidenav-close"> <a href="/login">Profile</a> </li>}
                {user.auth ? <li className="sidenav-close"> <a href="/api/logout">Log out</a> </li>
                    : <li className="sidenav-close"> <Link to="/login">Login in</Link> </li>}

                <li className="sidenav-close"> <Link to="/contact">Contact Us</Link> </li>
            </ul>

        </div>
    )
}

export default Navbar
