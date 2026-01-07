<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

const ROLE_CLIENT = 'client';
const ROLE_EMPLOYEE = 'employee';

function currentUser()
{
    return $_SESSION['user'] ?? null;
}

function requireLogin($role = null, $asJson = false)
{
    $user = currentUser();
    if (!$user) {
        if ($asJson) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Unauthorized.']);
            exit;
        }
        header('Location: login.php');
        exit;
    }

    if ($role && ($user['role'] ?? null) !== $role) {
        if ($asJson) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Forbidden.']);
            exit;
        }
        $target = ($user['role'] ?? ROLE_CLIENT) === ROLE_EMPLOYEE ? 'funcionarios.php' : 'index.php';
        header('Location: ' . $target);
        exit;
    }
}
