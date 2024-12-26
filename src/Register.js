import { Container } from "react-bootstrap";
import { Form,Button } from "react-bootstrap";
import { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import bcrypt from 'bcryptjs';

function Register(props){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [usernameMsg, setUsernameMsg] = useState(null);
    const [passwordMsg, setPasswordMsg] = useState(null);
    const [password2Msg, setPassword2Msg] = useState(null);
    const [emailMsg, setEmailMsg] = useState(null);
    const [email, setEmail] = useState("");
    const [emailIsValid, setEmailIsValid] = useState(null);
    const [bloomFilter, setBloomFilter] = useState(null);
    const [correctEmailFormat, setCorrectEmailFormat] = useState(true);
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
            console.log(error.response.status)
        });
    }

    const validateEmailFormat = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const handleRegister = () =>{
        const saltRounds = 11;

        if(emailIsValid === null){
            if (!validateEmail(email)){
                alert('Input tidak valid')
                return;
            }
        }

        if (username.length < 3 || password.length < 8 || password !== password2 || !correctEmailFormat || (emailIsValid!==null && !emailIsValid)){
            alert('Input tidak valid')
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
            navigate('/verify')
        })
        .catch(function (error) {
            console.log(error.response.status);
        });
      })
      .catch(error => console.log(error.response.status))
    }

    const validateEmail = (email) =>{
        let validEmail = validateEmailFormat(email)

        if(!validEmail){
            setCorrectEmailFormat(false)
            return false;
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
            return true;
        })
        .catch(function (e) {
            if(e.response && e.response.status === 409){
                setEmailIsValid(false)
                return false;
            }
            else{
                alert('Oops ada error!')
                return false;
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
    
    return(
        <Container className="mt-5 col-10 col-sm-7 col-lg-4 col-xl-3">
        <div className="shadow-sm p-3 rounded bg-white">
            <h3 className="text-center">Registrasi akun</h3>
            <br />
            <Form>
            <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" onChange={(e)=>{setUsername(e.target.value)}} onBlur={()=>{validateUsername(username)}}  value={username} />
                <Form.Text className="text-danger">{usernameMsg}</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Kata Sandi</Form.Label>
                <Form.Control type="password" onChange={(e)=>{setPassword(e.target.value)}} onBlur={()=>{validatePassword(password)}} value={password} />
                <Form.Text className="text-danger">{passwordMsg}</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword2" onBlur={()=>{validateSamePassword(password, password2)}}>
                <Form.Label>Ketik Ulang Kata Sandi</Form.Label>
                <Form.Control type="password" onChange={(e)=>{setPassword2(e.target.value)}} value={password2} />
                <Form.Text className="text-danger">{password2Msg}</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" onChange={(e)=>{setEmail(e.target.value)}} onBlur={()=>{validateEmail(email)}} value={email} />
                {emailIsValid === true && correctEmailFormat? <Form.Text className="text-success">Email bisa digunakan!</Form.Text> : (emailIsValid === false && correctEmailFormat? <Form.Text className="text-danger">Email sudah diambil!</Form.Text> : (!correctEmailFormat? <Form.Text className="text-danger">Format Email salah!</Form.Text> : null))}
            </Form.Group>
    
            <Button variant="primary" type="button" onClick={handleRegister}>Daftar</Button>
            </Form>
        </div>
        </Container>
    );
}

export default Register;
