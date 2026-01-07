<?php
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';

requireLogin(ROLE_CLIENT, true);

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
if ($orderId <= 0) {
    http_response_code(422);
    echo json_encode(['error' => 'Missing order_id.']);
    exit;
}

$user = currentUser();
$cpf = $user['cpf'] ?? '';
$name = $user['name'] ?? 'Cliente';
if ($cpf === '') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden.']);
    exit;
}

$stmt = $pdo->prepare(
    'UPDATE orders
     SET cancel_requested = 1, cancel_requested_by = :name, cancel_requested_at = NOW()
     WHERE id = :id AND client_cpf = :cpf'
);
$stmt->execute([
    ':name' => $name,
    ':id' => $orderId,
    ':cpf' => $cpf,
]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found.']);
    exit;
}

echo json_encode(['success' => true]);
