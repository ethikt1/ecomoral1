import React from 'react';
import { Leaf, Code2, BookOpen, Settings, PlayCircle } from 'lucide-react';

interface NavbarProps {
  activeTab: 'simulator' | 'code' | 'guide' | 'settings';
  setActiveTab: (tab: 'simulator' | 'code' | 'guide' | 'settings') => void;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, apiConnected }) => {
  return (
    <header className="bg-[#E8F0E6] text-[#2C3E2D] border-b border-[#D1DBCF] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('simulator')}>
            <div className="w-10 h-10 bg-[#5D7A5D] text-white rounded-xl flex items-center justify-center shadow-xs">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight text-[#2C3E2D]">EcoMoral Lab</h1>
                <span className="text-[11px] bg-[#5D7A5D]/15 text-[#344E41] font-semibold px-2.5 py-0.5 rounded-full border border-[#5D7A5D]/30">
                  v1.0 Ready
                </span>
              </div>
              <p className="text-xs text-[#6B7A6B]">환경 도덕성 진단 및 맞춤형 학습 플랫폼</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-white/90 p-1 rounded-2xl border border-[#D1DBCF] shadow-2xs">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'simulator'
                  ? 'bg-[#344E41] text-white shadow-xs'
                  : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
              }`}
            >
              <PlayCircle className="w-4 h-4" />
              <span>웹앱 시뮬레이터</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'code'
                  ? 'bg-[#344E41] text-white shadow-xs'
                  : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Apps Script 소스코드</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-[#344E41] text-white shadow-xs'
                  : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>설정 & 매뉴얼</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#344E41] text-white shadow-xs'
                  : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>
                연동 상태 ({apiConnected ? '실제 웹앱' : '로컬 모의'})
              </span>
            </button>
          </nav>

        </div>
      </div>

      {/* Mobile Tab bar */}
      <div className="md:hidden flex items-center justify-around bg-[#F0F4EF] border-t border-[#D1DBCF] py-2 px-1 text-[11px]">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${activeTab === 'simulator' ? 'text-[#344E41] font-bold bg-[#D1DBCF]/40' : 'text-[#6B7A6B]'}`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>시뮬레이터</span>
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${activeTab === 'code' ? 'text-[#344E41] font-bold bg-[#D1DBCF]/40' : 'text-[#6B7A6B]'}`}
        >
          <Code2 className="w-4 h-4" />
          <span>소스코드</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${activeTab === 'guide' ? 'text-[#344E41] font-bold bg-[#D1DBCF]/40' : 'text-[#6B7A6B]'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>매뉴얼</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${activeTab === 'settings' ? 'text-[#344E41] font-bold bg-[#D1DBCF]/40' : 'text-[#6B7A6B]'}`}
        >
          <Settings className="w-4 h-4" />
          <span>연동설정</span>
        </button>
      </div>
    </header>
  );
};
