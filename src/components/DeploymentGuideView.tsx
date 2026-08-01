import React, { useState } from 'react';
import { BookOpen, CheckCircle, Database, Lock, QrCode, Play, FileSpreadsheet, AlertTriangle, Code, RefreshCw } from 'lucide-react';

export const DeploymentGuideView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('sheets');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro Header */}
      <div className="bg-[#2C3E2D] border border-[#344E41] rounded-2xl p-6 text-white mb-8 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-[#8A9A5B]" />
          <h2 className="text-2xl font-bold text-[#FDFCF8]">EcoMoral Lab 시스템 구축 및 배포 매뉴얼</h2>
        </div>
        <p className="text-xs text-[#D1DBCF] leading-relaxed max-w-3xl">
          개발 초보자도 쉽게 따라 할 수 있는 단계별 설치 가이드입니다. Google Sheets 생성부터 Apps Script 배포,
          QR 코드 생성, 데이터 분석, 문제 해결 방법까지 순서대로 설명합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Side Navigation */}
        <div className="lg:col-span-1 space-y-1.5">
          {[
            { id: 'sheets', label: '1. Google Sheets 두 개 생성', icon: Database },
            { id: 'scriptprops', label: '2. Script Properties 설정', icon: Lock },
            { id: 'deploy', label: '3. Apps Script 웹앱 배포', icon: Play },
            { id: 'qr', label: '4. QR 코드 생성 & 공유', icon: QrCode },
            { id: 'testing', label: '5. DB 분리 & 테스트 검증', icon: CheckCircle },
            { id: 'colab', label: '6. Colab 분석 & CSV 내보내기', icon: FileSpreadsheet },
            { id: 'update', label: '7. 코드 수정 후 새 버전 배포', icon: RefreshCw },
            { id: 'errors', label: '8. 권한 오류 & 트러블슈팅', icon: AlertTriangle }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                  activeSection === item.id
                    ? 'bg-[#344E41] text-white shadow-xs font-bold'
                    : 'bg-white text-[#344E41] hover:bg-[#F0F4EF] border border-[#D1DBCF]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0 text-[#5D7A5D]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Guide Content Panel */}
        <div className="lg:col-span-3 bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs text-[#344E41]">

          {/* Section 1: Sheets */}
          {activeSection === 'sheets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#5D7A5D]" />
                  1. Google Sheets 두 개 생성 및 ID 확인 방법
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed mb-4">
                  실제 학생 응답과 가상데이터가 절대로 섞이지 않도록 두 개의 구글 스프레드시트 파일을 생성합니다.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#344E41]">
                <div className="p-4 bg-[#E8F0E6] border border-[#D1DBCF] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">Step 1-1. 두 개의 스프레드시트 파일 생성</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Google 드라이브(<a href="https://drive.google.com" target="_blank" rel="noreferrer" className="text-[#344E41] underline font-semibold">drive.google.com</a>)에 접속합니다.</li>
                    <li><strong>[+ 새로 만들기] → [Google 스프레드시트]</strong>를 눌러 새 문서를 만듭니다.</li>
                    <li>첫 번째 파일 제목: <strong className="text-[#344E41]">EcoMoral_Actual_DB</strong> (실제 학생 응답 저장용)</li>
                    <li>두 번째 파일 제목: <strong className="text-[#5D7A5D]">EcoMoral_Synthetic_DB</strong> (가상데이터 실습용)</li>
                  </ol>
                </div>

                <div className="p-4 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">Step 1-2. 스프레드시트 ID 추출하기</h4>
                  <p>각 스프레드시트의 주소창(URL)을 확인하면 ID를 추출할 수 있습니다.</p>
                  <div className="bg-[#1B291F] text-[#D8E6D3] p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                    https://docs.google.com/spreadsheets/d/<span className="text-[#FFB02E] font-bold">1A2b3C4d5E6f7G8h9I0j-kLmNoPqRsTuVwXyZ</span>/edit
                  </div>
                  <p className="text-[#6B7A6B]">
                    위 예시 주소에서 <span className="text-[#8A9A5B] font-bold">/d/</span>와 <span className="text-[#8A9A5B] font-bold">/edit</span> 사이에 있는 긴 영문+숫자 조합이 <strong className="text-[#2C3E2D]">SPREADSHEET_ID</strong> 입니다. 두 파일의 ID를 각각 메모장에 복사해 둡니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Script Properties */}
          {activeSection === 'scriptprops' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#5D7A5D]" />
                  2. Script Properties (스크립트 속성) 설정
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed mb-4">
                  보안을 위해 스프레드시트 ID와 교사 비밀번호를 소스코드에 직접 넣지 않고 Apps Script의 스크립트 속성에 안전하게 보관합니다.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#344E41]">
                <div className="p-4 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl space-y-3">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">Step 2-1. Apps Script 편집기 접속</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Apps Script 홈(<a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-[#344E41] underline font-semibold">script.google.com</a>)에 접속 후 <strong>[새 프로젝트]</strong>를 만듭니다.</li>
                    <li>좌측 메뉴에서 <strong>⚙️ 프로젝트 설정 (톱니바퀴 아이콘)</strong>을 클릭합니다.</li>
                    <li>스크롤을 내려 <strong>[스크립트 속성]</strong> 항목에서 <strong>[스크립트 속성 편집]</strong>을 누릅니다.</li>
                  </ol>
                </div>

                <div className="p-4 bg-[#FFF9EA] border border-[#E6D7B8] rounded-xl space-y-3">
                  <h4 className="font-bold text-[#5C4518] text-sm">Step 2-2. 3개의 속성 추가하기</h4>
                  <p className="text-[#5C4518]">다음 3가지 속성 이름(Property)과 값(Value)을 정확히 입력하고 저장합니다:</p>
                  <table className="w-full text-xs text-left border-collapse bg-white border border-[#E6D7B8] rounded-lg">
                    <thead>
                      <tr className="bg-[#FAF0D9] border-b border-[#E6D7B8] text-[#5C4518]">
                        <th className="p-2 font-bold">속성 이름 (Property)</th>
                        <th className="p-2 font-bold">값 (Value)</th>
                        <th className="p-2 font-bold">설명</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#F2E5C9]">
                        <td className="p-2 font-mono font-bold text-[#2C3E2D]">ACTUAL_SPREADSHEET_ID</td>
                        <td className="p-2 font-mono">1A2b3C... (Actual DB ID)</td>
                        <td className="p-2 text-[#6B7A6B]">실제 학생 DB 스프레드시트 ID</td>
                      </tr>
                      <tr className="border-b border-[#F2E5C9]">
                        <td className="p-2 font-mono font-bold text-[#5D7A5D]">SYNTHETIC_SPREADSHEET_ID</td>
                        <td className="p-2 font-mono">9Z8y7X... (Synthetic DB ID)</td>
                        <td className="p-2 text-[#6B7A6B]">가상 학생 DB 스프레드시트 ID</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-[#344E41]">TEACHER_PASSWORD_HASH</td>
                        <td className="p-2 font-mono">해시값 또는 비워두기</td>
                        <td className="p-2 text-[#6B7A6B]">미설정 시 기본 비밀번호: <strong>ecomoral123!</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Deploy */}
          {activeSection === 'deploy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#5D7A5D]" />
                  3. Apps Script 최초 권한 승인 및 웹앱 배포
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed mb-4">
                  작성한 코드를 웹 앱 형태로 배포하여 학생과 교사가 스마트폰 및 PC에서 접속할 수 있도록 만듭니다.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#344E41]">
                <div className="p-4 bg-[#E8F0E6] border border-[#D1DBCF] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">Step 3-1. 최초 권한 승인 (Authorization)</h4>
                  <ol className="list-decimal pl-4 space-y-1.5">
                    <li>Apps Script 상단 메뉴의 함수 선택 드롭다운에서 <strong>initializeDatabases</strong>를 선택하고 <strong>[실행]</strong>을 누릅니다.</li>
                    <li>'권한 필요' 팝업이 뜨면 <strong>[권한 검토]</strong>를 클릭하고 본인의 Google 계정을 선택합니다.</li>
                    <li>'Google에서 이 앱을 검증하지 않았습니다' 경고 화면이 나오면 좌측 하단의 <strong>[고급]</strong>을 클릭합니다.</li>
                    <li>하단의 <strong>[제목 없는 프로젝트(으)로 이동(안전하지 않음)]</strong>을 클릭합니다.</li>
                    <li>구글 드라이브 및 스프레드시트 접근 권한에 <strong>[허용]</strong>을 누르면 시트 초기화가 자동 실행됩니다.</li>
                  </ol>
                </div>

                <div className="p-4 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl space-y-3">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">Step 3-2. 웹앱 배포 설정 (중요)</h4>
                  <ol className="list-decimal pl-4 space-y-2">
                    <li>Apps Script 우측 상단 <strong>[배포] → [새 배포]</strong>를 클릭합니다.</li>
                    <li>좌측 톱니바퀴에서 <strong>유형 선택: 웹 앱</strong>을 선택합니다.</li>
                    <li>설정값 구성:
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-[#6B7A6B]">
                        <li><strong>설명:</strong> EcoMoral Lab v1.0</li>
                        <li><strong>다음 사용자로 실행 (Execute as):</strong> <strong className="text-[#344E41]">나 (me@gmail.com)</strong></li>
                        <li><strong>액세스 권한이 있는 사용자 (Who has access):</strong> <strong className="text-[#344E41]">모든 사용자 (Anyone)</strong></li>
                      </ul>
                    </li>
                    <li><strong>[배포]</strong> 버튼을 누르면 완성된 <strong>웹 앱 URL 주소</strong>가 생성됩니다!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: QR */}
          {activeSection === 'qr' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-[#5D7A5D]" />
                  4. 웹앱 URL로 QR 코드 생성 및 수업 공유
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed mb-4">
                  학생들이 수업 시간에 스마트폰 카메라로 간편하게 접속할 수 있도록 QR 코드를 생성합니다.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#344E41]">
                <div className="p-4 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">방법 A. Chrome 브라우저의 자체 QR 생성 기능 활용</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>배포된 웹앱 URL을 Chrome 브라우저 주소창에 입력하여 접속합니다.</li>
                    <li>주소창 우측의 <strong>공유 아이콘(또는 마우스 우클릭) → [QR 코드 생성]</strong>을 누릅니다.</li>
                    <li>생성된 QR 코드를 다운로드하여 수업 PPT 발표 화면이나 학습지에 인쇄합니다.</li>
                  </ol>
                </div>

                <div className="p-4 bg-[#E8F0E6] border border-[#D1DBCF] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">방법 B. 무료 온라인 QR 생성기 활용</h4>
                  <p>QR Code API 서비스를 이용하여 바로 이미지 파일로 저장할 수 있습니다:</p>
                  <div className="bg-white p-3 border border-[#D1DBCF] rounded-lg font-mono text-[11px] text-[#344E41]">
                    https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=[여기에_배포된_웹앱_URL_입력]
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Testing */}
          {activeSection === 'testing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#5D7A5D]" />
                  5. DB 분리 및 테스트 학생 제출 과정 검증
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed mb-4">
                  실제 데이터와 가상 데이터가 철저히 분리 저장되는지 검증합니다.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#344E41]">
                <div className="p-4 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">Step 5-1. 테스트 학생 전체 제출 과정 수행</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>생성된 웹앱 URL로 접속하여 <strong>'학생 학습 시작'</strong>을 누릅니다.</li>
                    <li>학번 및 이름 입력 (예: 학번 <code className="bg-[#E0E7DE] px-1 rounded font-bold text-[#2C3E2D]">10101</code> / 이름 <code className="bg-[#E0E7DE] px-1 rounded font-bold text-[#2C3E2D]">홍길동</code>) 후 동의 체크</li>
                    <li>12개 사전 설문 응답 → 추천 활동 선택 및 서술형 답변 작성 → If-Then 행동계획 작성</li>
                    <li>12개 사후 설문 응답 → 사전·사후 변화 그래프 확인 후 최종 제출 완료!</li>
                  </ol>
                </div>

                <div className="p-4 bg-[#E8F0E6] border border-[#D1DBCF] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">Step 5-2. Google Sheets에서 저장 결과 확인</h4>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li><strong>EcoMoral_Actual_DB</strong> 파일의 <code className="bg-white px-1 font-bold">combined_export</code> 시트를 엽니다.</li>
                    <li>방금 입력한 <code className="bg-white px-1 font-bold">10101 홍길동</code> 행에 사전/사후 점수, 선택 활동, If-Then 계획, <code className="bg-white px-1 font-bold">data_source = ACTUAL</code>이 정상적으로 저장되었는지 확인합니다.</li>
                    <li><strong>EcoMoral_Synthetic_DB</strong> 파일에는 해당 실제 데이터가 <strong>전혀 들어가지 않음</strong>을 확인합니다.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Colab & CSV */}
          {activeSection === 'colab' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#5D7A5D]" />
                  6. Google Sheets CSV 내보내기 및 Google Colab 데이터 분석
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed mb-4">
                  수집된 데이터를 CSV 파일로 내보내거나 파이썬(Google Colab)을 활용하여 통계 분석 및 그래프 생성을 진행합니다.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#344E41]">
                <div className="p-4 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">Google Colab 파이썬 분석 예제 코드</h4>
                  <p>Colab 노트를 열고 아래 코드를 복사하여 실행하면 <code className="font-bold text-[#344E41]">combined_export</code> 데이터를 즉시 시각화할 수 있습니다:</p>
                  
                  <div className="bg-[#1B291F] text-[#D8E6D3] p-4 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#344E41]">
{`import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 1. 내보낸 combined_export.csv 파일 불러오기
df = pd.read_csv('EcoMoral_ACTUAL_Export.csv')

print("=== 데이터 요약 정보 ===")
print("총 응답 인원:", len(df))
print(df.info())

# 2. 사전 vs 사후 4구성요소 평균 비교
pre_cols = ['sensitivity_pre', 'judgment_pre', 'motivation_pre', 'action_pre']
post_cols = ['sensitivity_post', 'judgment_post', 'motivation_post', 'action_post']

pre_means = df[pre_cols].mean()
post_means = df[post_cols].mean()

comparison_df = pd.DataFrame({
    '사전 평균': pre_means.values,
    '사후 평균': post_means.values
}, index=['도덕적 민감성', '도덕적 판단', '도덕적 동기화', '도덕적 행동'])

print("\\n=== 사전 vs 사후 평균 비교 ===")
print(comparison_df)

# 3. 막대 그래프 시각화
plt.rc('font', family='NanumGothic') # 한글 폰트 설정
comparison_df.plot(kind='bar', figsize=(8, 5), color=['#64748b', '#5D7A5D'])
plt.title('Rest의 도덕적 행동 4구성요소 사전-사후 변화 비교')
plt.ylabel('점수 (1~5점)')
plt.ylim(1, 5)
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.tight_layout()
plt.show()`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 7: Update */}
          {activeSection === 'update' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-[#5D7A5D]" />
                  7. 배포 후 소스코드 수정 시 새 버전 적용 방법
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed mb-4">
                  Apps Script 코드를 고친 후 이전 웹앱 주소를 그대로 유지하면서 새로운 기능을 반영하는 올바른 방법입니다.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#344E41]">
                <div className="p-4 bg-[#FFF9EA] border border-[#E6D7B8] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#5C4518] text-sm">⚠️ 주의: 단순히 코드만 수정하고 저장하면 학생 화면에 반영되지 않습니다!</h4>
                  <ol className="list-decimal pl-4 space-y-1.5 text-[#5C4518]">
                    <li>Code.gs 또는 HTML 코드를 수정 후 <strong>[저장] (Ctrl + S)</strong>을 누릅니다.</li>
                    <li>Apps Script 우측 상단 <strong>[배포] → [배포 관리]</strong>를 누릅니다.</li>
                    <li>우측 상단 <strong>✏️ 편집 아이콘(연필 모형)</strong>을 클릭합니다.</li>
                    <li><strong>버전 드롭다운에서 [새 버전]</strong>을 선택합니다.</li>
                    <li><strong>[배포]</strong> 버튼을 누르면 기존 웹앱 URL 주소 변경 없이 최신 코드가 적용됩니다!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Section 8: Errors */}
          {activeSection === 'errors' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2C3E2D] mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#FF6B6B]" />
                  8. 자주 발생하는 권한 오류 및 해결 가이드
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed mb-4">
                  배포 시 흔히 부딪히는 오류 메시지와 명쾌한 해결책입니다.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#344E41]">
                <div className="p-4 bg-[#FFF5F5] border border-[#FFD1D1] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#7A1F1F] text-sm">오류 1: "Script Properties에서 SPREADSHEET_ID를 확인하세요"</h4>
                  <p className="text-[#7A1F1F]"><strong>원인:</strong> 스크립트 속성에 ACTUAL_SPREADSHEET_ID 또는 SYNTHETIC_SPREADSHEET_ID가 설정되지 않았거나 철자가 틀림.</p>
                  <p className="text-[#7A1F1F]"><strong>해결:</strong> ⚙️ 프로젝트 설정 → 스크립트 속성에서 오타 없이 ID를 정확히 다시 입력합니다.</p>
                </div>

                <div className="p-4 bg-[#FFF9EA] border border-[#E6D7B8] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#5C4518] text-sm">오류 2: 학생 접속 시 로그인 창이나 "권한이 없습니다" 문구 출력</h4>
                  <p className="text-[#5C4518]"><strong>원인:</strong> 배포 설정에서 '액세스 권한이 있는 사용자'를 '나만' 또는 '조직 구성원'으로 설정한 경우.</p>
                  <p className="text-[#5C4518]"><strong>해결:</strong> 배포 관리에서 액세스 권한을 <strong className="text-[#2C3E2D]">모든 사용자 (Anyone)</strong>로 변경합니다.</p>
                </div>

                <div className="p-4 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl space-y-2">
                  <h4 className="font-bold text-[#2C3E2D] text-sm">오류 3: 학교 교육청 계정 정책 제한으로 외부 공개 불가</h4>
                  <p className="text-[#6B7A6B]"><strong>원인:</strong> 일부 교육청 구글 계정(@sen.go.kr 등)은 보안 정책상 '모든 사용자(Anyone)' 배포를 차단할 수 있음.</p>
                  <p className="text-[#6B7A6B]"><strong>해결:</strong> 개인 Gmail 계정으로 구글 드라이브/스프레드시트를 새로 만든 후 Apps Script 프로젝트를 재배포하면 제한 없이 '모든 사용자' 설정이 가능합니다.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
