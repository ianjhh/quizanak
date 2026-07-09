import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import axios from 'axios';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import Verify from './Verify';
import Quiz from './Quiz';
import QuizList from './QuizList';
import AboutUs from './AboutUs';
import AnimalFacts from './AnimalFacts';
import AnimalFact from './AnimalFact';
import SpaceFacts from './SpaceFacts';
import SpaceFact from './SpaceFact';
import HistoryFacts from './HistoryFacts';
import HistoryFact from './HistoryFact';
import Sitemap from './Sitemap';
import reportWebVitals from './reportWebVitals';
import {Routes, Route, HashRouter} from 'react-router-dom';

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000; // 10 second timeout to prevent infinite spinners on database hangs

// Intercept network/CORS errors to prevent TypeError crashes in catch blocks
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.response = {
        status: 503,
        data: 'Koneksi ke server gagal. Silakan coba beberapa saat lagi.'
      };
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <HashRouter>
        <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/register' element={<Register />} />
              <Route path='/login' element={<Login />} />
              <Route path='/verify' element={<Verify />} />
              <Route path='/quiz' element={<QuizList />} />
              <Route path='/about-us' element={<AboutUs />} />
              <Route path='/sitemap' element={<Sitemap />} />
              <Route path='/fakta-binatang' element={<AnimalFacts />} />
              <Route path='/fakta-binatang/:fact-title' element={<AnimalFact />} />
              <Route path='/fakta-angkasa' element={<SpaceFacts />} />
              <Route path='/fakta-angkasa/:fact-title' element={<SpaceFact />} />
              <Route path='/fakta-aneh' element={<HistoryFacts />} />
              <Route path='/fakta-aneh/:fact-title' element={<HistoryFact />} />
              <Route path='/quiz/:quiz-name' element={<Quiz />} />
          </Routes>
      </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
