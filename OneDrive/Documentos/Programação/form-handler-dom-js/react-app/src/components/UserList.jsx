const UserCard = ({ user, index, formatBirthdate }) => {
  const passwordLength = Number(user.passwordLength) || 0;
  const maskedPassword = "*".repeat(Math.max(passwordLength, 4));

  return (
    <li className="user-card" style={{ "--delay": `${Math.min(index, 10) * 0.05}s` }}>
      <div className="user-card__top">
        <h3>{user.username}</h3>
        <span className="user-card__email">{user.email}</span>
      </div>
      <ul className="user-card__meta">
        <li>
          <span className="meta__label">Telefone</span>
          <span className="meta__value">{user.phone}</span>
        </li>
        <li>
          <span className="meta__label">Nascimento</span>
          <span className="meta__value">{formatBirthdate(user.birthdate)}</span>
        </li>
        <li>
          <span className="meta__label">Senha</span>
          <span className="meta__value">{`${maskedPassword} (${passwordLength} caracteres)`}</span>
        </li>
      </ul>
    </li>
  );
};

const UserList = ({ users, formatBirthdate }) => {
  return (
    <div className="card__list">
      <div className="list-header">
        <div>
          <h2>Usuários cadastrados</h2>
          <p>Dados válidos aparecem aqui imediatamente.</p>
        </div>
        <span className="badge">{users.length}</span>
      </div>

      <ul className="list" aria-label="Lista de usuários">
        {users.map((user, index) => (
          <UserCard
            key={`${user.email}-${index}`}
            user={user}
            index={index}
            formatBirthdate={formatBirthdate}
          />
        ))}
      </ul>
      <p className="empty" hidden={users.length > 0}>
        Nenhum cadastro ainda.
      </p>
    </div>
  );
};

export default UserList;
