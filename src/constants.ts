import { AssessmentQuestion, LearningActivityInfo, ComponentScores, ActivityType } from './types';

export const DEFAULT_SCENARIO = {
  id: 'SCENARIO_FESTIVAL_01',
  title: '학교 축제 일회용품 vs 다회용기 사용 딜레마',
  description: `학교 축제에서 일회용 컵과 접시를 사용하면 준비가 편리하고 비용도 적게 듭니다. 반면 다회용기를 사용하면 설거지와 반납 관리가 필요해 번거롭지만 쓰레기를 획기적으로 줄일 수 있습니다. 학생회는 축제 부스에서 어떤 방식을 선택할지 열띤 논의를 진행하고 있습니다.`
};

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // --- 파트 A: 생각 및 태도 (1~20번, 5점 Likert) ---
  {
    id: 1,
    component: 'sensitivity',
    componentLabel: '도덕적 민감성',
    section: 'attitude',
    text: '일상생활에서 날씨 변화나 환경 오염이 사람과 자연에 미치는 위험을 쉽게 느낀다.'
  },
  {
    id: 2,
    component: 'judgment',
    componentLabel: '도덕적 판단',
    section: 'attitude',
    isReverse: true,
    text: '환경 보호보다는 나 자신의 편리가 더 중요하다.'
  },
  {
    id: 3,
    component: 'motivation',
    componentLabel: '도덕적 동기화',
    section: 'attitude',
    text: '친환경 제품이 조금 더 비싸더라도 구매할 마음이 있다.'
  },
  {
    id: 4,
    component: 'action',
    componentLabel: '도덕적 행동 (행동 의향)',
    section: 'attitude',
    text: '환경을 지키기 위한 캠페인이나 학교 서명 활동에 기꺼이 참여하겠다.'
  },
  {
    id: 5,
    component: 'sensitivity',
    componentLabel: '도덕적 민감성',
    section: 'attitude',
    text: '나의 행동이 미래 세대나 야생 동식물에게 피해를 줄 수 있음을 염두에 둔다.'
  },
  {
    id: 6,
    component: 'motivation',
    componentLabel: '도덕적 동기화',
    section: 'attitude',
    isReverse: true,
    text: '친구들이 환경 보호에 관심이 없으면 나도 굳이 신경 쓰고 싶지 않다.'
  },
  {
    id: 7,
    component: 'judgment',
    componentLabel: '도덕적 판단',
    section: 'attitude',
    text: '다소 번거롭더라도 일회용품 대신 다회용기를 사용하는 것이 도덕적으로 옳다.'
  },
  {
    id: 8,
    component: 'action',
    componentLabel: '도덕적 행동 (행동 의향)',
    section: 'attitude',
    text: '우리 학교나 동네의 쓰레기를 줄이는 실천 활동에 적극 동참할 것이다.'
  },
  {
    id: 9,
    component: 'sensitivity',
    componentLabel: '도덕적 민감성',
    section: 'attitude',
    isReverse: true,
    text: '쓰레기를 무심코 버려도 주변 환경에 큰 영향을 주지는 않는다고 생각한다.'
  },
  {
    id: 10,
    component: 'judgment',
    componentLabel: '도덕적 판단',
    section: 'attitude',
    text: '당장의 경제적 이득이나 편리함보다 환경 보전 가치를 우선해야 한다.'
  },
  {
    id: 11,
    component: 'motivation',
    componentLabel: '도덕적 동기화',
    section: 'attitude',
    text: '환경 보호를 위해 약간의 불편함을 감수할 때 자부심과 보람을 느낀다.'
  },
  {
    id: 12,
    component: 'action',
    componentLabel: '도덕적 행동 (행동 의향)',
    section: 'attitude',
    isReverse: true,
    text: '환경 문제 해결을 위해 나의 습관이나 행동을 직접 바꿀 필요는 없다고 본다.'
  },
  {
    id: 13,
    component: 'sensitivity',
    componentLabel: '도덕적 민감성',
    section: 'attitude',
    text: '환경 오염으로 어려움을 겪는 이웃이나 동물들의 처지에 깊이 공감한다.'
  },
  {
    id: 14,
    component: 'judgment',
    componentLabel: '도덕적 판단',
    section: 'attitude',
    text: '자연환경을 파괴하고 오염시키는 행위에 대해서는 엄격한 책임이 따라야 한다.'
  },
  {
    id: 15,
    component: 'motivation',
    componentLabel: '도덕적 동기화',
    section: 'attitude',
    text: '누가 보지 않거나 알아주지 않더라도 스스로 친환경 윤리를 지키려고 노력한다.'
  },
  {
    id: 16,
    component: 'action',
    componentLabel: '도덕적 행동 (행동 의향)',
    section: 'attitude',
    text: '일상 속에서 텀블러 지참, 잔반 줄이기 등 친환경 습관을 꾸준히 실천할 계획이다.'
  },
  {
    id: 17,
    component: 'judgment',
    componentLabel: '도덕적 판단',
    section: 'attitude',
    isReverse: true,
    text: '나 하나쯤 환경을 보호하지 않는다고 해서 커다란 문제가 되지는 않는다.'
  },
  {
    id: 18,
    component: 'sensitivity',
    componentLabel: '도덕적 민감성',
    section: 'attitude',
    text: '환경 오염이 심각해지면 우리 사회와 생태계 전체가 위험해질 수 있음을 잘 안다.'
  },
  {
    id: 19,
    component: 'motivation',
    componentLabel: '도덕적 동기화',
    section: 'attitude',
    text: '불편함을 이겨내고 환경 보호를 몸소 실천하는 사람이 도덕적으로 훌륭하다고 여긴다.'
  },
  {
    id: 20,
    component: 'action',
    componentLabel: '도덕적 행동 (행동 의향)',
    section: 'attitude',
    text: '주변 친구들에게 올바른 분리배출 등 환경 보호 실천을 권유하고 함께할 것이다.'
  },

  // --- 파트 B: 최근 7일 실제 행동 (21~28번) ---
  {
    id: 21,
    component: 'action',
    componentLabel: '도덕적 행동 (실제 행동)',
    section: 'actual_behavior',
    text: '최근 7일 동안 텀블러나 개인 다회용 컵을 사용한 빈도는 어떠했습니까?',
    options: [
      { label: '0회 (전혀 안 함)', value: 1 },
      { label: '1~2회 사용', value: 2 },
      { label: '3~4회 사용', value: 3 },
      { label: '5회 이상 자주 사용', value: 4 },
      { label: '매일 항상 사용', value: 5 },
      { label: '최근 7일간 컵을 사용할 기회가 없었음', value: 0, isNoOpportunity: true }
    ]
  },
  {
    id: 22,
    component: 'action',
    componentLabel: '도덕적 행동 (실제 행동)',
    section: 'actual_behavior',
    text: '최근 7일 동안 발생한 쓰레기를 올바르게 분리배출한 비율은 어느 정도입니까?',
    options: [
      { label: '전혀 안 함 (0%)', value: 1 },
      { label: '25% 미만', value: 2 },
      { label: '50% 정도', value: 3 },
      { label: '75% 이상', value: 4 },
      { label: '100% 항상 올바르게 함', value: 5 }
    ]
  },
  {
    id: 23,
    component: 'action',
    componentLabel: '도덕적 행동 (실제 행동)',
    section: 'actual_behavior',
    text: '최근 7일 동안 쓰지 않는 전등을 끄거나 플러그를 뽑아 전기를 절약한 빈도는 어떠합니까?',
    options: [
      { label: '전혀 안 함', value: 1 },
      { label: '가끔 실천', value: 2 },
      { label: '보통', value: 3 },
      { label: '자주 실천', value: 4 },
      { label: '항상 철저히 실천', value: 5 }
    ]
  },
  {
    id: 24,
    component: 'action',
    componentLabel: '도덕적 행동 (실제 행동)',
    section: 'actual_behavior',
    text: '최근 7일 동안 일회용 비닐봉투나 일회용 용기 사용을 줄이려 노력했습니까?',
    options: [
      { label: '전혀 안 함', value: 1 },
      { label: '거의 노력 안 함', value: 2 },
      { label: '보통', value: 3 },
      { label: '노력함', value: 4 },
      { label: '매우 적극적으로 노력함', value: 5 }
    ]
  },
  {
    id: 25,
    component: 'action',
    componentLabel: '도덕적 행동 (실제 행동)',
    section: 'actual_behavior',
    text: '최근 7일 동안 급식이나 식사 시 음식물을 남기지 않고 다 먹으려 노력했습니까?',
    options: [
      { label: '전혀 안 함', value: 1 },
      { label: '거의 노력 안 함', value: 2 },
      { label: '보통', value: 3 },
      { label: '노력함', value: 4 },
      { label: '매 끼니 철저히 노력함', value: 5 }
    ]
  },
  {
    id: 26,
    component: 'action',
    componentLabel: '도덕적 행동 (실제 행동)',
    section: 'actual_behavior',
    text: '최근 7일 동안 가까운 거리는 걸어가거나 대중교통을 이용하려 노력했습니까?',
    options: [
      { label: '전혀 안 함', value: 1 },
      { label: '거의 노력 안 함', value: 2 },
      { label: '보통', value: 3 },
      { label: '자주 실천', value: 4 },
      { label: '항상 실천', value: 5 },
      { label: '최근 7일간 이동할 기회/상황이 없었음', value: 0, isNoOpportunity: true }
    ]
  },
  {
    id: 27,
    component: 'action',
    componentLabel: '도덕적 행동 (실제 행동)',
    section: 'actual_behavior',
    text: '최근 7일 동안 세수나 양치 시 물을 틀어놓지 않고 절약하여 사용했습니까?',
    options: [
      { label: '전혀 안 함', value: 1 },
      { label: '거의 노력 안 함', value: 2 },
      { label: '보통', value: 3 },
      { label: '자주 절약함', value: 4 },
      { label: '항상 절약함', value: 5 }
    ]
  },
  {
    id: 28,
    component: 'action',
    componentLabel: '도덕적 행동 (실제 행동)',
    section: 'actual_behavior',
    text: '최근 7일 동안 주변 친구가 쓰레기를 무단 투기하거나 환경을 오염시킬 때 조언하거나 도운 적이 있습니까?',
    options: [
      { label: '전혀 없음', value: 1 },
      { label: '거의 없음', value: 2 },
      { label: '1회 정도 있음', value: 3 },
      { label: '2~3회 있음', value: 4 },
      { label: '적극적으로 조언하고 함께 해결함', value: 5 },
      { label: '그런 상황을 접할 기회가 없었음', value: 0, isNoOpportunity: true }
    ]
  }
];

