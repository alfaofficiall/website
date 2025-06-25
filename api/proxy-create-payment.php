<?php
header('Content-Type: application/json');

$apikey = "alfa2025";
$qrisCode = "00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214140263240266770303UMI51440014ID.CO.QRIS.WWW0215ID20253948029410303UMI5204481253033605802ID5919ANDI CALL OK23853956005BLORA61055821162070703A0163044FEE";
$amount = isset($_GET['amount']) ? intval($_GET['amount']) : 0;

if ($amount <= 0) {
    echo json_encode(['error' => 'Jumlah tidak valid']);
    exit;
}

$url = "https://alfaofficial.cloud/orderkuota/createpayment?apikey={$apikey}&amount={$amount}&codeqr={$qrisCode}";
$response = @file_get_contents($url);

if ($response === FALSE) {
    echo json_encode(['error' => 'Tidak bisa menghubungi server pembayaran.']);
} else {
    echo $response;
}
?>
