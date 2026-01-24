import { useState } from "react";
import ThemeToggle from "./components/ThemeToggle.jsx";
import UserForm from "./components/UserForm.jsx";
import UserList from "./components/UserList.jsx";
import useLocalStorage from "./hooks/useLocalStorage.js";
import useTheme from "./hooks/useTheme.js";

const STORAGE_KEY = "formHandlerUsersReact";

const initialForm = {
  username: "",
  password: "",
  phone: "",
  birthdate: "",
  email: "",
};

const initialErrors = {
  username: "",
  password: "",
  phone: "",
  birthdate: "",
  email: "",
};

const initialTouched = {
  username: false,
  password: false,
  phone: false,
  birthdate: false,
  email: false,
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (name, value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Campo obrigatório.";
  }

  if (name === "password" && trimmedValue.length < 6) {
    return "A senha precisa ter pelo menos 6 caracteres.";
  }

  if (name === "email" && !emailRegex.test(trimmedValue)) {
    return "Informe um e-mail válido.";
  }

  return "";
};

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

const App = () => {
  const { isDark, toggleTheme } = useTheme();
  const [users, setUsers] = useLocalStorage(STORAGE_KEY, []);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [touched, setTouched] = useState(initialTouched);
  const [message, setMessage] = useState(null);

  const validateField = (name, value) => getErrorMessage(name, value);

  const validateAll = () => {
    let isValid = true;
    const nextErrors = {};
    const nextTouched = {};

    Object.keys(initialForm).forEach((field) => {
      const error = validateField(field, formData[field]);
      nextErrors[field] = error;
      nextTouched[field] = true;
      if (error) {
        isValid = false;
      }
    });

    setErrors(nextErrors);
    setTouched(nextTouched);

    return isValid;
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage(null);

    const isValid = validateAll();

    if (!isValid) {
      console.error("Preencha todos os campos corretamente antes de enviar.");
      setMessage({
        type: "error",
        text: "Existem campos inválidos. Corrija antes de enviar.",
      });
      return;
    }

    const newUser = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      birthdate: formData.birthdate,
      passwordLength: formData.password.length,
    };

    setUsers((prev) => [...prev, newUser]);
    setMessage({ type: "success", text: "Cadastro adicionado com sucesso." });
    setFormData(initialForm);
    setErrors(initialErrors);
    setTouched(initialTouched);
  };

  const handleClear = () => {
    setUsers([]);
    setMessage({ type: "info", text: "Lista limpa. Você pode iniciar um novo cadastro." });
  };

  return (
    <main className="page">
      <header className="page__header">
        <div className="header__top">
          <p className="eyebrow">Eventos DOM • Hooks • UI Premium</p>
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
        <h1>Formulário com React + Hooks</h1>
        <p>
          Gerencie envios, valide campos e persista dados com uma experiência fluida e
          elegante.
        </p>
      </header>

      <section className="card" aria-label="Área principal">
        <UserForm
          formData={formData}
          errors={errors}
          touched={touched}
          onChange={handleChange}
          onBlur={handleBlur}
          onSubmit={handleSubmit}
          onClear={handleClear}
          message={message}
        />
        <UserList users={users} formatBirthdate={formatBirthdate} />
      </section>
    </main>
  );
};

export default App;
