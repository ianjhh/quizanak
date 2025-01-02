import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import { useSearchParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Verify(props){
    const [verified, setVerified] = useState(false);
    const [code, setCode] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const verifyToken = () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            setIsLoggedIn(true)
            if (response.data.verified === true){
                navigate('/')
            }
            else{
                setUsername(response.data.authorizedData.username)
            }
        })
        .catch(function (error) {
            console.log(error.response.status)
            navigate('/login')
        });
    }

    const handleLogout = () =>{
        axios.get('/api/logout', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            navigate('/login')
        })
        .catch(function (error) {
            alert(error.response.data)
            console.log(error.response.status);
        });
    }

    const handleVerify = () =>{
        axios.post('/api/setVerified', {verificationCode: code})
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if(response.status===200){
                setVerified(true)
        }})
        .catch(function (error) {
            alert(error.response.data)
            console.log(error.response.status);
        });
    }

    const handleResendCode = () =>{
        axios.post('/api/resendCode', {username: username})
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if(response.status===200){
                alert('Email telah dikirim!')
        }})
        .catch(function (error) {
            console.log(error.response.status)
            alert(error.response.data)
        });
    }

    useEffect(()=>{verifyToken();}, [])
    
    return(
        <>
            {!verified?
            <Container className='mt-3'>
                <h3>Masukin kode verifikasi dari email dibawah</h3>
                <Form.Group className="mb-3" controlId="formVerificationCode">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" onChange={(e)=>{setCode(e.target.value)}} value={code} />
                </Form.Group>
        
                <Button variant="primary" type="button" onClick={handleVerify}>Verifikasi!</Button>&nbsp;
                <Button variant="danger" type="button" onClick={handleResendCode}>Kirim ulang kode verifikasi</Button>
                <br/><br/>
                <Button variant="danger" type="button" onClick={handleLogout}>Logout</Button>
            </Container>
            : <Container><h3>Akun telah diverifikasi!</h3></Container>}
        </>
    )
}

export default Verify;
