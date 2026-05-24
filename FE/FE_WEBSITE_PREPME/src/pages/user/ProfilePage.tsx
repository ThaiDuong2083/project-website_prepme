import { motion } from 'framer-motion';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes.constants';
import { Phone, Mail, Star, Shield, Calendar, LogOut, Trophy, Zap, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
};

const statItems = [
  { label: 'Ngày streak', value: '1', icon: Zap, color: '#f97316' },
  { label: 'Đề đã làm', value: '0', icon: BookOpen, color: '#6366f1' },
  { label: 'Hạng mục tiêu', value: '#—', icon: Trophy, color: BRAND[500] },
];

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate(ROUTES.LOGIN);
  };

  const initials = (user?.fullName ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '28px 24px' }}>
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '24px',
          border: `1.5px solid ${BRAND[100]}`,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(244,63,94,0.10)',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        {/* Banner */}
        <div
          style={{
            height: '120px',
            background: `linear-gradient(135deg, ${BRAND[300]} 0%, ${BRAND[400]} 50%, ${BRAND[500]} 100%)`,
            position: 'relative',
          }}
        />

        {/* Avatar + info */}
        <div style={{ padding: '0 24px 24px', position: 'relative' }}>
          {/* Avatar */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${BRAND[300]}, ${BRAND[500]})`,
              border: '4px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 900,
              fontSize: '28px',
              marginTop: '-40px',
              boxShadow: '0 4px 16px rgba(244,63,94,0.3)',
              fontFamily: 'inherit',
            }}
          >
            {initials}
          </div>

          <div style={{ marginTop: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1e293b', margin: '0 0 4px 0' }}>
              {user?.fullName ?? 'Người dùng'}
            </h2>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {user?.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748b' }}>
                  <Phone size={13} color={BRAND[300]} />
                  {user.phone}
                </span>
              )}
              {user?.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748b' }}>
                  <Mail size={13} color={BRAND[300]} />
                  {user.email}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {statItems.map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  style={{
                    flex: 1,
                    minWidth: '100px',
                    background: BRAND[50],
                    border: `1.5px solid ${BRAND[100]}`,
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <Icon size={20} color={color} />
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', margin: 0 }}>{value}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subscription card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '20px',
          border: `1.5px solid ${BRAND[100]}`,
          padding: '20px 24px',
          marginBottom: '16px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star size={18} color="#fff" fill="#fff" />
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Gói hiện tại</p>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Free Plan</p>
            </div>
          </div>
          <button
            style={{
              background: `linear-gradient(135deg, ${BRAND[400]}, ${BRAND[500]})`,
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 12px rgba(244,63,94,0.35)',
            }}
          >
            ⭐ Nâng cấp Premium
          </button>
        </div>

        <div
          style={{
            marginTop: '14px',
            padding: '12px 14px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '10px',
            fontSize: '13px',
            color: '#92400e',
          }}
        >
          Premium bao gồm: AI Writing chấm bài không giới hạn, tất cả bộ đề Cambridge, no ads.
        </div>
      </motion.div>

      {/* Actions card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderRadius: '20px',
          border: `1.5px solid ${BRAND[100]}`,
          overflow: 'hidden',
          backdropFilter: 'blur(8px)',
        }}
      >
        {[
          { icon: Shield, label: 'Bảo mật tài khoản', sub: 'Đổi mật khẩu, xác minh 2 bước', color: '#6366f1' },
          { icon: Calendar, label: 'Lịch sử hoạt động', sub: 'Xem quá trình học tập', color: '#0ea5e9' },
        ].map(({ icon: Icon, label, sub, color }, i) => (
          <button
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              width: '100%',
              padding: '16px 24px',
              background: 'transparent',
              border: 'none',
              borderBottom: i === 0 ? `1px solid ${BRAND[50]}` : 'none',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = BRAND[50])}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `${color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={18} color={color} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{label}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>{sub}</p>
            </div>
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            width: '100%',
            padding: '16px 24px',
            background: 'transparent',
            border: 'none',
            borderTop: `1px solid ${BRAND[50]}`,
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#fef2f2')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={18} color="#ef4444" />
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444', margin: 0 }}>Đăng xuất</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Thoát khỏi tài khoản</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
};
