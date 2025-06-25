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

let pembayaranAktif = { status: false, amount: 0, transactionId: null, produk: null, interval: null };

// --- Manajemen Modal ---
const modal = document.getElementById('qrisModal');
const semuaTombolBeli = document.querySelectorAll('.btn-buy-qris');
const tombolBatal = modal.querySelectorAll('.batal');

semuaTombolBeli.forEach(tombol => {
  tombol.onclick = (e) => {
    e.preventDefault();
    const produk = tombol.getAttribute('data-produk');
    const harga = parseInt(tombol.getAttribute('data-harga'));
    
    pembayaranAktif.produk = produk;
    pembayaranAktif.amount = harga;

    document.getElementById('detailProduk').innerHTML = `
        <p style="font-size:1.1em;"><strong>Produk:</strong><br>${produk}</p>
        <h3 style="margin-top: 20px;">Harga: Rp ${harga.toLocaleString('id-ID')}</h3>
    `;
    tampilkanArea('konfirmasiArea');
    modal.style.display = "block";
  };
});

tombolBatal.forEach(tombol => tombol.onclick = tutupModal);

function tutupModal() {
    modal.style.display = "none";
    if (pembayaranAktif.interval) clearInterval(pembayaranAktif.interval);
    pembayaranAktif.status = false;
}

function tampilkanArea(namaArea) {
    ['konfirmasiArea', 'qrisArea', 'suksesArea'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(namaArea).classList.remove('hidden');
}

// --- Logika Pembayaran ---
document.getElementById('lanjutBayarBtn').onclick = async function () {
  tampilkanArea('qrisArea');
  document.getElementById('loadingText').classList.remove('hidden');
  document.getElementById('qrisImage').classList.add('hidden');
  document.getElementById('paymentInfo').classList.add('hidden');

  const { apikey, qrisCode } = SETTINGS.QRIS;
  const apiUrl = `https://alfaofficial.cloud/orderkuota/createpayment?apikey=${apikey}&amount=${pembayaranAktif.amount}&codeqr=${qrisCode}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json?.result?.idtransaksi || !json?.result?.imageqris?.url) {
      throw new Error('Respons API tidak lengkap.');
    }

    const data = json.result;
    pembayaranAktif.status = true;
    pembayaranAktif.transactionId = data.idtransaksi;
    
    document.getElementById('loadingText').classList.add('hidden');
    document.getElementById("qrisImage").src = data.imageqris.url;
    document.getElementById("paymentInfo").innerHTML = `
      <strong>Produk:</strong> ${pembayaranAktif.produk}<br>
      <strong>ID Transaksi:</strong> ${data.idtransaksi}<br>
      <strong>Jumlah:</strong> Rp ${pembayaranAktif.amount.toLocaleString('id-ID')}
    `;
    document.getElementById('qrisImage').classList.remove('hidden');
    document.getElementById('paymentInfo').classList.remove('hidden');
    
    pembayaranAktif.interval = setInterval(cekStatusPembayaran, SETTINGS.CHECK_INTERVAL_MS);
  } catch (err) {
    console.error("Error saat membuat pembayaran:", err);
    document.getElementById('loadingText').innerHTML = 'Gagal membuat pembayaran. Silakan coba lagi.';
    setTimeout(tutupModal, 3000);
  }
};

async function cekStatusPembayaran() {
  if (!pembayaranAktif.status) return clearInterval(pembayaranAktif.interval);

  const { apikey, merchantId, keyorkut } = SETTINGS.QRIS;
  const apiUrl = `https://alfaofficial.cloud/orderkuota/cekstatus?apikey=${apikey}&merchant=${merchantId}&keyorkut=${keyorkut}&idtransaksi=${pembayaranAktif.transactionId}`;

  try {
    const res = await fetch(apiUrl);
    const json = await res.json();
    
    if (json?.result?.status === "PAID") {
      pembayaranAktif.status = false;
      clearInterval(pembayaranAktif.interval);
      
      tampilkanArea('suksesArea');
      document.getElementById("suksesInfo").innerHTML = `
        <strong>Produk:</strong> ${pembayaranAktif.produk}<br>
        <strong>ID Transaksi:</strong> ${pembayaranAktif.transactionId}<br>
        <strong>Jumlah Dibayar:</strong> Rp ${pembayaranAktif.amount.toLocaleString('id-ID')}
      `;

      const pesanWA = `Halo Admin, saya telah berhasil melakukan pembayaran untuk:\n\nProduk: *${pembayaranAktif.produk}*\nID Transaksi: *${pembayaranAktif.transactionId}*\nJumlah: *Rp ${pembayaranAktif.amount.toLocaleString('id-ID')}*\n\nMohon untuk segera diproses. Terima kasih.`;
      const urlWA = `https://wa.me/${SETTINGS.NOMOR_ADMIN_WA}?text=${encodeURIComponent(pesanWA)}`;
      document.getElementById('kirimBuktiBtn').onclick = () => window.open(urlWA, '_blank');

    } else {
      console.log("Menunggu pembayaran...");
    }
  } catch (err) {
    console.error("Gagal cek status:", err);
  }
}
