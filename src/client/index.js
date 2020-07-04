
import ReactDOM from 'react-dom';
import App from './Components/App';
import React from 'react'
import { StateProvider } from './Context/Store';

ReactDOM.render(
    <StateProvider>
        <App />
    </StateProvider>
    , document.getElementById('root'));
