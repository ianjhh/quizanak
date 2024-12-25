import { Link } from "react-router-dom";
import './Footer.css';

function Footer(props){
    return(
        <>
        <footer className="bg-black text-white py-3">
            <ul className="nav justify-content-center border-bottom pb-3 mb-3">
                <li className="nav-item footer-text"><Link to='/' className="px-2 text-white text-decoration-none">home</Link></li>
                <li className="nav-item footer-text"><Link to='/about-us' className="px-2 text-white text-decoration-none">tentang kami</Link></li>
                <li className="nav-item footer-text"><Link to='/sitemap' className="px-2 text-white text-decoration-none">sitemap</Link></li>
                <li className="nav-item footer-text"><Link to='/about-us' className="px-2 text-white text-decoration-none">kebijakan privasi</Link></li>
            </ul>
            <p className="text-center text-white">© 2024 KuisAnak, Inc</p>
        </footer>
        </>
    );
}

export default Footer;
