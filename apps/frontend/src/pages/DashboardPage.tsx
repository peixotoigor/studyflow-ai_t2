import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSummary } from '../hooks/useSummary';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { data, isLoading, error, refetch } = useSummary();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Studyflow</h1>
        <div>
          <span>{user?.name}</span>
          <button onClick={() => navigate('/')}>Abrir Workspace</button>
          <button onClick={logout}>Sair</button>
        </div>
      </header>
      <main>
        {isLoading && <p>Carregando dados...</p>}
        {error && (
          <div className="dashboard-error">
            <p>Não foi possível carregar os dados.</p>
            <button onClick={() => refetch()}>Tentar novamente</button>
          </div>
        )}
        {data && (
          <section className="dashboard-grid">
            <article>
              <h2>Planos</h2>
              <p>{data.plans.length}</p>
            </article>
            <article>
              <h2>Disciplinas</h2>
              <p>{data.plans.reduce((total, plan) => total + (plan.subjects?.length ?? 0), 0)}</p>
            </article>
            <article>
              <h2>Notas Salvas</h2>
              <p>{data.savedNotes.length}</p>
            </article>
            <article>
              <h2>Simulados</h2>
              <p>{data.simulatedExams.length}</p>
            </article>
          </section>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
