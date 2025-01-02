import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Button, NavDropdown } from 'react-bootstrap';
import './Navapp.css';
import Placeholder from 'react-bootstrap/Placeholder';
import PlaceholderButton from 'react-bootstrap/PlaceholderButton'
import { Link, NavLink } from 'react-router-dom';

function LoadingNav(){
  return(
    <>
        <Navbar className="bg-black">
            <Container>
                <Navbar.Brand><Link className='text-decoration-none text-white navbar-title fs-5'>KuisAnak</Link></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Navbar.Text className='text-white nav-text'>Kuis</Navbar.Text>
                    <NavDropdown title={<span className='text-white'>Fakta</span>} id="collapsible-nav-dropdown">
                        <NavDropdown.Item className='text-black'>Binatang</NavDropdown.Item>
                        <NavDropdown.Item className='text-black'>Angkasa</NavDropdown.Item>
                        <NavDropdown.Item className='text-black'>Sejarah</NavDropdown.Item>
                    </NavDropdown>
                    <PlaceholderButton variant="secondary" xs={12} animation="wave" />
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </>
  )
}

export default LoadingNav;
