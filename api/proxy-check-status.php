<?php
header('Content-Type: application/json');

// Kredensial rahasia Anda
$apikey = "alfa2025";
$merchantId = "OK2385395";
$keyorkut = "184646517465972242385395OKCTB1BFD496F29624C01FF8E5728CF69A17";
$idtransaksi = isset($_GET['idtransaksi']) ? $_GET['idtransaksi'] : '';

if (empty($idtransaksi)) {
    echo json_encode(['error' => 'ID Transaksi tidak ada']);
    exit;
}

// Memanggil API alfaofficial dari server
$url = "https://alfaofficial.cloud/orderkuota/cekstatus?apikey={$apikey}&merchant={$merchantId}&keyorkut={$keyorkut}&idtransaksi={$idtransaksi}";
$response = file_get_contents($url);

// Meneruskan jawabannya ke website Anda
echo $response;
?>

