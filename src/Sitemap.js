import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Row, Container, Col } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import LoadingNav from './LoadingNav';

function Sitemap(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [animalQuiz, setAnimalQuiz] = useState([]);
    const [mathQuiz, setMathQuiz] = useState([]);
    const [miscellaneousQuiz, setMiscellaneousQuiz] = useState([]);
    const [languageQuiz, setLanguageQuiz] = useState([]);
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

    const fetchAnimalQuiz = () =>{
        axios.get('/api/fetchAnimalQuiz')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setAnimalQuiz(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
        });
    }

    const fetchMathQuiz = () =>{
        axios.get('/api/fetchMathQuiz')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setMathQuiz(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
        });
    }

    const fetchMiscellaneousQuiz = () =>{
        axios.get('/api/fetchMiscellaneousQuiz')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setMiscellaneousQuiz(response.data);
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
        });
    }

    const fetchLanguageQuiz = () =>{
        axios.get('/api/fetchLanguageQuiz')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setLanguageQuiz(response.data);
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

    useEffect(()=>{verifyToken(); fetchAnimalQuiz(); fetchMathQuiz(); fetchLanguageQuiz(); fetchMiscellaneousQuiz();}, [])

    return(
        <>
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>
        {isLoggedIn === null ? <LoadingNav /> : <LoggedInRender isLoggedIn={isLoggedIn} />}
        <div className="main-content-wrapper">
            <Container>
                <div className="glass-panel p-4 p-md-5 mx-auto" style={{maxWidth: '800px'}}>
                    <h3 className="fw-bold mb-4" style={{background: 'linear-gradient(135deg, #fff, var(--color-warning))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'}}>
                        Peta Situs (Sitemap)
                    </h3>
                    
                    <h5 className="fw-bold text-white mt-4 mb-3 border-bottom pb-2 border-secondary">Kuis Binatang</h5>
                    <Row xs={1} md={2} className="g-3 mb-4">
                        {animalQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none text-info fw-semibold hover-opacity'>
                                    <i className="bi bi-chevron-right me-2 small"></i>{item.title}
                                </Link>
                            </Col>
                        ))}
                    </Row>
                    
                    <h5 className="fw-bold text-white mt-4 mb-3 border-bottom pb-2 border-secondary">Kuis Matematika</h5>
                    <Row xs={1} md={2} className="g-3 mb-4">
                        {mathQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none text-info fw-semibold hover-opacity'>
                                    <i className="bi bi-chevron-right me-2 small"></i>{item.title}
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    <h5 className="fw-bold text-white mt-4 mb-3 border-bottom pb-2 border-secondary">Kuis Bahasa</h5>
                    <Row xs={1} md={2} className="g-3 mb-4">
                        {languageQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none text-info fw-semibold hover-opacity'>
                                    <i className="bi bi-chevron-right me-2 small"></i>{item.title}
                                </Link>
                            </Col>
                        ))}
                    </Row>

                    <h5 className="fw-bold text-white mt-4 mb-3 border-bottom pb-2 border-secondary">Kuis Lain</h5>
                    <Row xs={1} md={2} className="g-3 mb-4">
                        {miscellaneousQuiz.map((item, idx) => (
                            <Col key={idx}>
                                <Link to={`/quiz/${item.name}`} className='text-decoration-none text-info fw-semibold hover-opacity'>
                                    <i className="bi bi-chevron-right me-2 small"></i>{item.title}
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Container>
            <br/><br/>
            <Footer />
        </div>
        </>
    );
}

export default Sitemap;
