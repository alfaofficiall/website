<?php
header('Content-Type: application/json');

$apikey = "alfa2025";
$merchantId = "OK2385395";
$keyorkut = "184646517465972242385395OKCTB1BFD496F29624C01FF8E5728CF69A17";
$idtransaksi = isset($_GET['idtransaksi']) ? $_GET['idtransaksi'] : '';

if (empty($idtransaksi)) {
    echo json_encode(['error' => 'ID Transaksi tidak ada']);
    exit;
}

$url = "https://alfaofficial.cloud/orderkuota/cekstatus?apikey={$apikey}&merchant={$merchantId}&keyorkut={$keyorkut}&idtransaksi={$idtransaksi}";
$response = @file_get_contents($url);

if ($response === FALSE) {
    echo json_encode(['error' => 'Tidak bisa menghubungi server pembayaran.']);
} else {
    echo $response;
}
?>
