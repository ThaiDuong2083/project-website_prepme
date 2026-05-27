import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, X, User as UserIcon, LogOut, Wrench } from 'lucide-react';
import { ROUTES } from '@constants/routes.constants';
import { useAuthStore } from '@store/auth.store';
import { useAppStore } from '@store/app.store';
import toast from 'react-hot-toast';

const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi thiết bị', { icon: '👋' });
    navigate(ROUTES.LOGIN);
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('vi-VN')
    : '23/05/2026'; // Fallback if no joined date

  const isDark = theme === 'dark';
  const cardBg = isDark ? '#1a1d27' : '#fff';
  const itemBg = isDark ? '#242a38' : '#fffbeb';
  const textTitle = isDark ? '#e2e8f0' : '#475569';
  const textValue = isDark ? '#94a3b8' : '#64748b';
  const borderColor = isDark ? '#2d3343' : BRAND[200];
  const headerBorder = isDark ? '#2d3343' : BRAND[100];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        minHeight: '100vh',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          width: '100%',
          maxWidth: '720px',
          background: cardBg,
          borderRadius: '24px',
          border: `1.5px solid ${headerBorder}`,
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 20px 40px rgba(251,113,133,0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '24px',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: BRAND[300] }}>
            <Settings size={28} strokeWidth={2.5} />
            <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'inherit' }}>
              Cài Đặt
            </span>
          </div>
          <button
            onClick={() => navigate(ROUTES.USER.DASHBOARD)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>
        <hr style={{ border: 'none', borderTop: `1.5px dashed ${borderColor}`, margin: '0 0 24px 0' }} />

        {/* Section: Thông tin tài khoản */}
        <div
          style={{
            border: `1.5px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '20px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isDark ? '#cbd5e1' : BRAND[300], marginBottom: '16px' }}>
            <UserIcon size={18} fill={isDark ? '#cbd5e1' : BRAND[300]} />
            <span style={{ fontWeight: 800, fontSize: '15px' }}>Thông tin tài khoản</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: textTitle, fontWeight: 700, fontSize: '14px' }}>Mã học viên:</span>
              <span style={{ color: isDark ? BRAND[300] : BRAND[400], fontWeight: 600, fontSize: '14px' }}>
                {user?.email || user?.phone || 'Học viên ẩn danh'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: textTitle, fontWeight: 700, fontSize: '14px' }}>Ngày tham gia:</span>
              <span style={{ color: textValue, fontWeight: 700, fontSize: '14px' }}>
                {formattedDate}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                marginTop: '12px',
                background: isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2',
                color: isDark ? '#fb7185' : BRAND[400],
                border: isDark ? '1px solid rgba(244, 63, 94, 0.2)' : 'none',
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(244, 63, 94, 0.15)' : '#ffe4e6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2';
              }}
            >
              <LogOut size={16} strokeWidth={3} /> Đăng xuất khỏi thiết bị
            </button>
          </div>
        </div>

        {/* Section: Tiện ích mở rộng */}
        <div
          style={{
            border: `1.5px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '20px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', marginBottom: '16px' }}>
            <Wrench size={18} fill="#cbd5e1" color={cardBg} />
            <span style={{ fontWeight: 800, fontSize: '15px', color: isDark ? '#cbd5e1' : BRAND[300] }}>Tiện ích mở rộng</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Giao diện (Sáng/Tối) */}
            <div
              onClick={toggleTheme}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: itemBg,
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.97)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              <span style={{ color: textTitle, fontWeight: 700, fontSize: '14px' }}>
                Giao diện (Sáng/Tối)
              </span>
              <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
            </div>

            {/* Nhắn tin cho Admin */}
            <div
              onClick={() => window.open('https://facebook.com', '_blank')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: itemBg,
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.97)')}
              onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              <span style={{ color: textTitle, fontWeight: 700, fontSize: '14px' }}>
                Nhắn tin cho Admin
              </span>
              <span>💛</span>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
