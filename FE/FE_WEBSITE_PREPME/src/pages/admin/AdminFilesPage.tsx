import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Trash2, Edit2, Search, Plus, X, Check,
  Image, Film, Music, File, ExternalLink, ChevronLeft, ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi, type FileDTO } from '@api/files.api';
import { Card, CardBody } from '@components/ui/Card';
import { Button } from '@components/ui/Button';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FILE_CATEGORIES = ['GRAMMAR'];

function fileIcon(type?: string) {
  if (!type) return <File className="h-5 w-5 text-slate-400" />;
  if (type.startsWith('image')) return <Image className="h-5 w-5 text-violet-500" />;
  if (type.startsWith('video')) return <Film className="h-5 w-5 text-blue-500" />;
  if (type.startsWith('audio')) return <Music className="h-5 w-5 text-emerald-500" />;
  if (type.includes('pdf') || type.includes('document') || type.includes('text'))
    return <FileText className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-slate-400" />;
}

function categoryBadgeColor(cat?: string) {
  switch (cat?.toLowerCase()) {
    case 'audio': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'video': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
    case 'image': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300';
    case 'document': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
    case 'grammar': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }
}

function formatDate(dt?: string) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Vui lòng chọn file'); return; }
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    setLoading(true);
    try {
      await filesApi.createFile(file, { title: title.trim(), category: category || undefined });
      toast.success('✅ Upload file thành công!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Lỗi khi upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-500" />
            Thêm file mới
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer
            ${dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
            ${file ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input ref={inputRef} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          {file ? (
            <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
              <Check className="h-6 w-6" />
              <div>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs opacity-70">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Kéo thả file vào đây, hoặc <span className="text-indigo-500 font-medium">click để chọn</span>
              </p>
            </>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Nhập tiêu đề file..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Danh mục</label>
          <select
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Chọn danh mục --</option>
            {FILE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={loading} leftIcon={<Upload className="h-4 w-4" />}>
            Upload
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ file, onClose, onSuccess }: { file: FileDTO; onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState(file.title);
  const [category, setCategory] = useState(file.category ?? '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) { toast.error('Vui lòng nhập tiêu đề'); return; }
    setLoading(true);
    try {
      await filesApi.updateFile(file.id, { title: title.trim(), category: category || undefined });
      toast.success('✅ Cập nhật thành công!');
      onSuccess();
      onClose();
    } catch {
      toast.error('Lỗi khi cập nhật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-amber-500" />
            Chỉnh sửa file
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tiêu đề <span className="text-red-500">*</span></label>
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Danh mục</label>
          <select
            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">-- Chọn danh mục --</option>
            {FILE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-1">
          <Button variant="ghost" onClick={onClose}>Hủy</Button>
          <Button variant="warning" onClick={handleSubmit} isLoading={loading} leftIcon={<Check className="h-4 w-4" />}>
            Lưu thay đổi
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export const AdminFilesPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [editTarget, setEditTarget] = useState<FileDTO | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-files', page, categoryFilter],
    queryFn: () => filesApi.getFiles({ page, size: 10, category: categoryFilter || undefined }),
  });

  const files: FileDTO[] = data?.data?.content ?? [];
  const totalPages: number = data?.data?.totalPages ?? 1;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => filesApi.deleteFile(id),
    onSuccess: () => {
      toast.success('Đã xóa file');
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-files'] });
    },
    onError: () => toast.error('Lỗi khi xóa file'),
  });

  const filtered = search
    ? files.filter((f) => f.title.toLowerCase().includes(search.toLowerCase()) || f.fileName?.toLowerCase().includes(search.toLowerCase()))
    : files;

  const refreshList = () => queryClient.invalidateQueries({ queryKey: ['admin-files'] });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 shadow-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Quản lý Files</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Upload, chỉnh sửa và quản lý tài nguyên file.</p>
          </div>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowUpload(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Thêm file mới
        </Button>
      </motion.div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên file..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
          >
            <option value="">Tất cả danh mục</option>
            {FILE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-sm text-slate-500 dark:text-slate-400 ml-auto">
            {data?.data?.totalElements ?? 0} file(s)
          </span>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
              <FileText className="h-12 w-12 opacity-30" />
              <p className="text-sm">Chưa có file nào. Hãy upload file đầu tiên!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr>
                    {['#', 'Loại', 'Tiêu đề', 'Tên file', 'Danh mục', 'Ngày upload', ''].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filtered.map((f, idx) => (
                    <motion.tr
                      key={f.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-slate-400 w-8">{page * 10 + idx + 1}</td>
                      <td className="px-4 py-3 w-10">{fileIcon(f.type)}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                        {f.title}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[180px] truncate text-xs">
                        {f.fileName}
                      </td>
                      <td className="px-4 py-3">
                        {f.category ? (
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeColor(f.category)}`}>
                            {f.category}
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(f.uploadedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                            title="Xem file"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            className="rounded p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                            onClick={() => setEditTarget(f)}
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            className="rounded p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            onClick={() => setDeleteId(f.id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost" size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Trước
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="ghost" size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={refreshList} />}
        {editTarget && <EditModal file={editTarget} onClose={() => setEditTarget(null)} onSuccess={refreshList} />}
        {deleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Xóa file?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hành động này không thể hoàn tác.</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
                <Button
                  variant="danger"
                  isLoading={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(deleteId!)}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Xóa
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
