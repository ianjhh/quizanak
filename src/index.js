import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import { configureApi } from './api';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import Verify from './Verify';
import Quiz from './Quiz';
import QuizList from './QuizList';
import AboutUs from './AboutUs';
import FactList from './FactList';
import FactArticle from './FactArticle';
import { FACT_CATEGORIES } from './factCategories';
import Sitemap from './Sitemap';
import reportWebVitals from './reportWebVitals';
import {Routes, Route, HashRouter} from 'react-router-dom';

configureApi();

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
              {/* keys make React start fresh when switching between categories */}
              {FACT_CATEGORIES.map((category) => [
                  <Route key={category.key} path={category.path} element={<FactList key={category.key} category={category} />} />,
                  <Route key={`${category.key}-article`} path={`${category.path}/:fact-title`} element={<FactArticle key={category.key} category={category} />} />,
              ])}
              <Route path='/quiz/:quiz-name' element={<Quiz />} />
          </Routes>
      </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
