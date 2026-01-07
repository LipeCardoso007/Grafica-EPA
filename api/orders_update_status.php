<?php
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';

requireLogin(ROLE_EMPLOYEE, true);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload.']);
    exit;
}

$orderId = (int)($payload['order_id'] ?? 0);
$status = trim((string)($payload['status'] ?? ''));

if ($orderId <= 0 || $status === '') {
    http_response_code(422);
    echo json_encode(['error' => 'Missing required fields.']);
    exit;
}

$stmt = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id');
$stmt->execute([
    ':status' => $status,
    ':id' => $orderId,
]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found.']);
    exit;
}

echo json_encode(['success' => true]);
