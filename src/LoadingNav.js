import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Button, NavDropdown } from 'react-bootstrap';
import './Navapp.css';
import Placeholder from 'react-bootstrap/Placeholder';

function LoadingNav(){
  return(
    <>
        <Navbar className="bg-black">
            <Container>
                <Navbar.Brand className='text-white navbar-title fs-5'>KuisAnak</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Placeholder animation="glow">
                      <Placeholder xs={5} /><Placeholder xs={5} />
                    </Placeholder>
                    <Placeholder.Button variant="primary" xs={10} />
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </>
  )
}

export default LoadingNav;
