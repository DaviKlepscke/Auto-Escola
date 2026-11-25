// =====================================================================
// UTILITÁRIO DE VALIDAÇÃO DE DADOS RIGOROSA NO FRONT-END
// Especialista em Front-End: frontend_electron
// =====================================================================

export const Validators = {
  /**
   * Validação matemática oficial dos dois dígitos verificadores do CPF
   */
  validarCPF(cpfLimpo) {
    const cpf = String(cpfLimpo).replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // Elimina sequências repetidas (111.111...)

    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10), 10)) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11), 10)) return false;

    return true;
  },

  /**
   * Validação de formato do RENACH (padrão estadual + 9 a 11 dígitos)
   */
  validarRenach(renach) {
    if (!renach) return true; // campo opcional no pré-cadastro
    const limpo = renach.trim().toUpperCase();
    return /^[A-Z]{2}\d{8,11}$/.test(limpo);
  },

  /**
   * Validação de Placa de Veículo (Padrão Mercosul BRA1A23 ou Tradicional ABC-1234)
   */
  validarPlaca(placa) {
    const limpo = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const regexMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    const regexAntiga = /^[A-Z]{3}[0-9]{4}$/;
    return regexMercosul.test(limpo) || regexAntiga.test(limpo);
  },

  /**
   * Validação de Telefone Brasileiro (fixo ou celular com DDD)
   */
  validarTelefone(telefone) {
    const limpo = String(telefone).replace(/\D/g, '');
    return limpo.length === 10 || limpo.length === 11;
  },

  /**
   * Validação de E-mail
   */
  validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  /**
   * Validação de Idade Mínima DETRAN:
   * Categorias A, B: mínimo 18 anos
   * Categorias C, D, E: mínimo 21 anos (padrão)
   */
  validarIdadeMinima(dataNascStr, categoria) {
    if (!dataNascStr) return false;
    const nasc = new Date(dataNascStr);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--;
    }

    if (['C', 'D', 'E'].includes(categoria)) {
      return idade >= 21;
    }
    return idade >= 18;
  },

  /**
   * Aplica máscara visual dinâmica de CPF
   */
  mascaraCPF(v) {
    v = v.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
  },

  /**
   * Aplica máscara visual de telefone (11) 98888-7777
   */
  mascaraTelefone(v) {
    v = v.replace(/\D/g, '');
    if (v.length > 11) v = v.substring(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (v.length > 5) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
    }
    return v;
  },

  /**
   * Atualiza as classes Bootstrap is-valid ou is-invalid no elemento de input
   */
  setFieldStatus(inputEl, isValid, feedbackEl, errorMessage = '') {
    if (isValid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      if (feedbackEl) feedbackEl.textContent = '';
    } else {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
      if (feedbackEl) feedbackEl.textContent = errorMessage;
    }
  }
};
