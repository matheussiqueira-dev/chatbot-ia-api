const UserForm = ({ formData, errors, touched, onChange, onBlur, onSubmit, onClear, message }) => {
  const getStatusClass = (name) => {
    if (!touched[name]) {
      return "";
    }

    if (errors[name]) {
      return "is-invalid";
    }

    const value = formData[name] ?? "";
    return value.trim() ? "is-valid" : "";
  };

  const getErrorMessage = (name) => (touched[name] ? errors[name] : "");

  const messageClass = message
    ? `message message--${message.type} message--visible`
    : "message";

  return (
    <div className="card__form">
      <div className="section-title">
        <h2>Novo cadastro</h2>
        <p>Preencha todos os campos para gerar um cartão do usuário.</p>
      </div>

      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="username">Nome de usuário</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Ex.: Larissa Souza"
            autoComplete="username"
            value={formData.username}
            onChange={(event) => onChange(event.target.name, event.target.value)}
            onBlur={(event) => onBlur(event.target.name)}
            className={getStatusClass("username")}
            aria-invalid={touched.username && Boolean(errors.username)}
            aria-describedby="usernameError"
            required
          />
          <small className={`field__message ${getErrorMessage("username") ? "field__message--visible" : ""}`}
            id="usernameError">
            {getErrorMessage("username")}
          </small>
        </div>

        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Mínimo de 6 caracteres"
            autoComplete="new-password"
            value={formData.password}
            onChange={(event) => onChange(event.target.name, event.target.value)}
            onBlur={(event) => onBlur(event.target.name)}
            className={getStatusClass("password")}
            aria-invalid={touched.password && Boolean(errors.password)}
            aria-describedby="passwordError"
            required
          />
          <small className={`field__message ${getErrorMessage("password") ? "field__message--visible" : ""}`}
            id="passwordError">
            {getErrorMessage("password")}
          </small>
        </div>

        <div className="field">
          <label htmlFor="phone">Telefone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="(11) 91234-5678"
            autoComplete="tel"
            value={formData.phone}
            onChange={(event) => onChange(event.target.name, event.target.value)}
            onBlur={(event) => onBlur(event.target.name)}
            className={getStatusClass("phone")}
            aria-invalid={touched.phone && Boolean(errors.phone)}
            aria-describedby="phoneError"
            required
          />
          <small className={`field__message ${getErrorMessage("phone") ? "field__message--visible" : ""}`}
            id="phoneError">
            {getErrorMessage("phone")}
          </small>
        </div>

        <div className="field">
          <label htmlFor="birthdate">Data de nascimento</label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
            value={formData.birthdate}
            onChange={(event) => onChange(event.target.name, event.target.value)}
            onBlur={(event) => onBlur(event.target.name)}
            className={getStatusClass("birthdate")}
            aria-invalid={touched.birthdate && Boolean(errors.birthdate)}
            aria-describedby="birthdateError"
            required
          />
          <small className={`field__message ${getErrorMessage("birthdate") ? "field__message--visible" : ""}`}
            id="birthdateError">
            {getErrorMessage("birthdate")}
          </small>
        </div>

        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="voce@email.com"
            autoComplete="email"
            value={formData.email}
            onChange={(event) => onChange(event.target.name, event.target.value)}
            onBlur={(event) => onBlur(event.target.name)}
            className={getStatusClass("email")}
            aria-invalid={touched.email && Boolean(errors.email)}
            aria-describedby="emailError"
            required
          />
          <small className={`field__message ${getErrorMessage("email") ? "field__message--visible" : ""}`}
            id="emailError">
            {getErrorMessage("email")}
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn--primary">Enviar</button>
          <button type="button" className="btn btn--ghost" onClick={onClear}>
            Limpar Lista
          </button>
        </div>

        <div className={messageClass} role="status" aria-live="polite">
          {message ? message.text : ""}
        </div>
      </form>
    </div>
  );
};

export default UserForm;
