// Starter content for a new database: a few quizzes per category and one
// article per fact category. Image names refer to src/assets/images/<name>.jpg.

// Builds 10 arithmetic questions with three nearby wrong answers each.
function arithmeticQuestions(symbol, pairs, solve) {
  return pairs.map(([a, b]) => {
    const answer = solve(a, b);
    const options = [answer, answer + 1, answer - 1, answer + 10]
      .map(String)
      // Rotate so the right answer is not always first.
      .sort((x, y) => ((Number(x) * 7 + a) % 5) - ((Number(y) * 7 + a) % 5));
    return { question: `Berapa hasil dari ${a} ${symbol} ${b}?`, options, answer: String(answer) };
  });
}

const quizzes = [
  {
    name: 'penjumlahan',
    title: 'Penjumlahan',
    description: 'Latihan menjumlahkan angka sampai 20.',
    category: 'math',
    difficulty: 'mudah',
    quizImage: 'penjumlahan',
    array: arithmeticQuestions('+', [[2, 3], [4, 5], [7, 1], [6, 6], [8, 4], [9, 3], [5, 7], [10, 6], [11, 8], [12, 7]], (a, b) => a + b),
  },
  {
    name: 'pengurangan',
    title: 'Pengurangan',
    description: 'Latihan mengurangi angka sampai 20.',
    category: 'math',
    difficulty: 'mudah',
    quizImage: 'pengurangan',
    array: arithmeticQuestions('-', [[5, 2], [9, 4], [8, 8], [12, 5], [15, 7], [20, 10], [14, 6], [18, 9], [17, 3], [16, 11]], (a, b) => a - b),
  },
  {
    name: 'binatang-laut',
    title: 'Binatang Laut',
    description: 'Seberapa kenal kamu dengan hewan-hewan di laut?',
    category: 'animal',
    difficulty: 'mudah',
    quizImage: 'binatang-laut1',
    array: [
      { question: 'Hewan laut apa yang punya delapan lengan?', options: ['Gurita', 'Bintang laut', 'Kepiting', 'Paus'], answer: 'Gurita' },
      { question: 'Hewan terbesar di dunia adalah ...', options: ['Hiu paus', 'Gajah', 'Paus biru', 'Lumba-lumba'], answer: 'Paus biru' },
      { question: 'Ikan bernapas menggunakan ...', options: ['Paru-paru', 'Insang', 'Kulit', 'Hidung'], answer: 'Insang' },
      { question: 'Hewan laut bertubuh seperti jeli yang bisa menyengat adalah ...', options: ['Ubur-ubur', 'Kerang', 'Udang', 'Penyu'], answer: 'Ubur-ubur' },
      { question: 'Lumba-lumba termasuk kelompok hewan ...', options: ['Ikan', 'Reptil', 'Mamalia', 'Amfibi'], answer: 'Mamalia' },
      { question: 'Kepiting biasanya berjalan ke arah ...', options: ['Depan', 'Belakang', 'Samping', 'Atas'], answer: 'Samping' },
      { question: 'Hewan laut yang bentuknya seperti bintang adalah ...', options: ['Bintang laut', 'Kuda laut', 'Cumi-cumi', 'Anemon'], answer: 'Bintang laut' },
      { question: 'Penyu termasuk kelompok hewan ...', options: ['Mamalia', 'Ikan', 'Reptil', 'Burung'], answer: 'Reptil' },
      { question: 'Makanan utama hiu paus adalah ...', options: ['Plankton', 'Anjing laut', 'Rumput laut', 'Batu karang'], answer: 'Plankton' },
      { question: 'Pada kuda laut, yang mengandung telur sampai menetas adalah ...', options: ['Induk betina', 'Induk jantan', 'Anaknya', 'Ikan lain'], answer: 'Induk jantan' },
    ],
  },
  {
    name: 'binatang-darat',
    title: 'Binatang Darat',
    description: 'Tebak hewan-hewan yang hidup di darat.',
    category: 'animal',
    difficulty: 'mudah',
    quizImage: 'binatang-darat1',
    array: [
      { question: 'Hewan yang dijuluki raja hutan adalah ...', options: ['Harimau', 'Singa', 'Gajah', 'Serigala'], answer: 'Singa' },
      { question: 'Hewan dengan leher paling panjang adalah ...', options: ['Jerapah', 'Unta', 'Kuda', 'Zebra'], answer: 'Jerapah' },
      { question: 'Gajah mengambil makanan dengan ...', options: ['Ekor', 'Telinga', 'Belalai', 'Kaki'], answer: 'Belalai' },
      { question: 'Hewan bertelinga panjang yang suka wortel adalah ...', options: ['Kucing', 'Kelinci', 'Tikus', 'Kambing'], answer: 'Kelinci' },
      { question: 'Komodo hanya hidup secara alami di negara ...', options: ['Australia', 'India', 'Indonesia', 'Brasil'], answer: 'Indonesia' },
      { question: 'Hewan darat tercepat adalah ...', options: ['Cheetah', 'Kuda', 'Singa', 'Rusa'], answer: 'Cheetah' },
      { question: 'Unta bisa bertahan lama tanpa minum dan hidup di ...', options: ['Kutub', 'Gurun', 'Hutan hujan', 'Laut'], answer: 'Gurun' },
      { question: 'Hewan berbulu putih yang hidup di Kutub Utara adalah ...', options: ['Panda', 'Beruang kutub', 'Penguin', 'Serigala abu-abu'], answer: 'Beruang kutub' },
      { question: 'Warna garis-garis pada zebra adalah ...', options: ['Cokelat kuning', 'Hitam putih', 'Merah putih', 'Abu-abu'], answer: 'Hitam putih' },
      { question: 'Kanguru membawa anaknya di dalam ...', options: ['Mulut', 'Sarang', 'Kantong', 'Punggung'], answer: 'Kantong' },
    ],
  },
  {
    name: 'kata-inggris',
    title: 'Kata Bahasa Inggris',
    description: 'Apa bahasa Inggris dari kata-kata ini?',
    category: 'language',
    difficulty: 'mudah',
    quizImage: 'img_katainggris',
    array: [
      ['kucing', 'cat', ['dog', 'cow', 'bird']],
      ['anjing', 'dog', ['cat', 'fish', 'horse']],
      ['rumah', 'house', ['school', 'car', 'tree']],
      ['buku', 'book', ['pen', 'bag', 'table']],
      ['air', 'water', ['fire', 'milk', 'rice']],
      ['matahari', 'sun', ['moon', 'star', 'cloud']],
      ['apel', 'apple', ['orange', 'banana', 'grape']],
      ['merah', 'red', ['blue', 'green', 'yellow']],
      ['sekolah', 'school', ['house', 'market', 'park']],
      ['burung', 'bird', ['fish', 'frog', 'snake']],
    ].map(([word, answer, others], index) => {
      const options = [...others];
      options.splice(index % 4, 0, answer);
      return { question: `Apa bahasa Inggris dari kata '${word}'?`, options, answer };
    }),
  },
  {
    name: 'warna',
    title: 'Warna',
    description: 'Kenali warna dan campuran warna.',
    category: 'miscellaneous',
    difficulty: 'mudah',
    quizImage: 'warna',
    array: [
      { question: 'Warna langit saat cerah adalah ...', options: ['Biru', 'Merah', 'Hitam', 'Ungu'], answer: 'Biru' },
      { question: 'Campuran merah dan kuning menjadi ...', options: ['Hijau', 'Oranye', 'Ungu', 'Cokelat'], answer: 'Oranye' },
      { question: 'Campuran biru dan kuning menjadi ...', options: ['Ungu', 'Oranye', 'Hijau', 'Merah muda'], answer: 'Hijau' },
      { question: 'Campuran merah dan biru menjadi ...', options: ['Ungu', 'Hijau', 'Kuning', 'Abu-abu'], answer: 'Ungu' },
      { question: 'Campuran merah dan putih menjadi ...', options: ['Oranye', 'Merah muda', 'Cokelat', 'Biru muda'], answer: 'Merah muda' },
      { question: 'Warna pisang yang sudah matang adalah ...', options: ['Hijau', 'Merah', 'Kuning', 'Biru'], answer: 'Kuning' },
      { question: 'Warna salju adalah ...', options: ['Putih', 'Biru', 'Abu-abu', 'Kuning'], answer: 'Putih' },
      { question: 'Warna bendera Indonesia adalah ...', options: ['Merah dan putih', 'Merah dan biru', 'Hijau dan putih', 'Kuning dan merah'], answer: 'Merah dan putih' },
      { question: 'Warna daun yang masih segar biasanya ...', options: ['Cokelat', 'Hijau', 'Ungu', 'Oranye'], answer: 'Hijau' },
      { question: 'Warna arang adalah ...', options: ['Putih', 'Merah', 'Hitam', 'Kuning'], answer: 'Hitam' },
    ],
  },
];

