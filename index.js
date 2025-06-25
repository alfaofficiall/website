// Memanggil semua library yang dibutuhkan
const express = require('express');
const cors = require('cors'); // Untuk memberikan izin CORS
const fetch = require('node-fetch'); // Untuk mengambil gambar di proxy
const { URL } = require('url'); // Untuk keamanan di proxy

// Membuat aplikasi express
const app = express();

// --- INI BAGIAN PENTING UNTUK MEMBERI IZIN KE WEBSITE ANDA ---
// Menggunakan 'cors' sebagai middleware. Ini akan mengizinkan semua permintaan
// dari domain manapun, menyelesaikan masalah "Permintaan Lintas Asal Diblokir".
app.use(cors());


// --- RUTE API ANDA ---

// Rute untuk membuat pembayaran (createpayment)
// Ini adalah logika utama Anda, tidak ada yang diubah
app.get('/orderkuota/createpayment', (req, res) => {
    // Di sini seharusnya ada logika Anda untuk memanggil
    // penyedia layanan QRIS dan mendapatkan hasilnya.
    // Untuk contoh, kita akan kirimkan data dummy yang mirip.
    // GANTI INI DENGAN LOGIKA ASLI ANDA
    const { apikey, amount, codeqr } = req.query;
    if (!apikey || !amount || !codeqr) {
        return res.status(400).json({ status: false, message: "Parameter tidak lengkap." });
    }
    
    // Data dummy yang meniru respons asli Anda
    const responseSukses = {
        status: true,
        creator: "ALFA OFFICIA",
        result: {
            idtransaksi: "TRX" + Math.random().toString(36).substr(2, 9).toUpperCase(),
            jumlah: amount,
            expired: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            imageqris: {
                url: "https://img1.pixhost.to/images/6751/615257491_alfa.png" // Contoh URL Gambar
            }
        }
    };
    res.json(responseSukses);
});

// Rute untuk mengecek status pembayaran (cekstatus)
// Ini adalah logika utama Anda, tidak ada yang diubah
app.get('/orderkuota/cekstatus', (req, res) => {
    // Logika Anda untuk mengecek status
    const { apikey, merchant, keyorkut } = req.query;
    // ...logika Anda...
    res.json({ status: true, message: "Contoh respons cek status" });
});


// Rute untuk proxy gambar, untuk menghindari CORS dari server gambar
app.get('/api/qris-proxy', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send('Parameter URL gambar tidak ditemukan.');
    }

    const allowedHostnames = ['img1.pixhost.to', 'i.pxhost.to', 'imqi.pxhost.to'];
    const parsedUrl = new URL(imageUrl);
    if (!allowedHostnames.includes(parsedUrl.hostname)) {
        return res.status(403).send('Akses ke domain ini tidak diizinkan oleh proxy.');
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Gagal mengambil gambar: ${imageResponse.statusText}`);
    }

    const contentType = imageResponse.headers.get('content-type');
    res.setHeader('Content-Type', contentType);
    imageResponse.body.pipe(res);

  } catch (error) {
    console.error('Error di proxy gambar:', error);
    res.status(500).send('Terjadi kesalahan saat memproses gambar.');
  }
});


// Mengekspor aplikasi agar Vercel bisa menjalankannya
module.exports = app;
