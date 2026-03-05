import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LegacyAppPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="legacy-shell">
      <div className="legacy-toolbar" role="toolbar" aria-label="Ações da conta">
        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </div>
      <p style={{ padding: '1rem' }}>
        A versão legada não está mais disponível neste build. Use a interface principal.
      </p>
    </div>
  );
};

export default LegacyAppPage;
