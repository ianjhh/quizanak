import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, NavLink } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import './Navapp.css';

function LoggedInNav(props){

    const handleLogout = () =>{
        axios.get('/http://localhost:5000/logout', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    return (
        <Navbar className="bg-black">
            <Container>
                <Navbar.Brand><Link to='/' className='text-decoration-none text-info'>QuizAnak</Link></Navbar.Brand>
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
                    <NavLink to = '/login'><Button variant="danger" className='login-button' onClick={handleLogout}>Logout</Button></NavLink>
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default LoggedInNav;