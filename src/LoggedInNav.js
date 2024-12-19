import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, NavLink } from 'react-router-dom';
import { Button, NavDropdown } from 'react-bootstrap';
import axios from 'axios';
import { useState } from 'react';
import './Navapp.css';

function LoggedInNav(props){
    const [show, setShow] = useState(false);
    const showDropdown = (e)=>{
        setShow(!show);
    }
    const hideDropdown = e => {
        setShow(false);
    }
    const manageShow = () =>{
        setShow(!show)
    }

    const handleLogout = () =>{
        axios.get('/api/logout', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
        })
        .catch(function (error) {
            alert(error.response.data)
            console.log(error.response.status);
        });
    }

    return (
        <Navbar className="bg-black">
            <Container>
                <Navbar.Brand><Link to='/' className='text-decoration-none text-white navbar-title fs-5'>KuisAnak</Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Navbar.Text><NavLink to='/quiz' className='text-white text-decoration-none nav-text'>Kuis</NavLink></Navbar.Text>
                    <NavDropdown title={<span className='text-white'>Fakta</span>} id="collapsible-nav-dropdown" show={show} onMouseEnter={showDropdown} onMouseLeave={hideDropdown} onClick={manageShow}>
                        <NavDropdown.Item><Link to='/fakta-binatang' className='text-decoration-none text-black'>Binatang</Link></NavDropdown.Item>
                        <NavDropdown.Item><Link to='/fakta-angkasa' className='text-decoration-none text-black'>Angkasa</Link></NavDropdown.Item>
                        <NavDropdown.Item><Link to='/fakta-sejarah' className='text-decoration-none text-black'>Sejarah</Link></NavDropdown.Item>
                    </NavDropdown>
                    <NavLink to = '/login'><Button variant="danger" onClick={handleLogout}>Logout</Button></NavLink>
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default LoggedInNav;
