import { Link } from 'react-router-dom';

function DevAccessPageSimple() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>DevAccessPage - Funcionando!</h1>
      <p>Esta é a página de desenvolvimento que deveria estar em /dev</p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>
          <button>← Voltar para Home</button>
        </Link>
        <Link to="/dashboard/dev/trainer">
          <button>Dashboard Treinador</button>
        </Link>
      </div>
    </div>
  );
}

export default DevAccessPageSimple;