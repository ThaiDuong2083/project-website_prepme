import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

import { B } from './colors';

export const Overlay = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 200,
      padding: '16px',
    }}
  >
    {children}
  </motion.div>
);

export const ModalBox = ({
  children,
  maxWidth = 700,
  height,
  onClick,
}: {
  children: React.ReactNode;
  maxWidth?: number;
  height?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => (
  <motion.div
    initial={{ y: 60, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 60, opacity: 0 }}
    transition={{ type: 'spring', damping: 25, stiffness: 320 }}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.(e);
    }}
    style={{
      background: '#fff',
      borderRadius: '24px',
      width: '100%',
      maxWidth: `${maxWidth}px`,
      padding: '28px 24px',
      boxShadow: '0 24px 60px rgba(0,0,0,0.15)',
      maxHeight: '92vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      height,
    }}
  >
    {children}
  </motion.div>
);

export const ModalHeader = ({
  name,
  streak,
  onBack,
}: {
  name: string;
  streak: number;
  onBack?: () => void;
}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: B[400],
            padding: 0,
          }}
        >
          <ChevronLeft size={26} />
        </button>
      )}
      <span style={{ fontSize: '20px' }}>🧡</span>
      <span style={{ fontWeight: 800, fontSize: '18px', color: B[400] }}>{name}</span>
      <span style={{ fontSize: '18px' }}>🌙</span>
    </div>
    <div
      style={{
        background: B[100],
        borderRadius: '12px',
        padding: '6px 14px',
        fontWeight: 800,
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {streak} 🔥
    </div>
  </div>
);
