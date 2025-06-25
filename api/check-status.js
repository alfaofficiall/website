import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  const apikey = "alfa2025";
  const merchantId = "OK2385395";
  const keyorkut = "184646517465972242385395OKCTB1BFD496F29624C01FF8E5728CF69A17";
  const { idtransaksi } = req.query;

  if (!idtransaksi) {
    return res.status(400).json({ error: 'ID Transaksi tidak ada' });
  }

  const apiUrl = `https://alfaofficial.cloud/orderkuota/cekstatus?apikey=${apikey}&merchant=${merchantId}&keyorkut=${keyorkut}&idtransaksi=${idtransaksi}`;

  try {
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghubungi server pembayaran.' });
  }
}
