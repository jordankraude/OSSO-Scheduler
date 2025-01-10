// app/login/page.tsx
import React from 'react' 
import LoginForm from '@/components/forms/login-form';

const LoginPage: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-screen text-black">
      <LoginForm />
    </div>
  );
};

export default LoginPage;