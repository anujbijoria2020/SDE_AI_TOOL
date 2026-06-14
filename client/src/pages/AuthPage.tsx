import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { Code2, KeyRound, Mail } from 'lucide-react';
import Button from '../components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const { login, register, status } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema) as any,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // If already authenticated, redirect to workspace
  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: FormValues) => {
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await login(data.email, data.password);
        navigate('/', { replace: true });
      } else {
        await register(data.email, data.password);
        // Automatically log in after registration
        await login(data.email, data.password);
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        err.message || 
        (isLogin ? 'Failed to log in. Please check your credentials.' : 'Registration failed. User may already exist.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = (mode: boolean) => {
    setIsLogin(mode);
    setError(null);
    reset({
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-bg-sidebar/30 p-4 select-none">
      <div className="w-full max-w-[420px] bg-white border border-border-main rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-accent text-white p-2.5 rounded-2xl flex items-center justify-center shadow-md mb-3">
            <Code2 size={28} />
          </div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            SE Assistant
          </h2>
          <p className="text-xs text-text-muted mt-1.5 text-center px-4 leading-relaxed">
            Turn your project idea into complete design artifacts
          </p>
        </div>

        {/* Login / Register Toggle (Pill Buttons) */}
        <div className="flex bg-bg-sidebar p-1 rounded-xl mb-6 w-full">
          <button
            type="button"
            onClick={() => handleToggleMode(true)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              isLogin
                ? 'bg-white text-text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode(false)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              !isLogin
                ? 'bg-white text-text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="w-full mb-5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs leading-normal text-left font-medium">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4 select-text">
          <div className="flex flex-col gap-1 items-start">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1">
              Email Address
            </label>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                {...registerField('email')}
                className={`w-full border bg-white rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-border-main focus:border-accent'
                }`}
                disabled={loading}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-red-500 pl-1 mt-0.5">{errors.email.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1 items-start">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1">
              Password
            </label>
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                {...registerField('password')}
                className={`w-full border bg-white rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-border-main focus:border-accent'
                }`}
                disabled={loading}
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-red-500 pl-1 mt-0.5">{errors.password.message}</span>
            )}
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1 items-start">
              <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider pl-1">
                Confirm Password
              </label>
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <KeyRound size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerField('confirmPassword')}
                  className={`w-full border bg-white rounded-lg pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-border-main focus:border-accent'
                  }`}
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-red-500 pl-1 mt-0.5">{errors.confirmPassword.message}</span>
              )}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2 py-2.5 font-semibold"
            isLoading={loading}
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>

        {/* Mode Switch Helper Link */}
        <div className="mt-6 text-xs text-text-muted">
          {isLogin ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                className="text-accent hover:text-accent-hover font-semibold underline cursor-pointer"
              >
                Register
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                className="text-accent hover:text-accent-hover font-semibold underline cursor-pointer"
              >
                Login
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
