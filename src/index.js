import React from "react"
import ReactDOM from 'react-dom/client';
import App from "./App"
import * as serviceWorker from "./serviceWorker"
import { BrowserRouter } from "react-router-dom"
import "./i18n"
import { Provider } from "react-redux"

import store from "./store"

if (process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Support for defaultProps will be removed from function components')) {
      return;
    }
    originalError(...args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
      <>
      <BrowserRouter basename={process.env.PUBLIC_URL} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
  </>
    </Provider>
);

serviceWorker.unregister()
