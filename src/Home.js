import Navapp from './Navapp';
import Footer from './Footer';
import './Home.css';
import { useEffect, useState, useReducer } from 'react';
import LoggedInNav from './LoggedInNav';
import axios from 'axios';
import { Row, Container, Form, Button, Card, Table, Col } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import img1 from './binatang-laut1.jpg'
import games_img from './games_img.jpg'

function Home(props){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [historyList, setHistoryList] = useState([]);
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
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

    return(
        <>
            {isLoggedIn? <LoggedInNav /> : <Navapp />}
            <div className='bg-warning'>
                <br />
                <Container>
                <Row>
                    <div className='col-12 col-sm-6 col-md-8'>
                        <h1>Games dan Kuis untuk anak-anak! 🌴</h1>
                        {/* --------------CARDS-------------- */}

                        <Row xs={1} md={2} lg={3} className="g-4 main-container">
                        <Col>
                            <Card>
                                <Card.Img variant="top" src={img1} height={200} />
                                <Card.Body>
                                <Card.Title>Quiz</Card.Title>
                                <Card.Text>
                                    Kuis tentang binatang, matematika dan lebih!
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{navigate('/quiz')}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col>
                            <Card>
                                <Card.Img variant="top" src={games_img} height={200} />
                                <Card.Body>
                                <Card.Title>Games</Card.Title>
                                <Card.Text>
                                  Permainan anak-anak klasik seperti Ular dan Pong
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{navigate('/games')}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col>
                            <Card>
                                <Card.Img variant="top" src={require(`./faktabinatang.jpg`)} height={200} />
                                <Card.Body>
                                <Card.Title>Fakta Binatang</Card.Title>
                                <Card.Text>
                                  Belajar tentang fakta-fakta binatang!
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{navigate('/fakta-binatang')}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col>
                            <Card>
                                <Card.Img variant="top" src={require(`./faktaangkasa.jpg`)} height={200} />
                                <Card.Body>
                                <Card.Title>Fakta Angkasa</Card.Title>
                                <Card.Text>
                                  Belajar tentang fakta-fakta angkasa!
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{navigate('/fakta-angkasa')}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col>
                            <Card>
                                <Card.Img variant="top" src={require(`./faktasejarah.jpg`)} height={200} />
                                <Card.Body>
                                <Card.Title>Fakta Aneh Tapi Nyata</Card.Title>
                                <Card.Text>
                                  Belajar tentang fakta-fakta aneh tapi nyata!
                                </Card.Text>
                                <Button variant="primary" onClick={()=>{navigate('/fakta-sejarah')}}>Mulai!</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                </Row>

                    </div>
                    {!isLoggedIn? <div className='col-sm-6 col-md-4'>
                        <div className="shadow-sm p-3 rounded bg-white">
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
                    </div> : 
                        <div className='col-sm-6 col-md-4'>
                        <div className="shadow-sm p-3 rounded bg-white">
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
                        </div></div>}
                </Row>
                </Container>
                    
                <br /><br />
            </div>
            <Footer />
        </>
    );
}

export default Home;
