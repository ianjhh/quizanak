import { Button, Container, Row } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import LoggedInNav from './LoggedInNav';
import Navapp from './Navapp';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Snake from './Snake.tsx';

const SnakeGame = () =>{
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    const gameName = location.pathname.split('/')[2];

    const verifyToken = () =>{
        axios.get('/http://localhost:5000/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            setIsLoggedIn(true)
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    const fetchGame = () =>{
        axios.post('/http://localhost:5000/fetchGame', {
            gameName: gameName
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                
            }
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    useEffect(()=>{verifyToken(); fetchGame();}, [])

    return (
        <div className='bg-warning'>
            {isLoggedIn? <LoggedInNav /> : <Navapp />}
            <Container className='mt-4'>
                <Row>
                <div className='col-2'>
                    <Link to='/games' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Game List</Button></Link>
                </div>
                
                <div className="col">
                <Snake />
                </div>
                </Row>

            </Container><br/>
            <Footer />
        </div>
    );
}

export default SnakeGame;