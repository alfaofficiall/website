import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  const apikey = "alfa2025";
  const qrisCode = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214140263240266770303UMI51440014ID.CO.QRIS.WWW0215ID20253948029410303UMI5204481253033605802ID5919ANDI CALL OK23853956005BLORA61055821162070703A0163044FEE";
  const { amount } = req.query;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Jumlah tidak valid' });
  }

  const apiUrl = `https://alfaofficial.cloud/orderkuota/createpayment?apikey=${apikey}&amount=${amount}&codeqr=${qrisCode}`;

  try {
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghubungi server pembayaran.' });
  }
}
