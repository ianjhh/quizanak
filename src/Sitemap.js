import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Modal, Button, Card, Col, Form } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import LoadingNav from './LoadingNav';

function Sitemap(){
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [animalQuiz, setAnimalQuiz] = useState([]);
    const [mathQuiz, setMathQuiz] = useState([]);
    const [miscellaneousQuiz, setMiscellaneousQuiz] = useState([]);
    const [languageQuiz, setLanguageQuiz] = useState([]);
    const navigate = useNavigate();

    const verifyToken = () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.data.verified === true){
                setIsLoggedIn(true)
            }
            else{
                navigate('/verify')
            }
        })
        .catch(function (error) {
            console.log(error.response.status)
        });
}

    const fetchAnimalQuiz = () =>{
        axios.get('/api/fetchAnimalQuiz')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setAnimalQuiz(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    }

    const fetchMathQuiz = () =>{
        axios.get('/api/fetchMathQuiz')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setMathQuiz(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    }

    const fetchMiscellaneousQuiz = () =>{
        axios.get('/api/fetchMiscellaneousQuiz')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setMiscellaneousQuiz(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    }

    const fetchLanguageQuiz = () =>{
        axios.get('/api/fetchLanguageQuiz')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setLanguageQuiz(response.data);
            }
        })
        .catch(function (error) {
            console.log('error');
        });
    }

    function LoggedInRender({isLoggedIn}){
        if(isLoggedIn){
            return <LoggedInNav />
        }
        return <Navapp />
    }

    useEffect(()=>{verifyToken(); fetchAnimalQuiz(); fetchMathQuiz(); fetchLanguageQuiz(); fetchMiscellaneousQuiz();}, [])

    return(
        <>
        {isLoggedIn === null ? <LoadingNav /> : <LoggedInRender isLoggedIn={isLoggedIn} />}
        <div className='bg-warning'>
            <br/>
            <Container>
                <h3 className='mb-3'>Quiz</h3>
                <h5>Quiz Binatang</h5>
                <Row xs={1} md={2} className="g-4">
                    <ul style={{ columns: 2, "-webkit-columns": 2, "-moz-columns": 2}}>
                    {animalQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none'>{item.title}</Link>
                            </Col>
                    ))}</ul>
                </Row>
                <h5>Quiz Matematika</h5>
                <Row xs={1} md={2} className="g-4">
                <ul style={{ columns: 2, "-webkit-columns": 2, "-moz-columns": 2}}>
                    {mathQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none'>{item.title}</Link>
                            </Col>
                    ))}</ul>
                </Row>
                <h5>Quiz Bahasa</h5>
                <Row xs={1} md={2} className="g-4">
                <ul style={{ columns: 2, "-webkit-columns": 2, "-moz-columns": 2}}>
                    {languageQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none'>{item.title}</Link>
                            </Col>
                    ))}</ul>
                </Row>
                <h5>Quiz Lain</h5>
                <Row xs={1} md={2} className="g-4">
                <ul style={{ columns: 2, "-webkit-columns": 2, "-moz-columns": 2}}>
                {miscellaneousQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none'>{item.title}</Link>
                            </Col>
                    ))}
                    </ul>
                </Row>
            </Container>
            <Footer />
        </div>
        </>
    );
}

export default Sitemap;
