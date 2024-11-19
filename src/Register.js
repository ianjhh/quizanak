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
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleRegister = () =>{
        const saltRounds = 11;
        const staticText = 'Hf82c36rZnDKWa';

        if (username.length < 6 || password.length < 8){
            alert('Invalid input!')
            return;
        }

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
            verified: false
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            alert('Link verifikasi akun telah dikirim kepada email anda!')
            navigate('/')
        })
        .catch(function (error) {
            alert(error);
        });
      })
      .catch(err => console.error(err.message))
    }

    return(
        <Container className="w-25 mt-5">
        <div className="shadow-sm p-3 rounded bg-white">
            <h3 className="text-center">Registrasi akun</h3>
            <br />
            <Form>
            <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" onChange={(e)=>{setUsername(e.target.value)}} value={username} />
                {username.length < 6 && username? <Form.Text className="text-muted">Panjang username tidak boleh kurang dari 6!</Form.Text> : null}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Kata Sandi</Form.Label>
                <Form.Control type="password" onChange={(e)=>{setPassword(e.target.value)}} value={password} />
                {password.length < 8 && password? <Form.Text className="text-muted">Panjang kata sandi tidak boleh kurang dari 8!</Form.Text> : null}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword2">
                <Form.Label>Ketik Ulang Kata Sandi</Form.Label>
                <Form.Control type="password" onChange={(e)=>{setPassword2(e.target.value)}} value={password2} />
                {(password === password2) || password2 === ''? null : <Form.Text className="text-muted">Kata Sandi tidak cocok!</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" onChange={(e)=>{setEmail(e.target.value)}} value={email} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicCheckbox">
                <Form.Check type="checkbox" label="Remember Me" />
            </Form.Group>
            <Button variant="primary" type="button" onClick={handleRegister}>Daftar</Button>
            </Form>
        </div>
        </Container>
    );
}

export default Register;
