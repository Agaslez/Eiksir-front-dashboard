import React from 'react';
import LoginForm from '../../components/admin/LoginForm';

const AdminLogin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <LoginForm />
    </div>
  );
};

export default AdminLogin;
