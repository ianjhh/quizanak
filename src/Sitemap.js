import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Modal, Button, Card, Col, Form } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";

function Sitemap(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [animalQuiz, setAnimalQuiz] = useState([]);
    const [mathQuiz, setMathQuiz] = useState([]);
    const [miscellaneousQuiz, setMiscellaneousQuiz] = useState([]);
    const [languageQuiz, setLanguageQuiz] = useState([]);
    const [gameList, setGameList] = useState([]);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const navigate = useNavigate();

    const verifyToken = () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            setIsLoggedIn(true)
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    const handleLogin = () =>{
        axios.post('/api/login', {
            username: username,
            password: password
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            navigate('/sitemap')
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    const fetchAllGames = () =>{
        axios.get('/api/fetchAllGames')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setGameList(response.data);
            }
        })
        .catch(function (error) {
            console.log(error);
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
            console.log(error);
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
            console.log(error);
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
            console.log(error);
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
            console.log(error);
        });
    }

    useEffect(()=>{verifyToken(); fetchAnimalQuiz(); fetchMathQuiz(); fetchLanguageQuiz(); fetchMiscellaneousQuiz(); fetchAllGames()}, [])

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
            <br/>
            <Container>
                <h3 className='mb-3'>Quiz</h3>
                <h5>Quiz Binatang</h5>
                <Row xs={1} md={2} className="g-4">
                    <ul style={{ columns: 2, "-webkit-columns": 2, "-moz-columns": 2}}>
                    {animalQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Button className='text-decoration-none' variant="link" onClick={()=>{if (isLoggedIn){navigate(`/quiz/${item.name}`)} else{handleShow()}}}>{item.title}</Button>
                            </Col>
                    ))}</ul>
                </Row>
                <h5>Quiz Matematika</h5>
                <Row xs={1} md={2} className="g-4">
                <ul style={{ columns: 2, "-webkit-columns": 2, "-moz-columns": 2}}>
                    {mathQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Button className='text-decoration-none' variant="link" onClick={()=>{if (isLoggedIn){navigate(`/quiz/${item.name}`)} else{handleShow()}}}>{item.title}</Button>
                            </Col>
                    ))}</ul>
                </Row>
                <h5>Quiz Bahasa</h5>
                <Row xs={1} md={2} className="g-4">
                <ul style={{ columns: 2, "-webkit-columns": 2, "-moz-columns": 2}}>
                    {languageQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Button className='text-decoration-none' variant="link" onClick={()=>{if (isLoggedIn){navigate(`/quiz/${item.name}`)} else{handleShow()}}}>{item.title}</Button>
                            </Col>
                    ))}</ul>
                </Row>
                <h5>Quiz Lain</h5>
                <Row xs={1} md={2} className="g-4">
                <ul style={{ columns: 2, "-webkit-columns": 2, "-moz-columns": 2}}>
                {miscellaneousQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Button className='text-decoration-none' variant="link" onClick={()=>{navigate(`/quiz/${item.name}`)}}>{item.title}</Button>
                            </Col>
                    ))}
                    </ul>
                </Row>
                <h3 className='mb-3'>Games</h3>
                <h5>Quiz Lain</h5>
                <Row xs={1} md={2} className="g-4">
                    <ul>
                {gameList.map((item, idx) => (
                            <Col key={idx}>
                                <Button className='text-decoration-none' variant="link" onClick={()=>{navigate(`/games/${item.name}`)}}>{item.title}</Button>
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
