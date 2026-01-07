<?php
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';

requireLogin(ROLE_CLIENT, true);

header('Content-Type: application/json');

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'GET'], true)) {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$orderId = 0;
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $orderId = (int)($_GET['order_id'] ?? 0);
} else {
    $raw = file_get_contents('php://input');
    $payload = json_decode($raw, true);
    if (is_array($payload)) {
        $orderId = (int)($payload['order_id'] ?? 0);
    } elseif (!empty($_POST['order_id'])) {
        $orderId = (int)($_POST['order_id'] ?? 0);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload.']);
        exit;
    }
}
if ($orderId <= 0) {
    http_response_code(422);
    echo json_encode(['error' => 'Missing order_id.']);
    exit;
}

$user = currentUser();
$cpf = $user['cpf'] ?? '';
if ($cpf === '') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden.']);
    exit;
}

$check = $pdo->prepare('SELECT status FROM orders WHERE id = :id AND client_cpf = :cpf');
$check->execute([
    ':id' => $orderId,
    ':cpf' => $cpf,
]);
$order = $check->fetch();
if (!$order) {
    http_response_code(404);
    echo json_encode(['error' => 'Order not found.']);
    exit;
}
if (strtolower((string)$order['status']) === 'producao' || strtolower((string)$order['status']) === 'em producao') {
    http_response_code(409);
    echo json_encode(['error' => 'Order cannot be cancelled.']);
    exit;
}

$stmt = $pdo->prepare('UPDATE orders SET status = :status WHERE id = :id AND client_cpf = :cpf');
$stmt->execute([
    ':status' => 'cancelado',
    ':id' => $orderId,
    ':cpf' => $cpf,
]);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $back = $_SERVER['HTTP_REFERER'] ?? '/index.php';
    header('Location: ' . $back);
    exit;
}

echo json_encode(['success' => true]);
