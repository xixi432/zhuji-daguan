import { CheckCircle2, Clock3, FileText, Trash2, UploadCloud, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';
import { useStore } from '@/store';
import type { FileUpload } from '@/types';

export function FileUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { addUpload, removeUpload, updateUpload, uploadDocument, uploads } = useStore();

  const handleUpload = async (file: File) => {
    const id = `upload-${Date.now()}-${file.name}`;
    const upload: FileUpload = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      status: 'uploading',
      progress: 20,
    };

    addUpload(upload);
    updateUpload(id, { status: 'processing', progress: 60 });

    try {
      await uploadDocument(file, {
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: 'private',
      });
      updateUpload(id, { status: 'completed', progress: 100 });
    } catch (error) {
      updateUpload(id, {
        status: 'failed',
        error: error instanceof Error ? error.message : '上传失败',
      });
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      await handleUpload(file);
    }
  };

  const statusIcon = (status: FileUpload['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={18} className="text-green-600" />;
      case 'failed':
        return <XCircle size={18} className="text-red-600" />;
      default:
        return <Clock3 size={18} className="text-amber-600" />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-ink-50">
      <div className="border-b border-ink-200 bg-white px-6 py-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900">文献上传</h1>
        <p className="mt-2 text-sm text-ink-500">支持上传 PDF、TXT、Word 等文献文件。</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFiles(event.dataTransfer.files);
          }}
          className={`rounded-3xl border-2 border-dashed p-10 text-center transition ${
            dragging ? 'border-lingnan-400 bg-lingnan-50' : 'border-ink-200 bg-white'
          }`}
        >
          <UploadCloud size={44} className="mx-auto mb-4 text-lingnan-600" />
          <h2 className="text-xl font-medium text-ink-900">拖拽文件到这里</h2>
          <p className="mt-2 text-sm text-ink-500">或者使用按钮选择本地文献。</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-6 rounded-2xl bg-lingnan-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-lingnan-700"
          >
            选择文件
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx"
            className="hidden"
            onChange={(event) => void handleFiles(event.target.files)}
          />
        </div>

        <div className="mt-6 rounded-3xl border border-ink-200 bg-white p-6">
          <h3 className="mb-4 font-medium text-ink-900">上传记录</h3>
          <div className="space-y-3">
            {uploads.length === 0 && <p className="text-sm text-ink-400">暂时还没有上传记录。</p>}
            {uploads.map((upload) => (
              <div key={upload.id} className="rounded-2xl border border-ink-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText size={18} className="text-ink-500" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">{upload.name}</p>
                      <p className="text-sm text-ink-500">
                        {upload.status === 'uploading' && '上传中'}
                        {upload.status === 'processing' && '处理中'}
                        {upload.status === 'completed' && '已完成'}
                        {upload.status === 'failed' && (upload.error || '上传失败')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusIcon(upload.status)}
                    <button
                      onClick={() => removeUpload(upload.id)}
                      className="rounded-xl border border-ink-200 p-2 text-ink-500 transition hover:bg-ink-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {upload.status !== 'failed' && (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                    <div className="h-full bg-lingnan-600 transition-all" style={{ width: `${upload.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
