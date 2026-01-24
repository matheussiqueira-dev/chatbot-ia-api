// DOM references
const form = document.querySelector("#userForm");
const list = document.querySelector("#userList");
const clearBtn = document.querySelector("#clearList");
const message = document.querySelector("#message");
const countBadge = document.querySelector("#count");
const emptyState = document.querySelector("#emptyState");
const themeToggle = document.querySelector("#themeToggle");
const themeToggleText = document.querySelector(".theme-toggle__text");

const fields = {
  username: document.querySelector("#username"),
  password: document.querySelector("#password"),
  phone: document.querySelector("#phone"),
  birthdate: document.querySelector("#birthdate"),
  email: document.querySelector("#email"),
};

const errorElements = {
  username: document.querySelector("#usernameError"),
  password: document.querySelector("#passwordError"),
  phone: document.querySelector("#phoneError"),
  birthdate: document.querySelector("#birthdateError"),
  email: document.querySelector("#emailError"),
};

const inputs = Object.values(fields);

const STORAGE_KEY = "formHandlerUsers";
const THEME_KEY = "formHandlerTheme";

let users = [];

// UI helpers
const showMessage = (type, text) => {
  message.textContent = text;
  message.classList.remove("message--success", "message--error", "message--info");
  message.classList.add(`message--${type}`, "message--visible");
};

const clearMessage = () => {
  message.textContent = "";
  message.classList.remove(
    "message--success",
    "message--error",
    "message--info",
    "message--visible"
  );
};

const updateListState = (count) => {
  countBadge.textContent = String(count);
  emptyState.hidden = count > 0;
};

const setFieldMessage = (input, text) => {
  const errorEl = errorElements[input.id];
  if (!errorEl) {
    return;
  }

  errorEl.textContent = text;
  if (text) {
    errorEl.classList.add("field__message--visible");
    return;
  }

  errorEl.classList.remove("field__message--visible");
};

const markInvalid = (input) => {
  input.classList.add("is-invalid");
  input.classList.remove("is-valid");
  input.setAttribute("aria-invalid", "true");
};

const markValid = (input) => {
  input.classList.remove("is-invalid");
  input.classList.add("is-valid");
  input.setAttribute("aria-invalid", "false");
};

const resetValidation = () => {
  inputs.forEach((input) => {
    input.classList.remove("is-invalid", "is-valid");
    input.removeAttribute("aria-invalid");
    setFieldMessage(input, "");
  });
};

// Validation logic
const getErrorMessage = (input) => {
  const value = input.value.trim();

  if (!value) {
    return "Campo obrigatório.";
  }

  if (input.id === "password" && value.length < 6) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  if (input.type === "email" && !input.checkValidity()) {
    return "Informe um e-mail válido.";
  }

  return "";
};

const validateInput = (input) => {
  const errorMessage = getErrorMessage(input);

  if (errorMessage) {
    markInvalid(input);
    setFieldMessage(input, errorMessage);
    return false;
  }

  markValid(input);
  setFieldMessage(input, "");
  return true;
};

const validateFields = () => {
  let isValid = true;

  inputs.forEach((input) => {
    if (!validateInput(input)) {
      isValid = false;
    }
  });

  return isValid;
};

// Storage helpers
const loadUsers = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Erro ao ler dados salvos:", error);
    return [];
  }
};

const saveUsers = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Theme helpers
const setTheme = (theme) => {
  const isDark = theme === "dark";
  document.body.classList.toggle("theme-dark", isDark);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
  }
  if (themeToggleText) {
    themeToggleText.textContent = isDark ? "Modo claro" : "Modo escuro";
  }
};

const getPreferredTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

// Dynamic card creation
const formatBirthdate = (value) => {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
};

const createUserCard = (data, index) => {
  const item = document.createElement("li");
  item.className = "user-card";
  item.style.setProperty("--delay", `${Math.min(index, 10) * 0.05}s`);

  const top = document.createElement("div");
  top.className = "user-card__top";

  const name = document.createElement("h3");
  name.textContent = data.username;

  const email = document.createElement("span");
  email.className = "user-card__email";
  email.textContent = data.email;

  top.appendChild(name);
  top.appendChild(email);

  const meta = document.createElement("ul");
  meta.className = "user-card__meta";

  const addMeta = (label, value) => {
    const row = document.createElement("li");

    const labelEl = document.createElement("span");
    labelEl.className = "meta__label";
    labelEl.textContent = label;

    const valueEl = document.createElement("span");
    valueEl.className = "meta__value";
    valueEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valueEl);
    meta.appendChild(row);
  };

  const passwordLength = Number(data.passwordLength) || 0;
  const maskedPassword = "*".repeat(Math.max(passwordLength, 4));

  addMeta("Telefone", data.phone);
  addMeta("Nascimento", formatBirthdate(data.birthdate));
  addMeta("Senha", `${maskedPassword} (${passwordLength} caracteres)`);

  item.appendChild(top);
  item.appendChild(meta);

  return item;
};

const renderUsers = () => {
  list.innerHTML = "";

  const fragment = document.createDocumentFragment();
  users.forEach((user, index) => {
    fragment.appendChild(createUserCard(user, index));
  });

  list.appendChild(fragment);
  updateListState(users.length);
};

// Events
form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearMessage();

  const isValid = validateFields();

  if (!isValid) {
    console.error("Preencha todos os campos antes de enviar o formulário.");
    showMessage("error", "Campos obrigatórios em branco. Revise antes de enviar.");
    return;
  }

  const formData = {
    username: fields.username.value.trim(),
    passwordLength: fields.password.value.length,
    phone: fields.phone.value.trim(),
    birthdate: fields.birthdate.value,
    email: fields.email.value.trim(),
  };

  users.push(formData);
  saveUsers();
  renderUsers();
  showMessage("success", "Cadastro adicionado com sucesso.");

  form.reset();
  resetValidation();
});

clearBtn.addEventListener("click", () => {
  users = [];
  saveUsers();
  renderUsers();
  showMessage("info", "Lista limpa. Você pode iniciar um novo cadastro.");
});

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    validateInput(input);
  });

  input.addEventListener("blur", () => {
    validateInput(input);
  });
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("theme-dark");
    const theme = isDark ? "dark" : "light";
    localStorage.setItem(THEME_KEY, theme);
    themeToggle.setAttribute("aria-pressed", String(isDark));
    if (themeToggleText) {
      themeToggleText.textContent = isDark ? "Modo claro" : "Modo escuro";
    }
  });
}

// Init
users = loadUsers();
renderUsers();
setTheme(getPreferredTheme());
