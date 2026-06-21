import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, User as UserIcon, LogOut, Wrench, CheckCircle, Sparkles, Phone } from 'lucide-react';
import { ROUTES } from '@constants/routes.constants';
import { useAuthStore } from '@store/auth.store';
import { useAppStore } from '@store/app.store';
import { userApi } from '@api/user.api';
import toast from 'react-hot-toast';

const BRAND = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
};

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout, fetchProfile } = useAuthStore();
  const { theme, toggleTheme } = useAppStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);

  const handleUpgradeClick = async () => {
    try {
      const response = await userApi.checkPhone();
      if (response.data.hasPhone) {
        setShowPaymentModal(true);
      } else {
        setPhoneInput('');
        setShowPhoneModal(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi kiểm tra thông tin');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      toast.error('Số điện thoại không được để trống');
      return;
    }

    const phoneRegex = /^(\+84|0)(3|5|7|8|9)\d{8}$/;
    if (!phoneRegex.test(phoneInput.trim())) {
      toast.error('Số điện thoại không hợp lệ (VD: 0912345678)');
      return;
    }

    setIsUpdatingPhone(true);
    try {
      await userApi.updatePhone(phoneInput.trim());
      await fetchProfile();
      toast.success('Cập nhật số điện thoại thành công!');
      setShowPhoneModal(false);
      setShowPaymentModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật số điện thoại thất bại');
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất khỏi thiết bị', { icon: '👋' });
    navigate(ROUTES.LOGIN);
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
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
          boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 20px 40px rgba(96,165,250,0.08)',
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
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? '#2e354f' : '#f1f5f9')}
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
            <UserIcon size={18} fill={isDark ? '#cbd5e1' : BRAND[300]} color={cardBg} />
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
              <span style={{ color: textTitle, fontWeight: 700, fontSize: '14px' }}>Loại tài khoản:</span>
              <span style={{
                color: user?.membershipType === 'PREMIUM' ? '#fbbf24' : '#94a3b8',
                fontWeight: 800,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {user?.membershipType === 'PREMIUM' ? '👑 PRO' : 'FREE'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: textTitle, fontWeight: 700, fontSize: '14px' }}>Ngày tham gia:</span>
              <span style={{ color: textValue, fontWeight: 700, fontSize: '14px' }}>
                {formattedDate}
              </span>
            </div>

            {user?.membershipType !== 'PREMIUM' && (
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgradeClick}
                style={{
                  marginTop: '12px',
                  background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                  transition: 'all 0.2s',
                }}
              >
                👑 Nâng cấp tài khoản PRO
              </motion.button>
            )}

            <button
              onClick={handleLogout}
              style={{
                marginTop: '12px',
                background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                color: isDark ? '#60a5fa' : BRAND[400],
                border: isDark ? '1px solid rgba(59, 130, 246, 0.2)' : 'none',
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
                e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff';
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
              onClick={() => window.open('https://www.facebook.com/profile.php?id=61590306457643', '_blank')}
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

      {/* Payment Upgrade Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: 'relative',
                background: isDark ? '#1e293b' : '#ffffff',
                width: '100%',
                maxWidth: '540px',
                maxHeight: '90vh',
                overflowY: 'auto',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                color: isDark ? '#f1f5f9' : '#0f172a',
                zIndex: 1000,
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#94a3b8' : '#64748b',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>

              {/* Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '10px', borderRadius: '12px' }}>
                  <Sparkles className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                    Nâng Cấp Hội Viên PRO
                  </h3>
                  <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Mở khóa tiềm năng tối đa cùng trợ lý AI Prepme
                  </p>
                </div>
              </div>

              {/* Benefit List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {[
                  { text: 'Truy cập 100% Đề thi:', desc: 'Làm toàn bộ đề Premium Listening, Reading, Writing & Speaking.' },
                  { text: 'Đánh giá chi tiết bằng AI:', desc: 'Nhận Band Score dự đoán, sửa lỗi ngữ pháp và từ vựng chi tiết.' },
                  { text: 'Trợ lý học tập thông minh:', desc: 'Xem bài mẫu gợi ý, nâng cấp vốn từ vựng học thuật.' },
                  { text: 'Thời hạn sử dụng:', desc: 'Tài khoản có thời hạn 30 ngày kể từ ngày đăng ký.' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <CheckCircle className="text-emerald-500 flex-shrink-0" size={18} style={{ marginTop: '2px' }} />
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 800 }}>{item.text}</h4>
                      <p style={{ fontSize: '12.5px', color: isDark ? '#94a3b8' : '#64748b', marginTop: '1px' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* QR and Transfer Info */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                {/* QR Code */}
                <div style={{ flex: '1 1 160px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ padding: '8px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img
                      src="https://res.cloudinary.com/dilyyimrn/image/upload/v1780242258/ab7f4a31-b2ed-40a2-bd16-be2dc9937636_qr.png"
                      alt="Payment QR Code"
                      style={{ width: '100%', maxWidth: '160px', height: 'auto', borderRadius: '8px', display: 'block' }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Quét mã QR để thanh toán nhanh</span>
                </div>

                {/* Account Details */}
                <div style={{ flex: '1 1 240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: isDark ? '#0f172a' : '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, fontSize: '13px' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Chủ tài khoản:</span>
                      <strong style={{ color: textTitle, fontSize: '13px' }}>NGUYEN THI PHUONG THAO</strong>
                    </div>

                    <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Số tài khoản:</span>
                        <strong style={{ color: textTitle, fontSize: '13px' }}>3385 7779 69</strong>
                      </div>
                      <button
                        onClick={() => copyToClipboard('3385777969', 'Đã sao chép số tài khoản!')}
                        style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        Sao chép
                      </button>
                    </div>

                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>Số tiền:</span>
                      <strong style={{ color: '#3b82f6', fontSize: '15px', fontWeight: 900 }}>79.000đ</strong>
                      <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginLeft: '8px', fontSize: '11px' }}>99.000đ</span>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '11px' }}>Nội dung chuyển khoản:</span>
                        <button
                          onClick={() => copyToClipboard(`${user?.phone || ''} nang cap goi pro`.trim(), 'Đã sao chép nội dung!')}
                          style={{ padding: '4px 8px', fontSize: '11px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Sao chép
                        </button>
                      </div>
                      <strong style={{ color: textTitle, fontSize: '12px', wordBreak: 'break-all', display: 'block', lineHeight: '1.4' }}>
                        {user?.phone ? `${user.phone} nang cap goi pro` : '[Số điện thoại] nang cap goi pro'}
                      </strong>
                      <span style={{ fontSize: '10.5px', color: '#3b82f6', display: 'block', marginTop: '2px', fontStyle: 'italic' }}>
                        * SĐT đăng ký của bạn
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note banner */}
              <div style={{
                background: isDark ? 'rgba(96, 165, 250, 0.05)' : 'rgba(96, 165, 250, 0.08)',
                border: '1px solid rgba(96, 165, 250, 0.2)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '24px',
                fontSize: '12px',
                color: isDark ? '#60a5fa' : '#2563eb',
                lineHeight: '1.5',
              }}>
                <strong>📌 Lưu ý:</strong> Vui lòng reload (F5 lại trang) sau 5 phút để cập nhật trạng thái PRO. Nếu vẫn chưa được nâng cấp, vui lòng nhắn admin hỗ trợ qua Facebook.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.open('https://www.facebook.com/profile.php?id=61590306457643', '_blank')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)',
                  }}
                >
                  Nhắn tin hỗ trợ (FB)
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    flex: 1,
                    background: isDark ? '#334155' : '#f1f5f9',
                    border: 'none',
                    color: isDark ? '#cbd5e1' : '#475569',
                    borderRadius: '12px',
                    padding: '12px',
                    fontWeight: 800,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Update Phone Modal */}
      <AnimatePresence>
        {showPhoneModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPhoneModal(false)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(8px)',
              }}
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              style={{
                position: 'relative',
                background: isDark ? '#1e293b' : '#ffffff',
                width: '100%',
                maxWidth: '460px',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                color: isDark ? '#f1f5f9' : '#0f172a',
                zIndex: 1000,
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPhoneModal(false)}
                style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: isDark ? '#94a3b8' : '#64748b',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                }}
              >
                <X size={20} />
              </button>

              {/* Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                  <Phone className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                    Cập Nhật Số Điện Thoại
                  </h3>
                  <p style={{ fontSize: '13px', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Vui lòng cung cấp số điện thoại để thực hiện thanh toán
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handlePhoneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: textTitle }}>
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    disabled={isUpdatingPhone}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                      background: isDark ? '#0f172a' : '#ffffff',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={isUpdatingPhone}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px',
                      fontWeight: 800,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                      opacity: isUpdatingPhone ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    {isUpdatingPhone ? 'Đang cập nhật...' : 'Xác nhận & Tiếp tục'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPhoneModal(false)}
                    disabled={isUpdatingPhone}
                    style={{
                      flex: 1,
                      background: isDark ? '#334155' : '#f1f5f9',
                      border: 'none',
                      color: isDark ? '#cbd5e1' : '#475569',
                      borderRadius: '12px',
                      padding: '12px',
                      fontWeight: 800,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
