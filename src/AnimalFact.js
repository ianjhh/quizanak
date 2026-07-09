import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import Footer from './Footer';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
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
            console.log(error.response.status)
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
            console.log(error.response.status);
        });
    }

    useEffect(()=>{verifyToken(); fetchAnimalFact();}, [])

    function LoggedInRender(isLoggedIn){
        if (isLoggedIn){
            return <>
            <LoggedInNav /> 
            <div className='bg-warning'>
                <br />
                <Container>
                    <Link to='/fakta-binatang' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Kembali</Button></Link>
                    <div className='bg-white rounded p-1 mt-3'>
                    <h2 className='mt-3 mb-4'>{title}</h2>
                    <ol>
                    {animalFact.map((item, idx) => (
                        <li className='mb-4 fs-5'>{item[0]}<br/>{item[1]? <img src={safeRequire(item[1])} /> : null}</li>
                    ))}
                    </ol>
                    </div>
                </Container>
                <br /><br />
            </div>
            <Footer />
            </>
        }
        return <Spinner animation="border" role="status" variant="success">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    }

    return(
        <>
            <LoggedInRender isLoggedIn={isLoggedIn} />
        </>
    );
}

export default AnimalFact;
