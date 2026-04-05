import { BookMarked, Eye, EyeOff, Languages, Share2, Type } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import type { Annotation } from '@/types';

const fontSizeMap = {
  small: 'text-base leading-8',
  medium: 'text-lg leading-9',
  large: 'text-xl leading-10',
};

const categoryLabelMap = {
  official: '官修典籍',
  local: '地方文献',
  private: '私人著述',
  inscription: '碑刻铭文',
  drawing: '图绘资料',
};

export function DocumentReader() {
  const {
    addBookmark,
    currentDocument,
    documents,
    fontSize,
    openDocument,
    setFontSize,
    showAnnotations,
    showTranslation,
    toggleAnnotations,
    toggleTranslation,
  } = useStore();
  const [hoveredAnnotation, setHoveredAnnotation] = useState<Annotation | null>(null);

  const renderedContent = useMemo(() => {
    if (!currentDocument) return null;
    if (!showAnnotations || !currentDocument.annotations?.length) {
      return <p className="whitespace-pre-wrap">{currentDocument.content}</p>;
    }

    const parts: JSX.Element[] = [];
    let cursor = 0;
    [...currentDocument.annotations]
      .sort((left, right) => left.start - right.start)
      .forEach((annotation) => {
        if (annotation.start > cursor) {
          parts.push(
            <span key={`${annotation.id}-text`}>{currentDocument.content.slice(cursor, annotation.start)}</span>,
          );
        }
        parts.push(
          <span
            key={annotation.id}
            className="rounded bg-lingnan-50 px-1 text-lingnan-700"
            onMouseEnter={() => setHoveredAnnotation(annotation)}
            onMouseLeave={() => setHoveredAnnotation(null)}
          >
            {currentDocument.content.slice(annotation.start, annotation.end)}
          </span>,
        );
        cursor = annotation.end;
      });

    if (cursor < currentDocument.content.length) {
      parts.push(<span key="tail">{currentDocument.content.slice(cursor)}</span>);
    }

    return <p className="whitespace-pre-wrap">{parts}</p>;
  }, [currentDocument, showAnnotations]);

  if (!currentDocument) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="text-center">
          <BookMarked size={48} className="mx-auto mb-4 text-ink-300" />
          <p className="text-lg font-medium text-ink-700">请选择一篇文献开始阅读</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex h-14 items-center justify-between border-b border-ink-100 px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTranslation}
            className={`rounded-xl px-3 py-2 text-sm transition ${
              showTranslation ? 'bg-lingnan-50 text-lingnan-700' : 'hover:bg-ink-50 text-ink-600'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Languages size={16} />
              白话说明
            </span>
          </button>
          <button
            onClick={toggleAnnotations}
            className={`rounded-xl px-3 py-2 text-sm transition ${
              showAnnotations ? 'bg-lingnan-50 text-lingnan-700' : 'hover:bg-ink-50 text-ink-600'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              {showAnnotations ? <Eye size={16} /> : <EyeOff size={16} />}
              术语标注
            </span>
          </button>
          <div className="ml-2 flex rounded-xl bg-ink-50 p-1">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`rounded-lg p-2 transition ${fontSize === size ? 'bg-white text-lingnan-700 shadow-sm' : 'text-ink-400'}`}
              >
                <Type size={16} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              void addBookmark({
                type: 'document',
                title: currentDocument.title,
                description: currentDocument.summary,
                documentId: currentDocument.id,
              })
            }
            className="rounded-xl p-2 text-ink-600 transition hover:bg-ink-50"
            title="加入书签"
          >
            <BookMarked size={18} />
          </button>
          <button className="rounded-xl p-2 text-ink-600 transition hover:bg-ink-50" title="分享">
            <Share2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl px-8 py-10">
            <div className="mb-8 border-b border-ink-100 pb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-ink-500">
                <span className="rounded-full bg-lingnan-50 px-3 py-1 text-lingnan-700">
                  {currentDocument.dynasty || '未标注朝代'}
                </span>
                <span>{currentDocument.author || '佚名'}</span>
                <span>·</span>
                <span>{categoryLabelMap[currentDocument.category]}</span>
              </div>
              <h1 className="font-serif text-4xl font-bold text-ink-900">{currentDocument.title}</h1>
              {currentDocument.originalTitle && (
                <p className="mt-2 font-serif text-lg text-ink-500">{currentDocument.originalTitle}</p>
              )}
            </div>

            {currentDocument.summary && (
              <div className="mb-8 rounded-3xl border border-lingnan-100 bg-lingnan-50 p-5">
                <p className="mb-2 text-sm font-medium text-lingnan-700">内容提要</p>
                <p className="text-sm leading-7 text-ink-700">{currentDocument.summary}</p>
              </div>
            )}

            <div className={`font-serif text-ink-800 ${fontSizeMap[fontSize]}`}>{renderedContent}</div>

            {showTranslation && (
              <div className="mt-8 rounded-3xl border border-ink-200 bg-ink-50 p-5">
                <p className="mb-2 text-sm font-medium text-ink-700">白话说明</p>
                <p className="text-sm leading-7 text-ink-600">
                  {currentDocument.title} 主要讨论了 {currentDocument.summary || '古建筑相关内容'}，
                  当前版本使用前端演示说明，可继续接入真实大模型翻译与溯源能力。
                </p>
              </div>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {currentDocument.metadata.source && (
                <div className="rounded-2xl bg-ink-50 p-4">
                  <p className="text-xs text-ink-400">来源</p>
                  <p className="mt-1 text-sm text-ink-700">{currentDocument.metadata.source}</p>
                </div>
              )}
              {currentDocument.metadata.preservation && (
                <div className="rounded-2xl bg-ink-50 p-4">
                  <p className="text-xs text-ink-400">藏本</p>
                  <p className="mt-1 text-sm text-ink-700">{currentDocument.metadata.preservation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden w-80 border-l border-ink-100 bg-ink-50 xl:block">
          <div className="border-b border-ink-100 px-5 py-4">
            <h3 className="font-medium text-ink-900">快速切换文献</h3>
          </div>
          <div className="space-y-3 p-4">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => void openDocument(doc)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  doc.id === currentDocument.id
                    ? 'border-lingnan-200 bg-white'
                    : 'border-transparent bg-white/80 hover:border-ink-200'
                }`}
              >
                <p className="font-medium text-ink-900">{doc.title}</p>
                <p className="mt-1 text-xs text-ink-500">{doc.author || '佚名'}</p>
              </button>
            ))}
          </div>
        </aside>
      </div>

      {hoveredAnnotation && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 w-[360px] -translate-x-1/2 rounded-2xl border border-ink-200 bg-white p-4 shadow-xl">
          <p className="mb-1 text-sm font-medium text-lingnan-700">{hoveredAnnotation.text}</p>
          <p className="text-sm leading-6 text-ink-600">{hoveredAnnotation.explanation}</p>
        </div>
      )}
    </div>
  );
}
