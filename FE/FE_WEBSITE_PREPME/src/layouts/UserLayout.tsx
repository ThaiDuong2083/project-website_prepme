import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Home, LogOut, Settings, Trophy } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/routes.constants';
import toast from 'react-hot-toast';

const BRAND = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
};

const navItems = [
  { label: 'Trang chủ', href: ROUTES.USER.DASHBOARD, icon: Home },
  { label: 'Luyện thi', href: ROUTES.USER.EXAMS, icon: BookOpen },
  { label: 'Xếp hạng', href: ROUTES.USER.LEADERBOARD, icon: Trophy },
  { label: 'Cài đặt', href: ROUTES.USER.SETTINGS, icon: Settings },
];

export const UserLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate(ROUTES.LOGIN);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#fff5f5',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23fecdd3' stroke-width='1' stroke-opacity='0.3'%3E%3Cellipse cx='100' cy='100' rx='80' ry='40'/%3E%3Cellipse cx='100' cy='100' rx='55' ry='27'/%3E%3Cellipse cx='100' cy='100' rx='30' ry='14'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px',
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: '80px',
          minHeight: '100vh',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderRight: `1.5px solid ${BRAND[100]}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '20px',
          paddingBottom: '20px',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 40,
          gap: '4px',
        }}
      >
        {/* Nav items */}
        <nav
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            width: '100%',
            paddingTop: '8px',
          }}
        >
          {navItems.map(({ label, href, icon: Icon }) => (
            <NavLink key={href} to={href} style={{ width: '100%', textDecoration: 'none' }}>
              {({ isActive }) => (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '10px 6px',
                    margin: '2px 8px',
                    borderRadius: '14px',
                    background: isActive ? BRAND[50] : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = BRAND[50];
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <Icon
                    size={22}
                    color={isActive ? BRAND[500] : '#94a3b8'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? BRAND[500] : '#94a3b8',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '10px 6px',
            margin: '0 8px',
            borderRadius: '14px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: 'calc(100% - 16px)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut size={20} color="#f87171" strokeWidth={1.8} />
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#f87171' }}>Đăng xuất</span>
        </button>
      </aside>

      {/* ── Main content ── */}
      <main
        style={{
          flex: 1,
          marginLeft: '80px',
          padding: '0',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ minHeight: '100vh' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};
