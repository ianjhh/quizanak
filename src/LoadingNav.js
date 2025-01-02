function LoadingNav(){
  return(
    <>
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
                    <Placeholder.Button variant="primary" xs={5} />
                </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </>
  )
}

export default LoadingNav;
