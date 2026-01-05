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
        hint.textContent = 'Selecione uma opcao para continuar.';
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
})();
