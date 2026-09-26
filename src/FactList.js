import './Facts.css';
import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Button, Card, Col } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import { imageFor } from './images';

// Lists the articles of one fact category (see factCategories.js).
function FactList({ category }){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [facts, setFacts] = useState([]);
    const navigate = useNavigate();

    useEffect(()=>{
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
    }, [navigate])

    useEffect(()=>{
        axios.get(category.listEndpoint)
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setFacts(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
        });
    }, [category.listEndpoint])

    return(
        <>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            {isLoggedIn ? <LoggedInNav /> : <Navapp />}
            <div className='main-content-wrapper'>
                <Container>
                    <Link to='/' className='text-decoration-none'>
                        <Button className='btn-primary-glow mb-4'>
                            <i className="bi bi-arrow-left-short"></i> Kembali
                        </Button>
                    </Link>
                    <br/>
                    <h3 className='section-title'>{category.title}</h3>
                    <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4 facts-grid-custom">
                        {facts.map((item, idx) => (
                            <Col key={idx} className='facts-col-list'>
                                <Link to={`${category.path}/${item.link_name}`} className='text-decoration-none'>
                                    <Card className='glass-panel glass-panel-hover facts-card-list'>
                                        <Card.Img variant="top" src={imageFor(item.image)} className='facts-img-card-list' />
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

export default FactList;
