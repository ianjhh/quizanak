import './Facts.css';
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
                navigate('/verify', { replace: true })
            }
        })
        .catch(function (error) {
            setIsLoggedIn(false)
            console.log(error.response ? error.response.status : error)
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
            console.log(error.response ? error.response.status : error);
        });
    }

    function LoggedInRender({isLoggedIn}){
        if(isLoggedIn){
            return <LoggedInNav />
        }
        return <Navapp />
    }

    useEffect(()=>{verifyToken(); fetchAnimalFacts()}, [])

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
                    <br/>
                    <h3 className='section-title'>Fakta-Fakta Binatang</h3>
                    <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 facts-grid-custom">
                        {animalFacts.map((item, idx) => (
                            <Col key={idx} className='facts-col-list'>
                                <Link to={`/fakta-binatang/${item.link_name}`} className='text-decoration-none'>
                                    <Card className='glass-panel glass-panel-hover facts-card-list'>
                                        <Card.Img variant="top" src={safeRequire(item.image)} className='facts-img-card-list' />
                                        <Card.Body className='facts-card-body-list'>
                                            <Card.Title className="facts-card-title-list">{item.title}</Card.Title>
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

export default AnimalFacts;
