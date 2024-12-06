import Footer from './Footer';
import { Container, Row } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import axios from 'axios';
import LoggedInNav from './LoggedInNav';
import Navapp from './Navapp';

function AboutUs(){
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const verifyToken = () =>{
        axios.get('/api/verifyToken', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.data.verified === true){
                navigate('/')
            }
            else{
                navigate('/verify')
            }
        })
        .catch(function (error) {
            console.log('Error!')
        });
    }

    useEffect(()=>{verifyToken();}, [])

    return(
        <>
        {isLoggedIn? <LoggedInNav /> : <Navapp />}
        <div>
            <br/>
            <Container>
                <Row>
                <h4><b>Tentang Kami</b></h4>
                <div className='col-7'>
                <p>Kami adalah tim mahasiswa yang senang membuat situs web di waktu luang kami. Kami membuat situs ini dengan tujuan menyediakan kuis pendidikan untuk anak-anak untuk membuat setiap anak menjadi lebih pintar.</p>
                <h4><b>Kebijakan Privasi</b></h4>
                <p>Halaman ini digunakan untuk memberi tahu pengunjung situs web mengenai kebijakan kami dengan pengumpulan, penggunaan, dan pengungkapan Informasi Pribadi jika ada yang memutuskan untuk menggunakan Layanan kami
                Jika Anda memilih untuk menggunakan Layanan kami, maka Anda menyetujui pengumpulan dan penggunaan informasi sehubungan dengan kebijakan ini. Informasi Pribadi yang kami kumpulkan digunakan untuk menyediakan dan meningkatkan Layanan. Kami tidak akan menggunakan atau membagikan informasi Anda kepada siapa pun kecuali sebagaimana dijelaskan dalam Kebijakan Privasi ini.</p>
                <p><b>Pengumpulan dan Penggunaan Informasi</b><br/>
                Kami dapat mengumpulkan informasi melalui cookie atau weblog. Hal ini untuk membantu kami meningkatkan layanan kami melalui analitik.</p>
                <p><b>Data Log</b><br/>
                Kami ingin memberi tahu Anda bahwa setiap kali Anda mengunjungi Layanan kami, kami mengumpulkan informasi yang dikirimkan browser Anda kepada kami yang disebut Data Log. Data Log ini dapat mencakup informasi seperti alamat Protokol Internet ("IP") komputer Anda, versi browser, halaman Layanan kami yang Anda kunjungi, waktu dan tanggal kunjungan Anda, waktu yang dihabiskan di halaman tersebut, dan statistik lainnya.</p>
                <p><b>Cookies</b><br/>
                Cookies adalah file dengan sejumlah kecil data yang biasanya digunakan sebagai pengidentifikasi unik anonim. Ini dikirim ke browser Anda dari situs web yang Anda kunjungi dan disimpan di hard drive komputer Anda.
                Situs web kami menggunakan "cookie" ini untuk mengumpulkan informasi dan meningkatkan Layanan kami. Anda mempunyai pilihan untuk menerima atau menolak cookie ini, dan mengetahui kapan cookie dikirim ke komputer Anda.</p>
                <p><b>Penyedia Layanan</b><br/>
                Kami dapat mempekerjakan perusahaan dan individu pihak ketiga karena alasan berikut:<br/>
                Untuk memfasilitasi Layanan kami;<br/>
                Untuk menyediakan Layanan atas nama kami;<br/>
                Untuk melakukan layanan terkait Layanan; atau<br/>
                Untuk membantu kami menganalisis bagaimana Layanan kami digunakan.<br/>
                Kami ingin memberi tahu pengguna Layanan kami bahwa pihak ketiga ini memiliki akses ke Informasi Pribadi Anda. Alasannya adalah untuk melaksanakan tugas yang diberikan kepada mereka atas nama kita. Namun, mereka diwajibkan untuk tidak mengungkapkan atau menggunakan informasi tersebut untuk tujuan lain apa pun.</p>
                <p><b>Keamanan</b><br/>
                Kami menghargai kepercayaan Anda dalam memberikan Informasi Pribadi Anda kepada kami, oleh karena itu kami berupaya menggunakan cara yang dapat diterima secara komersial untuk melindunginya. Namun perlu diingat bahwa tidak ada metode transmisi melalui internet, atau metode penyimpanan elektronik yang 100% aman dan dapat diandalkan, dan kami tidak dapat menjamin keamanan mutlaknya.</p>
                <p><b>Privasi Anak</b><br/>
                Layanan kami tidak ditujukan kepada siapa pun yang berusia di bawah 13 tahun. Kami tidak dengan sengaja mengumpulkan informasi identitas pribadi dari anak-anak di bawah 13 tahun. Jika kami menemukan bahwa seorang anak di bawah 13 tahun telah memberi kami informasi pribadi, kami segera menghapusnya dari server kami. Jika Anda adalah orang tua atau wali dan Anda mengetahui bahwa anak Anda telah memberikan informasi pribadi kepada kami, silakan hubungi kami agar kami dapat melakukan tindakan yang diperlukan.</p>
                <p><b>Perubahan pada Kebijakan Privasi Ini</b><br/>
                Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Oleh karena itu, kami menyarankan Anda untuk meninjau halaman ini secara berkala untuk mengetahui adanya perubahan. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini. Perubahan ini berlaku segera setelah diposting di halaman ini.</p>
                </div>
                </Row>
            </Container>
            <Footer />
        </div>
        </>
    )
}

export default AboutUs;
