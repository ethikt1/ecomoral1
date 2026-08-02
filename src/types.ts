/**
 * EcoMoral Lab Data Types
 */

export type RestComponent = 'sensitivity' | 'judgment' | 'motivation' | 'action';

export interface AssessmentQuestionOption {
  label: string;
  value: number;
  isNoOpportunity?: boolean; // 기회 없었음 옵션 여부
}

export interface AssessmentQuestion {
  id: number;
  component: RestComponent;
  componentLabel: string;
  text: string;
  isReverse?: boolean;
  section?: 'attitude' | 'actual_behavior';
  options?: AssessmentQuestionOption[];
  subLabel?: string;
}

export interface ComponentScores {
  sensitivity: number;
  judgment: number;
  motivation: number;
  action: number;
}

export type ActivityType = 'sensitivity' | 'judgment' | 'motivation' | 'action';

export interface LearningActivityInfo {
  id: ActivityType;
  title: string;
  componentLabel: string;
  description: string;
  q1Prompt: string;
  q1Placeholder: string;
  q2Prompt: string;
  q2Placeholder: string;
}

export interface StudentSession {
  submission_id: string;
  student_number?: string; // 학번 (예: 10101)
  student_name?: string;   // 이름 (예: 홍길동)
  student_code: string;    // 학번 + 이름 (예: 10101 홍길동)
  scenario_id: string;
  scenario_title: string;
  started_at: string;
  completed_at?: string;
  consent_checked: boolean;
  status: 'IN_PROGRESS' | 'COMPLETED';
  step: number; // 1 to 10
  attempt_number: number;
  
  // Pre-assessment
  preAnswers: Record<number, number>; // qId -> 1..5
  preScores?: ComponentScores;
  
  // Learning Activity
  recommendedActivity?: ActivityType;
  selectedActivity?: ActivityType;
  reflectionAnswer1?: string;
  reflectionAnswer2?: string;
  
  // Action Plan
  ifPlan?: string;
  thenPlan?: string;
  
  // Post-assessment
  postAnswers: Record<number, number>; // qId -> 1..5
  postScores?: ComponentScores;
}

export interface CombinedExportRecord {
  submission_id: string;
  student_code: string;
  scenario_id: string;
  started_at: string;
  completed_at: string;
  attempt_number: number;
  
  sensitivity_pre: number;
  judgment_pre: number;
  motivation_pre: number;
  action_pre: number;
  
  recommended_activity: string;
  selected_activity: string;
  reflection_answer_1: string;
  reflection_answer_2: string;
  if_plan: string;
  then_plan: string;
  
  sensitivity_post: number;
  judgment_post: number;
  motivation_post: number;
  action_post: number;
  
  sensitivity_gain: number;
  judgment_gain: number;
  motivation_gain: number;
  action_gain: number;
  
  data_source: 'ACTUAL' | 'SYNTHETIC';
}

export interface DashboardData {
  dataSource: 'ACTUAL' | 'SYNTHETIC';
  totalSubmissions: number;
  completedCount: number;
  completionRate: number;
  
  preAverages: ComponentScores;
  postAverages: ComponentScores;
  averageGains: ComponentScores;
  
  recommendedDistribution: Record<ActivityType, number>;
  selectedDistribution: Record<ActivityType, number>;
  matchRate: number; // % where recommended === selected
  
  records: CombinedExportRecord[];
}

export interface DashboardFilters {
  scenarioId?: string;
  completedOnly?: boolean;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
