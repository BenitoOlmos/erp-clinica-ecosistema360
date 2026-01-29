import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ClientesPage } from './pages/ClientesPage';
import { ProfesionalesPage } from './pages/ProfesionalesPage';
import { ServiciosPage } from './pages/ServiciosPage';
import { CalendarioPage } from './pages/CalendarioPage';
import { ProgramasPage } from './pages/ProgramasPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Placeholder Pages
const Dashboard = () => <div className="p-8"><h1>Dashboard</h1><p>Bienvenido al Sistema Equilibrar</p></div>;

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/profesionales" element={<ProfesionalesPage />} />
        <Route path="/servicios" element={<ServiciosPage />} />
        <Route path="/calendario" element={<CalendarioPage />} />
        <Route path="/programas" element={<ProgramasPage />} />
        {/* Add more routes here */}
      </Route>
    </Routes>
  );
}

export default App;
