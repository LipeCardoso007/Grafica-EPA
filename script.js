(() => {
  const faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) {
        return;
      }
      faqItems.forEach((other) => {
        if (other !== item) {
          other.open = false;
        }
      });
    });
  });

  const modal = document.getElementById('flow-modal');
  const startButton = document.getElementById('flow-start');
  const stepPanels = modal ? Array.from(modal.querySelectorAll('.step-panel')) : [];
  const backButton = document.getElementById('flow-back');
  const nextButton = document.getElementById('flow-next');
  const progressText = document.getElementById('flow-progress');
  const progressBar = document.getElementById('flow-progress-bar');
  const totalText = document.getElementById('flow-total');
  const closeButtons = modal ? modal.querySelectorAll('[data-close]') : [];
  const optionButtons = modal ? modal.querySelectorAll('[data-select]') : [];

  const selections = {
    artReady: null,
    product: null,
    productPrice: null,
    format: null,
    customWidth: null,
    customHeight: null,
    customUnit: 'cm',
    paper: null,
    quantity: null,
    payment: null,
  };

  let currentStep = 0;

  const requiredByStep = {
    0: 'artReady',
    1: 'product',
    2: 'format',
    3: 'paper',
    4: 'quantity',
    8: 'payment',
  };

  const summaryFields = {
    product: document.getElementById('summary-product'),
    format: document.getElementById('summary-format'),
    paper: document.getElementById('summary-paper'),
    quantity: document.getElementById('summary-quantity'),
    design: document.getElementById('summary-design'),
    payment: document.getElementById('summary-payment'),
    total: document.getElementById('summary-total'),
  };
  const quantityInput = document.getElementById('quantity-input');
  const customSizeFields = document.getElementById('custom-size-fields');
  const customHeightInput = document.getElementById('custom-height');
  const customWidthInput = document.getElementById('custom-width');
  const customUnitInputs = document.querySelectorAll('input[name="custom_unit"]');
  const clientFileInput = document.getElementById('client-file');
  const clientRefsInput = document.getElementById('client-refs');
  const designFee = 25;
  let orderSubmitted = false;
  const orderSuccess = document.getElementById('order-success');
  const orderError = document.getElementById('order-error');

  const formatMultipliers = {
    A6: 0.9,
    A5: 1,
    A4: 1.2,
    Personalizado: 1.4,
  };

  const paperMultipliers = {
    'Couch 150g': 1,
    'Couch 300g': 1.4,
    'Offset 120g': 1.1,
    Outro: 1.3,
  };

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const getSelectedProductPrice = () => {
    if (Number.isFinite(selections.productPrice)) {
      return selections.productPrice;
    }
    const activeProduct = modal.querySelector('[data-select="product"].option--active');
    if (!activeProduct) {
      return null;
    }
    const price = Number(activeProduct.dataset.price);
    return Number.isFinite(price) ? price : null;
  };

  const getQuantityValue = () => {
    if (quantityInput) {
      const rawValue = quantityInput.value.trim();
      if (!rawValue) {
        return 1;
      }
      const value = Number(rawValue);
      if (Number.isFinite(value) && value > 0) {
        return value;
      }
    }
    const fallback = Number(selections.quantity);
    return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
  };

  const calculateTotal = () => {
    const productPrice = getSelectedProductPrice();
    const quantity = getQuantityValue();
    if (!productPrice || !selections.format || !selections.paper || !quantity) {
      return null;
    }
    const formatMultiplier = formatMultipliers[selections.format] || 1;
    const paperMultiplier = paperMultipliers[selections.paper] || 1;
    const baseTotal = productPrice * formatMultiplier * paperMultiplier * quantity;
    const needsDesign = !shouldSkipDesign();
    return baseTotal + (needsDesign ? designFee : 0);
  };

  const calculateLiveTotal = () => {
    const productPrice = getSelectedProductPrice();
    const quantity = getQuantityValue();
    const needsDesign = selections.artReady ? !shouldSkipDesign() : false;
    if (!productPrice || !quantity) {
      return needsDesign ? designFee : 0;
    }
    const formatMultiplier = selections.format ? formatMultipliers[selections.format] || 1 : 1;
    const paperMultiplier = selections.paper ? paperMultipliers[selections.paper] || 1 : 1;
    const baseTotal = productPrice * formatMultiplier * paperMultiplier * quantity;
    return baseTotal + (needsDesign ? designFee : 0);
  };

  const shouldSkipDesign = () =>
    typeof selections.artReady === 'string' &&
    selections.artReady.toLowerCase().startsWith('sim');

  const formatSizeLabel = () => {
    if (selections.format !== 'Personalizado') {
      return selections.format;
    }
    const width = Number(selections.customWidth);
    const height = Number(selections.customHeight);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return 'Personalizado';
    }
    const unit = (selections.customUnit || 'cm').toUpperCase();
    return `Personalizado (${width} x ${height} ${unit})`;
  };

  const syncSummary = () => {
    const total = calculateTotal();
    const liveTotal = calculateLiveTotal();
    if (totalText) {
      totalText.textContent = `Total estimado: ${
        liveTotal === null ? '-' : currencyFormatter.format(liveTotal)
      }`;
    }
    Object.entries(summaryFields).forEach(([key, node]) => {
      if (!node) {
        return;
      }
      if (key === 'total') {
        node.textContent = total ? currencyFormatter.format(total) : '-';
        return;
      }
      if (key === 'design') {
        node.textContent = shouldSkipDesign()
          ? currencyFormatter.format(0)
          : currencyFormatter.format(designFee);
        return;
      }
      if (key === 'format') {
        node.textContent = formatSizeLabel() || '-';
        return;
      }
      node.textContent = selections[key] || '-';
    });
  };

  const setStep = (index) => {
    currentStep = index;
    stepPanels.forEach((panel, panelIndex) => {
      panel.classList.toggle('is-active', panelIndex === index);
    });
    if (backButton) {
      backButton.disabled = index === 0;
    }
    if (nextButton) {
      nextButton.textContent = index === stepPanels.length - 1 ? 'Fechar' : 'Continuar';
    }
    if (progressText) {
      progressText.textContent = `Etapa ${index + 1} de ${stepPanels.length}`;
    }
    if (progressBar) {
      progressBar.style.width = `${((index + 1) / stepPanels.length) * 100}%`;
    }
    if (index === 2) {
      updateCustomSizeVisibility();
    }
    syncSummary();
  };

  const updateCustomSizeVisibility = () => {
    if (!customSizeFields) {
      return;
    }
    const activeFormat = modal
      ? modal.querySelector('[data-select="format"].option--active')
      : null;
    const currentFormat = selections.format || (activeFormat ? activeFormat.dataset.value : null);
    const shouldShow = currentFormat === 'Personalizado';
    customSizeFields.hidden = !shouldShow;
    if (!shouldShow) {
      selections.customWidth = null;
      selections.customHeight = null;
      selections.customUnit = 'cm';
      if (customWidthInput) customWidthInput.value = '';
      if (customHeightInput) customHeightInput.value = '';
      customUnitInputs.forEach((input) => {
        input.checked = input.value === 'cm';
      });
    }
  };

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.removeAttribute('inert');
    document.body.classList.add('modal-open');
    if (quantityInput && !quantityInput.value.trim()) {
      quantityInput.value = '1';
      selections.quantity = 1;
    }
    setStep(0);
    updateCustomSizeVisibility();
  };

  const closeModal = () => {
    const active = document.activeElement;
    if (active && modal.contains(active)) {
      active.blur();
    }
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('inert', '');
    document.body.classList.remove('modal-open');
  };

  const getHint = () => {
    const panel = stepPanels[currentStep];
    if (!panel) {
      return null;
    }
    return panel.querySelector('[data-hint]');
  };

  const clearHint = () => {
    const hint = getHint();
    if (hint) {
      hint.textContent = '';
    }
  };

  const validateStep = () => {
    const key = requiredByStep[currentStep];
    if (!key) {
      return true;
    }
    if (!selections[key]) {
      const hint = getHint();
      if (hint) {
        hint.textContent = 'Selecione uma opcao para continuar.';
      }
      return false;
    }
    if (currentStep === 2 && selections.format === 'Personalizado') {
      const width = Number(selections.customWidth);
      const height = Number(selections.customHeight);
      if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
        const hint = getHint();
        if (hint) {
          hint.textContent = 'Informe altura e largura para o tamanho personalizado.';
        }
        return false;
      }
    }
    return true;
  };

  if (modal && startButton) {
    startButton.addEventListener('click', openModal);
    closeButtons.forEach((button) => {
      button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  optionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.select;
      const value = button.dataset.value;
      const price = button.dataset.price;
      if (!key) {
        return;
      }
      selections[key] = value;
      if (key === 'product') {
        let parsedPrice = price ? Number(price) : null;
        if (!Number.isFinite(parsedPrice)) {
          const match = button.textContent.match(/R\$\s*([\d.,]+)/);
          if (match) {
            parsedPrice = Number(match[1].replace(/\./g, '').replace(',', '.'));
          }
        }
        selections.productPrice = Number.isFinite(parsedPrice) ? parsedPrice : null;
        if (!selections.quantity) {
          selections.quantity = getQuantityValue() || 1;
        }
      }
      const siblings = modal.querySelectorAll(`[data-select="${key}"]`);
      siblings.forEach((item) => {
        item.classList.toggle('option--active', item === button);
      });
      if (key === 'format') {
        updateCustomSizeVisibility();
      }
      clearHint();
      syncSummary();
    });
  });

  if (quantityInput) {
    quantityInput.addEventListener('input', () => {
      const raw = quantityInput.value.trim();
      selections.quantity = raw ? Number(raw) : null;
      clearHint();
      syncSummary();
    });
  }

  if (customWidthInput) {
    customWidthInput.addEventListener('input', () => {
      const raw = customWidthInput.value.trim();
      selections.customWidth = raw ? Number(raw) : null;
      clearHint();
      syncSummary();
    });
  }

  if (customHeightInput) {
    customHeightInput.addEventListener('input', () => {
      const raw = customHeightInput.value.trim();
      selections.customHeight = raw ? Number(raw) : null;
      clearHint();
      syncSummary();
    });
  }

  if (customUnitInputs.length) {
    customUnitInputs.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.checked) {
          selections.customUnit = input.value || 'cm';
          syncSummary();
        }
      });
    });
  }

  if (modal && backButton) {
    backButton.addEventListener('click', () => {
      if (currentStep === 0) {
        return;
      }
      if (currentStep === 7 && shouldSkipDesign()) {
        setStep(5);
        return;
      }
      setStep(currentStep - 1);
    });
  }

  if (modal && nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentStep === stepPanels.length - 1) {
        closeModal();
        return;
      }
      if (!validateStep()) {
        return;
      }
      if (currentStep === 8 && !orderSubmitted) {
        orderSubmitted = true;
        const total = calculateTotal();
        const payload = new FormData();
        payload.append('client_name', loginNameInput ? loginNameInput.value.trim() : '');
        payload.append('client_phone', loginPhoneInput ? loginPhoneInput.value.trim() : '');
        payload.append('client_cpf', loginCpfInput ? loginCpfInput.value.trim() : '');
        payload.append('product', selections.product || '');
        payload.append('format', formatSizeLabel() || selections.format || '');
        payload.append('paper', selections.paper || '');
        payload.append('quantity', String(Number(selections.quantity) || 0));
        payload.append('payment', selections.payment || '');
        payload.append('total', String(Number(total) || 0));
        payload.append('art_ready', selections.artReady || '');
        if (clientFileInput && clientFileInput.files && clientFileInput.files[0]) {
          payload.append('client_file', clientFileInput.files[0]);
        }
        if (clientRefsInput && clientRefsInput.files && clientRefsInput.files.length) {
          Array.from(clientRefsInput.files).forEach((file) => {
            payload.append('client_refs[]', file);
          });
        }
        fetch('api/orders_create.php', {
          method: 'POST',
          body: payload,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Erro ao enviar.');
            }
            return response.json();
          })
          .then((data) => {
            if (orderSuccess) {
              const orderId = data && data.id ? ` Pedido #${data.id}.` : '';
              orderSuccess.textContent = `Pedido enviado com sucesso.${orderId}`;
              orderSuccess.hidden = false;
            }
            if (orderError) {
              orderError.hidden = true;
            }
            loadClientOrders();
          })
          .catch(() => {
            orderSubmitted = false;
            if (orderError) {
              orderError.hidden = false;
            }
          });
      }
      if (currentStep === 5 && shouldSkipDesign()) {
        setStep(7);
        return;
      }
      setStep(currentStep + 1);
    });
  }

  if (modal) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  const infoModals = Array.from(document.querySelectorAll('.modal')).filter(
    (node) => node.id !== 'flow-modal',
  );
  const modalStack = [];

  const closeInfoModal = (target, options = {}) => {
    if (!target) {
      return;
    }
    const active = document.activeElement;
    if (active && target.contains(active)) {
      active.blur();
    }
    target.classList.remove('is-open');
    target.setAttribute('aria-hidden', 'true');
    target.setAttribute('inert', '');
    document.body.classList.remove('modal-open');
    if (options.back === false) {
      return;
    }
    const previousId = modalStack.pop();
    if (previousId) {
      const previous = document.getElementById(previousId);
      openInfoModal(previous, { skipStack: true });
    }
  };

  const openInfoModal = (target, options = {}) => {
    if (!target) {
      return;
    }
    const currentOpen = infoModals.find((modalNode) => modalNode.classList.contains('is-open'));
    if (currentOpen && currentOpen !== target) {
      if (!options.skipStack) {
        modalStack.push(currentOpen.id);
      }
      closeInfoModal(currentOpen, { back: false });
    }
    target.classList.add('is-open');
    target.setAttribute('aria-hidden', 'false');
    target.removeAttribute('inert');
    document.body.classList.add('modal-open');
  };

  infoModals.forEach((modalNode) => {
    modalNode.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', () => closeInfoModal(modalNode));
    });
  });

  const loginEditToggle = document.getElementById('login-edit-toggle');
  const loginSummary = document.getElementById('login-summary');
  const loginSuccess = document.getElementById('login-success');
  const loginName = document.getElementById('login-name');
  const loginPhone = document.getElementById('login-phone');
  const loginCpf = document.getElementById('login-cpf');
  const loginNameInput = document.getElementById('login-name-input');
  const loginPhoneInput = document.getElementById('login-phone-input');
  const loginCpfInput = document.getElementById('login-cpf-input');

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

  if (loginPhoneInput) {
    loginPhoneInput.addEventListener('input', () => {
      loginPhoneInput.value = formatPhone(loginPhoneInput.value);
    });
  }

  if (loginCpfInput) {
    loginCpfInput.addEventListener('input', () => {
      loginCpfInput.value = formatCpf(loginCpfInput.value);
    });
  }

  if (loginEditToggle) {
    loginEditToggle.addEventListener('click', () => {
      if (loginName && loginNameInput) {
        loginName.textContent = loginNameInput.value.trim() || loginName.textContent;
      }
      if (loginPhone && loginPhoneInput) {
        loginPhone.textContent = loginPhoneInput.value.trim() || loginPhone.textContent;
      }
      if (loginCpf && loginCpfInput) {
        loginCpf.textContent = loginCpfInput.value.trim() || loginCpf.textContent;
      }
      if (loginSummary) {
        loginSummary.hidden = false;
      }
      if (loginSuccess) {
        loginSuccess.hidden = false;
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') {
      return;
    }
    const currentOpen = infoModals.find((modalNode) => modalNode.classList.contains('is-open'));
    if (currentOpen) {
      closeInfoModal(currentOpen);
    }
  });

  const adjustModal = document.getElementById('modal-adjust');
  const adjustSend = document.getElementById('adjust-send');
  const adjustSendNew = document.getElementById('adjust-send-new');
  const adjustSuccess = document.getElementById('adjust-success');
  if (adjustModal && adjustSuccess) {
    const adjustTextarea = adjustModal.querySelector('textarea');
    const adjustFile = adjustModal.querySelector('input[type="file"]');

    const showAdjustSuccess = () => {
      adjustSuccess.hidden = false;
    };

    const resetAdjustForm = () => {
      if (adjustTextarea) {
        adjustTextarea.value = '';
      }
      if (adjustFile) {
        adjustFile.value = '';
      }
      adjustSuccess.hidden = true;
    };

    if (adjustSend) {
      adjustSend.addEventListener('click', showAdjustSuccess);
    }
    if (adjustSendNew) {
      adjustSendNew.addEventListener('click', () => {
        resetAdjustForm();
      });
    }
    adjustModal.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', resetAdjustForm);
    });
  }

  const approveConfirm = document.getElementById('approve-confirm');
  const approveModal = document.getElementById('modal-approve');
  const artModal = document.getElementById('modal-art');
  const approvedModal = document.getElementById('modal-approved');
  if (approveConfirm) {
    approveConfirm.addEventListener('click', () => {
      closeInfoModal(approveModal);
      closeInfoModal(artModal);
      openInfoModal(approvedModal);
    });
  }

  let openOrderMenu = null;
  const closeAllOrderMenus = () => {
    if (openOrderMenu) {
      openOrderMenu.classList.remove('is-open');
      openOrderMenu = null;
    }
  };

  document.addEventListener('click', (event) => {
    const modalTrigger = event.target.closest('[data-modal-open]');
    if (modalTrigger) {
      const targetId = modalTrigger.getAttribute('data-modal-open');
      const target = document.getElementById(targetId);
      if (targetId === 'modal-art-upload') {
        const step = event.target.closest('.step');
        const orderIdRaw = step ? step.getAttribute('data-order-id') : null;
        artOrderId = orderIdRaw ? Number(orderIdRaw) : null;
        if (artOrderLabel) {
          artOrderLabel.textContent = artOrderId ? `Pedido: #${artOrderId}` : 'Pedido: -';
        }
        if (artSuccess) {
          artSuccess.hidden = true;
        }
        if (artError) {
          artError.hidden = true;
        }
        if (artFileInput) {
          artFileInput.value = '';
        }
      }
      openInfoModal(target);
      return;
    }

    const toggle = event.target.closest('.order-menu__toggle');
    if (toggle) {
      event.stopPropagation();
      const menu = toggle.closest('.order-menu');
      if (!menu) {
        return;
      }
      if (openOrderMenu && openOrderMenu !== menu) {
        openOrderMenu.classList.remove('is-open');
      }
      const willOpen = openOrderMenu !== menu;
      menu.classList.toggle('is-open', willOpen);
      openOrderMenu = willOpen ? menu : null;
      return;
    }

    const cancelButton = event.target.closest('.order-cancel');
    if (cancelButton) {
      const container = cancelButton.closest('[data-status]');
      const status = container ? container.dataset.status : null;
      if (status === 'producao') {
        return;
      }
      const orderId = Number(cancelButton.dataset.order) || null;
      cancelClientOrderRequest(orderId);
      return;
    }

    const editButton = event.target.closest('.order-edit');
    if (editButton) {
      const orderId = editButton.dataset.order || 'pedido';
      window.alert(`Editar ${orderId} (em breve).`);
      return;
    }

    if (!event.target.closest('.order-menu')) {
      closeAllOrderMenus();
    }
  });

  const carouselTrack = document.querySelector('.carousel-track');
  if (carouselTrack) {
    const items = Array.from(carouselTrack.children);
    if (items.length) {
      let index = 0;
      items[0].classList.add('is-active');
      setInterval(() => {
        const current = items[index];
        current.classList.add('is-exiting');
        current.classList.remove('is-active');
        index = (index + 1) % items.length;
        const next = items[index];
        next.classList.remove('is-exiting');
        next.classList.add('is-active');
        setTimeout(() => {
          current.classList.remove('is-exiting');
        }, 460);
      }, 2600);
    }
  }

  const ordersList = document.getElementById('orders-list');
  const clientOrdersList = document.getElementById('client-orders-list');
  const clientCancelError = document.getElementById('client-cancel-error');
  const statusOrderLabel = document.getElementById('status-order-label');
  const statusSelect = document.getElementById('status-select');
  const statusResponsavel = document.getElementById('status-responsavel');
  const statusNotes = document.getElementById('status-notes');
  const statusSave = document.getElementById('status-save');
  const statusSuccess = document.getElementById('status-success');
  const statusError = document.getElementById('status-error');
  const orderDetailsModal = document.getElementById('modal-order-details');
  const orderDetailsId = document.getElementById('order-details-id');
  const orderDetailsClient = document.getElementById('order-details-client');
  const orderDetailsCpf = document.getElementById('order-details-cpf');
  const orderDetailsPhone = document.getElementById('order-details-phone');
  const orderDetailsProduct = document.getElementById('order-details-product');
  const orderDetailsFormat = document.getElementById('order-details-format');
  const orderDetailsPaper = document.getElementById('order-details-paper');
  const orderDetailsQuantity = document.getElementById('order-details-quantity');
  const orderDetailsArt = document.getElementById('order-details-art');
  const orderDetailsFile = document.getElementById('order-details-file');
  const orderDetailsRefs = document.getElementById('order-details-refs');
  const orderDetailsArtFile = document.getElementById('order-details-art-file');
  const orderDetailsPayment = document.getElementById('order-details-payment');
  const orderDetailsTotal = document.getElementById('order-details-total');
  const orderDetailsStatus = document.getElementById('order-details-status');
  const orderDetailsDate = document.getElementById('order-details-date');
  const artOrderLabel = document.getElementById('art-order-label');
  const artResponsavel = document.getElementById('art-responsavel');
  const artFileInput = document.getElementById('art-file');
  const artNotes = document.getElementById('art-notes');
  const artSave = document.getElementById('art-save');
  const artSuccess = document.getElementById('art-success');
  const artError = document.getElementById('art-error');
  let statusOrderId = null;
  let artOrderId = null;
  const ordersCache = new Map();
  const formatStatus = (status) => {
    if (!status) {
      return 'Aguardando';
    }
    const normalized = String(status).toLowerCase();
    if (normalized === 'producao' || normalized === 'em producao') return 'Em producao';
    if (normalized === 'pronto') return 'Pronto para retirada';
    if (normalized === 'entregue') return 'Entregue';
    if (normalized === 'cancelado') return 'Cancelado';
    if (normalized.includes('arte')) return 'Aguardando confirmacao da arte';
    return 'Aguardando confirmacao';
  };

  const normalizeStatus = (status) =>
    String(status || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const isProductionStatus = (status) => {
    const normalized = normalizeStatus(status);
    return normalized === 'producao' || normalized === 'em producao';
  };

  const fillOrderDetails = (orderId, order) => {
    if (!order) {
      return false;
    }
    if (orderDetailsId) {
      orderDetailsId.textContent = orderId ? `Pedido: #${orderId}` : 'Pedido: -';
    }
    if (orderDetailsClient) {
      orderDetailsClient.textContent = order.client_name || '-';
    }
    if (orderDetailsCpf) {
      orderDetailsCpf.textContent = order.client_cpf || '-';
    }
    if (orderDetailsPhone) {
      orderDetailsPhone.textContent = order.client_phone || '-';
    }
    if (orderDetailsProduct) {
      orderDetailsProduct.textContent = order.product || '-';
    }
    if (orderDetailsFormat) {
      orderDetailsFormat.textContent = order.format || '-';
    }
    if (orderDetailsPaper) {
      orderDetailsPaper.textContent = order.paper || '-';
    }
    if (orderDetailsQuantity) {
      orderDetailsQuantity.textContent = order.quantity ? String(order.quantity) : '-';
    }
    if (orderDetailsArt) {
      orderDetailsArt.textContent = order.art_ready || '-';
    }
    if (orderDetailsFile) {
      if (order.client_file) {
        const fileName = order.client_file_name || 'arquivo';
        orderDetailsFile.innerHTML = `<a href="${order.client_file}" download target="_blank" rel="noopener">Baixar ${fileName}</a>`;
      } else {
        orderDetailsFile.textContent = 'Nenhum arquivo enviado.';
      }
    }
    if (orderDetailsRefs) {
      if (order.client_refs) {
        let refs = [];
        let refsNames = [];
        try {
          refs = JSON.parse(order.client_refs);
        } catch (error) {
          refs = [];
        }
        try {
          refsNames = JSON.parse(order.client_refs_names || '[]');
        } catch (error) {
          refsNames = [];
        }
        if (Array.isArray(refs) && refs.length) {
          orderDetailsRefs.innerHTML = refs
            .map((ref, index) => {
              const refName = refsNames[index] || `Referencia ${index + 1}`;
              return `<a href="${ref}" download target="_blank" rel="noopener">${refName}</a>`;
            })
            .join(' ');
        } else {
          orderDetailsRefs.textContent = 'Nenhuma referencia enviada.';
        }
      } else {
        orderDetailsRefs.textContent = 'Nenhuma referencia enviada.';
      }
    }
    if (orderDetailsArtFile) {
      if (order.art_file) {
        const artName = order.art_file_name || 'arte';
        orderDetailsArtFile.innerHTML = `<a href="${order.art_file}" download target="_blank" rel="noopener">Baixar ${artName}</a>`;
      } else {
        orderDetailsArtFile.textContent = 'Nenhuma arte anexada.';
      }
    }
    if (orderDetailsPayment) {
      orderDetailsPayment.textContent = order.payment || '-';
    }
    if (orderDetailsTotal) {
      const totalValue = Number(order.total);
      orderDetailsTotal.textContent =
        Number.isFinite(totalValue) && totalValue > 0
          ? currencyFormatter.format(totalValue)
          : '-';
    }
    if (orderDetailsStatus) {
      orderDetailsStatus.textContent = formatStatus(order.status);
    }
    if (orderDetailsDate) {
      const createdAt = order.created_at ? new Date(order.created_at) : null;
      orderDetailsDate.textContent = createdAt ? createdAt.toLocaleString('pt-BR') : '-';
    }
    return true;
  };

  const renderOrders = (orders) => {
    if (!ordersList) {
      return;
    }
    if (!Array.isArray(orders) || orders.length === 0) {
      ordersList.innerHTML = `
        <div class="step">
          <strong>Nenhum pedido ainda.</strong>
          <span>Os pedidos feitos no autoatendimento aparecem aqui.</span>
        </div>
      `;
      return;
    }
      ordersList.innerHTML = orders
        .map((order) => {
          const orderId = order.id ? `#${order.id}` : '';
          const clientName = order.client_name || 'Cliente';
          const product = order.product || 'Produto';
          const statusLabel = formatStatus(order.status);
          const cardClass = statusCardClass(order.status);
          const accent = statusCardAccent(order.status);
          const shadow = statusCardShadow(order.status);
          const tint = statusCardTint(order.status);
          const cardStyle = `--order-accent: ${accent}; --order-accent-shadow: ${shadow}; --order-accent-tint: ${tint};`;
          return `
            <div class="step order-card ${cardClass}" data-order-id="${order.id || ''}" style="${cardStyle}">
              <strong>Pedido ${orderId}</strong>
              <span>Cliente: ${clientName} | Produto: ${product} | Status: ${statusLabel}</span>
              <div class="status-actions">
              <button class="cta secondary" type="button" data-order-details>Ver detalhes</button>
              <button class="cta secondary" type="button" data-modal-open="modal-art-upload" data-order-id="${order.id || ''}">
                Anexar arte
              </button>
              <button class="cta secondary" type="button" data-modal-open="modal-status-update" data-order-id="${order.id || ''}">
                Atualizar status
              </button>
              <button class="cta secondary" type="button" data-modal-open="modal-notify">Enviar aviso</button>
            </div>
          </div>
        `;
      })
      .join('');
  };

    const loadOrders = async () => {
    if (!ordersList) {
      return;
    }
    try {
      const response = await fetch('api/orders_list.php', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos.');
      }
      const data = await response.json();
      ordersCache.clear();
      if (Array.isArray(data)) {
        data.forEach((order) => {
          if (order && order.id) {
            ordersCache.set(Number(order.id), order);
          }
        });
      }
      renderOrders(data);
    } catch (error) {
      ordersList.innerHTML = `
        <div class="step">
          <strong>Falha ao carregar pedidos.</strong>
          <span>Verifique a API e o banco de dados.</span>
        </div>
      `;
    }
  };

  loadOrders();

  if (ordersList && orderDetailsModal) {
    ordersList.addEventListener('click', (event) => {
      const actionButton = event.target.closest('button');
      const wantsDetails = actionButton && actionButton.hasAttribute('data-order-details');
      if (actionButton && !wantsDetails) {
        return;
      }
      const step = event.target.closest('.step');
      if (!step) {
        return;
      }
      const orderIdRaw = step.getAttribute('data-order-id');
      const orderId = orderIdRaw ? Number(orderIdRaw) : null;
      const order = orderId ? ordersCache.get(orderId) : null;
      if (!fillOrderDetails(orderId, order)) {
        return;
      }
      openInfoModal(orderDetailsModal);
    });
  }

  const statusDotClass = (status) => {
    if (!status) return 'status-dot--blue';
    const normalized = normalizeStatus(status);
    if (normalized === 'producao' || normalized === 'em producao') return 'status-dot--yellow';
    if (normalized === 'pronto') return 'status-dot--green';
    if (normalized === 'entregue') return 'status-dot--green';
    if (normalized === 'cancelado') return 'status-dot--red';
    if (normalized.includes('arte')) return 'status-dot--red';
    return 'status-dot--blue';
  };

  const statusCardClass = (status) => {
    if (!status) return 'order-card--blue';
    const normalized = normalizeStatus(status);
    if (normalized === 'producao' || normalized === 'em producao') return 'order-card--yellow';
    if (normalized === 'pronto') return 'order-card--green';
    if (normalized === 'entregue') return 'order-card--green';
    if (normalized === 'cancelado') return 'order-card--red';
    if (normalized.includes('arte')) return 'order-card--red';
    return 'order-card--blue';
  };

  const statusCardAccent = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'producao' || normalized === 'em producao') return '#f8d23c';
    if (normalized === 'pronto' || normalized === 'entregue') return '#2fd46c';
    if (normalized === 'cancelado' || normalized.includes('arte')) return '#e10600';
    return '#4aa3ff';
  };

  const statusCardShadow = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'producao' || normalized === 'em producao') return 'rgba(248, 210, 60, 0.25)';
    if (normalized === 'pronto' || normalized === 'entregue') return 'rgba(47, 212, 108, 0.25)';
    if (normalized === 'cancelado' || normalized.includes('arte')) return 'rgba(225, 6, 0, 0.25)';
    return 'rgba(74, 163, 255, 0.25)';
  };

  const statusCardTint = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === 'producao' || normalized === 'em producao') return 'rgba(248, 210, 60, 0.12)';
    if (normalized === 'pronto' || normalized === 'entregue') return 'rgba(47, 212, 108, 0.12)';
    if (normalized === 'cancelado' || normalized.includes('arte')) return 'rgba(225, 6, 0, 0.12)';
    return 'rgba(74, 163, 255, 0.12)';
  };

  const renderClientOrders = (orders) => {
    if (!clientOrdersList) {
      return;
    }
    if (!Array.isArray(orders) || orders.length === 0) {
      clientOrdersList.innerHTML = `
        <div class="status-line status-line--boxed">
          <span class="status-dot status-dot--blue"></span>
          <strong>Nenhum pedido ainda.</strong>
        </div>
      `;
      return;
    }
    clientOrdersList.innerHTML = orders
      .map((order) => {
        const orderId = order.id ? `#${order.id}` : '';
        const statusLabel = formatStatus(order.status);
        const dotClass = statusDotClass(order.status);
        const cancelMarkup = isProductionStatus(order.status)
          ? '<span class="cta secondary is-disabled" aria-disabled="true">Cancelamento indisponivel</span>'
          : `<a class="cta secondary order-cancel" href="api/orders_cancel.php?order_id=${order.id || 0}" data-order="${order.id || ''}" role="button">
                  Cancelar
                </a>`;
        return `
          <div class="status-line status-line--boxed" data-status="${order.status || ''}">
            <span class="status-dot ${dotClass}"></span>
            <strong>Pedido ${orderId}</strong> - ${statusLabel}.
            <div class="order-menu">
              <button class="order-menu__toggle" type="button" aria-label="Mais opcoes">...</button>
              <div class="order-menu__panel">
                ${cancelMarkup}
                <button class="cta secondary order-edit" type="button" data-order="${order.id || ''}">Editar pedido</button>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  };

  const loadClientOrders = async () => {
    if (!clientOrdersList) {
      return;
    }
    try {
      const response = await fetch('api/orders_list.php', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Erro ao buscar pedidos.');
      }
      const data = await response.json();
      renderClientOrders(data);
    } catch (error) {
      clientOrdersList.innerHTML = `
        <div class="status-line status-line--boxed">
          <span class="status-dot status-dot--red"></span>
          <strong>Falha ao carregar pedidos.</strong>
        </div>
      `;
    }
  };

  loadClientOrders();

  const cancelClientOrderRequest = (orderId) => {
    if (!orderId) {
      return false;
    }
    if (clientCancelError) {
      clientCancelError.hidden = true;
      clientCancelError.textContent = '';
    }
    const confirmed = window.confirm(`Deseja cancelar o Pedido #${orderId}?`);
    if (!confirmed) {
      return false;
    }
    fetch('api/orders_cancel.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_id: orderId }),
    })
      .then(async (response) => {
        if (!response.ok) {
          let message = 'Erro ao cancelar.';
          try {
            const data = await response.json();
            if (data && data.error) {
              message = data.error;
            }
          } catch (error) {
            // ignore parsing errors
          }
          throw new Error(message);
        }
        return response.json();
      })
      .then(() => {
        loadClientOrders();
        loadOrders();
      })
      .catch((error) => {
        if (clientCancelError) {
          clientCancelError.textContent = error.message || 'Nao foi possivel cancelar.';
          clientCancelError.hidden = false;
        } else {
          window.alert(error.message || 'Nao foi possivel cancelar.');
        }
      });
    return false;
  };

  window.cancelClientOrder = cancelClientOrderRequest;

  if (clientOrdersList) {
    clientOrdersList.addEventListener('click', (event) => {
      const toggle = event.target.closest('.order-menu__toggle');
      if (toggle) {
        event.stopPropagation();
        const menu = toggle.closest('.order-menu');
        if (!menu) {
          return;
        }
        if (openOrderMenu && openOrderMenu !== menu) {
          openOrderMenu.classList.remove('is-open');
        }
        const willOpen = openOrderMenu !== menu;
        menu.classList.toggle('is-open', willOpen);
        openOrderMenu = willOpen ? menu : null;
        return;
      }

      const cancelButton = event.target.closest('.order-cancel');
      if (cancelButton) {
        event.preventDefault();
        event.stopPropagation();
        const container = cancelButton.closest('[data-status]');
        const status = container ? container.dataset.status : null;
        if (status === 'producao') {
          return;
        }
        const orderId = Number(cancelButton.dataset.order) || null;
        const confirmed = window.confirm(`Deseja cancelar o Pedido #${orderId}?`);
        if (!confirmed || !orderId) {
          return;
        }
        fetch('api/orders_cancel.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ order_id: orderId }),
        })
          .then(async (response) => {
            if (!response.ok) {
              let message = 'Erro ao cancelar.';
              try {
                const data = await response.json();
                if (data && data.error) {
                  message = data.error;
                }
              } catch (error) {
                // ignore parsing errors
              }
              throw new Error(message);
            }
            return response.json();
          })
          .then(() => {
            loadClientOrders();
            loadOrders();
          })
          .catch((error) => {
            window.alert(error.message || 'Nao foi possivel cancelar.');
          });
        return;
      }

      const editButton = event.target.closest('.order-edit');
      if (editButton) {
        event.stopPropagation();
        const orderId = editButton.dataset.order || 'pedido';
        window.alert(`Editar ${orderId} (em breve).`);
      }
    });
  }

  if (statusSave) {
    statusSave.addEventListener('click', () => {
      if (!statusOrderId || !statusSelect) {
        return;
      }
      if (statusSuccess) {
        statusSuccess.hidden = true;
      }
      if (statusError) {
        statusError.hidden = true;
      }
      fetch('api/orders_update_status.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: statusOrderId,
          status: statusSelect.value,
          responsavel: statusResponsavel ? statusResponsavel.value.trim() : '',
          notes: statusNotes ? statusNotes.value.trim() : '',
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao atualizar.');
          }
          return response.json();
        })
        .then(() => {
          if (statusSuccess) {
            statusSuccess.hidden = false;
          }
          loadOrders();
          loadClientOrders();
        })
        .catch(() => {
          if (statusError) {
            statusError.hidden = false;
          }
        });
    });
  }

  if (artSave) {
    artSave.addEventListener('click', () => {
      if (!artOrderId) {
        return;
      }
      if (artSuccess) {
        artSuccess.hidden = true;
      }
      if (artError) {
        artError.hidden = true;
      }
      const payload = new FormData();
      payload.append('order_id', String(artOrderId));
      payload.append('responsavel', artResponsavel ? artResponsavel.value.trim() : '');
      payload.append('notes', artNotes ? artNotes.value.trim() : '');
      if (artFileInput && artFileInput.files && artFileInput.files[0]) {
        payload.append('art_file', artFileInput.files[0]);
      }
      fetch('api/orders_upload_art.php', {
        method: 'POST',
        body: payload,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Erro ao anexar.');
          }
          return response.json();
        })
        .then(() => {
          if (artSuccess) {
            artSuccess.hidden = false;
          }
          loadOrders();
          loadClientOrders();
        })
        .catch(() => {
          if (artError) {
            artError.hidden = false;
          }
        });
    });
  }


  document.addEventListener('click', (event) => {
    const statusButton = event.target.closest('[data-modal-open="modal-status-update"]');
    if (!statusButton) {
      return;
    }
    const orderId = statusButton.getAttribute('data-order-id');
    statusOrderId = orderId ? Number(orderId) : null;
    if (statusOrderLabel) {
      statusOrderLabel.textContent = statusOrderId ? `Pedido: #${statusOrderId}` : 'Pedido: -';
    }
    if (statusSuccess) {
      statusSuccess.hidden = true;
    }
    if (statusError) {
      statusError.hidden = true;
    }
  });

})();

