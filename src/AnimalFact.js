import Navapp from './Navapp';
import LoggedInNav from './LoggedInNav';
import { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import Footer from './Footer';
import axios from 'axios';

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
                navigate('/verify')
            }
        })
        .catch(function (error) {
            navigate('/login')
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

    return(
        <>
            {isLoggedIn? <LoggedInNav /> : <Navapp />}
            <div className='bg-warning'>
                <br />
                <Container>
                    <Link to='/fakta-binatang' className='text-decoration-none'><Button variant='primary'><i className="bi bi-arrow-left-short"></i>Kembali</Button></Link>
                    <div className='bg-white rounded p-1 mt-3'>
                    <h2 className='mt-3 mb-4'>{title}</h2>
                    <ol>
                    {animalFact.map((item, idx) => (
                        <li className='mb-4 fs-5'>{item[0]}<br/><img src={require(`./${item[1]}.jpg`)} height={200} /></li>
                    ))}
                    </ol>
                    </div>
                </Container>
                <br /><br />
            </div>
            <Footer />
        </>
    );
}

export default AnimalFact;
