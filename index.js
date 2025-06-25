// Memanggil semua library yang dibutuhkan
const express = require('express');
const fetch = require('node-fetch'); // Untuk mengambil gambar di proxy
const { URL } = require('url'); // Untuk keamanan di proxy

// Membuat aplikasi express
const app = express();


// --- RUTE API ANDA DENGAN PERBAIKAN CORS MANUAL DI DALAMNYA ---

// Rute untuk membuat pembayaran (createpayment)
app.get('/orderkuota/createpayment', (req, res) => {
    // --- HEADER CORS MANUAL DITAMBAHKAN DI SINI ---
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Logika asli Anda untuk membuat pembayaran
    const { apikey, amount, codeqr } = req.query;
    if (!apikey || !amount || !codeqr) {
        return res.status(400).json({ status: false, message: "Parameter tidak lengkap." });
    }
    
    // Ini adalah contoh respons sukses. Pastikan logika asli Anda berjalan
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
app.get('/orderkuota/cekstatus', (req, res) => {
    // --- HEADER CORS MANUAL DITAMBAHKAN DI SINI ---
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Logika Anda untuk mengecek status
    const { apikey, merchant, keyorkut } = req.query;
    // ...logika Anda...
    res.json({ status: true, message: "Contoh respons cek status" });
});


// Rute untuk proxy gambar
app.get('/api/qris-proxy', async (req, res) => {
    // --- HEADER CORS MANUAL DITAMBAHKAN DI SINI ---
    res.setHeader('Access-Control-Allow-Origin', '*');
  
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


// Mengekspor aplikasi agar Vercel bisa menjalankannya dengan benar
module.exports = app;
