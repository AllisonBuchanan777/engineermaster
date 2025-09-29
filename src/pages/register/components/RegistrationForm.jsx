import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    specialization: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'student', label: 'Student - Learn engineering concepts' },
    { value: 'instructor', label: 'Instructor - Create and manage courses' }
  ];

  const specializationOptions = [
    { value: '', label: 'Select your engineering focus (optional)' },
    { value: 'mechanical', label: 'Mechanical Engineering' },
    { value: 'electrical', label: 'Electrical Engineering' },
    { value: 'civil', label: 'Civil Engineering' },
    { value: 'chemical', label: 'Chemical Engineering' },
    { value: 'computer', label: 'Computer Engineering' },
    { value: 'aerospace', label: 'Aerospace Engineering' },
    { value: 'biomedical', label: 'Biomedical Engineering' },
    { value: 'environmental', label: 'Environmental Engineering' },
    { value: 'materials', label: 'Materials Engineering' },
    { value: 'industrial', label: 'Industrial Engineering' }
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
    
    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!formData?.username?.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData?.username?.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/?.test(formData?.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/?.test(formData?.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await signUp({
        email: formData?.email,
        password: formData?.password,
        fullName: formData?.fullName?.trim(),
        username: formData?.username?.toLowerCase()?.trim(),
        role: formData?.role,
        specialization: formData?.specialization || null
      });

      if (error) {
        if (error?.message?.includes('already registered') || 
            error?.message?.includes('already exists')) {
          setErrors({
            email: 'An account with this email already exists'
          });
        } else if (error?.message?.includes('Failed to fetch') || 
                   error?.message?.includes('AuthRetryableFetchError')) {
          setErrors({
            general: 'Cannot connect to authentication service. Your Supabase project may be paused or inactive. Please check your Supabase dashboard and resume your project if needed.'
          });
        } else {
          setErrors({
            general: error?.message || 'An error occurred during registration.'
          });
        }
      } else if (data?.user) {
        // Registration successful
        navigate('/dashboard', { 
          state: { 
            message: 'Account created successfully! Welcome to EngineerMaster.' 
          } 
        });
      }
    } catch (error) {
      setErrors({
        general: 'An unexpected error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider) => {
    try {
      setErrors({
        general: `${provider} signup is not configured yet.`
      });
    } catch (error) {
      setErrors({
        general: `${provider} signup is not configured yet.`
      });
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Icon name="Zap" size={24} color="white" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
        <p className="text-muted-foreground">Start your engineering mastery journey today</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            placeholder="Enter your full name"
            value={formData?.fullName}
            onChange={handleInputChange}
            error={errors?.fullName}
            required
          />

          <Input
            label="Username"
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData?.username}
            onChange={handleInputChange}
            error={errors?.username}
            required
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData?.password}
            onChange={handleInputChange}
            error={errors?.password}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData?.confirmPassword}
            onChange={handleInputChange}
            error={errors?.confirmPassword}
            required
          />
        </div>

        <Select
          label="Account Type"
          name="role"
          value={formData?.role}
          onChange={(value) => handleInputChange({ target: { name: 'role', value } })}
          options={roleOptions}
          required
        />

        <Select
          label="Engineering Specialization"
          name="specialization"
          value={formData?.specialization}
          onChange={(value) => handleInputChange({ target: { name: 'specialization', value } })}
          options={specializationOptions}
          placeholder="Select your focus area"
        />

        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading || loading}
          disabled={isLoading || loading}
        >
          {isLoading || loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialSignUp('google')}
            disabled={isLoading || loading}
            iconName="Chrome"
            iconPosition="left"
            iconSize={18}
          >
            Google
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleSocialSignUp('github')}
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
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-150"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegistrationForm;