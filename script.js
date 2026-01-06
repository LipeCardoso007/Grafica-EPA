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
  const designFee = 25;

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
    syncSummary();
  };

  const openModal = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (quantityInput && !quantityInput.value.trim()) {
      quantityInput.value = '1';
      selections.quantity = 1;
    }
    setStep(0);
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
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
        hint.textContent = 'Selecione uma opção para continuar.';
      }
      return false;
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
  const openButtons = document.querySelectorAll('[data-modal-open]');
  const modalStack = [];

  const closeInfoModal = (target, options = {}) => {
    if (!target) {
      return;
    }
    target.classList.remove('is-open');
    target.setAttribute('aria-hidden', 'true');
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
    document.body.classList.add('modal-open');
  };

  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-modal-open');
      const target = document.getElementById(targetId);
      openInfoModal(target);
    });
  });

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

  const closeAllOrderMenus = () => {
    document.querySelectorAll('.order-menu').forEach((menu) => {
      menu.classList.remove('is-open');
    });
  };

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.order-menu')) {
      closeAllOrderMenus();
    }
  });

  document.querySelectorAll('.order-menu__toggle').forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const menu = toggle.closest('.order-menu');
      if (!menu) {
        return;
      }
      const wasOpen = menu.classList.contains('is-open');
      closeAllOrderMenus();
      if (!wasOpen) {
        menu.classList.add('is-open');
      }
    });
  });

  const cancelButtons = document.querySelectorAll('.order-cancel');
  cancelButtons.forEach((button) => {
    const container = button.closest('[data-status]');
    const status = container ? container.dataset.status : null;
    if (status === 'producao') {
      button.disabled = true;
      button.textContent = 'Nao cancelavel';
    }
    button.addEventListener('click', () => {
      if (status === 'producao') {
        return;
      }
      const orderId = button.dataset.order || 'Pedido';
      const confirmed = window.confirm(`Deseja cancelar o ${orderId}?`);
      if (!confirmed) {
        return;
      }
      if (container) {
        container.dataset.status = 'cancelado';
        const dot = container.querySelector('.status-dot');
        if (dot) {
          dot.className = 'status-dot status-dot--red';
        }
        container.innerHTML = `<span class=\"status-dot status-dot--red\"></span><strong>${orderId}</strong> - Cancelado.`;
      }
    });
  });

  document.querySelectorAll('.order-edit').forEach((button) => {
    button.addEventListener('click', () => {
      const orderId = button.dataset.order || 'pedido';
      window.alert(`Editar ${orderId} (em breve).`);
    });
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
})();

