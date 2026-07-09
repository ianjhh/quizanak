import { Container } from "react-bootstrap";
import { Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";

function Login(props){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const verifyToken = () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.data.verified === true){
                navigate('/', { replace: true })
            }
            else{
                navigate('/verify', { replace: true })
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error)
        });
    }

    const handleLogin = () =>{
        axios.post('/api/login', {
            username: username,
            password: password
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if(response.data.verified === true){
                navigate('/', { replace: true })
            }
            else{
                navigate('/verify', { replace: true })
            }
        })
        .catch(function (error) {
            alert(error.response.data)
            console.log(error.response ? error.response.status : error);
        });
    }

    useEffect(()=>{
        verifyToken();
    }, [])

    return(
        <div className="position-relative d-flex justify-content-center align-items-center" style={{minHeight: '100vh', backgroundColor: 'var(--bg-main)'}}>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            <Container className="position-relative" style={{zIndex: 2, maxWidth: '400px'}}>
                <div className="glass-panel auth-card p-4 p-sm-5">
                    <h3 className="text-center fw-bold mb-4">Login</h3>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Username</Form.Label>
                            <Form.Control 
                                type="text" 
                                className="form-input-custom" 
                                onChange={(e)=>{setUsername(e.target.value)}} 
                                value={username} 
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formBasicPassword">
                            <Form.Label>Kata Sandi</Form.Label>
                            <Form.Control 
                                type="password" 
                                className="form-input-custom" 
                                onChange={(e)=>{setPassword(e.target.value)}} 
                                value={password} 
                            />
                        </Form.Group>
                        
                        <Button className="btn-primary-glow w-100 py-2 fs-5" type="button" onClick={handleLogin}>
                            Masuk
                        </Button>
                    </Form>
                    <p className='mt-4 text-center text-white-50 mb-0'>
                        Belum daftar? <Link to='/register' className='text-decoration-none text-info fw-semibold'>Buat akun baru</Link>
                    </p>
                    <p className='mt-3 text-center mb-0'>
                        <Link to='/' className='text-decoration-none text-white-50 small'><i className="bi bi-arrow-left"></i> Kembali ke Beranda</Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}

export default Login;
