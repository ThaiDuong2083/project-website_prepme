import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Phone, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes.constants';

// Brand colors (Đồng bộ với LoginPage)
const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
};

// Schema validation cho đăng ký
const registerSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải ít nhất 2 ký tự'),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, 'Số điện thoại không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải ít nhất 8 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ── Brand‐styled input (Reused from LoginPage) ──────────────────────────────
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
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: '12px', color: '#f87171', fontWeight: 500 }}>{error}</p>}
    </div>
  );
};

export const RegisterPage = () => {
  const { register: registerAccount, loginWithGoogle, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerAccount(data);
      toast.success('Đăng ký tài khoản thành công! 🎉');
      navigate(ROUTES.USER.DASHBOARD);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Đăng ký bằng Google thành công!');
      navigate(ROUTES.USER.DASHBOARD);
    } catch (error) {
      console.error('Google registration failed:', error);
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
      {/* Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: BRAND[400], margin: '0 0 8px 0', letterSpacing: '0.05em' }}>
          THAM GIA PREPME
        </h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Bắt đầu hành trình chinh phục mục tiêu của bạn
        </p>
      </div>

      {/* Google Register */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Hủy thao tác')}
        />
      </div>

      {/* Divider */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', margin: '20px 0' }}>
        <div style={{ flex: 1, borderTop: `1.5px dashed ${BRAND[100]}` }} />
        <span style={{ padding: '0 12px', fontSize: '10px', fontWeight: 700, color: BRAND[300], textTransform: 'uppercase', background: '#fff' }}>
          Hoặc đăng ký bằng SĐT
        </span>
        <div style={{ flex: 1, borderTop: `1.5px dashed ${BRAND[100]}` }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <BrandInput
          id="fullName"
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          error={errors.fullName?.message}
          leftIcon={<User size={16} />}
          {...register('fullName')}
        />

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
          placeholder="Tối thiểu 8 ký tự..."
          error={errors.password?.message}
          leftIcon={<Lock size={16} />}
          {...register('password')}
        />

        <BrandInput
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu..."
          error={errors.confirmPassword?.message}
          leftIcon={<Lock size={16} />}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={isLoading}
          style={{
            height: '48px',
            marginTop: '8px',
            borderRadius: '16px',
            border: 'none',
            background: `linear-gradient(135deg, ${BRAND[400]} 0%, ${BRAND[500]} 100%)`,
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 6px 24px -4px rgba(244,63,94,0.45)',
            fontFamily: 'inherit',
          }}
        >
          Tạo tài khoản ngay 🚀
        </button>
      </form>

      {/* Footer */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Đã có tài khoản?{' '}
          <Link to={ROUTES.LOGIN} style={{ color: BRAND[500], fontWeight: 700, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </motion.div>
  );
};