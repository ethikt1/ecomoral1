import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Terminal } from 'lucide-react';
import { CODE_GS, INDEX_HTML, STYLESHEET_HTML, JAVASCRIPT_HTML, APPSSCRIPT_JSON } from '../utils/gasFilesLoader';

export const CodeExporterView: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'Code.gs' | 'Index.html' | 'Stylesheet.html' | 'JavaScript.html' | 'appsscript.json'>('Code.gs');
  const [copied, setCopied] = useState(false);

  const fileContents = {
    'Code.gs': CODE_GS,
    'Index.html': INDEX_HTML,
    'Stylesheet.html': STYLESHEET_HTML,
    'JavaScript.html': JAVASCRIPT_HTML,
    'appsscript.json': APPSSCRIPT_JSON
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContents[activeFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fileContents[activeFile]], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Info */}
      <div className="bg-[#2C3E2D] border border-[#344E41] rounded-2xl p-6 text-white mb-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-5 h-5 text-[#8A9A5B]" />
              <h2 className="text-xl font-bold text-[#FDFCF8]">Google Apps Script 전체 완성 코드</h2>
            </div>
            <p className="text-xs text-[#D1DBCF] leading-relaxed max-w-3xl">
              Google Apps Script 편집기에 복사하여 바로 배포할 수 있는 5개 소스 파일의 100% 완성본 코드입니다.
              아래 탭에서 각 파일 코드를 확인하고 <strong>[코드 전체 복사]</strong> 버튼을 클릭하여 입력하세요.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#5D7A5D] hover:bg-[#4E684E] text-white font-semibold text-xs rounded-xl shadow-2xs transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-[#E8F0E6]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '복사 완료!' : '코드 전체 복사'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#344E41] hover:bg-[#2A3F34] text-[#E8F0E6] font-semibold text-xs rounded-xl border border-[#5D7A5D] shadow-2xs transition-all"
            >
              <Download className="w-4 h-4" />
              <span>파일 다운로드</span>
            </button>
          </div>
        </div>
      </div>

      {/* File Tab Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {(['Code.gs', 'Index.html', 'Stylesheet.html', 'JavaScript.html', 'appsscript.json'] as const).map((filename) => (
          <button
            key={filename}
            onClick={() => setActiveFile(filename)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeFile === filename
                ? 'bg-[#344E41] text-white border-[#2C3E2D] shadow-xs'
                : 'bg-white text-[#344E41] border-[#D1DBCF] hover:bg-[#F0F4EF]'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>{filename}</span>
          </button>
        ))}
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-[#1B291F] rounded-2xl border border-[#344E41] overflow-hidden shadow-sm">
        <div className="bg-[#243529] border-b border-[#344E41] px-4 py-3 flex items-center justify-between text-xs text-[#A3B18A]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF6B6B] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFB02E] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#8A9A5B] inline-block"></span>
            <span className="ml-2 font-mono text-[#E8F0E6]">{activeFile}</span>
          </div>
          <span>{fileContents[activeFile].split('\n').length} lines</span>
        </div>

        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
          <pre className="font-mono text-xs text-[#D8E6D3] leading-relaxed whitespace-pre">
            {fileContents[activeFile]}
          </pre>
        </div>
      </div>
    </div>
  );
};
