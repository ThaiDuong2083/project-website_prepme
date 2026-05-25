import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@hooks/useAuth';
import { loginWithPhoneSchema, type LoginWithPhoneFormData } from '@lib/validations/auth.schema';
import { ROUTES } from '@constants/routes.constants';

// Brand colors
const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
};

// ── Brand‐styled input ───────────────────────────────────────────────────────
interface BrandInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  [key: string]: unknown;
}

const BrandInput = ({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  leftIcon,
  ...rest
}: BrandInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={id}
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: BRAND[400],
        }}
      >
        {label} <span style={{ color: BRAND[300] }}>*</span>
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <span
            style={{
              position: 'absolute',
              left: '14px',
              color: BRAND[300],
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          style={{
            height: '44px',
            width: '100%',
            borderRadius: '14px',
            border: `2px solid ${error ? '#fca5a5' : BRAND[100]}`,
            background: BRAND[50],
            padding: leftIcon ? '0 44px 0 40px' : isPassword ? '0 44px 0 16px' : '0 16px',
            fontSize: '14px',
            color: '#334155',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = BRAND[300];
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.boxShadow = `0 0 0 4px ${BRAND[100]}80`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#fca5a5' : BRAND[100];
            e.currentTarget.style.background = BRAND[50];
            e.currentTarget.style.boxShadow = 'none';
          }}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute',
              right: '14px',
              color: BRAND[300],
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = BRAND[500])}
            onMouseLeave={(e) => (e.currentTarget.style.color = BRAND[300])}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p style={{ fontSize: '12px', color: '#f87171', fontWeight: 500 }}>{error}</p>
      )}
    </div>
  );
};

// ── Main LoginPage ───────────────────────────────────────────────────────────
export const LoginPage = () => {
  const { loginWithPhone, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginWithPhoneFormData>({
    resolver: zodResolver(loginWithPhoneSchema),
  });

  const handleNavigate = () => {
    setTimeout(() => {
      const storedUser = JSON.parse(localStorage.getItem('prepme_user') ?? 'null') as {
        role?: string;
      } | null;
      const redirectTo =
        from ?? (storedUser?.role === 'ADMIN' ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD);
      navigate(redirectTo, { replace: true });
    }, 100);
  };

  const onSubmit = async (data: LoginWithPhoneFormData) => {
    try {
      await loginWithPhone(data);
      toast.success('Đăng nhập thành công! 👋');
      handleNavigate();
    } catch {
      // Error handled by global interceptor
    }
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        toast.success('Đăng nhập bằng Google thành công! 👋');
        handleNavigate();
      }
    } catch {
      // Error handled by global interceptor
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        width: '100%',
        borderRadius: '28px',
        background: '#ffffff',
        padding: '36px 32px',
        boxShadow: '0 16px 56px -8px rgba(244,63,94,0.18), 0 2px 8px rgba(0,0,0,0.04)',
        border: `1.5px solid ${BRAND[100]}`,
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px' }}>✨</span>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 900,
              letterSpacing: '0.18em',
              color: BRAND[400],
              margin: 0,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            CHARNISHERE
          </h1>
          <span style={{ fontSize: '18px' }}>✨</span>
        </div>
        <p
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: '#94a3b8',
            margin: 0,
          }}
        >
          Nền tảng luyện thi TOEIC cá nhân hóa
        </p>
      </div>

      {/* ── Google Login (Official SDK) ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Hủy thao tác đăng nhập Google')}
          locale="vi"
          shape="pill"
          size="large"
          type="standard"
          width="320"
        />
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0',
        }}
      >
        <div
          style={{
            flex: 1,
            borderTop: `1.5px dashed ${BRAND[100]}`,
          }}
        />
        <span
          style={{
            padding: '0 12px',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: BRAND[300],
            whiteSpace: 'nowrap',
            background: '#fff',
          }}
        >
          Đăng nhập bằng tài khoản
        </span>
        <div
          style={{
            flex: 1,
            borderTop: `1.5px dashed ${BRAND[100]}`,
          }}
        />
      </div>

      {/* ── Phone + Password Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <BrandInput
          id="phone"
          label="Số điện thoại"
          type="tel"
          placeholder="0912 345 678"
          error={errors.phone?.message}
          leftIcon={<Phone size={16} />}
          {...register('phone')}
        />

        <BrandInput
          id="password"
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu..."
          error={errors.password?.message}
          leftIcon={<Lock size={16} />}
          {...register('password')}
        />

        {/* Remember me */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748b',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <input
            type="checkbox"
            style={{
              width: '15px',
              height: '15px',
              borderRadius: '4px',
              accentColor: BRAND[500],
              cursor: 'pointer',
            }}
          />
          Ghi nhớ đăng nhập
        </label>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            height: '48px',
            width: '100%',
            borderRadius: '16px',
            border: 'none',
            background: isLoading
              ? BRAND[200]
              : `linear-gradient(135deg, ${BRAND[400]} 0%, ${BRAND[500]} 100%)`,
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isLoading
              ? 'none'
              : '0 6px 24px -4px rgba(244,63,94,0.45)',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.boxShadow = '0 8px 28px -4px rgba(244,63,94,0.55)';
              e.currentTarget.style.opacity = '0.93';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 6px 24px -4px rgba(244,63,94,0.45)';
            e.currentTarget.style.opacity = '1';
          }}
        >
          {isLoading ? (
            <span
              style={{
                width: '18px',
                height: '18px',
                border: '2.5px solid rgba(255,255,255,0.4)',
                borderTopColor: '#fff',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
                display: 'inline-block',
              }}
            />
          ) : (
            <>🚀 Đăng Nhập</>
          )}
        </button>
      </form>

      {/* ── Footer Link ── */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            style={{
              color: BRAND[500],
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};
