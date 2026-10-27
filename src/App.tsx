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
import ClienteLogin from './pages/ClienteLogin';
import ClienteCadastro from './pages/ClienteCadastro';

function App() {
  return (
    <Routes>
      <Route element={<LandingLayout />}>
        <Route path="/" element={<Landing />} />
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
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/reservas" element={<Reservas />} />
        <Route path="/app/reservas/:id" element={<DetalheReserva />} />
        <Route path="/app/quadras" element={<Quadras />} />
        <Route path="/app/clientes" element={<Clientes />} />
        <Route path="/app/clientes/:id" element={<DetalheCliente />} />
        <Route path="/app/financeiro" element={<Financeiro />} />
        <Route path="/app/configuracoes" element={<Configuracoes />} />
      </Route>

      <Route path="/:slug/login" element={<ClienteLogin />} />
      <Route path="/:slug/cadastro" element={<ClienteCadastro />} />

      <Route element={<ClientLayout />}>
        <Route path="/:slug/confirmacao" element={<ConfirmacaoReserva />} />
        <Route path="/:slug/minhas-reservas" element={<MinhasReservas />} />
        <Route path="/:slug/perfil" element={<PerfilCliente />} />
        <Route path="/:slug" element={<PortalCliente />} />
      </Route>
    </Routes>
  );
}

export default App;
