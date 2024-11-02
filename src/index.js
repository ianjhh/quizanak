import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import Verify from './Verify';
import Quiz from './Quiz';
import QuizList from './QuizList';
import Pong from './Pong';
import AboutUs from './AboutUs';
import Stacker from './Stacker';
import GameList from './GameList';
import SnakeGame from './SnakeGame';
import AnimalFacts from './AnimalFacts';
import AnimalFact from './AnimalFact';
import SpaceFacts from './SpaceFacts';
import SpaceFact from './SpaceFact';
import HistoryFacts from './HistoryFacts';
import HistoryFact from './HistoryFact';
import Sitemap from './Sitemap';
import reportWebVitals from './reportWebVitals';
import {Routes, Route, BrowserRouter} from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <BrowserRouter>
        <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/register' element={<Register />} />
              <Route path='/login' element={<Login />} />
              <Route path='/verify' element={<Verify />} />
              <Route path='/quiz' element={<QuizList />} />
              <Route path='/about-us' element={<AboutUs />} />
              <Route path='/sitemap' element={<Sitemap />} />
              <Route path='/games' element={<GameList />} />
              <Route path='/fakta-binatang' element={<AnimalFacts />} />
              <Route path='/fakta-binatang/:fact-title' element={<AnimalFact />} />
              <Route path='/fakta-angkasa' element={<SpaceFacts />} />
              <Route path='/fakta-angkasa/:fact-title' element={<SpaceFact />} />
              <Route path='/fakta-sejarah' element={<HistoryFacts />} />
              <Route path='/fakta-sejarah/:fact-title' element={<HistoryFact />} />
              <Route path='/quiz/:quiz-name' element={<Quiz />} />
              <Route path='/games/pong' element={<Pong />} />
              <Route path='/games/snake' element={<SnakeGame />} />
              <Route path='/games/stacker' element={<Stacker />} />
          </Routes>
      </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
