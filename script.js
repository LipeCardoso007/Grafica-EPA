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
  if (!modal || !startButton) {
    return;
  }

  const stepPanels = Array.from(modal.querySelectorAll('.step-panel'));
  const backButton = document.getElementById('flow-back');
  const nextButton = document.getElementById('flow-next');
  const progressText = document.getElementById('flow-progress');
  const progressBar = document.getElementById('flow-progress-bar');
  const closeButtons = modal.querySelectorAll('[data-close]');
  const optionButtons = modal.querySelectorAll('[data-select]');

  const selections = {
    product: null,
    format: null,
    paper: null,
    payment: null,
  };

  let currentStep = 0;

  const requiredByStep = {
    0: 'product',
    1: 'format',
    2: 'paper',
    6: 'payment',
  };

  const summaryFields = {
    product: document.getElementById('summary-product'),
    format: document.getElementById('summary-format'),
    paper: document.getElementById('summary-paper'),
    payment: document.getElementById('summary-payment'),
  };

  const syncSummary = () => {
    Object.entries(summaryFields).forEach(([key, node]) => {
      if (!node) {
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

  startButton.addEventListener('click', openModal);
  closeButtons.forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  optionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.select;
      const value = button.dataset.value;
      if (!key) {
        return;
      }
      selections[key] = value;
      const siblings = modal.querySelectorAll(`[data-select="${key}"]`);
      siblings.forEach((item) => {
        item.classList.toggle('option--active', item === button);
      });
      clearHint();
      syncSummary();
    });
  });

  if (backButton) {
    backButton.addEventListener('click', () => {
      if (currentStep === 0) {
        return;
      }
      setStep(currentStep - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentStep === stepPanels.length - 1) {
        closeModal();
        return;
      }
      if (!validateStep()) {
        return;
      }
      setStep(currentStep + 1);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  const infoModals = Array.from(document.querySelectorAll('.modal')).filter(
    (node) => node.id !== 'flow-modal',
  );
  const openButtons = document.querySelectorAll('[data-modal-open]');

  const closeInfoModal = (target) => {
    if (!target) {
      return;
    }
    target.classList.remove('is-open');
    target.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  const openInfoModal = (target) => {
    if (!target) {
      return;
    }
    infoModals.forEach((modalNode) => {
      if (modalNode !== target) {
        closeInfoModal(modalNode);
      }
    });
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
    infoModals.forEach((modalNode) => {
      if (modalNode.classList.contains('is-open')) {
        closeInfoModal(modalNode);
      }
    });
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

