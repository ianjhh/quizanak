import './QuizList.css';
import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Button, Card, Col } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import LoadingNav from './LoadingNav';

// Safe image require helper to prevent crashes on missing database image references
const safeRequire = (imageName) => {
  try {
    return require(`./assets/images/${imageName}.jpg`);
  } catch (err) {
    try {
      return require('./assets/images/binatang-laut1.jpg'); // secure fallback
    } catch (e) {
      return '';
    }
  }
};

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
                navigate('/verify', { replace: true })
            }
        })
        .catch(function (error) {
            setIsLoggedIn(false)
            console.log(error.response ? error.response.status : error)
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
            console.log(error.response ? error.response.status : error);
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
            console.log(error.response ? error.response.status : error);
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
            console.log(error.response ? error.response.status : error);
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
            console.log(error.response ? error.response.status : error);
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
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            {isLoggedIn === null ? <LoadingNav /> : <LoggedInRender isLoggedIn={isLoggedIn} />}
            <div className='main-content-wrapper'>
                <Container>
                    <Link to='/' className='text-decoration-none'>
                        <Button className='btn-primary-glow mb-4'>
                            <i className="bi bi-arrow-left-short"></i> Kembali
                        </Button>
                    </Link>
                    
                    <h3 className='section-title'>Kuis Binatang</h3>
                    <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 quiz-grid-custom">
                        {animalQuiz.map((item, idx) => (
                            <Col key={idx} className='quiz-col-list'>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none'>
                                    <Card className='glass-panel glass-panel-hover quiz-card-list'>
                                        <Card.Img variant="top" src={safeRequire(item.quizImage)} className='img-card-list' />
                                        <Card.Body className='card-body-list'>
                                            <Card.Title className="card-title-list">{item.title}</Card.Title>
                                            <Card.Text className='card-description-list'>
                                                {item.description}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    <h3 className='section-title'>Kuis Matematika</h3>
                    <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 quiz-grid-custom">
                        {mathQuiz.map((item, idx) => (
                            <Col key={idx} className='quiz-col-list'>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none'>
                                    <Card className='glass-panel glass-panel-hover quiz-card-list'>
                                        <Card.Img variant="top" src={safeRequire(item.quizImage)} className='img-card-list' />
                                        <Card.Body className='card-body-list'>
                                            <Card.Title className="card-title-list">{item.title}</Card.Title>
                                            <Card.Text className='card-description-list'>
                                                {item.description}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    <h3 className='section-title'>Kuis Bahasa</h3>
                    <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 quiz-grid-custom">
                        {languageQuiz.map((item, idx) => (
                            <Col key={idx} className='quiz-col-list'>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none'>
                                    <Card className='glass-panel glass-panel-hover quiz-card-list'>
                                        <Card.Img variant="top" src={safeRequire(item.quizImage)} className='img-card-list' />
                                        <Card.Body className='card-body-list'>
                                            <Card.Title className="card-title-list">{item.title}</Card.Title>
                                            <Card.Text className='card-description-list'>
                                                {item.description}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    <h3 className='section-title'>Kuis Lain</h3>
                    <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 quiz-grid-custom">
                        {miscellaneousQuiz.map((item, idx) => (
                            <Col key={idx} className='quiz-col-list'> 
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none'>
                                    <Card className='glass-panel glass-panel-hover quiz-card-list'>
                                        <Card.Img variant="top" src={safeRequire(item.quizImage)} className='img-card-list' />
                                        <Card.Body className='card-body-list'>
                                            <Card.Title className="card-title-list">{item.title}</Card.Title>
                                            <Card.Text className='card-description-list'>
                                                {item.description}
                                            </Card.Text>   
                                        </Card.Body>
                                    </Card>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </div>
            <Footer />
        </>
    );
}

export default QuizList;
