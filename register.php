<?php
require __DIR__ . '/api/db.php';
require __DIR__ . '/api/auth.php';

$employeeCpfs = require __DIR__ . '/api/employees.php';

if (currentUser()) {
    header('Location: index.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim((string)($_POST['full_name'] ?? ''));
    $cpf = preg_replace('/\D+/', '', (string)($_POST['cpf'] ?? ''));
    $phone = trim((string)($_POST['phone'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($name === '' || $cpf === '' || $phone === '' || $password === '') {
        $error = 'Preencha todos os campos.';
    } elseif (in_array($cpf, $employeeCpfs, true)) {
        $error = 'CPF reservado para funcionario.';
    } else {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE cpf = :cpf');
        $stmt->execute([':cpf' => $cpf]);
        if ($stmt->fetch()) {
            $error = 'CPF ja cadastrado.';
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare(
                'INSERT INTO users (full_name, cpf, phone, password_hash)
                 VALUES (:full_name, :cpf, :phone, :password_hash)'
            );
            $stmt->execute([
                ':full_name' => $name,
                ':cpf' => $cpf,
                ':phone' => $phone,
                ':password_hash' => $hash,
            ]);
            $_SESSION['user'] = [
                'id' => (int)$pdo->lastInsertId(),
                'name' => $name,
                'cpf' => $cpf,
                'phone' => $phone,
                'role' => ROLE_CLIENT,
            ];
            header('Location: index.php');
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
  <title>Cadastro - Grafica EPA</title>
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
        <div class="badge"><span class="pulse"></span>cadastro</div>
      </div>
    </div>
  </header>

  <section class="hero">
    <h1>Crie sua conta.</h1>
    <p>Use CPF e senha para acessar depois.</p>
  </section>

  <main>
    <section>
      <p class="section-title">Cadastro</p>
      <div class="summary">
        <form method="post" class="form-row">
          <label class="field">
            <span>Nome completo</span>
            <input type="text" name="full_name" required />
          </label>
          <label class="field">
            <span>CPF</span>
            <input type="text" name="cpf" id="register-cpf" placeholder="Somente numeros" required />
          </label>
          <label class="field">
            <span>Telefone</span>
            <input type="tel" name="phone" id="register-phone" required />
          </label>
          <label class="field">
            <span>Senha</span>
            <input type="password" name="password" required />
          </label>
          <?php if ($error !== ''): ?>
            <p class="step-hint" style="color:#b30000;"><?php echo htmlspecialchars($error, ENT_QUOTES, 'UTF-8'); ?></p>
          <?php endif; ?>
          <button class="btn" type="submit">Cadastrar</button>
        </form>
        <p class="step-hint">Ja tem conta? <a href="login.php">Entrar</a>.</p>
      </div>
    </section>
  </main>
  <script>
    (function () {
      const cpfInput = document.getElementById('register-cpf');
      const phoneInput = document.getElementById('register-phone');
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
      const formatPhone = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 11);
        if (digits.length <= 10) {
          const part1 = digits.slice(0, 2);
          const part2 = digits.slice(2, 6);
          const part3 = digits.slice(6, 10);
          if (!digits.length) return '';
          if (digits.length <= 2) return `(${part1}`;
          if (digits.length <= 6) return `(${part1}) ${part2}`;
          return `(${part1}) ${part2}-${part3}`;
        }
        const part1 = digits.slice(0, 2);
        const part2 = digits.slice(2, 7);
        const part3 = digits.slice(7, 11);
        return `(${part1}) ${part2}-${part3}`;
      };

      if (cpfInput) {
        cpfInput.addEventListener('input', () => {
          cpfInput.value = formatCpf(cpfInput.value);
        });
      }
      if (phoneInput) {
        phoneInput.addEventListener('input', () => {
          phoneInput.value = formatPhone(phoneInput.value);
        });
      }
    })();
  </script>
</body>
</html>
