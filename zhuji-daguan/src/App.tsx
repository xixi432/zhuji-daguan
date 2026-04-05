import { useEffect } from 'react';
import { AIAnalysisPanel } from '@/components/AI/AIAnalysisPanel';
import { KnowledgeGraphView } from '@/components/Graph/KnowledgeGraph';
import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import { DocumentReader } from '@/components/Reader/DocumentReader';
import { ReportGenerator } from '@/components/Report/ReportGenerator';
import { SearchPanel } from '@/components/Search/SearchPanel';
import { FileUploader } from '@/components/Upload/FileUploader';
import { BookmarksPanel } from '@/components/User/Bookmarks';
import { HistoryPanel } from '@/components/User/History';
import { Login } from '@/components/User/Login';
import { SettingsPanel } from '@/components/User/Settings';
import { useStore } from '@/store';

function App() {
  const {
    activeTab,
    loadBookmarks,
    loadDocuments,
    loadHistory,
    loadKnowledgeGraph,
    user,
  } = useStore();

  useEffect(() => {
    void loadDocuments();
    void loadKnowledgeGraph();
  }, [loadDocuments, loadKnowledgeGraph]);

  useEffect(() => {
    if (!user) return;
    void loadHistory();
    void loadBookmarks();
  }, [user, loadHistory, loadBookmarks]);

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'reader':
        return <DocumentReader />;
      case 'graph':
        return <KnowledgeGraphView />;
      case 'search':
        return <SearchPanel />;
      case 'analysis':
        return <AIAnalysisPanel />;
      case 'upload':
        return <FileUploader />;
      case 'report':
        return <ReportGenerator />;
      case 'history':
        return <HistoryPanel />;
      case 'bookmarks':
        return <BookmarksPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <DocumentReader />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
