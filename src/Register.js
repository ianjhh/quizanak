import { Container } from "react-bootstrap";
import { Form, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import bcrypt from 'bcryptjs';

function Register(props){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [usernameMsg, setUsernameMsg] = useState(null);
    const [passwordMsg, setPasswordMsg] = useState(null);
    const [password2Msg, setPassword2Msg] = useState(null);
    const [emailIsValid, setEmailIsValid] = useState(null);
    const [email, setEmail] = useState("");
    const [correctEmailFormat, setCorrectEmailFormat] = useState(true);
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

    const validateEmailFormat = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const handleRegister = (email) =>{
        let validEmail = validateEmailFormat(email)

        if(!validEmail){
            setCorrectEmailFormat(false)
            return;
        }
        else{
            setCorrectEmailFormat(true)
        }

        axios.post('/api/validateEmail', {
            email: email,
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            setEmailIsValid(true)
            const saltRounds = 11;

            if (username.length < 3 || password.length < 8 || password !== password2){
                alert('Input tidak valid!')
                return;
            }
    
            /* generate password hash */
            bcrypt
            .genSalt(saltRounds)
            .then(salt => {
                return bcrypt.hash(password, salt)
            })
            .then(hash => {
                axios.post('/api/register', {
                    username: username,
                    password: hash,
                    email: email,
                    verified: false,
                    createdAt: new Date(),
                    history: []
                })
                .then(function (response) {
                    /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
                    alert('Link verifikasi akun telah dikirim kepada email anda!')
                    navigate('/verify', { replace: true })
                })
                .catch(function (error) {
                    console.log(error.response ? error.response.status : error);
                });
            })
            .catch(error => console.log(error.response ? error.response.status : error))
        })
        .catch(function (e) {
            if(e.response && e.response.status === 409){
                setEmailIsValid(false)
            }
            else{
                alert('Oops ada error!')
            }
        });
    }

    const validateUsername = (username) =>{
        if(username.length < 3 && username){
            setUsernameMsg('Panjang username tidak boleh kurang dari 3!')
        }
        else{
            setUsernameMsg(null)
        }
    }

    const validatePassword = (password) =>{
        if(password.length < 8 && password){
            setPasswordMsg('Panjang kata sandi tidak boleh kurang dari 8!')
        }
        else{
            setPasswordMsg(null)
        }
    }

    const validateSamePassword = (password, password2) =>{
        if(password === password2 || password2 === ''){
            setPassword2Msg(null)
        }
        else{
            setPassword2Msg('Kata Sandi tidak cocok!')
        }
    }

    useEffect(() => {
        verifyToken();
    }, []);
    
    return(
        <div className="position-relative d-flex justify-content-center align-items-center py-5" style={{minHeight: '100vh', backgroundColor: 'var(--bg-main)'}}>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            <Container className="position-relative" style={{zIndex: 2, maxWidth: '450px'}}>
                <div className="glass-panel auth-card p-4 p-sm-5">
                    <h3 className="text-center fw-bold mb-4">Buat Akun Baru</h3>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control 
                                type="text" 
                                className="form-input-custom" 
                                onChange={(e)=>{setUsername(e.target.value)}} 
                                onBlur={()=>{validateUsername(username)}}  
                                value={username} 
                            />
                            {usernameMsg && <Form.Text className="text-danger d-block mt-1">{usernameMsg}</Form.Text>}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Kata Sandi</Form.Label>
                            <Form.Control 
                                type="password" 
                                className="form-input-custom" 
                                onChange={(e)=>{setPassword(e.target.value)}} 
                                onBlur={()=>{validatePassword(password)}} 
                                value={password} 
                            />
                            {passwordMsg && <Form.Text className="text-danger d-block mt-1">{passwordMsg}</Form.Text>}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword2" onBlur={()=>{validateSamePassword(password, password2)}}>
                            <Form.Label>Ketik Ulang Kata Sandi</Form.Label>
                            <Form.Control 
                                type="password" 
                                className="form-input-custom" 
                                onChange={(e)=>{setPassword2(e.target.value)}} 
                                value={password2} 
                            />
                            {password2Msg && <Form.Text className="text-danger d-block mt-1">{password2Msg}</Form.Text>}
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                className="form-input-custom" 
                                onChange={(e)=>{setEmail(e.target.value)}} 
                                value={email} 
                            />
                            {emailIsValid === true && correctEmailFormat && <Form.Text className="text-success d-block mt-1">Email bisa digunakan!</Form.Text>}
                            {emailIsValid === false && correctEmailFormat && <Form.Text className="text-danger d-block mt-1">Email sudah diambil!</Form.Text>}
                            {!correctEmailFormat && <Form.Text className="text-danger d-block mt-1">Format Email salah!</Form.Text>}
                        </Form.Group>
                
                        <Button className="btn-success-glow w-100 py-2 fs-5" type="button" onClick={()=>{handleRegister(email)}}>
                            Daftar Sekarang
                        </Button>
                    </Form>
                    <p className='mt-4 text-center text-white-50 mb-0'>
                        Sudah punya akun? <Link to='/login' className='text-decoration-none text-info fw-semibold'>Login disini</Link>
                    </p>
                    <p className='mt-3 text-center mb-0'>
                        <Link to='/' className='text-decoration-none text-white-50 small'><i className="bi bi-arrow-left"></i> Kembali ke Beranda</Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}

export default Register;
