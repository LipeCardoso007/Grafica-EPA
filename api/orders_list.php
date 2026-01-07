<?php
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';

requireLogin(null, true);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

$user = currentUser();

if (($user['role'] ?? null) === ROLE_CLIENT) {
    $stmt = $pdo->prepare(
        'SELECT id, client_name, client_phone, client_cpf, product, format, paper,
                quantity, payment, total, art_ready, client_file, client_file_name,
                client_refs, client_refs_names, art_file, art_file_name,
                art_uploaded_by, art_notes, cancel_requested, cancel_requested_by,
                cancel_requested_at, status, created_at
         FROM orders
         WHERE client_cpf = :cpf
         ORDER BY created_at DESC'
    );
    $stmt->execute([':cpf' => $user['cpf'] ?? '']);
    echo json_encode($stmt->fetchAll());
    exit;
}

$stmt = $pdo->query(
    'SELECT id, client_name, client_phone, client_cpf, product, format, paper,
            quantity, payment, total, art_ready, client_file, client_file_name,
            client_refs, client_refs_names, art_file, art_file_name,
            art_uploaded_by, art_notes, cancel_requested, cancel_requested_by,
            cancel_requested_at, status, created_at
     FROM orders
     ORDER BY created_at DESC'
);

echo json_encode($stmt->fetchAll());
