<?php
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/uploads.php';

requireLogin(ROLE_CLIENT, true);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$payload = null;
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload.']);
        exit;
    }
} else {
    $payload = $_POST;
}

$user = currentUser();
$clientName = trim((string)($user['name'] ?? ''));
$clientPhone = trim((string)($user['phone'] ?? ''));
$clientCpf = trim((string)($user['cpf'] ?? ''));
$product = trim((string)($payload['product'] ?? ''));
$format = trim((string)($payload['format'] ?? ''));
$paper = trim((string)($payload['paper'] ?? ''));
$quantity = (int)($payload['quantity'] ?? 0);
$payment = trim((string)($payload['payment'] ?? ''));
$total = (float)($payload['total'] ?? 0);
$artReady = trim((string)($payload['art_ready'] ?? ''));

if ($clientName === '' || $clientCpf === '' || $product === '' || $quantity <= 0 || $payment === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Missing required fields.']);
    exit;
}

$clientFilePath = null;
$clientFileName = null;
$clientRefs = [];
$clientRefsNames = [];

if (!empty($_FILES['client_file'])) {
    [$result, $error] = saveUpload($_FILES['client_file'], 'cliente', ['pdf', 'png', 'jpg', 'jpeg']);
    if ($error) {
        http_response_code(422);
        echo json_encode(['error' => $error]);
        exit;
    }
    $clientFilePath = $result['path'] ?? null;
    $clientFileName = $result['original'] ?? null;
}

if (!empty($_FILES['client_refs'])) {
    $refs = $_FILES['client_refs'];
    if (is_array($refs['name'])) {
        $count = count($refs['name']);
        for ($i = 0; $i < $count; $i++) {
            $file = [
                'name' => $refs['name'][$i],
                'type' => $refs['type'][$i],
                'tmp_name' => $refs['tmp_name'][$i],
                'error' => $refs['error'][$i],
                'size' => $refs['size'][$i],
            ];
            [$result, $error] = saveUpload($file, 'referencia', ['pdf', 'png', 'jpg', 'jpeg']);
            if ($error) {
                http_response_code(422);
                echo json_encode(['error' => $error]);
                exit;
            }
            $clientRefs[] = $result['path'] ?? null;
            $clientRefsNames[] = $result['original'] ?? null;
        }
    }
}

$stmt = $pdo->prepare(
    'INSERT INTO orders
      (client_name, client_phone, client_cpf, product, format, paper, quantity, payment, total, art_ready,
       client_file, client_file_name, client_refs, client_refs_names, status)
     VALUES
      (:client_name, :client_phone, :client_cpf, :product, :format, :paper, :quantity, :payment, :total, :art_ready,
       :client_file, :client_file_name, :client_refs, :client_refs_names, :status)'
);

$stmt->execute([
    ':client_name' => $clientName,
    ':client_phone' => $clientPhone,
    ':client_cpf' => $clientCpf,
    ':product' => $product,
    ':format' => $format,
    ':paper' => $paper,
    ':quantity' => $quantity,
    ':payment' => $payment,
    ':total' => $total,
    ':art_ready' => $artReady,
    ':client_file' => $clientFilePath,
    ':client_file_name' => $clientFileName,
    ':client_refs' => $clientRefs ? json_encode($clientRefs) : null,
    ':client_refs_names' => $clientRefsNames ? json_encode($clientRefsNames) : null,
    ':status' => 'aguardando',
]);

echo json_encode([
    'id' => (int)$pdo->lastInsertId(),
    'status' => 'aguardando',
]);
