import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import MotivationalPanel from './components/MotivationalPanel';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        </div>

        {/* Right Panel - Motivational Content (Desktop Only) */}
        <div className="flex-1 relative">
          <MotivationalPanel />
        </div>
      </div>

      {/* Mobile Motivational Content */}
      <div className="lg:hidden px-6 py-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Transform Your Engineering Journey
            </h2>
            <p className="text-muted-foreground">
              Join 50,000+ engineers mastering complex concepts through interactive, gamified learning experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 py-6">
            <div className="text-center">
              <div className="text-xl font-bold text-primary">50K+</div>
              <div className="text-xs text-muted-foreground">Learners</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">1000+</div>
              <div className="text-xs text-muted-foreground">Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary">95%</div>
              <div className="text-xs text-muted-foreground">Success</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;