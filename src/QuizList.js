import './Home.css';
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
    const [show, setShow] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
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

    const handleLogin = () =>{
        axios.post('/api/login', {
            username: username,
            password: password
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if(response.data.verified === true){
                navigate('/')
            }
            else{
                navigate('/verify')
            }
        })
        .catch(function (error) {
            alert(error.response.data);
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
            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" onChange={(e)=>{setUsername(e.target.value)}} value={username} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Kata Sandi</Form.Label>
                                <Form.Control type="password" onChange={(e)=>{setPassword(e.target.value)}} value={password} />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                                <Form.Check type="checkbox" label="Ingat Saya" />
                            </Form.Group>
                            <Button variant="primary" type="button" onClick={handleLogin}>
                                Masuk
                            </Button>
                </Form>
                <p className='mt-3'>Belum daftar? <Link to='/register' className='text-decoration-none'>Buat akun baru</Link></p>
            </Modal.Body>
            </Modal>

            {isLoggedIn? <LoggedInNav /> : <Navapp />}
            <div className='bg-warning'>
                <br />
                <Container>
                <Link to='/' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Kembali</Button></Link>
                <h3 className='mt-3'>Kuis Binatang</h3>
                <Row xs={1} md={5} className="g-4">
                    {animalQuiz.map((item, idx) => (
                            <Col key={idx}>
                            <Card>
                                <Card.Img variant="top" src={require(`./${item.quizImage}.jpg`)} width={200} height={200} />
                                <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>
                                  {item.description}<br/><br/>
                                  Kesulitan: {item.difficulty}
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{if (isLoggedIn){navigate(`/quiz/${item.name}`)} else{handleShow()}}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
                            </Col>
                    ))}
                </Row><br/><br/>

                <h3>Kuis Matematika</h3>
                <Row xs={1} md={5} className="g-4">
                    {mathQuiz.map((item, idx) => (
                            <Col key={idx}>
                            <Card>
                                <Card.Img variant="top" src={require(`./${item.quizImage}.jpg`)} width={200} height={200} />
                                <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>
                                  {item.description}<br/><br/>
                                  Kesulitan: {item.difficulty}
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{if (isLoggedIn){navigate(`/quiz/${item.name}`)} else{handleShow()}}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
                            </Col>
                    ))}
                </Row><br/><br/>

                <h3>Kuis Bahasa</h3>
                <Row xs={1} md={5} className="g-4">
                    {languageQuiz.map((item, idx) => (
                            <Col key={idx}>
                            <Card>
                                <Card.Img variant="top" src={require(`./${item.quizImage}.jpg`)} width={200} height={200} />
                                <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>
                                  {item.description}<br/><br/>
                                  Kesulitan: {item.difficulty}
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{if (isLoggedIn){navigate(`/quiz/${item.name}`)} else{handleShow()}}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
                            </Col>
                    ))}
                </Row><br/><br/>

                <h3>Kuis Lain</h3>
                <Row xs={1} md={5} className="g-4">
                    {miscellaneousQuiz.map((item, idx) => (
                            <Col key={idx}>
                            <Card>
                                <Card.Img variant="top" src={require(`./${item.quizImage}.jpg`)} width={200} height={200} />
                                <Card.Body>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text>
                                  {item.description}<br/><br/>
                                  Kesulitan: {item.difficulty}
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{if (isLoggedIn){navigate(`/quiz/${item.name}`)} else{handleShow()}}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
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
