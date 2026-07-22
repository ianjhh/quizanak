import { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

function Verify(props){
    const [verified, setVerified] = useState(false);
    const [code, setCode] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const verifyToken = () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.data.verified === true){
                navigate('/', { replace: true })
            }
            else{
                setUsername(response.data.authorizedData.username)
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error)
            navigate('/login', { replace: true })
        });
    }

    const handleLogout = () =>{
        axios.get('/api/logout', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            navigate('/login', { replace: true })
        })
        .catch(function (error) {
            alert(error.response ? error.response.data : error)
            console.log(error.response ? error.response.status : error);
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
            alert(error.response ? error.response.data : error)
            console.log(error.response ? error.response.status : error);
        });
    }

    const handleResendCode = () =>{
        if(!username){
            alert('Sedang memuat data pengguna, silakan tunggu sebentar dan coba lagi.');
            return;
        }
        axios.post('/api/resendCode', {username: username}, { withCredentials: true })
        .then(function (response) {
            if(response.status===200){
                alert('Email verifikasi telah berhasil dikirim ulang!')
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
            alert(error.response && error.response.data ? error.response.data : 'Gagal mengirim ulang kode verifikasi!');
        });
    }

    useEffect(()=>{verifyToken();}, [])
    
    return(
        <div className="position-relative d-flex justify-content-center align-items-center" style={{minHeight: '100vh', backgroundColor: 'var(--bg-main)'}}>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            <Container className="position-relative" style={{zIndex: 2, maxWidth: '450px'}}>
                <div className="glass-panel auth-card p-4 p-sm-5">
                    {!verified ? (
                        <>
                            <h3 className="text-center fw-bold mb-3">Verifikasi Akun</h3>
                            <p className="text-white-50 text-center small mb-4">
                                Masukkan kode verifikasi 6-digit yang kami kirimkan ke email Anda.
                            </p>
                            <Form>
                                <Form.Group className="mb-4 text-center" controlId="formVerificationCode">
                                    <Form.Label className="d-block mb-2">Kode Verifikasi</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        className="form-input-custom text-center fs-4 letter-spacing-lg mx-auto" 
                                        style={{maxWidth: '200px', letterSpacing: '4px'}}
                                        onChange={(e)=>{setCode(e.target.value)}} 
                                        value={code} 
                                        maxLength="6"
                                    />
                                </Form.Group>
                        
                                <Button className="btn-primary-glow w-100 py-2 fs-5 mb-3" type="button" onClick={handleVerify}>
                                    Verifikasi!
                                </Button>
                                
                                <Button className="w-100 py-2 btn-success-glow mb-3" type="button" onClick={handleResendCode}>
                                    Kirim Ulang Kode
                                </Button>
                                
                                <Button className="w-100 py-2 btn-danger-glow" type="button" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </Form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="correct-alert mb-4 w-100">
                                <i className="bi bi-check-circle-fill me-2 fs-4 d-block mb-2"></i> Akun telah diverifikasi!
                            </div>
                            <Link to="/" className="text-decoration-none">
                                <Button className="btn-primary-glow px-4 py-2">Mulai Kuis</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    )
}

export default Verify;
