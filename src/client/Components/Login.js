import React, { useState, useContext, useEffect } from 'react';
import { store } from '../Context/Store';
import googlebtn from '../../assets/googlebtn.png'

export default function Login() {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')

    const globalState = useContext(store);
    const { dispatch } = globalState;

    useEffect(() => {
        const el = document.querySelectorAll('.tabs');
        var instance = M.Tabs.init(el,);
    }, [])


    const submitCredentials = async (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email,
            })
        };
        let res = await (await fetch('/api/register/', requestOptions)).json();
        if (res.error) {
            M.toast({ html: res.error })
        }
        else {
            dispatch({ type: 'LOGIN', payload: res.user })
            alert('yay')
        }
    }

    const submitCredentialsLogin = async (e) => {
        e.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                password: password,
            })
        };


        let res = await fetch('/api/loginsubmit', requestOptions)
        if (res.status === 401) {
            M.toast({ html: 'Incorect Username or Password Please Try Again' })
        }
        else {
            let data = await res.json()
            dispatch({ type: 'LOGIN', payload: data.user })
            alert('yay')
        }
    }

    return (


        <div className="row">

            <div className="col s12">
                <ul className="tabs">
                    <li className="tab col s3"><a className="active" href="#login">Log in</a></li>
                    <li className="tab col s3"><a href="#signup">Sign Up</a></li>
                </ul>
            </div>
            <div id="login" className="col s12">
                <a href='/api/google'><img src={googlebtn} alt="" /></a>
                <form className="col s12">
                    <div className="row">
                        <div className="input-field col s12">
                            <input onChange={e => setUsername(e.target.value)}
                                id="username-login" className="validate" type="text" />
                            <label htmlFor="username-login">Username</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="input-field col s12">
                            <input onChange={e => setPassword(e.target.value)}
                                id="password-login" type="password" className="validate" />
                            <label htmlFor="password-login">Password</label>
                        </div>
                    </div>
                    <button className='btn' onClick={submitCredentialsLogin}>Login</button>
                </form>

            </div>
            <div id="signup" className="col s12">


                <form className="col s12">
                    <div className="row">
                        <div className="input-field col s12">
                            <input onChange={e => setEmail(e.target.value)}
                                id="email" type="email" className="validate" />
                            <label htmlFor="email">Email</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="input-field col s12">
                            <input onChange={e => setUsername(e.target.value)}
                                id="username-signup" className="validate" type="text" />
                            <label htmlFor="username-signup">Username</label>
                        </div>
                    </div>

                    <div className="row">
                        <div className="input-field col s12">
                            <input onChange={e => setPassword(e.target.value)}
                                id="password-signup" type="password" className="validate" />
                            <label htmlFor="password-signup">Password</label>
                        </div>
                    </div>
                    <button className='btn' onClick={submitCredentials}>Submit</button>
                </form>

            </div>
        </div>


    )
}
