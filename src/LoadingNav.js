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
                <Placeholder as={Navbar.Brand} animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                    <Placeholder as={Navbar.Text} animation="glow">
                      <Placeholder xs={3} /><Placeholder xs={3} />
                    </Placeholder>
                    <Placeholder.Button variant="primary" xs={5} animation="glow" />
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </>
  )
}

export default LoadingNav;
