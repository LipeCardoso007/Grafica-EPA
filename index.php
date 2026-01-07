<?php
require __DIR__ . '/api/auth.php';
requireLogin('client');
$user = currentUser();
$name = trim($user['name'] ?? '');
$firstNameRaw = $name !== '' ? strtok($name, ' ') : '';
$firstName = $firstNameRaw !== '' ? ucfirst(strtolower($firstNameRaw)) : 'Cliente';
?>
<!doctype html>
<html lang="pt-BR">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gráfica Autoatendimento - Protótipo Mobile</title>
  <link rel="stylesheet" href="styles.css" />
</head>

<body>
  <header>
    <div class="brand">
      <div class="logo">
        <img src="IMGs/LOGO minimalista Grafica EPA.svg" alt="Gráfica EPA" />
      </div>
      <div>
        <div class="brand-title">Gráfica EPA</div>
        <div class="badge"><span class="pulse"></span>on-line</div>
      </div>
    </div>
    <button class="user-greeting" type="button" data-modal-open="modal-login" aria-label="Usuario logado">
      <img class="user-greeting__icon" src="IMGs/do-utilizador.svg" alt="" aria-hidden="true" />
      <span>Ola, <?php echo htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8'); ?></span>
    </button>

  </header>

  <section class="hero">
    <h1 class="reveal">Imprima em minutos, direto do seu celular ou tablet.</h1>
    <p class="reveal delay-1">Escolha o produto, envie o arquivo e retire sem fila. Tudo em um fluxo rápido, claro e
      autoguiado.</p>
    <div class="cta-row reveal delay-2">
      <button class="cta cta--primary" type="button" id="flow-start">Fazer pedido</button>
      <a class="cta secondary" href="#como">Ver como funciona</a>
      <button class="cta secondary orders-cta" type="button" data-modal-open="modal-orders">
        Acompanhar meus pedidos
        <span class="alert-dot" aria-label="Pedido aguardando aprovação"></span>
      </button>
    </div>
    <div class="carousel reveal delay-3">
      <div class="carousel-track" aria-label="Carrossel de produtos">
        <div class="carousel-item">
          <span>Cartão de visita</span>
        </div>
        <div class="carousel-item">
          <span>Panfleto</span>
        </div>
        <div class="carousel-item">
          <span>Adesivo</span>
        </div>
        <div class="carousel-item">
          <span>Banner</span>
        </div>
        <div class="carousel-item">
          <span>Convite</span>
        </div>
      </div>
    </div>
  </section>

  <main>
    <section id="como">
      <p class="section-title">Como funciona</p>
      <div class="steps">
        <div class="step">
          <strong>1. Escolha o produto</strong>
          <span>Convite, impressão, panfleto, adesivo ou banner.</span>
          <button class="cta secondary" type="button" data-modal-open="modal-products">Ver produtos</button>
        </div>
        <div class="step">
          <strong>2. Formato e tamanho</strong>
          <span>Selecione o tamanho ideal para o seu uso.</span>
          <button class="cta secondary" type="button" data-modal-open="modal-formats">Ver formatos</button>
        </div>
        <div class="step">
          <strong>3. Papel e acabamento</strong>
          <span>Escolha o papel e a qualidade do acabamento.</span>
          <button class="cta secondary" type="button" data-modal-open="modal-materials">Ver materiais e papéis</button>
        </div>
        <div class="step">
          <strong>4. Envie o arquivo</strong>
          <span>PDF pronto para imprimir direto do celular.</span>
        </div>
        <div class="step">
          <strong>5. Referências (opcional)</strong>
          <span>Imagens ou textos para o design.</span>
        </div>
        <div class="step">
          <strong>6. Revisão do pedido</strong>
          <span>Confira tudo antes do pagamento.</span>
        </div>
        <div class="step">
          <strong>7. Pagamento</strong>
          <span>Entrada 50% ou total (mais rápido).</span>
        </div>
        <div class="step">
          <strong>8. Pedido em preparo</strong>
          <span>Avisamos quando estiver pronto.</span>
        </div>
      </div>
    </section>
  </main>

  <div class="modal" id="flow-modal" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="flow-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Autoatendimento</div>
          <h2 id="flow-title">Monte seu pedido</h2>
          <p class="modal__progress" id="flow-progress">Etapa 1 de 10</p>
          <div class="progress">
            <span id="flow-progress-bar"></span>
          </div>
          <p class="modal__progress" id="flow-total">Total estimado: -</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>

      <div class="modal__body">
        <div class="step-panel is-active" data-step="0">
          <strong>1. Tem a arte pronta?</strong>
          <p class="muted">Assim definimos o proximo passo.</p>
          <div class="option-grid">
            <button class="option" type="button" data-select="artReady" data-value="Sim, enviar arte">
              Sim, enviar arte <small>(R$ 0,00)</small>
            </button>
            <button class="option" type="button" data-select="artReady" data-value="Nao, solicitar design">
              Não, solicitar design <small>(R$ 25,00)</small>
            </button>
          </div>
          <p class="step-hint" data-hint></p>
        </div>

        <div class="step-panel" data-step="1">
          <strong>2. Escolha o produto</strong>
          <p class="muted">Selecione o tipo principal do pedido.</p>
          <div class="option-grid">
            <button class="option" type="button" data-select="product" data-value="Convite" data-price="35">
              Convite <small>(R$ 35,00)</small>
            </button>
            <button class="option" type="button" data-select="product" data-value="Impress?o" data-price="20">
              Impress?o <small>(R$ 20,00)</small>
            </button>
            <button class="option" type="button" data-select="product" data-value="Panfleto" data-price="45">
              Panfleto <small>(R$ 45,00)</small>
            </button>
            <button class="option" type="button" data-select="product" data-value="Adesivo" data-price="30">
              Adesivo <small>(R$ 30,00)</small>
            </button>
          </div>
          <p class="step-hint" data-hint></p>
        </div>

        <div class="step-panel" data-step="2">
          <strong>3. Formato e tamanho</strong>
          <p class="muted">Escolha o tamanho mais comum para o produto.</p>
          <div class="option-grid">
            <button class="option" type="button" data-select="format" data-value="A6">A6</button>
            <button class="option" type="button" data-select="format" data-value="A5">A5</button>
            <button class="option" type="button" data-select="format" data-value="A4">A4</button>
            <button class="option" type="button" data-select="format" data-value="Personalizado">Personalizado</button>
          </div>
          <div class="custom-size" id="custom-size-fields" hidden>
            <div class="custom-size__grid">
              <label class="field">
                <span>Altura (Y)</span>
                <input type="number" id="custom-height" name="custom_height" min="0.1" step="0.1" placeholder="Ex: 30" />
              </label>
              <label class="field">
                <span>Largura (X)</span>
                <input type="number" id="custom-width" name="custom_width" min="0.1" step="0.1" placeholder="Ex: 20" />
              </label>
            </div>
            <div class="custom-size__units" role="group" aria-label="Unidade de medida">
              <label class="unit-option">
                <input type="radio" name="custom_unit" value="cm" checked />
                <span>CM</span>
              </label>
              <label class="unit-option">
                <input type="radio" name="custom_unit" value="m" />
                <span>M</span>
              </label>
            </div>
          </div>
          <p class="step-hint" data-hint></p>
        </div>

        <div class="step-panel" data-step="3">
          <strong>4. Papel e acabamento</strong>
          <p class="muted">Escolha o papel ideal para a impressão.</p>
          <div class="option-grid">
            <button class="option" type="button" data-select="paper" data-value="Couch 150g">Couch 150g</button>
            <button class="option" type="button" data-select="paper" data-value="Couch 300g">Couch 300g</button>
            <button class="option" type="button" data-select="paper" data-value="Offset 120g">Offset 120g</button>
            <button class="option" type="button" data-select="paper" data-value="Outro">Outro</button>
          </div>
          <p class="step-hint" data-hint></p>
        </div>

        <div class="step-panel" data-step="4">
          <strong>5. Quantidade</strong>
          <p class="muted">Informe quantas unidades deseja imprimir.</p>
          <label class="field">
            <span>Quantidade</span>
            <input type="number" id="quantity-input" name="quantity" min="1" placeholder="Ex: 100" />
          </label>
          <p class="step-hint" data-hint></p>
        </div>

        <div class="step-panel" data-step="5">
          <strong>6. Envie o arquivo principal</strong>
          <p class="muted">PDF pronto para imprimir (opcional neste prototipo).</p>
          <label class="file-field">
            <span>Selecionar arquivo</span>
            <input type="file" id="client-file" name="client_file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" />
          </label>
        </div>

        <div class="step-panel" data-step="6">
          <strong>7. Arquivos de refer?ncia (opcional)</strong>
          <p class="muted">Imagens, textos ou briefing para o design.</p>
          <label class="file-field">
            <span>Adicionar imagens</span>
            <input type="file" id="client-refs" name="client_refs" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" />
          </label>
          <textarea class="text-area" id="client-brief" name="client_brief" rows="4" placeholder="Descreva sua ideia ou escreva o texto aqui."></textarea>
        </div>

        <div class="step-panel" data-step="7">
          <strong>8. Revis?o do pedido</strong>
          <p class="muted">Confira antes de seguir para o pagamento.</p>
          <div class="summary">
            <div><span>Produto:</span> <strong id="summary-product">-</strong></div>
            <div><span>Tamanho:</span> <strong id="summary-format">-</strong></div>
            <div><span>Papel:</span> <strong id="summary-paper">-</strong></div>
            <div><span>Quantidade:</span> <strong id="summary-quantity">-</strong></div>
            <div><span>Design:</span> <strong id="summary-design">-</strong></div>
            <div><span>Pagamento:</span> <strong id="summary-payment">-</strong></div>
            <div><span>Total estimado:</span> <strong id="summary-total">-</strong></div>
          </div>
        </div>

        <div class="step-panel" data-step="8">
          <strong>9. Forma de pagamento</strong>
          <p class="muted">Total confirma mais r?pido. Entrada 50% exige valida??o manual.</p>
          <div class="option-grid">
            <button class="option" type="button" data-select="payment" data-value="Entrada 50%">Entrada 50%</button>
            <button class="option" type="button" data-select="payment" data-value="Total (mais r?pido)">Total (mais
              r?pido)</button>
          </div>
          <p class="step-hint" data-hint></p>
        </div>

        <div class="step-panel" data-step="9">
          <strong>10. Pedido confirmado</strong>
          <p class="muted">Obrigado! Seu pedido est? em preparo e avisaremos quando estiver pronto.</p>
          <p class="step-hint success" id="order-success" hidden>Pedido enviado com sucesso.</p>
          <p class="step-hint" id="order-error" hidden>Falha ao enviar. Tente novamente.</p>
        </div>
      </div>

      <div class="modal__footer">
        <button class="btn ghost" type="button" id="flow-back" disabled>Voltar</button>
        <button class="btn" type="button" id="flow-next">Continuar</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-products" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-products-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Catálogo</div>
          <h2 id="modal-products-title">Produtos</h2>
          <p class="modal__progress">Escolha o que você precisa imprimir.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <div class="summary">
          <div><strong>Convites</strong> - sociais, corporativos, eventos (R$ 35,00).</div>
          <div><strong>Impress?o</strong> - documentos e materiais variados (R$ 20,00).</div>
          <div><strong>Panfletos</strong> - A5, A6, promocionais (R$ 45,00).</div>
          <div><strong>Adesivos</strong> - vinil, fosco ou brilho (R$ 30,00).</div>
          <div><strong>Banners</strong> - lona com ilhos (sob consulta).</div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn" type="button" data-close>Fechar</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-formats" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-formats-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Tamanhos</div>
          <h2 id="modal-formats-title">Formatos</h2>
          <p class="modal__progress">Tamanhos mais pedidos.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <div class="summary">
          <div><strong>A6</strong> - 10,5 x 14,8 cm</div>
          <div><strong>A5</strong> - 14,8 x 21 cm</div>
          <div><strong>A4</strong> - 21 x 29,7 cm</div>
          <div><strong>Personalizado</strong> - corte sob medida.</div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn" type="button" data-close>Fechar</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-materials" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-materials-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Papeis</div>
          <h2 id="modal-materials-title">Materiais e papéis</h2>
          <p class="modal__progress">Escolha o toque e a resistência.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <div class="summary">
          <div><strong>Couch 150g</strong> - leve, custo baixo.</div>
          <div><strong>Couch 300g</strong> - mais rígido, premium.</div>
          <div><strong>Offset 120g</strong> - fosco, bom para escrita.</div>
          <div><strong>Outros</strong> - consulte opções especiais.</div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn" type="button" data-close>Fechar</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-login" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-login-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Login</div>
          <h2 id="modal-login-title">Dados do cliente</h2>
          <p class="modal__progress">Informacoes cadastradas.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <div class="summary" id="login-summary">
          <div><strong>Nome:</strong> <span id="login-name"><?php echo htmlspecialchars($user['name'] ?? '', ENT_QUOTES, 'UTF-8'); ?></span></div>
          <div><strong>Telefone:</strong> <span id="login-phone"><?php echo htmlspecialchars($user['phone'] ?? '', ENT_QUOTES, 'UTF-8'); ?></span></div>
          <div><strong>CPF:</strong> <span id="login-cpf"><?php echo htmlspecialchars($user['cpf'] ?? '', ENT_QUOTES, 'UTF-8'); ?></span></div>
        </div>
        <div class="form-row" id="login-edit">
          <label class="field">
            <span>Nome</span>
            <input type="text" id="login-name-input" name="login_name" value="<?php echo htmlspecialchars($user['name'] ?? '', ENT_QUOTES, 'UTF-8'); ?>" />
          </label>
          <label class="field">
            <span>Telefone</span>
            <input type="tel" id="login-phone-input" name="login_phone" value="<?php echo htmlspecialchars($user['phone'] ?? '', ENT_QUOTES, 'UTF-8'); ?>" />
          </label>
          <label class="field">
            <span>CPF</span>
            <input type="text" id="login-cpf-input" name="login_cpf" value="<?php echo htmlspecialchars($user['cpf'] ?? '', ENT_QUOTES, 'UTF-8'); ?>" />
          </label>
          <p class="step-hint success" id="login-success" hidden>Dados atualizados com sucesso.</p>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn ghost" type="button" id="login-edit-toggle">Salvar alteração</button>
        <a class="btn" href="logout.php">SAIR</a>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-orders" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-orders-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Pedidos</div>
          <h2 id="modal-orders-title">Status dos pedidos</h2>
          <p class="modal__progress">Acompanhe o andamento em tempo real.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <div class="summary">
          <p class="step-hint" id="client-cancel-error" hidden></p>
          <div id="client-orders-list">
            <div class="status-line status-line--boxed">
              <span class="status-dot status-dot--blue"></span>
              <strong>Carregando pedidos...</strong>
            </div>
          </div>
          <div class="status-actions">
            <button class="cta secondary" type="button" data-modal-open="modal-art">Ver arte</button>
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn" type="button" data-close>Fechar</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-art" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-art-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Arte</div>
          <h2 id="modal-art-title">Pré-visualização</h2>
          <p class="modal__progress">Confirme se está tudo certo.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <div class="art-placeholder">
          <span>Imagem da arte</span>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn ghost" type="button" data-modal-open="modal-adjust">Solicitar ajustes</button>
        <button class="btn approve" type="button" data-modal-open="modal-approve">Aprovar arte</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-adjust" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-adjust-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Ajustes</div>
          <h2 id="modal-adjust-title">Solicitar ajuste</h2>
          <p class="modal__progress">Descreva o que precisa ser alterado.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__body">
        <textarea class="text-area" id="adjust-notes" name="adjust_notes" rows="5" placeholder="Digite os ajustes desejados."></textarea>
        <label class="file-field">
          <span>Anexar imagem (PNG ou JPG)</span>
          <input type="file" id="adjust-file" name="adjust_file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" />
        </label>
        <p class="step-hint success" id="adjust-success" hidden>Ajuste enviado.</p>
      </div>
      <div class="modal__footer">
        <button class="btn ghost" type="button" id="adjust-send">Enviar</button>
        <button class="btn" type="button" id="adjust-send-new">Enviar novo ajuste</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-approve" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-approve-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Confirmacao</div>
          <h2 id="modal-approve-title">Deseja aprovar?</h2>
          <p class="modal__progress">Apos a aprovacao nao sera possivel enviar ajustes.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__footer">
        <button class="btn ghost" type="button" data-close>Cancelar</button>
        <button class="btn approve" type="button" id="approve-confirm">Aprovar</button>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-approved" aria-hidden="true">
    <div class="modal__backdrop" data-close></div>
    <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-approved-title">
      <div class="modal__header">
        <div>
          <div class="modal__eyebrow">Sucesso</div>
          <h2 id="modal-approved-title">Arte aprovada</h2>
          <p class="modal__progress">Seu pedido segue para produção.</p>
        </div>
        <button class="modal__close" type="button" data-close aria-label="Fechar">&times;</button>
      </div>
      <div class="modal__footer">
        <button class="btn approve" type="button" data-close>Ok</button>
      </div>
    </div>
  </div>

  <script src="script.js?v=<?php echo filemtime(__DIR__ . '/script.js'); ?>" defer></script>
</body>

</html>
