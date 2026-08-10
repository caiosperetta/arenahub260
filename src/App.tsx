import { Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import LandingLayout from './layouts/LandingLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import DetalheReserva from './pages/DetalheReserva';
import Quadras from './pages/Quadras';
import Clientes from './pages/Clientes';
import DetalheCliente from './pages/DetalheCliente';
import Financeiro from './pages/Financeiro';
import Configuracoes from './pages/Configuracoes';

import PortalCliente from './pages/PortalCliente';
import ConfirmacaoReserva from './pages/ConfirmacaoReserva';
import MinhasReservas from './pages/MinhasReservas';
import PerfilCliente from './pages/PerfilCliente';

function App() {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/landing" element={<Landing />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/reservas/:id" element={<DetalheReserva />} />
        <Route path="/quadras" element={<Quadras />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:id" element={<DetalheCliente />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>

      <Route element={<ClientLayout />}>
        <Route path="/:slug" element={<PortalCliente />} />
        <Route path="/:slug/confirmacao" element={<ConfirmacaoReserva />} />
        <Route path="/:slug/minhas-reservas" element={<MinhasReservas />} />
        <Route path="/:slug/perfil" element={<PerfilCliente />} />
      </Route>
    </Routes>
  );
}

export default App;
