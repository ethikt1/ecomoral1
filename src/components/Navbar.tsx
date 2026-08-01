import React, { useState } from 'react';
import { Leaf, Code2, BookOpen, Settings, PlayCircle, LayoutDashboard, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export type TabType = 'simulator' | 'teacher' | 'code' | 'guide' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  apiConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, apiConnected }) => {
  const [showTeacherMenu, setShowTeacherMenu] = useState(activeTab !== 'simulator');

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
                  학생용 학습 플랫폼
                </span>
              </div>
              <p className="text-xs text-[#6B7A6B]">환경 도덕성 진단 및 맞춤형 학습 프로그램</p>
            </div>
          </div>

          {/* Right Action: Teacher Menu Toggle & Tabs */}
          <div className="flex items-center gap-2">
            {/* Toggle Button for Teacher Menu */}
            <button
              onClick={() => setShowTeacherMenu(!showTeacherMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                showTeacherMenu || activeTab !== 'simulator'
                  ? 'bg-[#344E41] text-white border-[#344E41]'
                  : 'bg-white/80 text-[#344E41] border-[#D1DBCF] hover:bg-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>교사용 메뉴</span>
              {showTeacherMenu ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Desktop Navigation Tabs (Shown when Teacher Menu is active) */}
            {showTeacherMenu && (
              <nav className="hidden md:flex items-center gap-1 bg-white/90 p-1 rounded-2xl border border-[#D1DBCF] shadow-2xs">
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'simulator'
                      ? 'bg-[#344E41] text-white shadow-xs'
                      : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
                  }`}
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>학생 학습화면</span>
                </button>

                <button
                  onClick={() => setActiveTab('teacher')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'teacher'
                      ? 'bg-[#344E41] text-white shadow-xs'
                      : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                  <span>교사 대시보드</span>
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'code'
                      ? 'bg-[#344E41] text-white shadow-xs'
                      : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Script 코드</span>
                </button>

                <button
                  onClick={() => setActiveTab('guide')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'guide'
                      ? 'bg-[#344E41] text-white shadow-xs'
                      : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>설정&매뉴얼</span>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'settings'
                      ? 'bg-[#344E41] text-white shadow-xs'
                      : 'text-[#5D7A5D] hover:text-[#2C3E2D] hover:bg-[#F0F4EF]'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>연동 ({apiConnected ? 'Google시트' : 'Firebase'})</span>
                </button>
              </nav>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Tab bar when teacher menu is toggled */}
      {showTeacherMenu && (
        <div className="md:hidden flex items-center justify-around bg-[#F0F4EF] border-t border-[#D1DBCF] py-2 px-1 text-[11px]">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${activeTab === 'simulator' ? 'text-[#344E41] font-bold bg-[#D1DBCF]/40' : 'text-[#6B7A6B]'}`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>학습화면</span>
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${activeTab === 'teacher' ? 'text-[#344E41] font-bold bg-[#D1DBCF]/40' : 'text-[#6B7A6B]'}`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
            <span>대시보드</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${activeTab === 'code' ? 'text-[#344E41] font-bold bg-[#D1DBCF]/40' : 'text-[#6B7A6B]'}`}
          >
            <Code2 className="w-4 h-4" />
            <span>코드</span>
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
            <span>설정</span>
          </button>
        </div>
      )}
    </header>
  );
};

