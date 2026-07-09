import Navapp from './Navapp';
import Footer from './Footer';
import './Home.css';
import { useEffect, useState } from 'react';
import LoggedInNav from './LoggedInNav';
import axios from 'axios';
import { Row, Container, Form, Button, Card, Table, Col } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import img1 from './assets/images/binatang-laut1.jpg';
import LoadingNav from './LoadingNav';
import Spinner from 'react-bootstrap/Spinner';

function Home(props){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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
                navigate('/verify', { replace: true })
            }
        })
        .catch(function (error) {
            setIsLoggedIn(false)
            console.log(error.response ? error.response.status : error)
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
                navigate('/verify', { replace: true })
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
            console.log(error.response ? error.response.status : error);
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
            return (
                <div className='col-12 col-md-4 mt-4 mt-md-0'>
                    <div className="glass-panel auth-card historylist">
                        <h3 className='fw-bold mb-3'>{username}</h3>
                        <Table responsive className="history-table mb-0">
                            <thead>
                                <tr>
                                    <th>Aktivitas Terbaru</th>
                                    <th>Skor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyList && historyList.length > 0 ? historyList.map((item, idx)=>{
                                    return(
                                        <tr key={idx}>
                                            <td className="text-white-50">{item[0]}</td>
                                            <td className="fw-semibold text-warning">{item[1]}</td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan="2" className="text-center text-white-50 py-3">Belum ada aktivitas</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            )
        }
        return (
            <div className='col-12 col-md-4 mt-4 mt-md-0'>
                <div className="glass-panel auth-card loginarea">
                    <h3 className="text-center fw-bold">Login</h3>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Username</Form.Label>
                            <Form.Control 
                                type="text" 
                                className="form-input-custom" 
                                onChange={(e)=>{setUsername(e.target.value)}} 
                                value={username} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Kata Sandi</Form.Label>
                            <Form.Control 
                                type="password" 
                                className="form-input-custom" 
                                onChange={(e)=>{setPassword(e.target.value)}} 
                                value={password} 
                            />
                        </Form.Group>
                        <Button className="btn-primary-glow w-100 py-2 mt-2" type="button" onClick={handleLogin}>
                            Masuk
                        </Button>
                    </Form>
                    <p className='mt-4 text-center text-white-50 mb-0'>
                        Belum daftar? <Link to='/register' className='text-decoration-none text-info fw-semibold'>Buat akun baru</Link>
                    </p>
                </div>
            </div>
        )
    }

    return(
        <>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            {isLoggedIn === null ? <LoadingNav /> : <LoggedInRender isLoggedIn={isLoggedIn} />}
            <div className='main-content-wrapper'>
                <Container>
                    <Row>
                        <div className='col-12 col-md-8'>
                            <h1 className="main-heading">Kuis untuk anak-anak! 🌴</h1>
                            {/* --------------CARDS-------------- */}
                            <Row xs={1} sm={2} lg={3} className="g-4 main-container">
                                <Col className='quiz-col-home'>
                                    <Link to='/quiz' className='text-decoration-none'>
                                        <Card className='glass-panel glass-panel-hover quiz-card-custom'>
                                            <Card.Img variant="top" src={img1} className='img-card-home' />
                                            <Card.Body className='card-body-home'>
                                                <Card.Title className="card-title-custom">Kuis</Card.Title>
                                                <Card.Text className='card-description-home'>
                                                    Kuis tentang binatang, matematika dan lebih!
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>

                                <Col className='quiz-col-home'>
                                    <Link to='/fakta-binatang' className='text-decoration-none'>
                                        <Card className='glass-panel glass-panel-hover quiz-card-custom'>
                                            <Card.Img variant="top" src={require(`./assets/images/faktabinatang.jpg`)} className='img-card-home' />
                                            <Card.Body className='card-body-home'>
                                                <Card.Title className="card-title-custom">Fakta Binatang</Card.Title>
                                                <Card.Text className='card-description-home'>
                                                    Belajar tentang fakta-fakta binatang!
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                                
                                <Col className='quiz-col-home'>
                                    <Link to='/fakta-angkasa' className='text-decoration-none'>
                                        <Card className='glass-panel glass-panel-hover quiz-card-custom'>
                                            <Card.Img variant="top" src={require(`./assets/images/faktaangkasa.jpg`)} className='img-card-home' />
                                            <Card.Body className='card-body-home'>
                                                <Card.Title className="card-title-custom">Fakta Angkasa</Card.Title>
                                                <Card.Text className='card-description-home'>
                                                    Belajar tentang fakta-fakta angkasa!
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
             
                                <Col className='quiz-col-home'>
                                    <Link to='/fakta-aneh' className='text-decoration-none'>
                                        <Card className='glass-panel glass-panel-hover quiz-card-custom'>
                                            <Card.Img variant="top" src={require(`./assets/images/faktasejarah.jpg`)} className='img-card-home' />
                                            <Card.Body className='card-body-home'>
                                                <Card.Title className="card-title-custom">Fakta Aneh</Card.Title>
                                                <Card.Text className='card-description-home'>
                                                    Belajar tentang fakta-fakta aneh tapi nyata!
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                            </Row>
                        </div>
                        {isLoggedIn === null ? (
                            <div className="col-12 col-md-4 d-flex justify-content-center align-items-center" style={{minHeight: '200px'}}>
                                <Spinner animation="border" role="status" variant="light">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </div>
                        ) : (
                            <RenderWhiteBox isLoggedIn={isLoggedIn} />
                        )}
                    </Row>
                </Container>
            </div>
            <Footer />
        </>
    );
}

export default Home;
