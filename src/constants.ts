import { AssessmentQuestion, LearningActivityInfo, ComponentScores, ActivityType } from './types';

export const DEFAULT_SCENARIO = {
  id: 'SCENARIO_FESTIVAL_01',
  title: '학교 축제 일회용품 vs 다회용기 사용 딜레마',
  description: `학교 축제에서 일회용 컵과 접시를 사용하면 준비가 편리하고 비용도 적게 듭니다. 반면 다회용기를 사용하면 설거지와 반납 관리가 필요해 번거롭지만 쓰레기를 획기적으로 줄일 수 있습니다. 학생회는 축제 부스에서 어떤 방식을 선택할지 열띤 논의를 진행하고 있습니다.`
};

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // 도덕적 민감성 (Moral Sensitivity)
  {
    id: 1,
    component: 'sensitivity',
    componentLabel: '도덕적 민감성',
    text: '일상생활에서 기후위기와 환경 오염 문제가 나, 이웃, 주변 생태계에 미칠 위험을 쉽게 감지할 수 있다.'
  },
  {
    id: 2,
    component: 'sensitivity',
    componentLabel: '도덕적 민감성',
    text: '나의 편리를 위한 행동 선택이 청소 노동자, 야생 동식물, 미래 세대 등 영향받는 존재들에게 미칠 부정적 결과를 주의 깊게 살펴본다.'
  },
  {
    id: 3,
    component: 'sensitivity',
    componentLabel: '도덕적 민감성',
    text: '기후위기와 환경 오염 문제가 단순한 개인 취향이나 불편의 문제를 넘어, 우리 공동체가 해결해야 할 핵심 도덕적 이슈임을 인지한다.'
  },

  // 도덕적 판단 (Moral Judgment)
  {
    id: 4,
    component: 'judgment',
    componentLabel: '도덕적 판단',
    text: '당장의 편리함이나 경제적 이익보다 환경 보전과 생태적 책임을 우선하는 것이 도덕적으로 타당하다고 본다.'
  },
  {
    id: 5,
    component: 'judgment',
    componentLabel: '도덕적 판단',
    text: '환경을 보호하기 위해 다소의 번거로움과 비용을 감수하는 것이 정의롭고 지속가능한 선택임을 합리적으로 판단할 수 있다.'
  },
  {
    id: 6,
    component: 'judgment',
    componentLabel: '도덕적 판단',
    text: '단기적 편의와 장기적 지속가능 가치 사이에서 무엇이 올바른 방향인지 객관적 윤리 기준으로 구분한다.'
  },

  // 도덕적 동기화 (Moral Motivation)
  {
    id: 7,
    component: 'motivation',
    componentLabel: '도덕적 동기화',
    text: '주변의 다수 사람들이 환경 파괴적 행동을 편하게 하더라도, 나 스스로 환경 가치를 최우선으로 두고 실천하려는 내적 의지가 있다.'
  },
  {
    id: 8,
    component: 'motivation',
    componentLabel: '도덕적 동기화',
    text: '환경 보호를 실천하는 과정에서 약간의 불편함이나 유혹이 생겨도 도덕적 자부심과 양심을 지키고자 노력한다.'
  },
  {
    id: 9,
    component: 'motivation',
    componentLabel: '도덕적 동기화',
    text: '나의 작은 환경 실천이 우리 학교와 사회의 도덕적 수준을 높이는 데 기여한다는 강한 책임감과 보람을 느낀다.'
  },

  // 도덕적 행동 (Moral Action)
  {
    id: 10,
    component: 'action',
    componentLabel: '도덕적 행동',
    text: '일상생활에서 텀블러/다회용기 지참, 분리배출, 에너지 절약 등을 실제로 지속해서 실천한다.'
  },
  {
    id: 11,
    component: 'action',
    componentLabel: '도덕적 행동',
    text: '올바른 쓰레기 분리수거, 자원 재활용 및 환경 보호 수칙을 끝까지 철저히 이행한다.'
  },
  {
    id: 12,
    component: 'action',
    componentLabel: '도덕적 행동',
    text: '주변 사람들이 환경 오염 행동을 할 때 환경 보전 행동을 친절하게 제안하고 함께 실천하도록 이끈다.'
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
  const getAvg = (qIds: number[]) => {
    const vals = qIds.map(id => answers[id] || 0).filter(v => v > 0);
    if (vals.length === 0) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  };

  return {
    sensitivity: getAvg([1, 2, 3]),
    judgment: getAvg([4, 5, 6]),
    motivation: getAvg([7, 8, 9]),
    action: getAvg([10, 11, 12])
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
