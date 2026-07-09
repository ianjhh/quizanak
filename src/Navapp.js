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
        <Navbar expand="lg" className="glass-navbar" variant="dark">
            <Container>
                <Navbar.Brand>
                    <Link to='/' className='text-decoration-none navbar-title'>KuisAnak</Link>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Nav className="align-items-center">
                        <Nav.Link as={NavLink} to='/quiz' className='nav-link-custom text-white me-3'>Kuis</Nav.Link>
                        <NavDropdown 
                            title={<span className='text-white dropdown-toggle-custom'>Fakta</span>} 
                            id="collapsible-nav-dropdown" 
                            show={show} 
                            onMouseEnter={showDropdown} 
                            onMouseLeave={hideDropdown} 
                            onClick={manageShow}
                            className="me-3"
                            menuVariant="dark"
                            renderMenuOnMount={true}
                        >
                            <div className="dropdown-menu-custom">
                                <NavDropdown.Item as={Link} to='/fakta-binatang' className='dropdown-item-custom'>Binatang</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to='/fakta-angkasa' className='dropdown-item-custom'>Angkasa</NavDropdown.Item>
                                <NavDropdown.Item as={Link} to='/fakta-aneh' className='dropdown-item-custom'>Sejarah</NavDropdown.Item>
                            </div>
                        </NavDropdown>
                        <Nav.Item className="d-flex align-items-center">
                            <Link to='/login' className="text-decoration-none">
                                <Button className="btn-primary-glow nav-btn me-2">Login</Button>
                            </Link>
                            <Link to='/register' className="text-decoration-none register-button">
                                <Button className="btn-success-glow nav-btn">Register</Button>
                            </Link>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default Navapp;
