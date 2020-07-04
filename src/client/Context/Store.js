// store.js
import React, { createContext, useReducer } from 'react';

const initialState = { auth: false };
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'LOGIN':
                let newState = { ...state, auth: true }
                return newState;
            case 'LOGOUT':
                newState = { ...state, auth: false }
                return newState;
            default:
                throw new Error();
        };
    }, initialState);

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider }