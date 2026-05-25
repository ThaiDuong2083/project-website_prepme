import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { FileDTO } from '@api/files.api';
import { filesApi } from '@api/files.api';
import { B } from './colors';
import { Overlay, ModalBox } from './shared';

export const GrammarModal = ({ onClose }: { onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'theory'>('menu');

  if (activeTab === 'theory') {
    return (
      <AnimatePresence>
        <GrammarTheoryModal onClose={() => setActiveTab('menu')} />
      </AnimatePresence>
    );
  }

  return (
    <Overlay onClick={onClose}>
      <ModalBox maxWidth={600} onClick={(e) => e.stopPropagation()}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '10px' }}>
          <h2
            style={{
              color: B[300],
              fontSize: '22px',
              fontWeight: 900,
              margin: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              letterSpacing: '0.5px',
            }}
          >
            📝 NGỮ PHÁP TOEIC
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0, fontWeight: 600 }}>
            Chọn phần bạn muốn học hôm nay
          </p>
        </div>

        {/* Options */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}
        >
          {[
            {
              id: 'theory',
              icon: '📖',
              title: 'Lý thuyết',
              desc: 'Đọc tài liệu tổng hợp',
              color: '#94a3b8',
            },
            {
              id: 'practice',
              icon: '🎯',
              title: 'Thực hành theo dạng',
              desc: 'Làm bài tập từng chủ đề',
              color: '#fbbf24',
            },
            {
              id: 'test',
              icon: '🔥',
              title: 'Kiểm tra tổng hợp',
              desc: 'Trộn ngẫu nhiên các chủ đề',
              color: '#fb923c',
            },
          ].map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                background: '#fff',
                border: '1px solid #f1f5f9',
                borderRadius: '16px',
                padding: '20px 24px',
                cursor: 'pointer',
                textAlign: 'left',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
              onClick={() => {
                if (item.id === 'theory') setActiveTab('theory');
              }}
            >
              <span style={{ fontSize: '32px', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <h3
                  style={{
                    margin: '0 0 6px 0',
                    fontSize: '17px',
                    fontWeight: 800,
                    color: item.color,
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: B[300],
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={36} strokeWidth={3} />
          </button>
        </div>
      </ModalBox>
    </Overlay>
  );
};

export const GrammarTheoryModal = ({ onClose }: { onClose: () => void }) => {
  const [files, setFiles] = useState<FileDTO[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await filesApi.getFiles({ page: 0, size: 50, category: 'GRAMMAR' });
        if (res.data && Array.isArray(res.data.content)) {
          setFiles(res.data.content);
          if (res.data.content.length > 0) setSelectedFile(res.data.content[0]);
        }
      } catch (err) {
        console.error('Failed to fetch theory files', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  return (
    <Overlay onClick={onClose}>
      <ModalBox maxWidth={820} height="85vh" onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: B[300] }}
          >
            <ChevronLeft size={32} strokeWidth={3} />
          </button>
          <h2
            style={{
              color: B[300],
              fontSize: '20px',
              fontWeight: 800,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.5px',
            }}
          >
            📖 LÝ THUYẾT
          </h2>
          <div style={{ width: '32px' }}></div>
        </div>

        {files.length > 0 && (
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <select
              value={selectedFile?.id || ''}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSelectedFile(files.find((f) => f.id === id) || null);
              }}
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '12px',
                border: `1.5px solid ${B[300]}`,
                color: B[400],
                fontWeight: 800,
                fontSize: '15px',
                outline: 'none',
                appearance: 'none',
                fontFamily: 'inherit',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {files.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title || f.fileName}
                </option>
              ))}
            </select>
            <span
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: B[300],
                fontSize: '12px',
              }}
            >
              ▼
            </span>
          </div>
        )}

        {loading && (
          <p
            style={{
              textAlign: 'center',
              color: '#94a3b8',
              fontStyle: 'italic',
              marginTop: '40px',
            }}
          >
            Đang tải dữ liệu...
          </p>
        )}

        {!loading && files.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
            Chưa có tài liệu lý thuyết nào.
          </p>
        )}

        {selectedFile && (
          <div
            style={{
              flex: 1,
              border: `2px solid ${B[200]}`,
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#f8fafc',
            }}
          >
            <iframe
              src={selectedFile.url}
              width="100%"
              height="100%"
              style={{ border: 'none', display: 'block' }}
              title={selectedFile.title || selectedFile.fileName}
            />
          </div>
        )}
      </ModalBox>
    </Overlay>
  );
};
