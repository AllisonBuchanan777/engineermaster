import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Demo credentials section
  const demoCredentials = [
    { 
      role: 'Admin', 
      email: 'admin@engineermaster.com', 
      password: 'AdminPass123!',
      description: 'Full platform access, content management'
    },
    { 
      role: 'Instructor', 
      email: 'instructor@engineermaster.com', 
      password: 'InstructorPass123!',
      description: 'Create lessons, manage learning paths'
    },
    { 
      role: 'Student', 
      email: 'student@engineermaster.com', 
      password: 'StudentPass123!',
      description: 'Access lessons, track progress'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await signIn({
        email: formData?.email,
        password: formData?.password
      });

      if (error) {
        if (error?.message?.includes('Invalid login credentials') || 
            error?.message?.includes('Email not confirmed')) {
          setErrors({
            general: 'Invalid email or password. Please try again.'
          });
        } else if (error?.message?.includes('Failed to fetch') || 
                   error?.message?.includes('AuthRetryableFetchError')) {
          setErrors({
            general: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.'
          });
        } else {
          setErrors({
            general: error?.message || 'An error occurred during sign in.'
          });
        }
      } else if (data?.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({
        general: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (credentials) => {
    setFormData({
      email: credentials?.email,
      password: credentials?.password
    });
    
    // Trigger login with demo credentials
    setIsLoading(true);
    try {
      const { data, error } = await signIn({
        email: credentials?.email,
        password: credentials?.password
      });

      if (error) {
        setErrors({
          general: 'Demo login failed. Please ensure your Supabase project is running.'
        });
      } else if (data?.user) {
        navigate('/dashboard');
      }
    } catch (error) {
      setErrors({
        general: 'Demo login failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      // Add this import at the top or get supabase from context
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.REACT_APP_SUPABASE_URL,
        process.env.REACT_APP_SUPABASE_ANON_KEY
      );
      
      const { error } = await supabase?.auth?.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location?.origin}/dashboard`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      setErrors({
        general: `${provider} login is not configured yet.`
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Icon name="Zap" size={24} color="white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
        <p className="text-muted-foreground">Sign in to continue your engineering journey</p>
      </div>
      {/* Demo Credentials Section */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center mb-3">
          <Icon name="Info" size={16} className="text-blue-600 mr-2" />
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Demo Credentials</h3>
        </div>
        <div className="space-y-2">
          {demoCredentials?.map((cred, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {cred?.role}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {cred?.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {cred?.description}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(cred)}
                disabled={isLoading || loading}
                className="ml-2 text-xs py-1 px-2"
              >
                Use
              </Button>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors?.general && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} color="var(--color-error)" />
              <p className="text-sm text-error">{errors?.general}</p>
            </div>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData?.email}
          onChange={handleInputChange}
          error={errors?.email}
          required
        />

        <div className="space-y-2">
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData?.password}
            onChange={handleInputChange}
            error={errors?.password}
            required
          />
          
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-primary hover:text-primary/80 transition-colors duration-150"
              onClick={() => {
                navigate('/forgot-password');
              }}
            >
              Forgot Password?
            </button>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading || loading}
          disabled={isLoading || loading}
        >
          {isLoading || loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading || loading}
            iconName="Chrome"
            iconPosition="left"
            iconSize={18}
          >
            Google
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading || loading}
            iconName="Github"
            iconPosition="left"
            iconSize={18}
          >
            GitHub
          </Button>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-150"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;