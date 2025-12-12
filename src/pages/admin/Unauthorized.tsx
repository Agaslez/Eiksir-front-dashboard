import React from 'react';
import { Link } from 'react-router-dom';

const AdminUnauthorized: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-amber-500 text-6xl mb-6">⛔</div>
        <h1 className="text-3xl font-bold text-white mb-4">Brak uprawnień</h1>
        <p className="text-gray-400 mb-8">
          Nie masz wystarczających uprawnień do dostępu do tej sekcji.
          Skontaktuj się z administratorem, jeśli uważasz, że to błąd.
        </p>
        <Link
          to="/admin/login"
          className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Wróć do logowania
        </Link>
      </div>
    </div>
  );
};

export default AdminUnauthorized;
