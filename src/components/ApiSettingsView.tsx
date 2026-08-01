import React, { useState } from 'react';
import { Settings, Link, Check, RefreshCw, Info, ExternalLink, Wand2 } from 'lucide-react';
import { cleanGoogleScriptUrl } from '../utils/urlHelper';

interface ApiSettingsViewProps {
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  useLiveApi: boolean;
  setUseLiveApi: (use: boolean) => void;
}

export const ApiSettingsView: React.FC<ApiSettingsViewProps> = ({
  webAppUrl,
  setWebAppUrl,
  useLiveApi,
  setUseLiveApi
}) => {
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleUrlChange = (rawUrl: string) => {
    const cleaned = cleanGoogleScriptUrl(rawUrl);
    setWebAppUrl(cleaned);
  };

  const handleTestConnection = async () => {
    if (!webAppUrl) {
      setTestStatus('웹 앱 URL을 입력해주세요.');
      return;
    }
    const targetUrl = cleanGoogleScriptUrl(webAppUrl);
    if (targetUrl !== webAppUrl) {
      setWebAppUrl(targetUrl);
    }

    setTesting(true);
    setTestStatus('연결 상태를 확인하는 중입니다...');

    try {
      // Test endpoint with no-cache and mode cors
      const res = await fetch(`${targetUrl}?action=health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.status === 'ok') {
          setTestStatus('✅ [연결 성공!] 구글 Apps Script 백엔드 데이터베이스와 연결되었습니다.');
        } else {
          setTestStatus('✅ 구글 웹앱 응답 수신 성공! (구글 시트 연동 준비 완료)');
        }
      } else {
        setTestStatus(`⚠️ 구글 응답 상태 코드: ${res.status}. Apps Script [새 배포] 권한 설정을 [모든 사용자(Anyone)]로 지정했는지 확인해 주세요.`);
      }
    } catch (e: any) {
      setTestStatus('💡 브라우저 CORS 정책 특성상 GET 응답이 제한될 수 있으나, 웹앱 시뮬레이터에서 학생 데이터를 제출하면 Apps Script로 정상 전송(no-cors POST)됩니다. 만약 전혀 동작하지 않는다면 구글 시트 Apps Script에서 [setupDatabase] 실행 및 [새 배포]가 완료되었는지 확인하세요.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E0E7DE] pb-4">
          <div className="w-10 h-10 bg-[#E8F0E6] text-[#2C3E2D] rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#2C3E2D]">연동 모드 및 구글 웹앱 URL 설정</h2>
            <p className="text-xs text-[#6B7A6B]">
              시뮬레이터 모드(인메모리 모의 구동) 또는 배포된 실제 Apps Script 연동 모드를 선택할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setUseLiveApi(false)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              !useLiveApi ? 'border-[#344E41] bg-[#E8F0E6]/60 shadow-2xs' : 'border-[#D1DBCF] hover:border-[#5D7A5D]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#2C3E2D] text-sm">🧪 로컬 모의 시뮬레이터 모드</span>
              {!useLiveApi && <Check className="w-5 h-5 text-[#344E41]" />}
            </div>
            <p className="text-xs text-[#6B7A6B] leading-relaxed">
              별도의 구글 시트 배포 없이도 브라우저 상에서 EcoMoral Lab의 10단계 학생 학습 및 교사 대시보드(60명 가상 데이터 생성 포함) 전체 기능을 바로 체험할 수 있는 모드입니다.
            </p>
          </div>

          <div
            onClick={() => setUseLiveApi(true)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              useLiveApi ? 'border-[#344E41] bg-[#E8F0E6]/60 shadow-2xs' : 'border-[#D1DBCF] hover:border-[#5D7A5D]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#2C3E2D] text-sm">🌐 실제 Google Apps Script 연동 모드</span>
              {useLiveApi && <Check className="w-5 h-5 text-[#344E41]" />}
            </div>
            <p className="text-xs text-[#6B7A6B] leading-relaxed">
              본인이 직접 구글 시트 및 Apps Script 웹앱으로 배포한 웹 앱 URL을 등록하여 실제 소유한 구글 시트 DB와 실시간 통신하는 모드입니다.
            </p>
          </div>
        </div>

        {/* Web App URL Input */}
        {useLiveApi && (
          <div className="space-y-4 pt-2 border-t border-[#E0E7DE]">
            <div>
              <label className="block text-xs font-bold text-[#2C3E2D] mb-1">
                배포된 Google Apps Script 웹 앱 URL 주소 (https://script.google.com/macros/s/.../exec)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={webAppUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 p-3 text-xs border border-[#D1DBCF] rounded-xl font-mono text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                />
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="bg-[#344E41] hover:bg-[#2A3F34] text-white font-semibold text-xs px-4 py-3 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                  <span>연결 테스트</span>
                </button>
              </div>
            </div>

            {/* Smart URL Detection Warnings */}
            {webAppUrl.includes('docs.google.com/spreadsheets') && (
              <div className="p-4 bg-[#FFF8E7] border-2 border-[#E6B800] rounded-xl text-xs text-[#5C4518] space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm text-[#8A6D00]">
                  <span>⚠️ 입력하신 주소는 [구글 시트 주소]입니다!</span>
                </div>
                <p className="leading-relaxed text-[12px]">
                  웹 앱 연동 주소는 구글 시트 URL이 아니라, 구글 시트에서 생성한 <strong>Apps Script 웹 앱 배포 URL</strong>이어야 합니다.
                </p>
                <div className="bg-white/80 p-2.5 rounded-lg border border-[#E6D7B8] text-[11px] space-y-1">
                  <div><strong>현재 구글 시트에서 배포 주소 가져오는 방법:</strong></div>
                  <ol className="list-decimal list-inside space-y-0.5 text-[#4A3B10]">
                    <li>해당 구글 시트 상단 메뉴에서 <strong>[확장 프로그램] ➔ [Apps Script]</strong> 클릭</li>
                    <li>Apps Script 상단 메뉴 <strong>[setupDatabase]</strong> 선택 후 <strong>[▶ 실행]</strong> 클릭 (최초 1회 DB 시트 자동 생성)</li>
                    <li>우측 상단 <strong>[배포] ➔ [새 배포]</strong> 클릭 ➔ ⚙️ 유형 [웹 앱] 선택</li>
                    <li>액세스 권한: <strong>[모든 사용자 (Anyone)]</strong> 선택 ➔ <strong>[배포]</strong> 클릭</li>
                    <li>화면에 나오는 <code>https://script.google.com/macros/s/.../exec</code> 주소를 복사하여 위 입력란에 붙여넣어 주세요!</li>
                  </ol>
                </div>
              </div>
            )}

            {webAppUrl.includes('/a/macros/') && (
              <div className="p-4 bg-[#FFF0F0] border-2 border-[#E57373] rounded-xl text-xs text-[#C62828] space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm text-[#B71C1C]">
                  <span>🚨 [senedu.kr] 교육청 조직 제한 URL이 감지되었습니다!</span>
                </div>
                <p className="leading-relaxed text-[12px]">
                  현재 배포 주소에 <code>/a/macros/senedu.kr/</code>이 포함되어 있습니다. 아래 [자동 변환] 버튼을 누르면 외부 통신 가능한 표준 글로벌 URL(<code>https://script.google.com/macros/s/.../exec</code>)로 즉시 변경됩니다.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      const cleaned = cleanGoogleScriptUrl(webAppUrl);
                      setWebAppUrl(cleaned);
                      setTestStatus('✨ 표준 배포 주소로 자동 정제되었습니다! [연결 테스트]를 클릭하세요.');
                    }}
                    className="px-3.5 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all text-xs"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>⚡ 표준 URL로 자동 정제하기 (/a/macros/ 제거)</span>
                  </button>
                </div>
                <div className="bg-white p-3 rounded-lg border border-[#FFCDD2] text-[11px] space-y-1.5 text-[#333]">
                  <div className="font-bold text-[#D32F2F]">💡 권장 설정 (구글 배포 확인):</div>
                  <ol className="list-decimal list-inside space-y-1 text-[#222]">
                    <li>Apps Script 편집기 우측 상단 <strong>[배포] ➔ [배포 관리]</strong> (또는 [새 배포]) 클릭</li>
                    <li>우측 ⚙️ 설정 아이콘 옆 <strong>연필(수정) 아이콘</strong> 클릭</li>
                    <li><strong>액세스 권한 있는 사용자:</strong>를 <span className="bg-[#FFE0B2] px-1 font-bold text-[#E65100]">모든 사용자 (Anyone)</span>로 변경</li>
                    <li><strong>[배포]</strong> 클릭하세요!</li>
                  </ol>
                </div>
              </div>
            )}

            {webAppUrl.includes('script.google.com') && webAppUrl.includes('/edit') && (
              <div className="p-4 bg-[#FFF8E7] border-2 border-[#E6B800] rounded-xl text-xs text-[#5C4518] space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm text-[#8A6D00]">
                  <span>⚠️ 입력하신 주소는 Apps Script [편집기 주소](/edit)입니다!</span>
                </div>
                <p className="leading-relaxed text-[12px]">
                  편집기 주소 대신 우측 상단 <strong>[배포] ➔ [웹 앱 배포]</strong>에서 발급받은 끝자리가 <code>/exec</code>로 끝나는 배포 URL을 입력해 주세요.
                </p>
              </div>
            )}

            {testStatus && (
              <div className="p-3 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl text-xs text-[#344E41]">
                {testStatus}
              </div>
            )}
          </div>
        )}

        <div className="bg-[#FFF9EA] border border-[#E6D7B8] rounded-xl p-4 text-xs text-[#5C4518] space-y-3">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-[#8A9A5B] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-[#5C4518] text-sm">💡 새 구글 시트 연동 및 웹앱 배포 3단계 안내</strong>
              <p className="text-[#5C4518] leading-relaxed">
                새 구글 시트를 만들어 연동하시려면 아래 버튼을 눌러 바로 이동하실 수 있습니다. (미리보기 화면 내부에서는 팝업이 차단될 수 있으므로 새 탭 주소창에 직접 입력하셔도 됩니다.)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="https://sheet.new"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold text-xs py-2 px-3.5 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>📊 1. 새 구글 시트만들기 (sheet.new)</span>
            </a>

            <a
              href="https://script.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#5D7A5D] hover:bg-[#4E684E] text-white font-bold text-xs py-2 px-3.5 rounded-lg inline-flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>📜 2. Apps Script 열기 (script.google.com)</span>
            </a>
          </div>

          <div className="bg-white/80 border border-[#E6D7B8] rounded-lg p-3 text-[11px] text-[#344E41] space-y-1.5">
            <div><strong>① 구글 시트 생성:</strong> 시트 생성 후 상단 메뉴 [확장 프로그램] → [Apps Script] 클릭</div>
            <div><strong>② 코드 복사&붙여넣기:</strong> 상단 [Apps Script 소스코드] 탭의 [Code.gs] 전체 코드를 복사하여 Apps Script 편집기 기존 내용을 지우고 붙여넣기</div>
            <div><strong>③ 함수 실행:</strong> 편집기 상단 드롭다운에서 <code>setupDatabase</code> 선택 후 [▶ 실행] 클릭 (최초 1회 권한 승인)</div>
            <div><strong>④ 웹앱 배포 설정 (중요):</strong> 우측 상단 [배포] → [새 배포]
              <ul className="list-disc list-inside ml-2 mt-0.5 space-y-0.5 text-[10.5px] text-[#5C4518]">
                <li><strong>유형 선택:</strong> 톱니바퀴 ⚙️ → [웹 앱]</li>
                <li><strong>다음 사용자로 앱 실행:</strong> <span className="underline font-bold">나 (Me)</span></li>
                <li><strong>액세스 권한 있는 사용자:</strong> <span className="underline font-bold">모든 사용자 (Anyone)</span> 또는 <span className="underline font-bold">senedu.kr 계정 사용자</span></li>
              </ul>
            </div>
            <div><strong>⑤ URL 연동:</strong> 생성된 배포 URL을 위 입력란에 붙여넣고 <strong>[저장하기]</strong> 클릭! (코드 수정 후엔 반드시 [새 배포] 필수)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
