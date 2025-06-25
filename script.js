// KODE JAVASCRIPT UNTUK HALAMAN INI
       document.addEventListener('DOMContentLoaded', function() {
           const urlParams = new URLSearchParams(window.location.search);
           const produk = urlParams.get('produk');
           const amount = parseInt(urlParams.get('harga'));

           if (!produk || !amount) {
               document.body.innerHTML = "<h1>Data produk tidak valid. Silakan kembali ke halaman utama.</h1>";
               return;
           }
           
           buatPembayaran(produk, amount);
       });

       let paymentInterval;

       async function buatPembayaran(produk, amount) {
           const SETTINGS = {
               QRIS: { apikey: "alfa2025", qrisCode: "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214140263240266770303UMI51440014ID.CO.QRIS.WWW0215ID20253948029410303UMI5204481253033605802ID5919ANDI CALL OK23853956005BLORA61055821162070703A0163044FEE" },
           };

           const { apikey, qrisCode } = SETTINGS.QRIS;
           const apiUrl = `https://alfaofficial.cloud/orderkuota/createpayment?apikey=${apikey}&amount=${amount}&codeqr=${qrisCode}`;

           try {
               const res = await fetch(apiUrl);
               const json = await res.json();
               if (!json?.result?.idtransaksi || !json?.result?.imageqris?.url) throw new Error('Respons API tidak lengkap.');
               
               const data = json.result;
               
               document.getElementById('loadingText').classList.add('hidden');
               document.getElementById("qrisImage").src = data.imageqris.url;
               document.getElementById("paymentInfo").innerHTML = `<strong>Produk:</strong> ${produk}<br><strong>ID Transaksi:</strong> ${data.idtransaksi}<br><strong>Jumlah:</strong> Rp ${amount.toLocaleString('id-ID')}`;
               document.getElementById('qrisImage').classList.remove('hidden');
               document.getElementById('paymentInfo').classList.remove('hidden');
               
               paymentInterval = setInterval(() => cekStatusPembayaran(data.idtransaksi, produk, amount), 5000);
           } catch (err) {
               console.error("Error:", err);
               document.getElementById('loadingText').innerHTML = 'Gagal membuat pembayaran. Cek konsol (F12) untuk error CORS.';
           }
       }

       async function cekStatusPembayaran(transactionId, produk, amount) {
           const SETTINGS = {
               QRIS: { apikey: "alfa2025", merchantId: "OK2385395", keyorkut: "184646517465972242385395OKCTB1BFD496F29624C01FF8E5728CF69A17" },
               NOMOR_ADMIN_WA: "6282226769163"
           };
           const { apikey, merchantId, keyorkut } = SETTINGS.QRIS;
           const apiUrl = `https://alfaofficial.cloud/orderkuota/cekstatus?apikey=${apikey}&merchant=${merchantId}&keyorkut=${keyorkut}&idtransaksi=${transactionId}`;

           try {
               const res = await fetch(apiUrl);
               const json = await res.json();
               
               if (json?.result?.status === "PAID") {
                   clearInterval(paymentInterval);
                   
                   document.getElementById('qrisArea').classList.add('hidden');
                   document.getElementById('suksesArea').classList.remove('hidden');
                   document.getElementById("suksesInfo").innerHTML = `<strong>Produk:</strong> ${produk}<br><strong>ID Transaksi:</strong> ${transactionId}<br><strong>Jumlah Dibayar:</strong> Rp ${amount.toLocaleString('id-ID')}`;

                   const pesanWA = `Halo Admin, saya telah berhasil melakukan pembayaran untuk:\n\nProduk: *${produk}*\nID Transaksi: *${transactionId}*\nJumlah: *Rp ${amount.toLocaleString('id-ID')}*\n\nMohon untuk segera diproses. Terima kasih.`;
                   const urlWA = `https://wa.me/${SETTINGS.NOMOR_ADMIN_WA}?text=${encodeURIComponent(pesanWA)}`;
                   document.getElementById('kirimBuktiBtn').onclick = () => window.open(urlWA, '_blank');
               } else {
                   console.log("Menunggu pembayaran...");
               }
           } catch (err) {
               console.error("Gagal cek status:", err);
           }
       }
   </script>
 </body>
</html>