import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight, Home } from 'lucide-react';
import { useAuthStore } from '@store/auth.store';
import { useAppStore } from '@store/app.store';
import { paymentApi } from '@api/payment.api';
import { ROUTES } from '@constants/routes.constants';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();
  const { theme } = useAppStore();

  const isDark = theme === 'dark';
  const orderId = searchParams.get('orderId');
  const resultCode = searchParams.get('resultCode');

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setLoading(false);
        setIsSuccess(false);
        setErrorMessage('Không tìm thấy thông tin mã đơn hàng.');
        return;
      }

      if (resultCode !== '0') {
        setLoading(false);
        setIsSuccess(false);
        setErrorMessage('Giao dịch MoMo bị hủy hoặc không thành công.');
        return;
      }

      try {
        // Verify payment on backend
        const res = await paymentApi.checkPaymentStatus(orderId);
        // Wait, checkPaymentStatus returns raw JSON string, but backend controller might wrap or return raw string
        // If it's a string, we parse it
        let resObj = typeof res === 'string' ? JSON.parse(res) : res;
        
        if (resObj && (resObj.resultCode === 0 || resObj.resultCode === '0')) {
          // Sync profile to get premium role
          await fetchProfile();
          setIsSuccess(true);
        } else {
          setIsSuccess(false);
          setErrorMessage(resObj?.message || 'Có lỗi xảy ra khi xác thực giao dịch.');
        }
      } catch (error: any) {
        console.error('Error verifying payment:', error);
        setErrorMessage('Không thể kết nối đến máy chủ để xác thực thanh toán.');
        setIsSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, resultCode, fetchProfile]);

  const containerBg = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const textSubColor = isDark ? '#94a3b8' : '#475569';
  const borderColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: containerBg,
        padding: '24px',
        color: textColor,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          maxWidth: '480px',
          width: '100%',
          background: cardBg,
          borderRadius: '24px',
          padding: '40px 32px',
          boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${borderColor}`,
          textAlign: 'center',
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 className="animate-spin text-rose-500" size={48} />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Đang xác thực thanh toán</h2>
            <p style={{ color: textSubColor, fontSize: '14px' }}>
              Vui lòng không tắt trình duyệt hoặc tải lại trang trong khi hệ thống đồng bộ giao dịch với MoMo...
            </p>
          </div>
        ) : isSuccess ? (
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              type="spring"
              stiffness={200}
              style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '24px' }}
            >
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '50%',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle className="text-emerald-500" size={56} />
              </div>
            </motion.div>

            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.025em' }}>
              Nâng Cấp PRO Thành Công! 👑
            </h2>
            <p style={{ color: textSubColor, fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
              Cảm ơn bạn đã nâng cấp tài khoản! Giao dịch trị giá <strong>1.000.000 VND</strong> đã được xử lý.
              Tài khoản của bạn hiện có quyền truy cập toàn bộ bài thi PRO và phản hồi phân tích IELTS từ AI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate(ROUTES.USER.EXAMS)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #fb7185 0%, #f43f5e 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(244, 63, 94, 0.3)',
                }}
              >
                Bắt đầu làm bài thi ngay <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate(ROUTES.USER.DASHBOARD)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'transparent',
                  color: textSubColor,
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: '14px',
                  padding: '14px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                <Home size={16} /> Quay về Trang chủ
              </button>
            </div>
          </div>
        ) : (
          <div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '24px' }}
            >
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '50%',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <XCircle className="text-red-500" size={56} />
              </div>
            </motion.div>

            <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.025em' }}>
              Thanh Toán Thất Bại
            </h2>
            <p style={{ color: textSubColor, fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 }}>
              {errorMessage || 'Đã xảy ra lỗi không xác định trong quá trình giao dịch.'}
              <br />
              Vui lòng thử lại hoặc liên hệ với bộ phận hỗ trợ nếu tiền đã bị trừ.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate(ROUTES.USER.SETTINGS)}
                style={{
                  background: isDark ? '#334155' : '#0f172a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '14px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                Quay lại Cài đặt
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
