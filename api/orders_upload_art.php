<?php
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/uploads.php';

requireLogin(ROLE_EMPLOYEE, true);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$orderId = (int)($_POST['order_id'] ?? 0);
$responsavel = trim((string)($_POST['responsavel'] ?? ''));
$notes = trim((string)($_POST['notes'] ?? ''));

if ($orderId <= 0) {
    http_response_code(422);
    echo json_encode(['error' => 'Missing required fields.']);
    exit;
}

$artFilePath = null;
$artFileName = null;
if (!empty($_FILES['art_file'])) {
    [$result, $error] = saveUpload($_FILES['art_file'], 'arte', ['pdf', 'png', 'jpg', 'jpeg']);
    if ($error) {
        http_response_code(422);
        echo json_encode(['error' => $error]);
        exit;
    }
    $artFilePath = $result['path'] ?? null;
    $artFileName = $result['original'] ?? null;
}

$check = $pdo->prepare('SELECT id FROM orders WHERE id = :id');
$check->execute([':id' => $orderId]);
if (!$check->fetch()) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found.']);
    exit;
}

$stmt = $pdo->prepare(
    'UPDATE orders
     SET art_file = :art_file, art_file_name = :art_file_name, art_uploaded_by = :art_uploaded_by, art_notes = :art_notes
     WHERE id = :id'
);
$stmt->execute([
    ':art_file' => $artFilePath,
    ':art_file_name' => $artFileName,
    ':art_uploaded_by' => $responsavel,
    ':art_notes' => $notes,
    ':id' => $orderId,
]);

echo json_encode(['success' => true, 'art_file' => $artFilePath]);
