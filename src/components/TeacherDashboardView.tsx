import React, { useState, useEffect } from 'react';
import { getSubmissionsFromFirestore, FirestoreStudentData } from '../lib/firestoreService';
import { RefreshCw, Download, Search, Users, CheckCircle2, Award, FileSpreadsheet, AlertCircle } from 'lucide-react';

export const TeacherDashboardView: React.FC = () => {
  const [submissions, setSubmissions] = useState<FirestoreStudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubmissionsFromFirestore();
      setSubmissions(data);
    } catch (err: any) {
      setError(err?.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = submissions.filter(sub => {
    const search = searchTerm.toLowerCase();
    return (
      (sub.student_code && sub.student_code.toLowerCase().includes(search)) ||
      (sub.submission_id && sub.submission_id.toLowerCase().includes(search)) ||
      (sub.actionIfThen && sub.actionIfThen.toLowerCase().includes(search))
    );
  });

  const completedCount = submissions.filter(s => s.step >= 10).length;
  const avgPreTotal = submissions.length > 0
    ? (submissions.reduce((acc, curr) => {
        if (!curr.preScores) return acc;
        const total = curr.preScores.sensitivity + curr.preScores.judgment + curr.preScores.motivation + curr.preScores.action;
        return acc + total;
      }, 0) / submissions.length).toFixed(1)
    : '0';

  const downloadCSV = () => {
    if (submissions.length === 0) return;

    const headers = [
      '제출ID', '학번/이름', '진행단계', '완료여부',
      '사전_도덕적민감성', '사전_도덕적판단력', '사전_도덕적동기화', '사전_도덕적실천력', '사전총점',
      '선택한활동', '행동목표', 'If-Then계획',
      '사후_도덕적민감성', '사후_도덕적판단력', '사후_도덕적동기화', '사후_도덕적실천력', '사후총점'
    ];

    const rows = submissions.map(s => {
      const preTot = s.preScores ? (s.preScores.sensitivity + s.preScores.judgment + s.preScores.motivation + s.preScores.action) : '';
      const postTot = s.postScores ? (s.postScores.sensitivity + s.postScores.judgment + s.postScores.motivation + s.postScores.action) : '';
      return [
        `"${s.submission_id || ''}"`,
        `"${s.student_code || ''}"`,
        s.step || 1,
        s.step >= 10 ? '완료' : '진행중',
        s.preScores?.sensitivity ?? '',
        s.preScores?.judgment ?? '',
        s.preScores?.motivation ?? '',
        s.preScores?.action ?? '',
        preTot,
        `"${s.selectedActivityId || ''}"`,
        `"${(s.actionGoal || '').replace(/"/g, '""')}"`,
        `"${(s.actionIfThen || '').replace(/"/g, '""')}"`,
        s.postScores?.sensitivity ?? '',
        s.postScores?.judgment ?? '',
        s.postScores?.motivation ?? '',
        s.postScores?.action ?? '',
        postTot,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EcoMoral_학습제출목록_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2C3E2D] to-[#344E41] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#A3B18A]/20 text-[#A3B18A] border border-[#A3B18A]/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Firebase Realtime DB
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#E8F0E6]">교사용 실시간 대시보드</h2>
          </div>
          <p className="text-sm text-[#A3B18A] mt-1">
            학생들이 수행한 환경 도덕성 사전/사후 진단 결과 및 If-Then 행동계획 데이터를 실시간 조회 및 엑셀(CSV)로 다운로드합니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors border border-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
          <button
            onClick={downloadCSV}
            disabled={submissions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#5D7A5D] hover:bg-[#4E684E] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            CSV 내보내기
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D1DBCF] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E8F0E6] text-[#344E41] rounded-xl flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#6B7A6B] font-medium">총 제출 학생 수</p>
            <p className="text-2xl font-bold text-[#2C3E2D]">{submissions.length}명</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D1DBCF] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E8F0E6] text-[#344E41] rounded-xl flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6 text-[#5D7A5D]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7A6B] font-medium">최종 학습 완료자</p>
            <p className="text-2xl font-bold text-[#2C3E2D]">{completedCount}명</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D1DBCF] shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E8F0E6] text-[#344E41] rounded-xl flex items-center justify-center font-bold">
            <Award className="w-6 h-6 text-[#A3B18A]" />
          </div>
          <div>
            <p className="text-xs text-[#6B7A6B] font-medium">사전 진단 평균 점수</p>
            <p className="text-2xl font-bold text-[#2C3E2D]">{avgPreTotal} <span className="text-sm font-normal text-[#6B7A6B]">/ 60점</span></p>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-[#D1DBCF] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E8F0E6] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7A6B]" />
            <input
              type="text"
              placeholder="학번 또는 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F0F4EF]/50 border border-[#D1DBCF] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5D7A5D] text-[#2C3E2D]"
            />
          </div>
          <p className="text-xs text-[#6B7A6B]">
            조회된 데이터: <span className="font-semibold text-[#344E41]">{filtered.length}건</span>
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#6B7A6B]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5D7A5D]" />
            <p className="text-sm">Firestore에서 데이터를 가져오는 중입니다...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 bg-red-50">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#6B7A6B]">
            <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-[#A3B18A]" />
            <p className="text-sm font-medium">제출된 데이터가 아직 없습니다.</p>
            <p className="text-xs text-[#6B7A6B] mt-1">학생들이 학습 진단을 진행하면 이곳에 실시간으로 표시됩니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#344E41]">
              <thead className="bg-[#E8F0E6]/60 text-[#2C3E2D] font-semibold border-b border-[#D1DBCF]">
                <tr>
                  <th className="py-3 px-4">학번/이름</th>
                  <th className="py-3 px-4">진행 상태</th>
                  <th className="py-3 px-4">사전 총점</th>
                  <th className="py-3 px-4">사후 총점</th>
                  <th className="py-3 px-4">선택한 학습 활동</th>
                  <th className="py-3 px-4">If-Then 행동계획</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8F0E6]">
                {filtered.map((item, idx) => {
                  const preTot = item.preScores
                    ? item.preScores.sensitivity + item.preScores.judgment + item.preScores.motivation + item.preScores.action
                    : null;
                  const postTot = item.postScores
                    ? item.postScores.sensitivity + item.postScores.judgment + item.postScores.motivation + item.postScores.action
                    : null;

                  return (
                    <tr key={item.submission_id || idx} className="hover:bg-[#F0F4EF]/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#2C3E2D]">
                        {item.student_code || '미입력'}
                      </td>
                      <td className="py-3 px-4">
                        {item.step >= 10 ? (
                          <span className="inline-flex items-center gap-1 bg-[#5D7A5D]/15 text-[#344E41] font-semibold px-2.5 py-0.5 rounded-full border border-[#5D7A5D]/30 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-[#5D7A5D]" /> 완료
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-medium px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px]">
                            {item.step}단계 진행중
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {preTot !== null ? `${preTot}점` : '-'}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {postTot !== null ? `${postTot}점` : '-'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-[#6B7A6B]">
                        {item.selectedActivityId || '-'}
                      </td>
                      <td className="py-3 px-4 max-w-sm truncate text-[#2C3E2D]" title={item.actionIfThen}>
                        {item.actionIfThen || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
