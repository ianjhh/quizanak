import './Facts.css';
import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Modal, Button, Card, Col, Form } from 'react-bootstrap';
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

function SpaceFacts(props){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [spaceFacts, setSpaceFacts] = useState([]);
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
            setIsLoggedIn(false)
            console.log(error.response.status)
        });
    }

    const fetchSpaceFacts = () =>{
        axios.get('/api/fetchSpaceFacts')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setSpaceFacts(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
    }

    function LoggedInRender({isLoggedIn}){
        if(isLoggedIn){
            return <LoggedInNav />
        }
        return <Navapp />
    }

    useEffect(()=>{verifyToken(); fetchSpaceFacts();}, [])

    return(
        <>
            {isLoggedIn === null ? <LoadingNav /> : <LoggedInRender isLoggedIn={isLoggedIn} />}
            <div className='bg-warning'>
                <br />
                <Container>
                <Link to='/' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Kembali</Button></Link>
                <h3 className='mt-3'>Fakta-Fakta Angkasa</h3>
                <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
                    {spaceFacts.map((item, idx) => (
                            <Col key={idx} className='facts-col-list'>
                            <Link to={`/fakta-angkasa/${item.link_name}`} className='text-decoration-none'>
                            <Card className='link-card rounded-0'>
                                <Card.Img variant="top" src={safeRequire(item.image)} className='facts-img-card-list rounded-0' />
                                <Card.Body className='bg-black text-white facts-card-body-list'>
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

export default SpaceFacts;