export const COMPONENT_DESCRIPTIONS: Record<string, string> = {
  sensitivity: '기후위기와 환경 오염 문제, 그리고 나의 선택이 생태계·타인·미래세대에 미치는 부정적 영향을 민감하게 포착하고 도덕적 이슈로 인지하는 능력입니다.',
  judgment: '편리함, 비용, 환경적 책임 간의 충돌 상황에서 무엇이 더 정당하고 정의로운지 합리적으로 판단하고 윤리적 기준을 세우는 능력입니다.',
  motivation: '타인의 시선이나 편의적 유혹에 흔들리지 않고 환경적 도덕 가치를 최우선 순위로 세우며 자부심을 갖는 의지입니다.',
  action: '일상 속 텀블러 지참, 잔반 제로, 분리배출, 유혹 상황 극복 등 실제 환경 보호 행동을 끈기 있게 실행하는 실천력입니다.'
};

export const LEARNING_ACTIVITIES: Record<ActivityType, LearningActivityInfo> = {
  sensitivity: {
    id: 'sensitivity',
    title: '2050 지구 미래 섹터별 기사 조사 & 영향받는 존재 지도',
    componentLabel: '도덕적 민감성',
    description: '교사 안내에 따라 2050 지구 미래 기사를 조사하고 영향받는 존재 지도를 완성한 후, 제출 링크와 소감을 입력하세요.',
    q1Prompt: '교육 활동 결과물 공유 링크 (URL)',
    q1Placeholder: '예: https://padlet.com/... (패들렛, 구글 드라이브, 노션 등의 결과물 공유 링크를 입력하세요)',
    q2Prompt: '활동 성찰 및 소감 (느낀 점 및 배운 점)',
    q2Placeholder: '활동을 수행하며 영향받는 존재들의 관점에서 느껴진 감정과 새롭게 깨달은 민감성을 작성해보세요.'
  },
  judgment: {
    id: 'judgment',
    title: 'Survive the Century 윤리적 의사결정 게임 & 판단',
    componentLabel: '도덕적 판단',
    description: '교사 안내에 따라 기후위기 시뮬레이션 게임을 진행하고 윤리적 판단 결과를 완성한 후, 제출 링크와 소감을 입력하세요.',
    q1Prompt: '교육 활동 결과물 공유 링크 (URL)',
    q1Placeholder: '예: https://... (게임 결과 캡처 이미지 공유 링크 또는 활동 제출 URL을 입력하세요)',
    q2Prompt: '활동 성찰 및 소감 (느낀 점 및 배운 점)',
    q2Placeholder: '시뮬레이션 선택 과정에서 단기 편의와 장기 생태 책임 사이에서 판단하며 느낀 도덕적 성찰을 작성해보세요.'
  },
  motivation: {
    id: 'motivation',
    title: '환경 도덕 가치 전달 카드뉴스 제작',
    componentLabel: '도덕적 동기화',
    description: '교사 안내에 따라 환경 도덕 가치를 알리는 카드뉴스를 제작한 후, 제출 링크와 소감을 입력하세요.',
    q1Prompt: '교육 활동 결과물 공유 링크 (URL)',
    q1Placeholder: '예: https://canva.com/... (캔바, 카드뉴스 공유 링크 또는 게시판 URL을 입력하세요)',
    q2Prompt: '활동 성찰 및 소감 (느낀 점 및 배운 점)',
    q2Placeholder: '카드뉴스를 직접 기획하고 제작하면서 강화된 나 자신의 환경 윤리적 실천 의지와 다짐을 작성해보세요.'
  },
  action: {
    id: 'action',
    title: '일상 속 실천 가능 환경 행동 기록 및 도전',
    componentLabel: '도덕적 행동',
    description: '교사 안내에 따라 일상 속 환경 실천 활동 및 도전 기록을 작성한 후, 제출 링크와 소감을 입력하세요.',
    q1Prompt: '교육 활동 결과물 공유 링크 (URL)',
    q1Placeholder: '예: https://... (실천 인증 사진, 도전자료 공유 링크 또는 게시판 URL을 입력하세요)',
    q2Prompt: '활동 성찰 및 소감 (느낀 점 및 배운 점)',
    q2Placeholder: '일상 속 환경 행동을 직접 실천하고 장애물을 극복해 나가며 느껴진 보람과 연속 실천 다짐을 작성해보세요.'
  }
};

