// --- PENGATURAN ---
const SETTINGS = {
  QRIS: {
    apikey: "alfa2025", 
    merchantId: "OK2385395", 
    keyorkut: "184646517465972242385395OKCTB1BFD496F29624C01FF8E5728CF69A17",
    qrisCode: "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214140263240266770303UMI51440014ID.CO.QRIS.WWW0215ID20253948029410303UMI5204481253033605802ID5919ANDI CALL OK23853956005BLORA61055821162070703A0163044FEE"
  },
  CHECK_INTERVAL_MS: 5000,
  NOMOR_ADMIN_WA: "6282226769163"
};

let pembayaranAktif = { status: false, amount: 0, transactionId: null, produk: null, interval: null, isPaid: false };

// --- Manajemen Modal ---
const modal = document.getElementById('qrisModal');
const semuaTombolBeli = document.querySelectorAll('.btn-buy-qris');
const tombolBatal = modal.querySelectorAll('.batal');

// Sembunyikan modal di awal untuk menghindari bug tampilan
document.addEventListener('DOMContentLoaded', () => {
  if(modal) {
    modal.style.display = 'none';
  }
});

semuaTombolBeli.forEach(tombol => {
  tombol.onclick = (e) => {
    e.preventDefault();
    const produk = tombol.getAttribute('data-produk');
    const harga = parseInt(tombol.getAttribute('data-harga'));
    
    pembayaranAktif.produk = produk;
    pembayaranAktif.amount = harga;
    pembayaranAktif.isPaid = false; 

    document.getElementById('detailProduk').innerHTML = `<p style="font-size:1.1em;"><strong>Produk:</strong><br>${produk}</p><h3 style="margin-top: 20px;">Harga: Rp ${harga.toLocaleString('id-ID')}</h3>`;
    tampilkanArea('konfirmasiArea');
    modal.style.display = "flex";
  };
});

tombolBatal.forEach(tombol => tombol.onclick = tutupModal);

function tutupModal() {
    modal.style.display = "none";
    if (pembayaranAktif.interval) clearInterval(pembayaranAktif.interval);
    pembayaranAktif.status = false;
}

function tampilkanArea(namaArea) {
    ['konfirmasiArea', 'qrisArea', 'suksesArea'].forEach(id => { document.getElementById(id).classList.add('hidden'); });
    document.getElementById(namaArea).classList.remove('hidden');
}

// --- Logika Pembayaran ---
document.getElementById('lanjutBayarBtn').onclick = async function () {
  tampilkanArea('qrisArea');
  document.getElementById('loadingText').classList.remove('hidden');
  document.getElementById('qrisImage').classList.add('hidden');
  document.getElementById('paymentInfo').classList.add('hidden');

  const { apikey, qrisCode } = SETTINGS.QRIS;
  const apiUrl = `https://alfaofficial.cloud/orderkuota/createpayment?apikey=${apikey}&amount=${pembayaranAktif.amount}&codeqr=${encodeURIComponent(qrisCode)}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const json = await res.json();
    if (!json?.result?.idtransaksi || !json?.result?.imageqris?.url) {
      throw new Error('Respons API tidak lengkap atau tidak valid.');
    }
    
    const data = json.result;
    pembayaranAktif.status = true;
    pembayaranAktif.transactionId = data.idtransaksi;
    
    document.getElementById('loadingText').classList.add('hidden');

    // MENGGUNAKAN PROXY UNTUK MENAMPILKAN GAMBAR DENGAN AMAN
    const qrisImageElement = document.getElementById("qrisImage");
    const imageUrlAsli = data.imageqris.url;
    const proxyImageUrl = `/api/qris-proxy?url=${encodeURIComponent(imageUrlAsli)}`;
    qrisImageElement.src = proxyImageUrl;
    
    qrisImageElement.onload = () => {
        qrisImageElement.style.display = 'block';
        document.getElementById('paymentInfo').classList.remove('hidden');
    };
    
    qrisImageElement.onerror = () => {
        console.error("Gagal memuat gambar via proxy. Pastikan endpoint /api/qris-proxy ada di backend dan berfungsi.");
        document.getElementById('loadingText').classList.remove('hidden');
        document.getElementById('loadingText').innerHTML = 'Gagal memuat gambar QRIS.';
    };
    
    document.getElementById("paymentInfo").innerHTML = `<strong>Produk:</strong> ${pembayaranAktif.produk}<br><strong>ID Transaksi:</strong> ${data.idtransaksi}<br><strong>Jumlah:</strong> Rp ${pembayaranAktif.amount.toLocaleString('id-ID')}`;
    
    pembayaranAktif.interval = setInterval(cekStatusPembayaran, SETTINGS.CHECK_INTERVAL_MS);
  } catch (err) {
    console.error("Error saat membuat pembayaran:", err);
    document.getElementById('loadingText').innerHTML = 'Gagal membuat pembayaran. Cek konsol browser (F12) untuk detail error.';
    setTimeout(tutupModal, 4000);
  }
};

// --- LOGIKA CEK STATUS PEMBAYARAN ---
async function cekStatusPembayaran() {
  if (!pembayaranAktif.status || pembayaranAktif.isPaid) {
      return clearInterval(pembayaranAktif.interval);
  }

  const { apikey, merchantId, keyorkut } = SETTINGS.QRIS;
  const apiUrl = `https://alfaofficial.cloud/orderkuota/cekstatus?apikey=${apikey}&merchant=${merchantId}&keyorkut=${keyorkut}`;

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    
    if (json?.result && json.result.amount == pembayaranAktif.amount) {
      if (pembayaranAktif.status && !pembayaranAktif.isPaid) {
          console.log("Transaksi dengan jumlah yang cocok ditemukan! Menganggap pembayaran berhasil.");
          
          pembayaranAktif.isPaid = true; 
          pembayaranAktif.status = false;
          clearInterval(pembayaranAktif.interval);
          
          tampilkanArea('suksesArea');
          document.getElementById("suksesInfo").innerHTML = `<strong>Produk:</strong> ${pembayaranAktif.produk}<br><strong>ID Transaksi:</strong> ${pembayaranAktif.transactionId}<br><strong>Jumlah Dibayar:</strong> Rp ${pembayaranAktif.amount.toLocaleString('id-ID')}`;

          const pesanWA = `Halo Admin, saya telah berhasil melakukan pembayaran untuk:\n\nProduk: *${pembayaranAktif.produk}*\nID Transaksi: *${pembayaranAktif.transactionId}*\nJumlah: *Rp ${pembayaranAktif.amount.toLocaleString('id-ID')}*\n\nMohon untuk segera diproses. Terima kasih.`;
          const urlWA = `https://wa.me/${SETTINGS.NOMOR_ADMIN_WA}?text=${encodeURIComponent(pesanWA)}`;
          document.getElementById('kirimBuktiBtn').onclick = () => window.open(urlWA, '_blank');
      }
    } else {
      console.log(`Mencari transaksi dengan jumlah Rp ${pembayaranAktif.amount}... Belum ditemukan.`);
    }
  } catch (err) {
    console.error("Gagal cek status:", err);
  }
}
