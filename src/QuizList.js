import './QuizList.css';
import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Modal, Button, Card, Col, Form } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";

function QuizList(props){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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
            console.log(error.response.status);
        });
    }

    useEffect(()=>{verifyToken(); fetchAnimalQuiz(); fetchMathQuiz(); fetchLanguageQuiz(); fetchMiscellaneousQuiz();}, [])

    return(
        <>
            {isLoggedIn? <LoggedInNav /> : <Navapp />}
            <div className='bg-warning'>
                <br />
                <Container>
                <Link to='/' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Kembali</Button></Link>
                <h3 className='mt-3'>Kuis Binatang</h3>
                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                    {animalQuiz.map((item, idx) => (
                            <Col key={idx} className='quiz-col-list'>
                            <Link to={`/quiz/${item.name}`} className='text-decoration-none'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./${item.quizImage}.jpg`)} className='img-card-list' />
                                <Card.Body className='card-body-list'>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text className='card-description-list'>
                                  {item.description}<br/><br/>
                                  Kesulitan: {item.difficulty}
                                </Card.Text>
                                </Card.Body>
                            </Card>
                            </Link>
                            </Col>
                    ))}
                </Row><br/><br/>

                <h3>Kuis Matematika</h3>
                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                    {mathQuiz.map((item, idx) => (
                            <Col key={idx} className='quiz-col-list'>
                            <Link to={`/quiz/${item.name}`} className='text-decoration-none'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./${item.quizImage}.jpg`)} className='img-card-list' />
                                <Card.Body className='card-body-list'>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text className='card-description-list'>
                                  {item.description}<br/><br/>
                                  Kesulitan: {item.difficulty}
                                </Card.Text>
                                </Card.Body>
                            </Card>
                            </Link>
                            </Col>
                    ))}
                </Row><br/><br/>

                <h3>Kuis Bahasa</h3>
                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                    {languageQuiz.map((item, idx) => (
                            <Col key={idx} className='quiz-col-list'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./${item.quizImage}.jpg`)} className='img-card-list' />
                                <Card.Body className='card-body-list'>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text className='card-description-list'>
                                  {item.description}<br/><br/>
                                  Kesulitan: {item.difficulty}
                                </Card.Text>
                                </Card.Body>
                            </Card>
                            </Link>
                            </Col>
                    ))}
                </Row><br/><br/>

                <h3>Kuis Lain</h3>
                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                    {miscellaneousQuiz.map((item, idx) => (
                            <Col key={idx} className='quiz-col-list'> 
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./${item.quizImage}.jpg`)} className='img-card-list' />
                                <Card.Body className='card-body-list'>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text className='card-description-list'>
                                  {item.description}<br/><br/>
                                  Kesulitan: {item.difficulty}
                                </Card.Text>   
                                </Card.Body>
                            </Card>
                            </Link>
                            </Col>
                    ))}
                </Row><br/><br/>
                </Container><br/><br/>
        </div>
        <Footer />
        </>
    );
}

export default QuizList;
