<?php
require __DIR__ . '/db.php';

$employee = [
    'full_name' => 'Felipe Gomes Cardoso',
    'cpf' => '05110959293',
    'email' => 'felipe11gc@gmail.com',
    'phone' => '',
    'password' => '140527',
];

$stmt = $pdo->prepare('SELECT id FROM users WHERE cpf = :cpf');
$stmt->execute([':cpf' => $employee['cpf']]);
if ($stmt->fetch()) {
    echo 'Funcionario ja cadastrado.';
    exit;
}

$hash = password_hash($employee['password'], PASSWORD_DEFAULT);
$stmt = $pdo->prepare(
    'INSERT INTO users (full_name, cpf, email, phone, password_hash)
     VALUES (:full_name, :cpf, :email, :phone, :password_hash)'
);
$stmt->execute([
    ':full_name' => $employee['full_name'],
    ':cpf' => $employee['cpf'],
    ':email' => $employee['email'],
    ':phone' => $employee['phone'],
    ':password_hash' => $hash,
]);

echo 'Funcionario cadastrado.';
