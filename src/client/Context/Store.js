// store.js
import React, { createContext, useReducer } from 'react';

const initialState = { auth: false };
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer((state, action) => {
        const { type, payload } = action;
        switch (type) {
            case 'LOGIN':
                let newState = { ...payload, auth: true }
                return newState;
            case 'LOGOUT':
                newState = { auth: false }
                return newState;
            case 'UPDATE':
                let updatedState = { ...payload, auth: true }
                return updatedState;
            default:
                throw new Error();
        };
    }, initialState);

    return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider }