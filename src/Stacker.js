import { Button, Container, Row } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import LoggedInNav from './LoggedInNav';
import Navapp from './Navapp';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Footer from './Footer';

const Stacker = () =>{
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    const gameName = location.pathname.split('/')[2];
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
            navigate('/login')
            console.log('Not Logged In!')
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
            console.log('error');
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
                {/* INSERT GAME HERE */}
                
                </div>
                </Row>

            </Container><br/>
            <Footer />
        </div>
    );
}

export default Stacker;
