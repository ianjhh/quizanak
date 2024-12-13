import './Facts.css';
import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Modal, Button, Card, Col, Form } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";

function AnimalFacts(props){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [animalFacts, setAnimalFacts] = useState([]);
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

    const fetchAnimalFacts = () =>{
        axios.get('/api/fetchAnimalFacts')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setAnimalFacts(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    }

    useEffect(()=>{verifyToken(); fetchAnimalFacts()}, [])

    return(
        <>
            {isLoggedIn? <LoggedInNav /> : <Navapp />}
            <div className='bg-warning'>
                <br />
                <Container>
                <Link to='/' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Kembali</Button></Link>
                <h3 className='mt-3'>Fakta-Fakta Binatang</h3>
                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                    {animalFacts.map((item, idx) => (
                            <Col key={idx} className='fact-card'>
                            <Link to={`/fakta-binatang/${item.link_name}`} className='text-decoration-none'>
                            <Card className='link-card'>
                                <Card.Img variant="top" src={require(`./${item.image}.jpg`)} width={200} height={200} />
                                <Card.Body className='bg-black text-white'>
                                <Card.Title>{item.title}</Card.Title>
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

export default AnimalFacts;
