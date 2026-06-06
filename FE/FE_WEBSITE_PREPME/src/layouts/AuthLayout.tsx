import { Outlet } from 'react-router-dom';

// Wavy decorative SVG pattern (cream/blue tones matching brand)
const bgPattern = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Cg fill='none' stroke='%23dbeafe' stroke-width='1.2' stroke-opacity='0.45'%3E%3Cellipse cx='100' cy='100' rx='80' ry='40' /%3E%3Cellipse cx='100' cy='100' rx='55' ry='27' /%3E%3Cellipse cx='100' cy='100' rx='30' ry='14' /%3E%3Cpath d='M20 100 Q60 60 100 100 T180 100' /%3E%3Cpath d='M20 115 Q60 75 100 115 T180 115' /%3E%3Cpath d='M20 85 Q60 45 100 85 T180 85' /%3E%3C/g%3E%3C/svg%3E")`;

export const AuthLayout = () => (
  <div
    className="flex min-h-screen items-center justify-center p-4"
    style={{
      backgroundColor: '#f0f7ff',
      backgroundImage: bgPattern,
      backgroundSize: '180px 180px',
    }}
  >
    <div className="w-full max-w-[420px]">
      <Outlet />
    </div>
  </div>
);
