import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Leaf, Lock, ShieldCheck, ArrowRight, ArrowLeft, Home, CheckCircle2, AlertCircle,
  BarChart3, RefreshCw, Download, Users, Sparkles, UserCheck, HelpCircle,
  FileText, Award, Layers, Plus, Trash2, Link2
} from 'lucide-react';
import {
  DEFAULT_SCENARIO, ASSESSMENT_QUESTIONS, LEARNING_ACTIVITIES, COMPONENT_DESCRIPTIONS,
  calculateComponentScores, getRecommendedActivity
} from '../constants';
import {
  StudentSession, ComponentScores, ActivityType, CombinedExportRecord,
  DashboardData, RestComponent
} from '../types';
import { cleanGoogleScriptUrl } from '../utils/urlHelper';
import { saveStudentSubmissionToFirestore, getSubmissionsFromFirestore } from '../lib/firestoreService';

interface SimulatorViewProps {
  webAppUrl: string;
  useLiveApi: boolean;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({ webAppUrl, useLiveApi }) => {
  const [role, setRole] = useState<'SELECT' | 'STUDENT' | 'TEACHER'>('SELECT');
  
  // Student Flow State
  const [student, setStudent] = useState<StudentSession>({
    submission_id: '',
    student_number: '',
    student_name: '',
    student_code: '',
    scenario_id: DEFAULT_SCENARIO.id,
    scenario_title: DEFAULT_SCENARIO.title,
    started_at: '',
    consent_checked: false,
    status: 'IN_PROGRESS',
    step: 1,
    attempt_number: 1,
    preAnswers: {},
    postAnswers: {}
  });

  // Teacher Flow State
  const [teacherAuthenticated, setTeacherAuthenticated] = useState(false);
  const [teacherPasswordInput, setTeacherPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [dataSource, setDataSource] = useState<'ACTUAL' | 'SYNTHETIC'>('ACTUAL');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [syntheticModalOpen, setSyntheticModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Teacher Password Management State
  const [changePwModalOpen, setChangePwModalOpen] = useState(false);
  const [currentPwInput, setCurrentPwInput] = useState('');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [pwChangeStatus, setPwChangeStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ecomoral_react_student');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.student_code || parsed.student_number)) {
          setStudent(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const saveStudentSession = (updated: StudentSession) => {
    setStudent(updated);
    try {
      localStorage.setItem('ecomoral_react_student', JSON.stringify(updated));
      if (updated.submission_id) {
        void saveStudentSubmissionToFirestore({
          submission_id: updated.submission_id,
          student_code: updated.student_code || `${updated.student_number} ${updated.student_name}`,
          step: updated.step,
          preAnswers: updated.preAnswers,
          preScores: updated.preScores,
          recommendedActivityId: updated.recommendedActivity,
          selectedActivityId: updated.selectedActivity,
          reflectionAnswer1: updated.reflectionAnswer1,
          reflectionAnswer2: updated.reflectionAnswer2,
          actionGoal: updated.ifPlan,
          actionIfThen: updated.thenPlan,
          postAnswers: updated.postAnswers,
          postScores: updated.postScores
        }).then((result) => {
          if (!result.success) {
            setSyncStatus(`Firebase 저장 실패: ${result.error}`);
          }
        });
      }
    } catch (e) {}
  };

  const clearStudentSession = () => {
    localStorage.removeItem('ecomoral_react_student');
    setStudent({
      submission_id: '',
      student_number: '',
      student_name: '',
      student_code: '',
      scenario_id: DEFAULT_SCENARIO.id,
      scenario_title: DEFAULT_SCENARIO.title,
      started_at: '',
      consent_checked: false,
      status: 'IN_PROGRESS',
      step: 1,
      attempt_number: 1,
      preAnswers: {},
      postAnswers: {}
    });
    setStepError('');
    setSyncStatus(null);
  };

  const [stepError, setStepError] = useState<string>('');

  // Live Google Sheets Data Collection Helper
  const syncLiveApiData = async (action: string, payload: any) => {
    if (!useLiveApi || !webAppUrl) return;
    try {
      setSyncStatus('구글 시트로 데이터 전송 중...');
      const targetUrl = cleanGoogleScriptUrl(webAppUrl);
      const params = new URLSearchParams();
      params.append('action', action);
      params.append('payload', JSON.stringify(payload));

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });
      setSyncStatus('✅ 구글 시트 DB로 데이터가 성공적으로 저장되었습니다!');
    } catch (err: any) {
      console.error('Google Sheets sync error:', err);
      setSyncStatus('⚠️ 구글 시트 전송 시도 완료 (로컬에도 정상 기록됨)');
    }
  };

  // Student Step Navigation Helpers
  const handleStartStudent = () => {
    setRole('STUDENT');
    setStepError('');
  };

  const goToPrevStep = () => {
    setStepError('');
    if (student.step > 1) {
      const prevStep = student.step - 1;
      const updated = { ...student, step: prevStep };
      setStudent(updated);
      saveStudentSession(updated);
    }
  };

  const goToNextStep = (nextStep: number) => {
    setStepError('');
    const updated = { ...student, step: nextStep };
    setStudent(updated);
    saveStudentSession(updated);
  };

  // Interactive Mindmap State for Moral Sensitivity
  const [mindmapTopic, setMindmapTopic] = useState<string>('일회용품 사용 vs 다회용기 전환');
  const [mindmapNodes, setMindmapNodes] = useState<Array<{ id: string; entity: string; impact: string }>>([
    { id: '1', entity: '', impact: '' },
    { id: '2', entity: '', impact: '' }
  ]);

  const handleAddMindmapNode = () => {
    const newNode = { id: String(Date.now()), entity: '', impact: '' };
    const updated = [...mindmapNodes, newNode];
    setMindmapNodes(updated);
    syncMindmapToAnswer1(mindmapTopic, updated);
  };

  const handleRemoveMindmapNode = (id: string) => {
    if (mindmapNodes.length <= 1) return;
    const updated = mindmapNodes.filter(n => n.id !== id);
    setMindmapNodes(updated);
    syncMindmapToAnswer1(mindmapTopic, updated);
  };

  const handleUpdateMindmapNode = (id: string, field: 'entity' | 'impact', val: string) => {
    const updated = mindmapNodes.map(n => n.id === id ? { ...n, [field]: val } : n);
    setMindmapNodes(updated);
    syncMindmapToAnswer1(mindmapTopic, updated);
  };

  const handleUpdateMindmapTopic = (val: string) => {
    setMindmapTopic(val);
    syncMindmapToAnswer1(val, mindmapNodes);
  };

  const syncMindmapToAnswer1 = (topic: string, nodes: Array<{ id: string; entity: string; impact: string }>) => {
    const formatted = `[중심 선택] ${topic}\n` + nodes
      .filter(n => n.entity.trim() || n.impact.trim())
      .map((n, i) => `[영향받는 존재 ${i + 1}] ${n.entity.trim() || '(미입력)'} ➔ ${n.impact.trim() || '(미입력)'}`)
      .join('\n');
    setStudent(prev => ({ ...prev, reflectionAnswer1: formatted }));
  };

  const fillSampleStudentCredentials = () => {
    setStepError('');
    const updated = {
      ...student,
      student_number: '10101',
      student_name: '홍길동',
      student_code: '10101 홍길동'
    };
    setStudent(updated);
  };

  const fillSampleReflection = () => {
    setStepError('');
    const actKey = student.selectedActivity || student.recommendedActivity || 'sensitivity';

    if (actKey === 'sensitivity') {
      const sampleNodes = [
        { id: '1', entity: '학교 청소 담당 선생님', impact: '축제 직후 분리수거되지 않은 무수한 일회용 컵과 쓰레기를 수거하느라 극심한 야간 과중 노동을 겪으심' },
        { id: '2', entity: '학교 주변 야생조류 및 동물들', impact: '버려진 플라스틱 용기와 끈에 몸이 엉키거나 미세플라스틱을 삼켜 생명에 위협을 받음' },
        { id: '3', entity: '미래의 우리 아이들 (미래 세대)', impact: '한 순간의 편리함을 위해 일회용품을 남용한 결과, 지구 온난화와 자원 고갈의 피해를 고스란히 안게 됨' }
      ];
      setMindmapNodes(sampleNodes);

      const formattedQ1 = sampleNodes.map((n, i) => `[영향받는 존재 ${i + 1}] ${n.entity} ➔ ${n.impact}`).join('\n');

      const updated = {
        ...student,
        reflectionAnswer1: formattedQ1,
        reflectionAnswer2: '눈앞의 사소한 편의 때문에 누군가의 과중한 노동과 동물들의 서식지 파괴를 당연시했다는 미안함이 들었습니다. 앞으로는 나 자신의 편리함보다 생태계 전체의 평화와 지속가능성을 우선 고려하겠습니다.'
      };
      setStudent(updated);
    } else {
      const updated = {
        ...student,
        reflectionAnswer1: '환경 문제를 타인의 일이 아닌 나 자신의 삶의 문제로 깊이 느끼게 되었습니다.',
        reflectionAnswer2: '사소한 편의보다 미래 세대와 자연 생태계를 우선 고려하는 도덕적 가치관을 실천하겠습니다.'
      };
      setStudent(updated);
    }
  };

  const fillSampleActionPlan = () => {
    setStepError('');
    const updated = {
      ...student,
      ifPlan: '매점이나 카페에서 일회용 플라스틱 컵을 이용하려 할 때',
      thenPlan: '지참한 개인 텀블러를 사용하고 친구들에게도 다회용기 사용을 적극 권유하겠다'
    };
    setStudent(updated);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');

    const num = student.student_number?.trim() || '';
    const name = student.student_name?.trim() || '';

    if (!num) {
      setStepError('학번을 입력해 주세요. (예: 10101)');
      return;
    }

    if (!name) {
      setStepError('이름을 입력해 주세요. (예: 홍길동)');
      return;
    }

    if (!student.consent_checked) {
      setStepError('개인정보 수집 및 구글 시트 저장 동의에 체크해 주세요.');
      return;
    }

    const codeCombined = `${num} ${name}`;
    const cleanSubCode = num.replace(/\s+/g, '');
    const subId = `SUB_${cleanSubCode}_${Date.now()}`;

    const updated: StudentSession = {
      ...student,
      student_number: num,
      student_name: name,
      student_code: codeCombined,
      submission_id: subId,
      started_at: new Date().toLocaleString(),
      step: 2
    };
    saveStudentSession(updated);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    if (Object.keys(student.preAnswers).length < 12) {
      setStepError('12개 모든 문항에 응답해 주셔야 합니다.');
      return;
    }

    const scores = calculateComponentScores(student.preAnswers);
    const rec = getRecommendedActivity(scores);

    const updated: StudentSession = {
      ...student,
      preScores: scores,
      recommendedActivity: rec,
      selectedActivity: student.selectedActivity || rec,
      step: 4
    };
    saveStudentSession(updated);

    // Sync to Google Sheets if live API enabled
    syncLiveApiData('savePreAssessment', {
      submission_id: updated.submission_id,
      student_code: updated.student_code,
      scenario_id: updated.scenario_id,
      answers: updated.preAnswers,
      attempt_number: updated.attempt_number
    });
  };

  const handleStep6Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    
    // Ensure reflection answers are saved properly
    const q1 = student.reflectionAnswer1?.trim() || '';
    const q2 = student.reflectionAnswer2?.trim() || '';

    if (!q1) {
      setStepError('교육 활동 결과물 공유 링크(URL)를 입력해 주세요.');
      return;
    }

    if (!q2) {
      setStepError('활동 성찰 및 소감을 입력해 주세요.');
      return;
    }

    const updated: StudentSession = {
      ...student,
      reflectionAnswer1: q1,
      reflectionAnswer2: q2,
      step: 7
    };
    saveStudentSession(updated);
  };

  const handleStep7Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    
    const ifP = student.ifPlan?.trim() || '';
    const thenP = student.thenPlan?.trim() || '';

    if (!ifP || !thenP) {
      setStepError('IF 상황과 THEN 행동계획을 모두 작성해 주세요. (하단의 [예시 행동계획 채우기] 버튼으로 손쉽게 테스트 가능합니다)');
      return;
    }

    const updated: StudentSession = {
      ...student,
      ifPlan: ifP,
      thenPlan: thenP,
      step: 8
    };
    saveStudentSession(updated);

    // Sync activity & action plan to Google Sheets
    syncLiveApiData('saveLearningActivity', {
      submission_id: updated.submission_id,
      recommended_activity: updated.recommendedActivity,
      selected_activity: updated.selectedActivity,
      reflection_answer_1: updated.reflectionAnswer1,
      reflection_answer_2: updated.reflectionAnswer2,
      if_plan: updated.ifPlan,
      then_plan: updated.thenPlan
    });
  };

  const handleStep8Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    if (Object.keys(student.postAnswers).length < 12) {
      setStepError('12개 모든 문항에 응답해 주셔야 합니다.');
      return;
    }

    const postScores = calculateComponentScores(student.postAnswers);
    const updated: StudentSession = {
      ...student,
      postScores,
      step: 9,
      status: 'COMPLETED',
      completed_at: new Date().toLocaleString()
    };
    saveStudentSession(updated);

    // Sync post assessment to Google Sheets
    syncLiveApiData('savePostAssessment', {
      submission_id: updated.submission_id,
      student_code: updated.student_code,
      answers: updated.postAnswers
    });

    // Fire celebratory confetti only if score improved!
    if (updated.preScores && updated.postScores) {
      const preAvg = Object.values(updated.preScores).reduce((a, b) => a + b, 0) / 4;
      const postAvg = Object.values(updated.postScores).reduce((a, b) => a + b, 0) / 4;
      if (postAvg > preAvg) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  // Teacher Flow Helpers
  const getStoredTeacherPassword = (): string => {
    try {
      return localStorage.getItem('ecomoral_teacher_password') || 'ecomoral123!';
    } catch {
      return 'ecomoral123!';
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPw = getStoredTeacherPassword();
    if (teacherPasswordInput === storedPw) {
      setTeacherAuthenticated(true);
      setPasswordError('');
      loadMockDashboardData('ACTUAL');
    } else {
      setPasswordError('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPw = getStoredTeacherPassword();
    if (currentPwInput !== storedPw) {
      setPwChangeStatus({ type: 'error', text: '현재 비밀번호가 올바르지 않습니다.' });
      return;
    }
    if (!newPwInput || newPwInput.length < 4) {
      setPwChangeStatus({ type: 'error', text: '새 비밀번호는 4자리 이상이어야 합니다.' });
      return;
    }
    if (newPwInput !== confirmPwInput) {
      setPwChangeStatus({ type: 'error', text: '새 비밀번호 확인이 일치하지 않습니다.' });
      return;
    }

    try {
      localStorage.setItem('ecomoral_teacher_password', newPwInput);
      setPwChangeStatus({ type: 'success', text: '교사 비밀번호가 성공적으로 변경되었습니다!' });
      setTimeout(() => {
        setChangePwModalOpen(false);
        setCurrentPwInput('');
        setNewPwInput('');
        setConfirmPwInput('');
        setPwChangeStatus(null);
      }, 1200);
    } catch (e) {
      setPwChangeStatus({ type: 'error', text: '비밀번호 저장 중 오류가 발생했습니다.' });
    }
  };

  const sampleStudentNames = [
    '김민준', '이서연', '박도윤', '최지우', '정예준',
    '강서윤', '조하은', '윤시우', '장지유', '임주원',
    '한서아', '오민재', '서유진', '신현우', '권채원',
    '황도현', '안수아', '송지호'
  ];

  const loadMockDashboardData = (source: 'ACTUAL' | 'SYNTHETIC') => {
    setDataSource(source);
    // Generate realistic dashboard state for simulator preview
    const count = source === 'SYNTHETIC' ? 60 : 18;
    const records: CombinedExportRecord[] = [];

    for (let i = 1; i <= count; i++) {
      const numStr = `101${i < 10 ? '0' : ''}${i}`;
      const nameStr = sampleStudentNames[(i - 1) % sampleStudentNames.length];
      const code = source === 'SYNTHETIC' ? `SYN${i < 10 ? '00' : '0'}${i}` : `${numStr} ${nameStr}`;
      const preS = Math.round((2.0 + (i % 5) * 0.4) * 10) / 10;
      const preJ = Math.round((2.2 + (i % 4) * 0.5) * 10) / 10;
      const preM = Math.round((1.8 + (i % 3) * 0.6) * 10) / 10;
      const preA = Math.round((1.5 + (i % 6) * 0.4) * 10) / 10;

      const rec = preA <= preM ? 'action' : 'motivation';
      const sel = (i % 4 === 0) ? 'judgment' : rec;

      records.push({
        submission_id: `SUB_${numStr}_20260730`,
        student_code: code,
        scenario_id: DEFAULT_SCENARIO.id,
        started_at: '2026-07-30 10:00:00',
        completed_at: '2026-07-30 10:25:00',
        attempt_number: 1,
        sensitivity_pre: preS,
        judgment_pre: preJ,
        motivation_pre: preM,
        action_pre: preA,
        recommended_activity: rec,
        selected_activity: sel,
        reflection_answer_1: `${sel} 활동 고찰 1 답변 내용입니다.`,
        reflection_answer_2: `${sel} 활동 고찰 2 답변 내용입니다.`,
        if_plan: '축제 부스 일회용품 제공 상황',
        then_plan: '개인 텀블러 사용 및 친구 권유',
        sensitivity_post: Math.min(5.0, Math.round((preS + 1.2) * 10) / 10),
        judgment_post: Math.min(5.0, Math.round((preJ + 1.1) * 10) / 10),
        motivation_post: Math.min(5.0, Math.round((preM + 1.3) * 10) / 10),
        action_post: Math.min(5.0, Math.round((preA + 1.4) * 10) / 10),
        sensitivity_gain: 1.2,
        judgment_gain: 1.1,
        motivation_gain: 1.3,
        action_gain: 1.4,
        data_source: source
      });
    }

    setDashboardData({
      dataSource: source,
      totalSubmissions: count,
      completedCount: count,
      completionRate: 100,
      preAverages: { sensitivity: 2.8, judgment: 3.1, motivation: 2.5, action: 2.2 },
      postAverages: { sensitivity: 4.0, judgment: 4.2, motivation: 3.8, action: 3.6 },
      averageGains: { sensitivity: 1.2, judgment: 1.1, motivation: 1.3, action: 1.4 },
      recommendedDistribution: { sensitivity: 4, judgment: 3, motivation: 20, action: 33 },
      selectedDistribution: { sensitivity: 5, judgment: 8, motivation: 18, action: 29 },
      matchRate: 85,
      records
    });
  };

  const handleGenerateSynthetic = () => {
    loadMockDashboardData('SYNTHETIC');
    setSyntheticModalOpen(false);
    alert('가상 학생 60명의 데이터 생성이 완료되었습니다.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#FDFCF8] py-6">
      
      {/* Live Google Sheets Integration Status Bar */}
      <div className="max-w-xl md:max-w-6xl mx-auto px-4 mb-4">
        <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs ${
          useLiveApi && webAppUrl
            ? 'bg-[#E8F0E6] border-[#D1DBCF] text-[#2C3E2D]'
            : 'bg-[#FFF9EA] border-[#E6D7B8] text-[#5C4518]'
        }`}>
          <div className="flex items-center gap-2">
            {useLiveApi && webAppUrl ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="font-bold">🌐 Google 시트 실시간 DB 연동 활성화</span>
                <span className="text-[11px] opacity-80 hidden md:inline">({webAppUrl.slice(0, 40)}...)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#8A9A5B] shrink-0" />
                <span className="font-bold">🧪 현재 시뮬레이터 모드</span>
                <span className="text-[11px] opacity-80 hidden md:inline">실제 구글 시트 연동을 위해서는 상단 [구글 시트 연동 상태]에서 웹앱 URL을 입력하세요.</span>
              </>
            )}
          </div>
          {syncStatus && (
            <span className="text-[11px] font-bold text-[#344E41] bg-white/80 px-2 py-0.5 rounded border border-[#D1DBCF]">
              {syncStatus}
            </span>
          )}
        </div>
      </div>

      {/* Role Selector Screen */}
      {role === 'SELECT' && (
        <div className="max-w-md mx-auto px-4 pt-8">
          <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 text-center shadow-xs">
            <div className="w-16 h-16 bg-[#E8F0E6] text-[#344E41] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Leaf className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-[#2C3E2D] mb-1">EcoMoral Lab</h2>
            <p className="text-xs text-[#6B7A6B] mb-6">반응형 환경 도덕성 진단 및 맞춤형 학습 플랫폼</p>

            {student.submission_id && (
              <div className="mb-6 p-4 bg-[#E8F0E6] border border-[#D1DBCF] rounded-xl text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2C3E2D] mb-1">
                  <Sparkles className="w-4 h-4 text-[#5D7A5D]" />
                  <span>이전 저장된 학습 진행 내역</span>
                </div>
                <p className="text-xs text-[#344E41] mb-3">
                  학번/이름: <strong>{student.student_code}</strong> (단계: {student.step}/10)
                </p>
                <button
                  onClick={() => setRole('STUDENT')}
                  className="w-full bg-[#5D7A5D] hover:bg-[#4E684E] text-white font-semibold text-xs py-2.5 px-3 rounded-lg shadow-2xs transition-all"
                >
                  이어서 학습 계속하기 →
                </button>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleStartStudent}
                className="w-full bg-[#344E41] hover:bg-[#2A3F34] text-white font-semibold py-3.5 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>🌱 학생 학습 시작하기</span>
              </button>

              <button
                onClick={() => setRole('TEACHER')}
                className="w-full bg-white hover:bg-[#F0F4EF] border border-[#D1DBCF] text-[#344E41] font-semibold py-3.5 px-4 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Lock className="w-4 h-4 text-[#6B7A6B]" />
                <span>교사용 대시보드</span>
              </button>
            </div>

            <div className="mt-8 text-[11px] text-[#A3B18A] border-t border-[#E0E7DE] pt-4">
              Rest의 도덕적 행동 4구성요소 (민감성·판단·동기화·행동) 진단 모델
            </div>
          </div>
        </div>
      )}

      {/* Student Flow Views */}
      {role === 'STUDENT' && (
        <div className="max-w-xl mx-auto px-4">
          {/* Header Progress & Navigation Bar */}
          <div className="bg-white border border-[#D1DBCF] rounded-xl p-3 mb-4 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRole('SELECT')}
                className="text-[#6B7A6B] hover:text-[#2C3E2D] font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F4EF] transition-all border border-transparent hover:border-[#D1DBCF]"
                title="첫 화면(역할 선택)으로 돌아가기"
              >
                <Home className="w-3.5 h-3.5" />
                <span>첫 화면</span>
              </button>

              {student.step > 1 && (
                <button
                  onClick={goToPrevStep}
                  className="text-[#344E41] hover:text-[#2C3E2D] font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E8F0E6] hover:bg-[#D1DBCF] transition-all"
                  title="이전 단계로 돌아가기"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>이전 단계</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-[#2C3E2D]">단계 {student.step} / 10</span>
              <span className="text-[#344E41] bg-[#E8F0E6] px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
                학번/이름: {student.student_code || '미입력'}
              </span>
            </div>
          </div>

          <div className="w-full bg-[#E0E7DE] h-2 rounded-full mb-6 overflow-hidden">
            <div className="bg-[#5D7A5D] h-2 rounded-full transition-all duration-300" style={{ width: `${(student.step / 10) * 100}%` }}></div>
          </div>

          {/* Step 1: Student Number & Name */}
          {student.step === 1 && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[#2C3E2D]">학번 및 이름 입력</h2>
                <button
                  type="button"
                  onClick={fillSampleStudentCredentials}
                  className="text-[#5D7A5D] hover:text-[#2C3E2D] text-xs font-semibold underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>예시 채우기 (10101 홍길동)</span>
                </button>
              </div>

              <p className="text-xs text-[#6B7A6B] mb-4 leading-relaxed">
                사전·사후 환경 도덕성 진단 및 맞춤형 학습 기록을 위해 학번과 이름을 입력해 주세요.
              </p>

              <div className="bg-[#FFF9EA] border border-[#E6D7B8] rounded-xl p-3.5 text-xs text-[#5C4518] mb-5 leading-relaxed space-y-1.5">
                <div className="font-bold flex items-center gap-1 text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#8A9A5B]" />
                  <span>학번 및 이름 수집 수집 및 이용 안내</span>
                </div>
                <p>• <strong>학번</strong>(예: 1학년 1반 1번 → 10101)과 <strong>이름</strong>(예: 홍길동)을 정확하게 입력합니다.</p>
                <p>• 수집된 학번/이름은 사전·사후 진단 결과 연동, If–Then 행동계획 기록 및 교사 구글 시트 DB 수집 목적으로 활용됩니다.</p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C3E2D] mb-1">학번 (예: 10101)</label>
                    <input
                      type="text"
                      value={student.student_number || ''}
                      onChange={(e) => {
                        const num = e.target.value;
                        setStudent({
                          ...student,
                          student_number: num,
                          student_code: `${num} ${student.student_name || ''}`.trim()
                        });
                      }}
                      placeholder="10101"
                      className="w-full p-3 text-sm border border-[#D1DBCF] rounded-xl font-mono text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C3E2D] mb-1">이름 (예: 홍길동)</label>
                    <input
                      type="text"
                      value={student.student_name || ''}
                      onChange={(e) => {
                        const name = e.target.value;
                        setStudent({
                          ...student,
                          student_name: name,
                          student_code: `${student.student_number || ''} ${name}`.trim()
                        });
                      }}
                      placeholder="홍길동"
                      className="w-full p-3 text-sm border border-[#D1DBCF] rounded-xl text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={student.consent_checked}
                    onChange={(e) => setStudent({ ...student, consent_checked: e.target.checked })}
                    className="mt-0.5 rounded text-[#344E41] accent-[#344E41]"
                  />
                  <label htmlFor="consent" className="text-xs text-[#6B7A6B] leading-snug">
                    본인의 학번과 이름을 사용하여 사전·사후 진단을 실시하며, 응답 내역이 환경 도덕성 연구 및 구글 시트 DB 저장을 위해 활용됨에 동의합니다.
                  </label>
                </div>

                {stepError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{stepError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1"
                >
                  <span>다음 단계로 (딜레마 확인)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Step 2: Dilemma */}
          {student.step === 2 && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs space-y-4">
              <span className="inline-block px-2.5 py-1 bg-[#E8F0E6] text-[#2C3E2D] text-xs font-bold rounded-full">
                환경 딜레마 확인
              </span>
              <h2 className="text-lg font-bold text-[#2C3E2D]">{DEFAULT_SCENARIO.title}</h2>
              <div className="bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl p-4 text-xs text-[#344E41] leading-relaxed space-y-2">
                <p>{DEFAULT_SCENARIO.description}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3.5 rounded-xl border border-[#D1DBCF] transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToNextStep(3)}
                  className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <span>사전 진단 설문 시작하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Pre Assessment */}
          {student.step === 3 && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs">
              <div className="mb-6">
                <span className="text-[11px] font-bold text-[#344E41] bg-[#E8F0E6] px-2.5 py-1 rounded-full border border-[#D1DBCF]">
                  사전 환경 도덕성 진단 (총 28문항)
                </span>
                <h2 className="text-lg font-bold text-[#2C3E2D] mt-2 mb-1">환경 도덕성 사전 진단 설문</h2>
                <p className="text-xs text-[#6B7A6B] leading-relaxed">
                  본 설문은 환경 교육 전 학생의 환경 도덕성(민감성, 판단, 동기화, 행동)을 알아보기 위한 검사입니다. 솔직하게 자신의 생각과 행동을 표시해주세요.
                </p>
              </div>

              <form onSubmit={handleStep3Submit} className="space-y-8">
                {/* Part A: Attitude & Thoughts (Q1 - Q20) */}
                <div className="space-y-6">
                  <div className="bg-[#F8F9F5] p-3.5 rounded-xl border border-[#D1DBCF] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5D7A5D]" />
                    <div>
                      <h3 className="text-xs font-bold text-[#2C3E2D]">파트 A: 환경에 대한 생각 및 태도 (1번~20번)</h3>
                      <p className="text-[11px] text-[#6B7A6B]">자신의 평소 생각이나 태도와 가장 일치하는 항목(1점~5점)을 선택해주세요.</p>
                    </div>
                  </div>

                  {ASSESSMENT_QUESTIONS.filter(q => q.section === 'attitude' || !q.section).map((q) => (
                    <div key={q.id} className="border-b border-[#E0E7DE] pb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-[#2C3E2D] bg-[#E8F0E6] px-2 py-0.5 rounded border border-[#D1DBCF]">
                          문항 {q.id}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#2C3E2D] leading-relaxed">{q.text}</p>
                      
                      <div className="grid grid-cols-5 gap-1.5 text-center pt-1">
                        {[
                          { score: 1, label: '전혀 그렇지 않다' },
                          { score: 2, label: '그렇지 않은 편이다' },
                          { score: 3, label: '보통이다' },
                          { score: 4, label: '그런 편이다' },
                          { score: 5, label: '매우 그렇다' }
                        ].map((item) => (
                          <label
                            key={item.score}
                            className={`cursor-pointer border rounded-xl py-2 px-1 transition-all flex flex-col items-center justify-between hover:bg-[#E8F0E6] ${
                              student.preAnswers[q.id] === item.score
                                ? 'border-[#344E41] bg-[#E8F0E6] font-bold text-[#2C3E2D] shadow-2xs ring-1 ring-[#344E41]'
                                : 'border-[#D1DBCF] text-[#6B7A6B]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value={item.score}
                              checked={student.preAnswers[q.id] === item.score}
                              onChange={() => setStudent({
                                ...student,
                                preAnswers: { ...student.preAnswers, [q.id]: item.score }
                              })}
                              className="sr-only"
                            />
                            <span className="text-[11px] font-bold">{item.score}점</span>
                            <span className="text-[9px] mt-0.5 text-[#6B7A6B] hidden sm:inline">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Part B: Recent 7 Days Actual Behavior (Q21 - Q28) */}
                <div className="space-y-6 pt-4 border-t-2 border-[#D1DBCF]">
                  <div className="bg-[#E8F0E6] p-3.5 rounded-xl border border-[#D1DBCF] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5D7A5D]" />
                    <div>
                      <h3 className="text-xs font-bold text-[#2C3E2D]">파트 B: 최근 7일 동안의 실제 행동 (21번~28번)</h3>
                      <p className="text-[11px] text-[#344E41]">최근 7일간 자신이 실제로 이행한 구체적 행동 경험을 선택해 주세요.</p>
                    </div>
                  </div>

                  {ASSESSMENT_QUESTIONS.filter(q => q.section === 'actual_behavior').map((q) => (
                    <div key={q.id} className="border-b border-[#E0E7DE] pb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-[#344E41] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          문항 {q.id}
                        </span>
                        <span className="text-[10px] text-[#6B7A6B] font-medium">최근 7일간의 실제 행동</span>
                      </div>
                      <p className="text-xs font-bold text-[#2C3E2D] leading-relaxed">{q.text}</p>
                      
                      <div className="space-y-1.5 pt-1">
                        {q.options?.map((opt) => (
                          <label
                            key={opt.value}
                            className={`cursor-pointer border rounded-xl p-2.5 transition-all flex items-center gap-2.5 hover:bg-[#F0F4EF] ${
                              student.preAnswers[q.id] === opt.value
                                ? opt.isNoOpportunity
                                  ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400'
                                  : 'border-[#344E41] bg-[#E8F0E6] font-bold text-[#2C3E2D] shadow-2xs ring-1 ring-[#344E41]'
                                : 'border-[#D1DBCF] text-[#4A5D4E]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              value={opt.value}
                              checked={student.preAnswers[q.id] === opt.value}
                              onChange={() => setStudent({
                                ...student,
                                preAnswers: { ...student.preAnswers, [q.id]: opt.value }
                              })}
                              className="accent-[#344E41]"
                            />
                            <span className="text-xs">{opt.label}</span>
                            {opt.isNoOpportunity && (
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded ml-auto font-medium">
                                (기회 없었음)
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {stepError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{stepError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3.5 rounded-xl border border-[#D1DBCF] transition-all flex items-center justify-center gap-1 text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>이전 단계</span>
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 text-xs"
                  >
                    <span>사전 진단 제출 및 결과 확인</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 4: Pre Results */}
          {student.step === 4 && student.preScores && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <h2 className="text-lg font-bold text-[#2C3E2D] mb-1">사전 진단 결과 및 구성요소별 해설</h2>
                <p className="text-xs text-[#6B7A6B]">Rest의 도덕적 행동 4구성요소별 점수와 해당하는 진단 문항 해설입니다.</p>
              </div>

              <div className="space-y-4">
                {(['sensitivity', 'judgment', 'motivation', 'action'] as const).map((key) => {
                  const score = student.preScores![key];
                  const isRec = key === student.recommendedActivity;
                  const labels = { sensitivity: '도덕적 민감성', judgment: '도덕적 판단', motivation: '도덕적 동기화', action: '도덕적 행동' };
                  const relatedQuestions = ASSESSMENT_QUESTIONS.filter(q => q.component === key);

                  return (
                    <div key={key} className={`p-4 rounded-xl border ${isRec ? 'bg-[#FFF9EA] border-[#E6D7B8]' : 'bg-[#F8F9F5] border-[#E0E7DE]'}`}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2C3E2D] text-sm">{labels[key]}</span>
                          {isRec && <span className="bg-[#FAF0D9] text-[#5C4518] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E6D7B8]">추천</span>}
                        </div>
                        <span className="font-extrabold text-[#2C3E2D] text-sm">{score} / 5.0 점</span>
                      </div>

                      <div className="w-full bg-[#E0E7DE] h-2.5 rounded-full overflow-hidden mb-3">
                        <div className={`h-2.5 rounded-full ${isRec ? 'bg-[#8A9A5B]' : 'bg-[#5D7A5D]'}`} style={{ width: `${(score / 5) * 100}%` }}></div>
                      </div>

                      {/* Component Commentary & Included Questions */}
                      <div className="bg-white/90 border border-[#D1DBCF] rounded-lg p-3 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-[#2C3E2D] text-[11px] border-b border-[#E0E7DE] pb-1">
                          <HelpCircle className="w-3.5 h-3.5 text-[#5D7A5D]" />
                          <span>도덕성 구성요소 해설 및 해당 문항</span>
                        </div>
                        <p className="text-[11px] text-[#6B7A6B] leading-relaxed">
                          {COMPONENT_DESCRIPTIONS[key]}
                        </p>
                        
                        <div className="space-y-1.5 pt-1">
                          {relatedQuestions.map(rq => (
                            <div key={rq.id} className="bg-[#F8F9F5] p-2 rounded-lg border border-[#E0E7DE] text-[11px] flex justify-between items-center gap-2">
                              <span className="text-[#344E41] leading-snug flex-1">
                                <strong className="text-[#2C3E2D]">Q{rq.id}.</strong> {rq.text}
                              </span>
                              <span className="shrink-0 bg-[#E8F0E6] text-[#2C3E2D] font-bold px-2 py-0.5 rounded text-[10px]">
                                {student.preAnswers[rq.id] || 0}점
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3.5 rounded-xl border border-[#D1DBCF] transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToNextStep(5)}
                  className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <span>맞춤 학습활동 선택하러 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Activity Selection */}
          {student.step === 5 && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#2C3E2D]">맞춤 학습활동 선택</h2>
              <p className="text-xs text-[#6B7A6B]">추천 활동 또는 직접 원하는 영역의 활동을 선택하세요.</p>

              <div className="space-y-3">
                {(['sensitivity', 'judgment', 'motivation', 'action'] as ActivityType[]).map((key) => {
                  const act = LEARNING_ACTIVITIES[key];
                  const isRec = key === student.recommendedActivity;
                  const isSelected = key === (student.selectedActivity || student.recommendedActivity || 'sensitivity');

                  return (
                    <div
                      key={key}
                      onClick={() => saveStudentSession({ ...student, selectedActivity: key })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-[#344E41] bg-[#E8F0E6]/80 shadow-2xs' : 'border-[#D1DBCF] hover:border-[#5D7A5D]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#2C3E2D] bg-[#E8F0E6] px-2 py-0.5 rounded">{act.componentLabel}</span>
                          <h3 className="text-xs font-bold text-[#2C3E2D]">{act.title}</h3>
                        </div>
                        <div className="flex gap-1">
                          {isRec && <span className="bg-[#FAF0D9] text-[#5C4518] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E6D7B8]">추천</span>}
                          {isSelected && <span className="bg-[#E8F0E6] text-[#2C3E2D] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#D1DBCF]">선택됨</span>}
                        </div>
                      </div>
                      <p className="text-[11px] text-[#6B7A6B] leading-snug">{act.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3.5 rounded-xl border border-[#D1DBCF] transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToNextStep(6)}
                  className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <span>선택한 활동 작성하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Reflection Essay & Result Link Submission */}
          {student.step === 6 && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs space-y-4">
              {(() => {
                const activityKey = student.selectedActivity || student.recommendedActivity || 'sensitivity';
                const activity = LEARNING_ACTIVITIES[activityKey];
                return (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-2.5 py-1 bg-[#E8F0E6] text-[#2C3E2D] text-xs font-bold rounded-full">
                        교육 활동 제출 [{activity.componentLabel}]
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-[#2C3E2D]">{activity.title}</h2>
                      <p className="text-xs text-[#6B7A6B] leading-relaxed">{activity.description}</p>
                    </div>

                    <form onSubmit={handleStep6Submit} className="space-y-4 pt-2">
                      <div className="bg-[#F8F9F5] border border-[#D1DBCF] rounded-xl p-4 space-y-4">
                        {/* Q1: URL Link input */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-[#2C3E2D] flex items-center gap-1.5">
                            <Link2 className="w-4 h-4 text-[#5D7A5D]" />
                            <span>Q1. {activity.q1Prompt}</span>
                          </label>
                          <p className="text-[11px] text-[#6B7A6B]">
                            선생님이 안내한 게시판(패들렛, 구글드라이브, 노션, 캔바 등)의 활동 결과물 공유 링크를 복사하여 붙여넣어 주세요.
                          </p>
                          <div className="relative">
                            <input
                              type="text"
                              value={student.reflectionAnswer1 || ''}
                              onChange={(e) => setStudent({ ...student, reflectionAnswer1: e.target.value })}
                              placeholder={activity.q1Placeholder}
                              className="w-full p-3 text-xs border border-[#D1DBCF] bg-white rounded-xl text-[#2C3E2D] focus:outline-hidden focus:border-[#344E41] font-mono"
                            />
                          </div>
                        </div>

                        {/* Q2: Reflection Essay input */}
                        <div className="space-y-1.5 pt-2 border-t border-[#E0E7DE]">
                          <label className="block text-xs font-bold text-[#2C3E2D] flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-[#5D7A5D]" />
                            <span>Q2. {activity.q2Prompt}</span>
                          </label>
                          <textarea
                            rows={4}
                            value={student.reflectionAnswer2 || ''}
                            onChange={(e) => setStudent({ ...student, reflectionAnswer2: e.target.value })}
                            placeholder={activity.q2Placeholder}
                            className="w-full p-3 text-xs border border-[#D1DBCF] bg-white rounded-xl text-[#344E41] focus:outline-hidden focus:border-[#344E41] leading-relaxed"
                          />
                        </div>
                      </div>

                      {/* Quick Auto-fill for Testing */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setStudent({
                            ...student,
                            reflectionAnswer1: 'https://padlet.com/example_eco_activity/result_10101',
                            reflectionAnswer2: '외부 교육 활동을 진행하면서 나의 소소한 실천 선택이 주변 생태계와 미래 세대에 직간접적 영향을 미침을 깊이 체감했습니다. 지속 가능한 도덕적 실천을 다짐합니다.'
                          })}
                          className="text-[11px] font-semibold text-[#5D7A5D] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>⚡ [예시 결과물 링크 및 소감 채우기]</span>
                        </button>
                      </div>

                      {stepError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                          <span>{stepError}</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={goToPrevStep}
                          className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3.5 rounded-xl border border-[#D1DBCF] transition-all flex items-center justify-center gap-1 text-xs cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>이전 단계</span>
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 text-xs cursor-pointer"
                        >
                          <span>행동계획 작성으로 이동</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </>
                );
              })()}
            </div>
          )}

          {/* Step 7: If-Then Action Plan */}
          {student.step === 7 && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#2C3E2D]">If–Then 환경 행동계획 작성</h2>
                <button
                  type="button"
                  onClick={fillSampleActionPlan}
                  className="text-[#5D7A5D] hover:text-[#2C3E2D] text-xs font-semibold underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>예시 행동계획 채우기</span>
                </button>
              </div>

              <p className="text-xs text-[#6B7A6B]">실제 현장에서 맞닥뜨릴 만약의 상황(If)과 나의 행동 약속(Then)을 설정하세요.</p>

              <form onSubmit={handleStep7Submit} className="space-y-4">
                <div className="p-4 bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2C3E2D] mb-1">IF (만약 어떤 상황이나 유혹이 생기면)</label>
                    <input
                      type="text"
                      value={student.ifPlan || ''}
                      onChange={(e) => setStudent({ ...student, ifPlan: e.target.value })}
                      placeholder="예: 학교 축제 부스에서 일회용 컵을 받을 때"
                      className="w-full p-3 text-xs border border-[#D1DBCF] rounded-lg bg-white text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C3E2D] mb-1">THEN (나는 이렇게 환경적 행동을 하겠다)</label>
                    <input
                      type="text"
                      value={student.thenPlan || ''}
                      onChange={(e) => setStudent({ ...student, thenPlan: e.target.value })}
                      placeholder="예: 지참한 개인 텀블러에 음료를 받고 친구에게도 권유하겠다"
                      className="w-full p-3 text-xs border border-[#D1DBCF] rounded-lg bg-white text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                    />
                  </div>
                </div>

                {stepError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{stepError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3.5 rounded-xl border border-[#D1DBCF] transition-all flex items-center justify-center gap-1 text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>이전 단계</span>
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 text-xs"
                  >
                    <span>사후 진단 설문으로 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 8: Post Assessment */}
          {student.step === 8 && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs">
              <div className="mb-6">
                <span className="text-[11px] font-bold text-[#344E41] bg-[#E8F0E6] px-2.5 py-1 rounded-full border border-[#D1DBCF]">
                  사후 환경 도덕성 진단 (총 28문항)
                </span>
                <h2 className="text-lg font-bold text-[#2C3E2D] mt-2 mb-1">환경 도덕성 사후 진단 설문</h2>
                <p className="text-xs text-[#6B7A6B] leading-relaxed">
                  교육 프로그램 참여 후 변화된 자신의 환경 도덕성(민감성, 판단, 동기화, 행동)을 측정하기 위한 설문입니다. 솔직하게 자신의 생각과 행동을 표시해주세요.
                </p>
              </div>

              <form onSubmit={handleStep8Submit} className="space-y-8">
                {/* Part A: Attitude & Thoughts (Q1 - Q20) */}
                <div className="space-y-6">
                  <div className="bg-[#F8F9F5] p-3.5 rounded-xl border border-[#D1DBCF] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#5D7A5D]" />
                    <div>
                      <h3 className="text-xs font-bold text-[#2C3E2D]">파트 A: 환경에 대한 생각 및 태도 (1번~20번)</h3>
                      <p className="text-[11px] text-[#6B7A6B]">현재 자신의 생각이나 태도와 가장 일치하는 항목(1점~5점)을 선택해주세요.</p>
                    </div>
                  </div>

                  {ASSESSMENT_QUESTIONS.filter(q => q.section === 'attitude' || !q.section).map((q) => (
                    <div key={q.id} className="border-b border-[#E0E7DE] pb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-[#2C3E2D] bg-[#E8F0E6] px-2 py-0.5 rounded border border-[#D1DBCF]">
                          문항 {q.id}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#2C3E2D] leading-relaxed">{q.text}</p>
                      
                      <div className="grid grid-cols-5 gap-1.5 text-center pt-1">
                        {[
                          { score: 1, label: '전혀 그렇지 않다' },
                          { score: 2, label: '그렇지 않은 편이다' },
                          { score: 3, label: '보통이다' },
                          { score: 4, label: '그런 편이다' },
                          { score: 5, label: '매우 그렇다' }
                        ].map((item) => (
                          <label
                            key={item.score}
                            className={`cursor-pointer border rounded-xl py-2 px-1 transition-all flex flex-col items-center justify-between hover:bg-[#E8F0E6] ${
                              student.postAnswers[q.id] === item.score
                                ? 'border-[#344E41] bg-[#E8F0E6] font-bold text-[#2C3E2D] shadow-2xs ring-1 ring-[#344E41]'
                                : 'border-[#D1DBCF] text-[#6B7A6B]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`post_q_${q.id}`}
                              value={item.score}
                              checked={student.postAnswers[q.id] === item.score}
                              onChange={() => setStudent({
                                ...student,
                                postAnswers: { ...student.postAnswers, [q.id]: item.score }
                              })}
                              className="sr-only"
                            />
                            <span className="text-[11px] font-bold">{item.score}점</span>
                            <span className="text-[9px] mt-0.5 text-[#6B7A6B] hidden sm:inline">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Part B: Recent 7 Days Actual Behavior (Q21 - Q28) */}
                <div className="space-y-6 pt-4 border-t-2 border-[#D1DBCF]">
                  <div className="bg-[#E8F0E6] p-3.5 rounded-xl border border-[#D1DBCF] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#5D7A5D]" />
                    <div>
                      <h3 className="text-xs font-bold text-[#2C3E2D]">파트 B: 최근 7일 동안의 실제 행동 (21번~28번)</h3>
                      <p className="text-[11px] text-[#344E41]">최근 7일간 자신이 실제로 이행한 구체적 행동 경험을 선택해 주세요.</p>
                    </div>
                  </div>

                  {ASSESSMENT_QUESTIONS.filter(q => q.section === 'actual_behavior').map((q) => (
                    <div key={q.id} className="border-b border-[#E0E7DE] pb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-[#344E41] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          문항 {q.id}
                        </span>
                        <span className="text-[10px] text-[#6B7A6B] font-medium">최근 7일간의 실제 행동</span>
                      </div>
                      <p className="text-xs font-bold text-[#2C3E2D] leading-relaxed">{q.text}</p>
                      
                      <div className="space-y-1.5 pt-1">
                        {q.options?.map((opt) => (
                          <label
                            key={opt.value}
                            className={`cursor-pointer border rounded-xl p-2.5 transition-all flex items-center gap-2.5 hover:bg-[#F0F4EF] ${
                              student.postAnswers[q.id] === opt.value
                                ? opt.isNoOpportunity
                                  ? 'border-amber-400 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400'
                                  : 'border-[#344E41] bg-[#E8F0E6] font-bold text-[#2C3E2D] shadow-2xs ring-1 ring-[#344E41]'
                                : 'border-[#D1DBCF] text-[#4A5D4E]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`post_q_${q.id}`}
                              value={opt.value}
                              checked={student.postAnswers[q.id] === opt.value}
                              onChange={() => setStudent({
                                ...student,
                                postAnswers: { ...student.postAnswers, [q.id]: opt.value }
                              })}
                              className="accent-[#344E41]"
                            />
                            <span className="text-xs">{opt.label}</span>
                            {opt.isNoOpportunity && (
                              <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded ml-auto font-medium">
                                (기회 없었음)
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {stepError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{stepError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3.5 rounded-xl border border-[#D1DBCF] transition-all flex items-center justify-center gap-1 text-xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>이전 단계</span>
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 text-xs"
                  >
                    <span>최종 제출 및 성과 확인</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 9: Pre/Post Gains */}
          {student.step === 9 && student.preScores && student.postScores && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs space-y-6 text-center">
              <div className="space-y-1">
                <span className="text-4xl inline-block">🎉</span>
                <h2 className="text-xl font-bold text-[#2C3E2D]">사전–사후 역량 변화 비교 그래프 및 문항 해설</h2>
                <p className="text-xs text-[#6B7A6B]">4대 환경 도덕성 역량 요소별 사전/사후 점수의 성장을 한눈에 비교해보세요.</p>
              </div>

              {/* Summary Bar Chart Card */}
              {(() => {
                const components = [
                  { key: 'sensitivity' as const, label: '도덕적 민감성' },
                  { key: 'judgment' as const, label: '도덕적 판단' },
                  { key: 'motivation' as const, label: '도덕적 동기화' },
                  { key: 'action' as const, label: '도덕적 행동' }
                ];
                const preAvg = Math.round((components.reduce((acc, c) => acc + student.preScores![c.key], 0) / 4) * 100) / 100;
                const postAvg = Math.round((components.reduce((acc, c) => acc + student.postScores![c.key], 0) / 4) * 100) / 100;
                const totalGain = Math.round((postAvg - preAvg) * 100) / 100;

                return (
                  <div className="bg-[#F8F9F5] border border-[#D1DBCF] rounded-xl p-5 text-left space-y-5 shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E0E7DE] pb-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#344E41]" />
                        <span className="text-sm font-extrabold text-[#2C3E2D]">사전 vs 사후 역량 성과 비교 차트 (5점 만점)</span>
                      </div>
                      <div className="bg-[#E8F0E6] border border-[#D1DBCF] px-3 py-1 rounded-full text-xs font-bold text-[#2C3E2D]">
                        전체 평균: {preAvg}점 ➔ {postAvg}점 ({totalGain >= 0 ? `+${totalGain}` : totalGain}점 성장)
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-[#A3B18A] inline-block"></span>
                        <span className="text-[#6B7A6B]">사전 진단 (Pre)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded bg-[#344E41] inline-block"></span>
                        <span className="text-[#2C3E2D] font-bold">사후 진단 (Post)</span>
                      </div>
                    </div>

                    {/* Bar Chart Rows */}
                    <div className="space-y-4">
                      {components.map(({ key, label }) => {
                        const preVal = student.preScores![key];
                        const postVal = student.postScores![key];
                        const diff = Math.round((postVal - preVal) * 10) / 10;
                        const prePct = Math.min(100, Math.max(0, (preVal / 5) * 100));
                        const postPct = Math.min(100, Math.max(0, (postVal / 5) * 100));

                        return (
                          <div key={key} className="space-y-1.5 bg-white p-3 rounded-lg border border-[#E0E7DE]">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className="text-[#2C3E2D]">{label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#6B7A6B]">사전 {preVal}점 ➔ 사후 {postVal}점</span>
                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${diff >= 0 ? 'bg-[#E8F0E6] text-[#2C3E2D]' : 'bg-red-50 text-red-600'}`}>
                                  {diff >= 0 ? `+${diff}` : diff}점
                                </span>
                              </div>
                            </div>

                            {/* Dual Bars */}
                            <div className="space-y-1 pt-1">
                              {/* Pre Bar */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#A3B18A] font-bold w-8 text-right shrink-0">사전</span>
                                <div className="flex-1 bg-[#F0F4EF] rounded-full h-3 overflow-hidden border border-[#D1DBCF]/50">
                                  <div
                                    className="bg-[#A3B18A] h-full rounded-full transition-all duration-700"
                                    style={{ width: `${prePct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-semibold text-[#6B7A6B] w-8">{preVal}점</span>
                              </div>

                              {/* Post Bar */}
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#2C3E2D] font-extrabold w-8 text-right shrink-0">사후</span>
                                <div className="flex-1 bg-[#F0F4EF] rounded-full h-3.5 overflow-hidden border border-[#344E41]/30">
                                  <div
                                    className="bg-[#344E41] h-full rounded-full transition-all duration-700"
                                    style={{ width: `${postPct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-[#2C3E2D] w-8">{postVal}점</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-4 text-left pt-2">
                <h3 className="text-sm font-extrabold text-[#2C3E2D] flex items-center gap-1.5 border-b border-[#E0E7DE] pb-2">
                  <FileText className="w-4 h-4 text-[#5D7A5D]" />
                  <span>세부 영역별 문항 해설 및 반응 상세</span>
                </h3>

                {(['sensitivity', 'judgment', 'motivation', 'action'] as const).map((key) => {
                  const pre = student.preScores![key];
                  const post = student.postScores![key];
                  const gain = Math.round((post - pre) * 10) / 10;
                  const labels = { sensitivity: '도덕적 민감성', judgment: '도덕적 판단', motivation: '도덕적 동기화', action: '도덕적 행동' };
                  const relatedQuestions = ASSESSMENT_QUESTIONS.filter(q => q.component === key);

                  return (
                    <div key={key} className="p-4 border border-[#E0E7DE] rounded-xl bg-[#F8F9F5] space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-[#2C3E2D] text-sm">{labels[key]}</span>
                        <span className="text-[#5D7A5D] bg-[#E8F0E6] px-2.5 py-0.5 rounded-full font-bold">
                          {gain >= 0 ? `+${gain}` : gain} 점 향상
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="bg-white p-2 border border-[#D1DBCF] rounded-lg">
                          <span className="text-[10px] text-[#A3B18A] block">사전 점수</span>
                          <span className="font-extrabold text-[#344E41] text-sm">{pre} 점</span>
                        </div>
                        <div className="bg-[#E8F0E6] border border-[#D1DBCF] p-2 rounded-lg">
                          <span className="text-[10px] text-[#2C3E2D] block">사후 점수</span>
                          <span className="font-extrabold text-[#2C3E2D] text-sm">{post} 점</span>
                        </div>
                      </div>

                      {/* Component Commentary & Questions Comparison */}
                      <div className="bg-white border border-[#D1DBCF] rounded-lg p-3 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-[#2C3E2D] text-[11px] border-b border-[#E0E7DE] pb-1">
                          <HelpCircle className="w-3.5 h-3.5 text-[#5D7A5D]" />
                          <span>구성요소 해설 및 문항별 변화</span>
                        </div>
                        <p className="text-[11px] text-[#6B7A6B] leading-relaxed">
                          {COMPONENT_DESCRIPTIONS[key]}
                        </p>
                        
                        <div className="space-y-1.5 pt-1">
                          {relatedQuestions.map(rq => {
                            const qPre = student.preAnswers[rq.id] || 0;
                            const qPost = student.postAnswers[rq.id] || 0;
                            const qDiff = Math.round((qPost - qPre) * 10) / 10;
                            return (
                              <div key={rq.id} className="bg-[#F8F9F5] p-2 rounded-lg border border-[#E0E7DE] text-[11px] flex justify-between items-center gap-2">
                                <span className="text-[#344E41] leading-snug flex-1">
                                  <strong className="text-[#2C3E2D]">Q{rq.id}.</strong> {rq.text}
                                </span>
                                <div className="shrink-0 text-right space-x-1">
                                  <span className="text-[10px] text-[#6B7A6B]">사전:{qPre}점 ➔</span>
                                  <span className="font-bold text-[#2C3E2D]">사후:{qPost}점</span>
                                  {qDiff > 0 && <span className="text-[10px] text-[#5D7A5D] font-bold">(+{qDiff})</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3.5 rounded-xl border border-[#D1DBCF] transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>이전 단계</span>
                </button>
                <button
                  type="button"
                  onClick={() => goToNextStep(10)}
                  className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1 text-xs"
                >
                  <span>최종 완료 카드 확인</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 10: Complete */}
          {student.step === 10 && (
            <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 bg-[#E8F0E6] text-[#344E41] rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-extrabold text-[#2C3E2D]">학습 제출 완료!</h2>
              <p className="text-xs text-[#6B7A6B] leading-relaxed">
                환경 도덕성 진단과 맞춤 학습을 성공적으로 완료하였습니다.<br/>
                작성하신 If–Then 행동계획을 꾸준히 실천해보세요!
              </p>

              <div className="bg-[#F8F9F5] border border-[#E0E7DE] rounded-xl p-4 text-left text-xs space-y-1 text-[#344E41]">
                <div><strong>학번 및 이름:</strong> {student.student_code}</div>
                <div><strong>제출 ID:</strong> {student.submission_id}</div>
                <div><strong>완료 일시:</strong> {student.completed_at}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold py-3 rounded-xl border border-[#D1DBCF] transition-all text-xs"
                >
                  이전 단계
                </button>
                <button
                  type="button"
                  onClick={clearStudentSession}
                  className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold py-3 rounded-xl transition-all shadow-2xs text-xs"
                >
                  새로운 학습 시작하기
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Teacher Dashboard Views */}
      {role === 'TEACHER' && (
        <div className="max-w-6xl mx-auto px-4">
          {!teacherAuthenticated ? (
            /* Login Modal */
            <div className="max-w-md mx-auto pt-12">
              <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 shadow-xs">
                <div className="w-12 h-12 bg-[#E8F0E6] text-[#344E41] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-center text-[#2C3E2D] mb-1">교사용 대시보드 인증</h2>
                <p className="text-xs text-center text-[#6B7A6B] mb-4">
                  선생님 전용 비밀번호를 입력해 주세요.<br />
                  <span className="text-[11px] text-[#5D7A5D] font-medium">(초기 기본 비밀번호: ecomoral123!)</span>
                </p>

                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <input
                    type="password"
                    value={teacherPasswordInput}
                    onChange={(e) => setTeacherPasswordInput(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="w-full p-3 text-xs border border-[#D1DBCF] rounded-xl text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                  />
                  {passwordError && <p className="text-xs text-red-600 font-semibold">{passwordError}</p>}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('SELECT')}
                      className="w-1/3 bg-white hover:bg-[#F0F4EF] border border-[#D1DBCF] text-[#344E41] font-semibold text-xs py-3 rounded-xl transition-all"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold text-xs py-3 rounded-xl shadow-2xs transition-all"
                    >
                      대시보드 접속
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Main Dashboard */
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-[#2C3E2D] text-white p-4 rounded-2xl shadow-xs border border-[#344E41] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-[#A3B18A]" />
                  <div>
                    <h2 className="font-bold text-base">EcoMoral Lab 교사 분석 대시보드</h2>
                    <p className="text-xs text-[#A3B18A]">학생 응답 데이터 및 가상 데이터 통계분석</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChangePwModalOpen(true)}
                    className="p-2 bg-[#344E41] hover:bg-[#2A3F34] rounded-lg text-white text-xs flex items-center gap-1 transition-all border border-[#5D7A5D]"
                    title="대시보드 접속 비밀번호 변경"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>비밀번호 변경</span>
                  </button>
                  <button
                    onClick={() => loadMockDashboardData(dataSource)}
                    className="p-2 bg-[#344E41] hover:bg-[#2A3F34] rounded-lg text-white text-xs flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>새로고침</span>
                  </button>
                  <button
                    onClick={() => setTeacherAuthenticated(false)}
                    className="px-3 py-1.5 bg-[#344E41] hover:bg-[#2A3F34] rounded-lg text-white text-xs transition-all"
                  >
                    로그아웃
                  </button>
                </div>
              </div>

              {/* Data Source Indicator Banner */}
              <div className={`p-3 rounded-xl text-center text-xs font-bold text-white shadow-2xs ${
                dataSource === 'ACTUAL' ? 'bg-[#344E41]' : 'bg-[#5D7A5D]'
              }`}>
                {dataSource === 'ACTUAL'
                  ? '🟢 현재 조망 중: [실제 학생 DB] 데이터 (EcoMoral_Actual_DB)'
                  : '🟣 현재 조망 중: [가상 연습 DB] 데이터 (EcoMoral_Synthetic_DB)'}
              </div>

              {/* Data Controls */}
              <div className="bg-white border border-[#D1DBCF] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#2C3E2D]">데이터 소스:</span>
                  <button
                    onClick={() => loadMockDashboardData('ACTUAL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dataSource === 'ACTUAL' ? 'bg-[#344E41] text-white shadow-2xs' : 'bg-[#F0F4EF] text-[#344E41] hover:bg-[#E8F0E6]'
                    }`}
                  >
                    실제 학생 데이터
                  </button>
                  <button
                    onClick={() => loadMockDashboardData('SYNTHETIC')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dataSource === 'SYNTHETIC' ? 'bg-[#5D7A5D] text-white shadow-2xs' : 'bg-[#F0F4EF] text-[#344E41] hover:bg-[#E8F0E6]'
                    }`}
                  >
                    가상 연습 데이터
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {dataSource === 'SYNTHETIC' && (
                    <button
                      onClick={() => setSyntheticModalOpen(true)}
                      className="px-3 py-1.5 bg-[#5D7A5D] hover:bg-[#4E684E] text-white font-bold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>가상 학생 60명 생성</span>
                    </button>
                  )}
                  <button
                    onClick={() => alert('CSV 다운로드가 정상 시작됩니다.')}
                    className="px-3 py-1.5 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold text-xs rounded-lg transition-all shadow-2xs flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV 다운로드</span>
                  </button>
                </div>
              </div>

              {dashboardData && (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white border border-[#D1DBCF] p-4 rounded-xl text-center shadow-xs">
                      <span className="text-xs text-[#6B7A6B] block font-semibold">총 제출 학생 수</span>
                      <span className="text-2xl font-extrabold text-[#2C3E2D]">{dashboardData.totalSubmissions}명</span>
                    </div>
                    <div className="bg-white border border-[#D1DBCF] p-4 rounded-xl text-center shadow-xs">
                      <span className="text-xs text-[#6B7A6B] block font-semibold">학습 완료율</span>
                      <span className="text-2xl font-extrabold text-[#5D7A5D]">{dashboardData.completionRate}%</span>
                    </div>
                    <div className="bg-white border border-[#D1DBCF] p-4 rounded-xl text-center shadow-xs">
                      <span className="text-xs text-[#6B7A6B] block font-semibold">평균 향상도</span>
                      <span className="text-2xl font-extrabold text-[#344E41]">+{dashboardData.averageGains.sensitivity}</span>
                    </div>
                    <div className="bg-white border border-[#D1DBCF] p-4 rounded-xl text-center shadow-xs">
                      <span className="text-xs text-[#6B7A6B] block font-semibold">추천-선택 일치율</span>
                      <span className="text-2xl font-extrabold text-[#8A9A5B]">{dashboardData.matchRate}%</span>
                    </div>
                  </div>

                  {/* Component Averages Table */}
                  <div className="bg-white border border-[#D1DBCF] rounded-2xl p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-[#2C3E2D] mb-3">Rest 4구성요소별 사전 vs 사후 평균 비교</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F8F9F5] border-b border-[#E0E7DE]">
                            <th className="p-2.5 font-bold text-[#2C3E2D]">구성요소</th>
                            <th className="p-2.5 font-bold text-[#2C3E2D]">사전 평균</th>
                            <th className="p-2.5 font-bold text-[#2C3E2D]">사후 평균</th>
                            <th className="p-2.5 font-bold text-[#2C3E2D]">평균 향상도</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: '도덕적 민감성', pre: dashboardData.preAverages.sensitivity, post: dashboardData.postAverages.sensitivity, gain: dashboardData.averageGains.sensitivity },
                            { name: '도덕적 판단', pre: dashboardData.preAverages.judgment, post: dashboardData.postAverages.judgment, gain: dashboardData.averageGains.judgment },
                            { name: '도덕적 동기화', pre: dashboardData.preAverages.motivation, post: dashboardData.postAverages.motivation, gain: dashboardData.averageGains.motivation },
                            { name: '도덕적 행동', pre: dashboardData.preAverages.action, post: dashboardData.postAverages.action, gain: dashboardData.averageGains.action }
                          ].map((row) => (
                            <tr key={row.name} className="border-b border-[#E0E7DE] hover:bg-[#F8F9F5]">
                              <td className="p-2.5 font-semibold text-[#2C3E2D]">{row.name}</td>
                              <td className="p-2.5 text-[#6B7A6B]">{row.pre} 점</td>
                              <td className="p-2.5 text-[#5D7A5D] font-bold">{row.post} 점</td>
                              <td className="p-2.5 text-[#344E41] font-bold">+{row.gain} 점</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Combined Records Table */}
                  <div className="bg-white border border-[#D1DBCF] rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-[#2C3E2D]">통합 학생 응답 기록 (combined_export)</h3>
                      <input
                        type="text"
                        placeholder="학번 또는 이름 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="p-2 text-xs border border-[#D1DBCF] rounded-lg w-48 text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                      />
                    </div>

                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <table className="w-full text-[11px] text-left border-collapse">
                        <thead className="sticky top-0 bg-[#F8F9F5] border-b border-[#E0E7DE]">
                          <tr>
                            <th className="p-2 font-bold text-[#2C3E2D]">학번 / 이름</th>
                            <th className="p-2 font-bold text-[#2C3E2D]">사전 점수(민/판/동/행)</th>
                            <th className="p-2 font-bold text-[#2C3E2D]">추천 활동</th>
                            <th className="p-2 font-bold text-[#2C3E2D]">선택 활동</th>
                            <th className="p-2 font-bold text-[#2C3E2D]">If–Then 행동계획</th>
                            <th className="p-2 font-bold text-[#2C3E2D]">완료 일시</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.records
                            .filter(r => !searchQuery || r.student_code.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((rec) => (
                              <tr key={rec.submission_id} className="border-b border-[#E0E7DE] hover:bg-[#F8F9F5]">
                                <td className="p-2 font-mono font-bold text-[#2C3E2D]">{rec.student_code}</td>
                                <td className="p-2 text-[#6B7A6B]">
                                  {rec.sensitivity_pre} / {rec.judgment_pre} / {rec.motivation_pre} / {rec.action_pre}
                                </td>
                                <td className="p-2 font-bold text-[#8A9A5B]">{rec.recommended_activity}</td>
                                <td className="p-2 font-bold text-[#5D7A5D]">{rec.selected_activity}</td>
                                <td className="p-2 text-[#344E41] max-w-xs truncate">
                                  IF {rec.if_plan} → THEN {rec.then_plan}
                                </td>
                                <td className="p-2 text-[#A3B18A]">{rec.completed_at}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Synthetic Generation Modal */}
          {syntheticModalOpen && (
            <div className="fixed inset-0 bg-[#2C3E2D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
                <h3 className="text-base font-bold text-[#2C3E2D] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#5D7A5D]" />
                  <span>가상 학생 60명 데이터 생성</span>
                </h3>
                <p className="text-xs text-[#6B7A6B] leading-relaxed">
                  가상 DB(EcoMoral_Synthetic_DB)에 SYN001~SYN060 코드를 가진 가상 학생 60명의 응답 데이터를 생성합니다. 기존 가상 데이터를 덮어쓰시겠습니까?
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSyntheticModalOpen(false)}
                    className="px-4 py-2 bg-white hover:bg-[#F0F4EF] border border-[#D1DBCF] text-[#344E41] text-xs font-semibold rounded-xl transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleGenerateSynthetic}
                    className="px-4 py-2 bg-[#5D7A5D] hover:bg-[#4E684E] text-white text-xs font-bold rounded-xl shadow-2xs transition-all"
                  >
                    60명 생성하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Password Change Modal */}
          {changePwModalOpen && (
            <div className="fixed inset-0 bg-[#2C3E2D]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white border border-[#D1DBCF] rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#E0E7DE] pb-3">
                  <div className="flex items-center gap-2 text-[#2C3E2D]">
                    <Lock className="w-5 h-5 text-[#344E41]" />
                    <h3 className="font-bold text-sm">교사 대시보드 비밀번호 변경</h3>
                  </div>
                  <button
                    onClick={() => {
                      setChangePwModalOpen(false);
                      setPwChangeStatus(null);
                    }}
                    className="text-[#6B7A6B] hover:text-[#2C3E2D] text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#344E41] mb-1">현재 비밀번호</label>
                    <input
                      type="password"
                      value={currentPwInput}
                      onChange={(e) => setCurrentPwInput(e.target.value)}
                      placeholder="현재 비밀번호 입력"
                      className="w-full p-2.5 text-xs border border-[#D1DBCF] rounded-xl text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#344E41] mb-1">새 비밀번호 (4자 이상)</label>
                    <input
                      type="password"
                      value={newPwInput}
                      onChange={(e) => setNewPwInput(e.target.value)}
                      placeholder="새 비밀번호 입력"
                      className="w-full p-2.5 text-xs border border-[#D1DBCF] rounded-xl text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#344E41] mb-1">새 비밀번호 확인</label>
                    <input
                      type="password"
                      value={confirmPwInput}
                      onChange={(e) => setConfirmPwInput(e.target.value)}
                      placeholder="새 비밀번호 재입력"
                      className="w-full p-2.5 text-xs border border-[#D1DBCF] rounded-xl text-[#344E41] focus:outline-hidden focus:border-[#344E41]"
                      required
                    />
                  </div>

                  {pwChangeStatus && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-semibold text-center ${
                        pwChangeStatus.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {pwChangeStatus.text}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChangePwModalOpen(false);
                        setPwChangeStatus(null);
                      }}
                      className="w-1/3 bg-[#F0F4EF] hover:bg-[#E8F0E6] text-[#344E41] font-semibold text-xs py-2.5 rounded-xl transition-all"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bg-[#344E41] hover:bg-[#2A3F34] text-white font-bold text-xs py-2.5 rounded-xl shadow-2xs transition-all"
                    >
                      변경사항 저장
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
