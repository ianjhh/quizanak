import { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from 'react-bootstrap/Spinner';
import { useSearchParams } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { Form,Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function Verify(props){
    const [verified, setVerified] = useState(false);
    const [code, setCode] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const verifyToken = async () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            setIsLoggedIn(true)
            setUsername(response.data.authorizedData.username)
        })
        .catch(function (error) {
            navigate('/login')
            console.log(error);
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
            alert('Error!')
            console.log(error);
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
            console.log(error)
            alert('Oops ada error!')
        });
    }

    useEffect(()=>{verifyToken();}, [])
    
    return(
        <>
            {!verified?
            <>
                <h3>Masukin kode verifikasi dari email dibawah</h3>
                <Form.Group className="mb-3" controlId="formVerificationCode">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" onChange={(e)=>{setCode(e.target.value)}} value={code} />
                </Form.Group>
        
                <Button variant="primary" type="button" onClick={handleVerify}>Verifikasi!</Button>
                <Button variant="danger" type="link" onClick={handleResendCode}>Kirim ulang kode verifikasi</Button>
            </>
            : <h3>Akun telah diverifikasi!</h3>}
        </>
    )
}

export default Verify;
