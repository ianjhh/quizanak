import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, NavLink } from 'react-router-dom';
import { Button, NavDropdown } from 'react-bootstrap';
import { useState } from 'react';
import './Navapp.css';

function Navapp(props){
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
    
    return (
        <Navbar className="bg-black">
            <Container>
                <Navbar.Brand><Link to='/' className='text-decoration-none'>KuisAnak</Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Navbar.Text><NavLink to='/quiz' className='text-white text-decoration-none nav-text'>Kuis</NavLink></Navbar.Text>&nbsp;&nbsp;
                    <Navbar.Text><NavLink to='/games' className='text-white text-decoration-none nav-text'>Games</NavLink></Navbar.Text>&nbsp;&nbsp;
                   <NavDropdown title={<span className='text-white'>Fakta</span>} id="collapsible-nav-dropdown" show={show} onMouseEnter={showDropdown} onMouseLeave={hideDropdown} onClick={manageShow}>
                        <NavDropdown.Item><Link to='/fakta-binatang' className='text-decoration-none text-black'>Binatang</Link></NavDropdown.Item>
                        <NavDropdown.Item><Link to='/fakta-angkasa' className='text-decoration-none text-black'>Angkasa</Link></NavDropdown.Item>
                        <NavDropdown.Item><Link to='/fakta-sejarah' className='text-decoration-none text-black'>Sejarah</Link></NavDropdown.Item>
                    </NavDropdown>
                    <Link to ='/register'><Button variant="success">Register</Button></Link>&nbsp;
                    <Link to ='/login'><Button variant="primary">Login</Button></Link>
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navapp;
