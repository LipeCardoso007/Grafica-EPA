<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/api/db.php';
require __DIR__ . '/api/auth.php';

$employeeCpfs = require __DIR__ . '/api/employees.php';

if (currentUser()) {
    $role = currentUser()['role'] ?? ROLE_CLIENT;
    header('Location: ' . ($role === ROLE_EMPLOYEE ? 'funcionarios.php' : 'index.php'));
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cpf = preg_replace('/\D+/', '', (string)($_POST['cpf'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($cpf === '' || $password === '') {
        $error = 'Informe CPF e senha.';
    } else {
        $stmt = $pdo->prepare('SELECT id, full_name, cpf, phone, password_hash FROM users WHERE cpf = :cpf');
        $stmt->execute([':cpf' => $cpf]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $error = 'CPF ou senha invalidos.';
        } else {
            $role = in_array($cpf, $employeeCpfs, true) ? ROLE_EMPLOYEE : ROLE_CLIENT;
            $_SESSION['user'] = [
                'id' => (int)$user['id'],
                'name' => $user['full_name'],
                'cpf' => $user['cpf'],
                'phone' => $user['phone'],
                'role' => $role,
            ];
            header('Location: ' . ($role === ROLE_EMPLOYEE ? 'funcionarios.php' : 'index.php'));
            exit;
        }
    }
}
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Login - Grafica EPA</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header>
    <div class="brand">
      <div class="logo">
        <img src="IMGs/LOGO minimalista Grafica EPA.svg" alt="Grafica EPA" />
      </div>
      <div>
        <div class="brand-title">Grafica EPA</div>
        <div class="badge"><span class="pulse"></span>acesso</div>
      </div>
    </div>
  </header>

  <section class="hero">
    <h1>Entre para continuar.</h1>
    <p>Use seu CPF e senha.</p>
  </section>

  <main>
    <section>
      <p class="section-title">Login</p>
      <div class="summary">
        <form method="post" class="form-row">
          <label class="field">
            <span>CPF</span>
            <input type="text" name="cpf" id="login-cpf" placeholder="Somente numeros" required />
          </label>
          <label class="field">
            <span>Senha</span>
            <input type="password" name="password" required />
          </label>
          <?php if ($error !== ''): ?>
            <p class="step-hint" style="color:#b30000;"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></p>
          <?php endif; ?>
          <button class="btn" type="submit">Entrar</button>
        </form>
        <p class="step-hint login-signup">Nao tem conta? <a href="register.php">Cadastre-se</a>.</p>
      </div>
    </section>
  </main>
  <script>
    (function () {
      const cpfInput = document.getElementById('login-cpf');
      const formatCpf = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        const part1 = digits.slice(0, 3);
        const part2 = digits.slice(3, 6);
        const part3 = digits.slice(6, 9);
        const part4 = digits.slice(9, 11);
        if (!digits.length) return '';
        if (digits.length <= 3) return part1;
        if (digits.length <= 6) return `${part1}.${part2}`;
        if (digits.length <= 9) return `${part1}.${part2}.${part3}`;
        return `${part1}.${part2}.${part3}-${part4}`;
      };

      if (cpfInput) {
        cpfInput.addEventListener('input', () => {
          cpfInput.value = formatCpf(cpfInput.value);
        });
      }
    })();
  </script>
</body>
</html>
