'use client'

import dynamic from 'next/dynamic';

// Dynamically import the Login component with SSR disabled to prevent hydration errors
const Login = dynamic(() => import('./LoginComponent'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ECFEFF 0%, #E0F2FE 50%, #F8FAFC 100%)'
    }}>
      <div>Loading...</div>
    </div>
  ),
});

export default function LoginPage() {
  return <Login />;
}