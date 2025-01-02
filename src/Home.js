import Navapp from './Navapp';
import Footer from './Footer';
import './Home.css';
import { useEffect, useState, useReducer } from 'react';
import LoggedInNav from './LoggedInNav';
import axios from 'axios';
import { Row, Container, Form, Button, Card, Table, Col } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import img1 from './binatang-laut1.jpg'
import LoadingNav from './LoadingNav';
import Spinner from 'react-bootstrap/Spinner';

function Home(props){
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [historyList, setHistoryList] = useState([]);
    const navigate = useNavigate();

    const verifyToken = () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.data.verified === true){
                setIsLoggedIn(true)
                setUsername(response.data.authorizedData.username)
                fetchHistory(response.data.authorizedData.username)
            }
            else{
                navigate('/verify')
            }
        })
        .catch(function (error) {
            setIsLoggedIn(false)
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
                window.location.reload()
            }
            else{
                navigate('/verify')
            }
        })
        .catch(function (error) {
            alert(error.response.data)
        });
    }

    const fetchHistory = async (username) =>{
        axios.post('/api/fetchHistory', {
            username: username
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setHistoryList(response.data.reverse())
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    }

    useEffect(()=>{verifyToken();}, [])

    function LoggedInRender({isLoggedIn}){
        if(isLoggedIn){
            return <LoggedInNav />
        }
        return <Navapp />
    }

    function RenderWhiteBox({isLoggedIn}){
        if(isLoggedIn){
            (<div className='col-sm-6 col-md-4'>
                        <div className="shadow-sm p-3 rounded bg-white historylist">
                            <h3 className='fw-bold'>{username}</h3>
                            <Table>
                            <thead>
                                <tr>
                                    <th>Aktivitas Terbaru</th>
                                    <th>Skor Total</th>
                                </tr>
                            </thead>
                            <tbody>
                            {historyList? historyList.map((item, idx)=>{
                                return(
                                <tr key={idx}>
                                    <td>{item[0]}</td>
                                    <td>{item[1]}</td>
                                </tr>)
                            }) : null}
                            </tbody>
                            </Table>
                        </div></div>)
        }
        return <div className='col-sm-6 col-md-4'>
                        <div className="shadow-sm p-3 rounded bg-white loginarea">
                            <h3 className="text-center">Login</h3>
                            <br />
                            <Form>
                            <Form.Group className="mb-3" controlId="formBasicEmail">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" onChange={(e)=>{setUsername(e.target.value)}} value={username} />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formBasicPassword">
                                <Form.Label>Kata Sandi</Form.Label>
                                <Form.Control type="password" onChange={(e)=>{setPassword(e.target.value)}} value={password} />
                            </Form.Group>
                            <Button variant="primary" type="button" onClick={handleLogin}>
                                Masuk
                            </Button>
                            </Form>
                            <p className='mt-3'>Belum daftar? <Link to='/register' className='text-decoration-none'>Buat akun baru</Link></p>
                        </div>
                    </div>
    }

    return(
        <>
            {isLoggedIn === null ? <LoadingNav /> : <LoggedInRender isLoggedIn={isLoggedIn} />}
            <div className='bg-warning'>
                <br />
                <Container>
                <Row>
                    <div className='col-12 col-sm-6 col-md-8'>
                        <h1>Kuis untuk anak-anak! 🌴</h1>
                        {/* --------------CARDS-------------- */}
                        <Row xs={1} md={2} lg={3} className="g-4 main-container">
                        <Col className='quiz-col-home'>
                            <Link to='/quiz' className='text-decoration-none'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={img1} className='img-card-home' />
                                <Card.Body className='card-body-home'>
                                <Card.Title>Kuis</Card.Title>
                                <Card.Text className='card-description-home'>
                                    Kuis tentang binatang, matematika dan lebih!
                                </Card.Text>
                                </Card.Body>
                            </Card>
                            </Link>
                        </Col>

                        <Col className='quiz-col-home'>
                            <Link to='/fakta-binatang' className='text-decoration-none'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./faktabinatang.jpg`)} className='img-card-home' />
                                <Card.Body className='card-body-home'>
                                <Card.Title>Fakta Binatang</Card.Title>
                                <Card.Text className='card-description-home'>
                                  Belajar tentang fakta-fakta binatang!
                                </Card.Text>
                                </Card.Body>
                            </Card>
                            </Link>
                        </Col>
                        
                        
                        <Col className='quiz-col-home'>
                            <Link to='/fakta-angkasa' className='text-decoration-none'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./faktaangkasa.jpg`)} className='img-card-home' />
                                <Card.Body className='card-body-home'>
                                <Card.Title>Fakta Angkasa</Card.Title>
                                <Card.Text className='card-description-home'>
                                  Belajar tentang fakta-fakta angkasa!
                                </Card.Text>
                                </Card.Body>
                            </Card>
                            </Link>
                        </Col>
     
                        <Col className='quiz-col-home'>
                            <Link to='/fakta-aneh' className='text-decoration-none'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./faktasejarah.jpg`)} className='img-card-home' />
                                <Card.Body className='card-body-home'>
                                <Card.Title>Fakta Aneh</Card.Title>
                                <Card.Text className='card-description-home'>
                                  Belajar tentang fakta-fakta aneh tapi nyata!
                                </Card.Text>
                                </Card.Body>
                            </Card>
                            </Link>
                        </Col>
                </Row>

                    </div>
                    {isLoggedIn === null ? <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">Loading...</span>
        </Spinner> : <RenderWhiteBox isLoggedIn={isLoggedIn} />}
                </Row>
                </Container>
                    
                <br /><br />
            </div>
            <Footer />
        </>
    );
}

export default Home;
