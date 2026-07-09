import LoggedInNav from './LoggedInNav';
import { useEffect, useState } from 'react';
import { Container, Button, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Footer from './Footer';
import axios from 'axios';
import './Fact.css';

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

function AnimalFact(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [animalFact, setAnimalFact] = useState([]);
    const [title, setTitle] = useState('');
    const location = useLocation();
    const linkName = location.pathname.split('/')[2];
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
            navigate('/login', { replace: true })
            console.log(error.response ? error.response.status : error)
        });
    }

    const fetchAnimalFact = () =>{
        axios.post('/api/fetchAnimalFact', {link_name: linkName})
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setAnimalFact(response.data.factsarr);
                setTitle(response.data.title);
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
        });
    }

    useEffect(()=>{verifyToken(); fetchAnimalFact();}, [])

    function LoggedInRender({isLoggedIn}){
        if (isLoggedIn){
            return (
                <div className="position-relative">
                    <div className="glow-blob-1"></div>
                    <div className="glow-blob-2"></div>
                    <LoggedInNav /> 
                    <div className='main-content-wrapper'>
                        <Container>
                            <Link to='/fakta-binatang' className='text-decoration-none'>
                                <Button className='btn-primary-glow mb-4'>
                                    <i className="bi bi-arrow-left-short"></i> Kembali
                                </Button>
                            </Link>
                            
                            <div className='glass-panel p-4 p-md-5 mt-3 mx-auto' style={{maxWidth: '800px'}}>
                                <h2 className='fw-bold mb-4' style={{background: 'linear-gradient(135deg, #fff, var(--color-warning))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'}}>
                                    {title}
                                </h2>
                                <ol className="list-styled-custom">
                                    {animalFact.map((item, idx) => (
                                        <li key={idx} className='mb-4 text-white-50 fs-5 leading-relaxed'>
                                            <span className="text-white">{item[0]}</span>
                                            {item[1] && (
                                                <div className="mt-3">
                                                    <img 
                                                        src={safeRequire(item[1])} 
                                                        className="img-fluid rounded-3 shadow" 
                                                        style={{maxHeight: '300px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)'}}
                                                        alt="Fakta gambar"
                                                    />
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </Container>
                    </div>
                    <Footer />
                </div>
            )
        }
        return (
            <div className="d-flex justify-content-center align-items-center" style={{minHeight: '100vh', backgroundColor: 'var(--bg-main)'}}>
                <Spinner animation="border" role="status" variant="light">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        )
    }

    return(
        <>
            <LoggedInRender isLoggedIn={isLoggedIn} />
        </>
    );
}

export default AnimalFact;
