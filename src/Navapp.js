import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, NavLink } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import './Navapp.css';

function Navapp(props){
    return (
        <Navbar className="bg-black">
            <Container>
                <Navbar.Brand><Link to='/' className='text-decoration-none'>QuizAnak</Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Navbar.Text><NavLink to='/quiz' className='text-white text-decoration-none nav-text'>Quiz</NavLink></Navbar.Text>&nbsp;&nbsp;
                    <Navbar.Text><NavLink to='/games' className='text-white text-decoration-none nav-text'>Games</NavLink></Navbar.Text>&nbsp;&nbsp;
                    <div className="dropdown mt-2">
                    <Navbar.Text className="dropbtn text-white text-decoration-none nav-text">Fakta</Navbar.Text>&nbsp;&nbsp;
                    <div className="dropdown-content">
                        <Link to='/fakta-binatang'>Binatang</Link>
                        <Link to='/fakta-angkasa'>Angkasa</Link>
                        <Link to='/fakta-sejarah'>Sejarah</Link>
                    </div>
                    </div>
                    <Link to ='/register'><Button variant="success">Register</Button></Link>&nbsp;
                    <Link to ='/login'><Button variant="primary">Login</Button></Link>
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navapp;