import './GameList.css';
import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Modal, Button, Card, Col, Form } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";

function GameList(props){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [gameList, setGameList] = useState([]);
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

    const fetchAllGames = () =>{
        axios.get('/api/fetchAllGames')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setGameList(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    }

    useEffect(()=>{verifyToken(); fetchAllGames()}, [])

    return(
        <>
            {isLoggedIn? <LoggedInNav /> : <Navapp />}
            <div className='bg-warning'>
                <br />
                <Container>
                <Link to='/' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Kembali</Button></Link>
                <Row xs={1} md={5} className="g-4 mt-1">
                    {gameList? gameList.map((item, idx) => (
                            <Col key={idx} className='games-col-list'>
                            <Link to={`/games/${item.name}`} className='text-decoration-none'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./${item.gameImage}.jpg`)} className='games-img-card-list' />
                                <Card.Body className='games-card-body-list'>
                                <Card.Title>{item.title}</Card.Title>
                                <Card.Text className='games-card-description-list'>
                                  {item.description}<br/><br/>
                                </Card.Text>
                                </Card.Body>
                            </Card>
                            </Link>
                            </Col>
                    )) : null}
                </Row><br/><br/>
                </Container><br/><br/>
        </div>
        <Footer />
        </>
    );
}

export default GameList;
