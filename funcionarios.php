<?php
require __DIR__ . '/api/auth.php';
requireLogin('employee');
$user = currentUser();
$name = trim($user['name'] ?? '');
$firstNameRaw = $name !== '' ? strtok($name, ' ') : '';
$firstName = $firstNameRaw !== '' ? ucfirst(strtolower($firstNameRaw)) : 'Equipe';
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Grafica EPA - Painel de Funcionarios</title>
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
        <div class="badge"><span class="pulse"></span>painel interno</div>
      </div>
    </div>
    <button class="user-greeting" type="button" aria-label="Funcionario logado">
      <img class="user-greeting__icon" src="IMGs/do-utilizador.svg" alt="" aria-hidden="true" />
      <span>Ola, <?php echo htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8'); ?></span>
    </button>
  </header>

  <section class="hero">
    <h1 class="reveal">Fila de pedidos e atualizacoes em tempo real.</h1>
    <p class="reveal delay-1">Receba, revise, anexe a arte e atualize o status de cada pedido.</p>
    <div class="cta-row reveal delay-2">
      <button class="cta" type="button">Abrir fila</button>
      <a class="cta secondary" href="logout.php">Entrar com outro usuario</a>
    </div>
  </section>

  <main>
    <section id="fila">
      <p class="section-title">Fila de pedidos</p>
      <div class="steps" id="orders-list">
        <div class="step">
          <strong>Carregando pedidos...</strong>
          <span>Assim que o banco responder, os pedidos aparecerão aqui.</span>
        </div>
      </div>
    </section>

    <section id="detalhes">
      <p class="section-title">Detalhes do pedido</p>
      <div class="summary">
        <div><strong>Cliente</strong> - Nome, telefone, CPF.</div>
        <div><strong>Arquivo</strong> - Arte anexada e historico.</div>
        <div><strong>Status</strong> - Quem alterou e quando.</div>
        <div><strong>Aviso</strong> - Mensagem enviada ao cliente.</div>
      </div>
    </section>

    <section id="login">
      <p class="section-title">Acesso do funcionario</p>
      <div class="summary">
        <div><strong>Usuario</strong> - Nome e permissao.</div>
        <div><strong>Registro</strong> - Quem anexou arte e quem atualizou status.</div>
      </div>
    </section>
  </main>

  <div class="modal" id="modal-status-update" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-status-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Status</div>
          <h2 id="modal-status-title">Atualizar status</h2>
          <p class="modal__progress">Registre quem alterou e o novo estado.</p>
          <p class="modal__progress" id="status-order-label">Pedido: -</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <label class="field">
          <span>Novo status</span>
          <select id="status-select" name="status_select">
            <option>Aguardando confirmacao</option>
            <option>Aguardando confirmacao da arte</option>
            <option>Em producao</option>
            <option>Pronto para retirada</option>
            <option>Entregue</option>
            <option>Cancelado</option>
          </select>
        </label>
        <label class="field">
          <span>Responsavel</span>
          <input type="text" id="status-responsavel" name="status_responsavel" placeholder="Nome do funcionario" />
        </label>
        <textarea class="text-area" id="status-notes" name="status_notes" rows="4" placeholder="Observacoes internas."></textarea>
        <p class="step-hint success" id="status-success" hidden>Status atualizado.</p>
        <p class="step-hint" id="status-error" hidden>Falha ao atualizar status.</p>
      </div>
      <div class="modal__footer">
        <button class="btn ghost" type="button" data-close>Cancelar</button>
        <button class="btn" type="button" id="status-save">Salvar status</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-notify" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-notify-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Aviso</div>
          <h2 id="modal-notify-title">Enviar aviso ao cliente</h2>
          <p class="modal__progress">Mensagem por WhatsApp, email ou SMS.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <label class="field">
          <span>Canal</span>
          <select id="notify-channel" name="notify_channel">
            <option>WhatsApp</option>
            <option>Email</option>
            <option>SMS</option>
          </select>
        </label>
        <label class="field">
          <span>Responsavel</span>
          <input type="text" id="notify-responsavel" name="notify_responsavel" placeholder="Nome do funcionario" />
        </label>
        <textarea class="text-area" id="notify-message" name="notify_message" rows="4" placeholder="Escreva a mensagem para o cliente."></textarea>
      </div>
      <div class="modal__footer">
        <button class="btn ghost" type="button" data-close>Cancelar</button>
        <button class="btn" type="button">Enviar aviso</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-art-upload" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-art-upload-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Arte</div>
          <h2 id="modal-art-upload-title">Anexar arte</h2>
          <p class="modal__progress">Informe quem anexou e o arquivo final.</p>
          <p class="modal__progress" id="art-order-label">Pedido: -</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <label class="field">
          <span>Responsavel</span>
          <input type="text" id="art-responsavel" name="art_responsavel" placeholder="Nome do funcionario" />
        </label>
        <label class="file-field">
          <span>Selecionar arquivo (PDF/PNG/JPG)</span>
          <input type="file" id="art-file" name="art_file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" />
        </label>
        <textarea class="text-area" id="art-notes" name="art_notes" rows="3" placeholder="Observacoes da arte."></textarea>
        <p class="step-hint success" id="art-success" hidden>Arte anexada.</p>
        <p class="step-hint" id="art-error" hidden>Falha ao anexar arte.</p>
      </div>
      <div class="modal__footer">
        <button class="btn ghost" type="button" data-close>Cancelar</button>
        <button class="btn" type="button" id="art-save">Anexar arte</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-order-details" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-order-details-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Pedido</div>
          <h2 id="modal-order-details-title">Detalhes do pedido</h2>
          <p class="modal__progress" id="order-details-id">Pedido: -</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <div class="summary">
          <div><strong>Cliente:</strong> <span id="order-details-client">-</span></div>
          <div><strong>CPF:</strong> <span id="order-details-cpf">-</span></div>
          <div><strong>Telefone:</strong> <span id="order-details-phone">-</span></div>
          <div><strong>Produto:</strong> <span id="order-details-product">-</span></div>
          <div><strong>Formato:</strong> <span id="order-details-format">-</span></div>
          <div><strong>Papel:</strong> <span id="order-details-paper">-</span></div>
          <div><strong>Quantidade:</strong> <span id="order-details-quantity">-</span></div>
          <div><strong>Arte pronta:</strong> <span id="order-details-art">-</span></div>
          <div><strong>Arquivo do cliente:</strong> <span id="order-details-file">-</span></div>
          <div><strong>Referencias:</strong> <span id="order-details-refs">-</span></div>
          <div><strong>Arquivo da arte:</strong> <span id="order-details-art-file">-</span></div>
          <div><strong>Pagamento:</strong> <span id="order-details-payment">-</span></div>
          <div><strong>Total:</strong> <span id="order-details-total">-</span></div>
          <div><strong>Status:</strong> <span id="order-details-status">-</span></div>
          <div><strong>Data:</strong> <span id="order-details-date">-</span></div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn" type="button" data-close>Fechar</button>
      </div>
    </div>
  </div>

  <script src="script.js?v=<?php echo filemtime(__DIR__ . '/script.js'); ?>" defer></script>
</body>
</html>