const animalFacts = [
  {
    link_name: 'fakta-kucing',
    title: 'Fakta Kucing',
    image: 'faktakucing',
    factsarr: [
      ['Kucing tidur sekitar 12 sampai 16 jam setiap hari.', 'faktakucing1'],
      ['Kumis kucing membantu mereka memperkirakan apakah tubuhnya muat melewati sebuah celah.', 'faktakucing2'],
      ['Kucing tidak bisa merasakan rasa manis.', 'faktakucing3'],
      ['Pola garis di hidung setiap kucing berbeda-beda, seperti sidik jari manusia.', 'faktakucing4'],
      ['Kucing bisa melompat sampai sekitar enam kali panjang tubuhnya.', 'faktakucing5'],
    ],
  },
];

const spaceFacts = [
  {
    link_name: 'fakta-mars',
    title: 'Fakta Mars',
    image: 'mars',
    factsarr: [
      ['Mars disebut Planet Merah karena tanahnya banyak mengandung karat besi.', 'mars1'],
      ['Olympus Mons di Mars adalah gunung tertinggi di tata surya kita.', 'mars6'],
      ['Satu hari di Mars lamanya sekitar 24 jam 37 menit, hampir sama dengan di Bumi.', 'mars3'],
      ['Mars punya dua bulan kecil bernama Phobos dan Deimos.', 'mars4'],
      ['Seperti Bumi, Mars punya lapisan es di kutub utara dan kutub selatannya.', 'mars9'],
    ],
  },
];

const historyFacts = [
  {
    link_name: 'fakta-aneh-tapi-nyata',
    title: 'Fakta Aneh tapi Nyata',
    image: 'faktaaneh',
    factsarr: [
      ['Madu yang disimpan dengan baik hampir tidak pernah basi. Madu berumur ribuan tahun pernah ditemukan di makam Mesir kuno.', 'faktaaneh1'],
      ['Gurita punya tiga jantung dan darahnya berwarna biru.', 'faktaaneh2'],
      ['Menurut ilmu tumbuhan, pisang termasuk buah beri, tetapi stroberi tidak.', 'faktaaneh3'],
      ['Menara Eiffel bisa bertambah tinggi sekitar 15 cm saat musim panas karena besinya memuai.', 'faktaaneh4'],
      ['Beberapa jenis siput bisa tidur sampai tiga tahun untuk bertahan di cuaca kering.', 'faktaaneh5'],
    ],
  },
];

module.exports = { quizzes, animalFacts, spaceFacts, historyFacts };
