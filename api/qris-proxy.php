<?php
// Lokasi file: /api/qris-proxy.php

// Ambil parameter URL dari permintaan
$imageUrl = $_GET['url'] ?? '';

// Jika parameter URL tidak ada, hentikan eksekusi
if (empty($imageUrl)) {
    http_response_code(400); // Bad Request
    echo 'URL parameter is missing';
    exit;
}

// PENTING: Validasi keamanan untuk memastikan hanya domain QRIS yang bisa diakses
$parsedUrl = parse_url($imageUrl);
if ($parsedUrl === false || !isset($parsedUrl['host']) || $parsedUrl['host'] !== 'imqi.pxhost.to') {
    http_response_code(403); // Forbidden
    echo 'Forbidden: Hostname not allowed';
    exit;
}

// Gunakan cURL untuk mengambil data gambar dari server aslinya
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $imageUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Timeout 15 detik

$imageData = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

// Jika gambar berhasil diambil (HTTP status 200 OK)
if ($httpcode == 200 && !empty($imageData)) {
    // Kirim header Content-Type yang sesuai (misal: 'image/png')
    header("Content-Type: " . $contentType);
    // Tampilkan data gambar
    echo $imageData;
} else {
    // Jika gagal, kirim status error
    http_response_code(500); // Internal Server Error
    echo 'Error fetching the image.';
}
?>

