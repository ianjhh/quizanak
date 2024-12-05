import { Container } from "react-bootstrap";
import { Form,Button } from "react-bootstrap";
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
                navigate('/')
            }
            else{
                navigate('/verify')
            }
        })
        .catch(function (error) {
            console.log(error);
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
                navigate('/')
            }
            else{
                navigate('/verify')
            }
        })
        .catch(function (error) {
            console.log('Error');
        });
    }

    useEffect(()=>{
        verifyToken();
    }, [])

    return(
        <Container className="w-25 mt-5">
        <div className="shadow-sm p-3 rounded bg-white">
            <h3 className="text-center">Login</h3>
            <br />
            <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" onChange={(e)=>{setUsername(e.target.value)}} value={username} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Kata Sandi</Form.Label>
                <Form.Control type="password" onChange={(e)=>{setPassword(e.target.value)}} value={password} />
            </Form.Group>
            <Button variant="primary" type="button" onClick={handleLogin}>
                Masuk
            </Button>
            </Form>
            <p className='mt-3'>Belum daftar? <Link to='/register' className='text-decoration-none'>Buat akun baru</Link></p>
        </div>
        </Container>
    );
}

export default Login;
