import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.scss';
import "react-datepicker/dist/react-datepicker.css";
import './i18n';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from "react-router-dom";
import { Provider } from 'react-redux'
import store from './store/index'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>

);


reportWebVitals();
