// store.js
import React, { createContext, useReducer } from "react";

const initialState = { auth: false, pageNumber: 0 };
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    const { type, payload } = action;
    switch (type) {
      case "LOGIN":
        let newState = { ...payload, auth: true, pageNumber: state.pageNumber };
        return newState;
      case "LOGOUT":
        newState = { auth: false };
        return newState;
      case "UPDATE":
        let updatedState = {
          ...payload,
          auth: true,
          pageNumber: state.pageNumber,
        };
      case "INCREMENTPAGE":
        let incrementedState = {
          ...state,
          pageNumber: state.pageNumber + 1,
        };
        return incrementedState;
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