/**
 * Calculates component average scores (1.0 to 5.0 rounded to 1 decimal place)
 */
export function calculateComponentScores(answers: Record<number, number>): ComponentScores {
  const getAdjustedScore = (question: AssessmentQuestion): number | null => {
    const rawVal = answers[question.id];
    if (rawVal === undefined || rawVal === null) return null;
    if (rawVal === 0) return null; // 기회 없었음(0점)은 평균 계산 제외

    if (question.isReverse) {
      return 6 - rawVal; // 1->5, 2->4, 3->3, 4->2, 5->1
    }
    return rawVal;
  };

  const getCompAvg = (questions: AssessmentQuestion[]): number => {
    const validScores: number[] = [];
    for (const q of questions) {
      const score = getAdjustedScore(q);
      if (score !== null && score > 0) {
        validScores.push(score);
      }
    }
    if (validScores.length === 0) return 0;
    const sum = validScores.reduce((a, b) => a + b, 0);
    return Math.round((sum / validScores.length) * 10) / 10;
  };

  const sensitivityQs = ASSESSMENT_QUESTIONS.filter(q => q.component === 'sensitivity');
  const judgmentQs = ASSESSMENT_QUESTIONS.filter(q => q.component === 'judgment');
  const motivationQs = ASSESSMENT_QUESTIONS.filter(q => q.component === 'motivation');
  const actionQs = ASSESSMENT_QUESTIONS.filter(q => q.component === 'action');

  return {
    sensitivity: getCompAvg(sensitivityQs),
    judgment: getCompAvg(judgmentQs),
    motivation: getCompAvg(motivationQs),
    action: getCompAvg(actionQs)
  };
}

/**
 * Finds lowest component to recommend
 */
export function getRecommendedActivity(scores: ComponentScores): ActivityType {
  const components: ActivityType[] = ['sensitivity', 'judgment', 'motivation', 'action'];
  let minComp = components[0];
  let minScore = scores[minComp];

  for (const comp of components) {
    if (scores[comp] < minScore) {
      minScore = scores[comp];
      minComp = comp;
    }
  }

  return minComp;
}
