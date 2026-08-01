import { collection, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, ensureFirebaseAuth, isFirebaseConfigured } from './firebase';

export interface FirestoreStudentData {
  submission_id: string;
  student_code: string;
  step: number;
  preAnswers?: Record<number, number>;
  preScores?: { sensitivity: number; judgment: number; motivation: number; action: number };
  recommendedActivityId?: string;
  selectedActivityId?: string;
  reflectionAnswer1?: string;
  reflectionAnswer2?: string;
  actionGoal?: string;
  actionIfThen?: string;
  postAnswers?: Record<number, number>;
  postScores?: { sensitivity: number; judgment: number; motivation: number; action: number };
  updatedAt?: unknown;
}

export type FirestoreResult = {
  success: boolean;
  skipped?: boolean;
  error?: string;
};

function friendlyFirebaseError(error: unknown): string {
  const value = error as { code?: string; message?: string };
  if (value?.code === 'auth/operation-not-allowed') {
    return 'Firebase Console에서 익명 로그인을 활성화해 주세요.';
  }
  if (value?.code === 'permission-denied' || value?.code === 'firestore/permission-denied') {
    return 'Firestore 보안 규칙이 로그인을 마친 사용자의 submissions 접근을 허용하지 않습니다.';
  }
  if (value?.code === 'auth/unauthorized-domain') {
    return 'Firebase Authentication 승인 도메인에 현재 Netlify 도메인을 추가해 주세요.';
  }
  return value?.message || String(error);
}

function removeUndefinedFields<T extends Record<string, any>>(obj: T): Record<string, any> {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && value.constructor === Object) {
        cleaned[key] = removeUndefinedFields(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

export async function saveStudentSubmissionToFirestore(data: FirestoreStudentData): Promise<FirestoreResult> {
  if (!isFirebaseConfigured || !db) return { success: true, skipped: true };
  if (!data.submission_id) return { success: false, error: '제출 ID가 없습니다.' };

  try {
    const ownerUid = await ensureFirebaseAuth();
    const payload = removeUndefinedFields({
      ...data,
      ownerUid,
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'submissions', data.submission_id), payload, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Firestore 저장 실패:', error);
    return { success: false, error: friendlyFirebaseError(error) };
  }
}

export async function getSubmissionsFromFirestore(): Promise<FirestoreStudentData[]> {
  if (!isFirebaseConfigured || !db) return [];

  try {
    await ensureFirebaseAuth();
    const snapshot = await getDocs(query(collection(db, 'submissions'), orderBy('updatedAt', 'desc')));
    return snapshot.docs.map((item) => item.data() as FirestoreStudentData);
  } catch (error) {
    console.error('Firestore 조회 실패:', friendlyFirebaseError(error));
    return [];
  }
}
