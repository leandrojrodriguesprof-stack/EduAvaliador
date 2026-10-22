import {
  FileCheck2,
  BookOpen,
  PlusCircle,
  Sparkles,
  ClipboardList,
  RotateCcw,
  PenTool,
  Camera,
  BarChart3,
} from 'lucide-react';
import { resetToDefaults } from '../utils/storage';

export type ActiveTab =
  | 'list'
  | 'editor'
  | 'dashboard'
  | 'taker'
  | 'results'
  | 'enem_essays'
  | 'photo_batch'
  | 'bncc_dashboard';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingCount: number;
  onOpenAiModal: () => void;
  onNewExam: () => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  onOpenAiModal,
  onNewExam,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('list')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-700 via-slate-800 to-indigo-900 bg-clip-text text-transparent">
                  Gabarito<span className="text-indigo-600">Pro</span>
                </span>
                <span className="block text-[10px] font-semibold text-slate-500 tracking-wide uppercase">
                  BNCC &bull; ENEM &bull; Correção IA
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Banco de Provas
            </button>

            <button
              onClick={() => {
                onNewExam();
                setActiveTab('editor');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'editor'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Criar Prova (BNCC)
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Correção de Provas
              {pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('photo_batch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'photo_batch'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-indigo-600" />
              Correção por Foto
            </button>

            <button
              onClick={() => setActiveTab('enem_essays')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'enem_essays'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-emerald-800 hover:text-emerald-950 font-semibold'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-amber-300" />
              Redações ENEM (MEC)
            </button>

            <button
              onClick={() => setActiveTab('bncc_dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bncc_dashboard'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              Dashboard BNCC
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onResetData}
              title="Zerar todos os dados da plataforma"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Zerar Dados
            </button>

            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-200 active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Gerar Prova IA</span>
            </button>
          </div>
        </div>

        {/* Responsive Secondary Nav Tabs */}
        <div className="flex xl:hidden py-2 border-t border-slate-100 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Provas
          </button>
          <button
            onClick={() => {
              onNewExam();
              setActiveTab('editor');
            }}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'editor' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Criar (BNCC)
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap relative ${
              activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Correção {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button
            onClick={() => setActiveTab('photo_batch')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'photo_batch' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'
            }`}
          >
            Foto/Lote
          </button>
          <button
            onClick={() => setActiveTab('enem_essays')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-bold whitespace-nowrap ${
              activeTab === 'enem_essays' ? 'bg-emerald-600 text-white' : 'text-emerald-800'
            }`}
          >
            Redações ENEM
          </button>
          <button
            onClick={() => setActiveTab('bncc_dashboard')}
            className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'bncc_dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
            }`}
          >
            Dashboard BNCC
          </button>
        </div>
      </div>
    </header>
  );
};
