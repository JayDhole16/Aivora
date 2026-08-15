import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { sendOtp } from '@/api/auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const emailSchema = z.object({ email: z.string().email('Please enter a valid email address.') });
const otpSchema = z.object({ email: z.string().email(), otp: z.string().length(6, 'Enter the 6-digit code.') });

type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const [step, setStep] = React.useState<'email' | 'otp'>('email');
  const [email, setEmail] = React.useState('');
  const [sendingOtp, setSendingOtp] = React.useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema), defaultValues: { email: '' } });

  const handleEmailSubmit = async (data: EmailForm) => {
    setSendingOtp(true);
    try {
      await sendOtp(data.email);
      setEmail(data.email);
      otpForm.setValue('email', data.email);
      setStep('otp');
      toast.success(`We sent a code to ${data.email}`);
    } catch {
      /* error toast already shown by api layer */
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpSubmit = async (data: OtpForm) => {
    try {
      const user = await loginMutation.mutateAsync(data);
      if (!user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch { /* handled */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-200">
            <Zap size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your Aivora account</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
          {step === 'email' ? (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} noValidate>
              <div className="mb-4">
                <label htmlFor="login-email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    {...emailForm.register('email')}
                    className={cn(
                      'w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none transition-colors',
                      'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                      emailForm.formState.errors.email ? 'border-red-300' : 'border-neutral-300',
                    )}
                    placeholder="you@yourbusiness.com"
                    aria-describedby={emailForm.formState.errors.email ? 'email-error' : undefined}
                    aria-invalid={!!emailForm.formState.errors.email}
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p id="email-error" className="mt-1.5 text-xs text-red-600" role="alert">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={sendingOtp}
                className="flex w-full items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                {sendingOtp ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {sendingOtp ? 'Sending code…' : 'Continue with email'}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-xs text-neutral-400">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toast.info('Google sign-in coming soon!')}
                  className="flex items-center justify-center gap-2 border border-neutral-300 rounded-lg py-2.5 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => toast.info('Microsoft sign-in coming soon!')}
                  className="flex items-center justify-center gap-2 border border-neutral-300 rounded-lg py-2.5 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 23 23"><path fill="#f3f3f3" d="M0 0h23v23H0z"/><path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/></svg>
                  Microsoft
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} noValidate>
              <div className="text-center mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 mx-auto mb-3">
                  <Mail size={18} className="text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-neutral-900">Check your email</p>
                <p className="text-sm text-neutral-500 mt-1">
                  We sent a 6-digit code to <span className="font-medium text-neutral-700">{email}</span>
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="otp-code" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  6-digit code
                </label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  {...otpForm.register('otp')}
                  className={cn(
                    'w-full px-3 py-3 rounded-lg border text-center text-xl tracking-widest font-mono outline-none transition-colors',
                    'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                    otpForm.formState.errors.otp ? 'border-red-300' : 'border-neutral-300',
                  )}
                  placeholder="000000"
                  aria-describedby={otpForm.formState.errors.otp ? 'otp-error' : undefined}
                  aria-invalid={!!otpForm.formState.errors.otp}
                />
                {otpForm.formState.errors.otp && (
                  <p id="otp-error" className="mt-1.5 text-xs text-red-600" role="alert">
                    {otpForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="flex w-full items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                {loginMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="mt-3 w-full text-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Don't have an account?{' '}
          <Link to="/auth/signup" className="text-indigo-600 font-medium hover:underline">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
