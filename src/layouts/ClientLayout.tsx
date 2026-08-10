import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-[1280px] px-12 py-8">
        <Outlet />
      </main>
    </div>
  );
}
