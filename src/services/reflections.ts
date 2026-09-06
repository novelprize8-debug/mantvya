import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { ReflectionDoc, RealityCheckBreakdown, StructuredSummary } from '../types';

/**
 * Recursively removes all `undefined` values from an object or array.
 * Retains meaningful falsy values: false, 0, "", [], and valid non-undefined values.
 * In Firestore, `undefined` causes "Function setDoc() called with invalid data. Unsupported field value: undefined".
 */
export function sanitizeForFirestore<T>(val: T): T {
  if (val === undefined) {
    return undefined as unknown as T;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (val instanceof Date) {
    return val as unknown as T;
  }
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(val)) {
    if (value !== undefined) {
      const cleaned = sanitizeForFirestore(value);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
  }
  return result as T;
}

/**
 * Normalizes a RealityCheckBreakdown to ensure all five categories exist as safe string arrays.
 */
function normalizeRealityCheck(rc: any): RealityCheckBreakdown | null {
  if (!rc || typeof rc !== 'object') return null;
  return {
    facts: Array.isArray(rc.facts) ? rc.facts.filter((s: any) => typeof s === 'string') : [],
    interpretations: Array.isArray(rc.interpretations) ? rc.interpretations.filter((s: any) => typeof s === 'string') : [],
    assumptions: Array.isArray(rc.assumptions) ? rc.assumptions.filter((s: any) => typeof s === 'string') : [],
    withinControl: Array.isArray(rc.withinControl) ? rc.withinControl.filter((s: any) => typeof s === 'string') : [],
    outsideControl: Array.isArray(rc.outsideControl) ? rc.outsideControl.filter((s: any) => typeof s === 'string') : [],
  };
}

/**
 * Prepares and sanitizes a ReflectionDoc before persisting to Firestore.
 * - Enforces zero-trust: ensures document userId matches authenticated user.
 * - Provides safe defaults for required fields.
 * - Omits optional fields when undefined, null, or empty to strictly adhere to firestore.rules.
 * - Recursively strips any remaining `undefined` values.
 */
export function normalizeReflectionDocForSave(reflection: ReflectionDoc, verifiedUserId: string): Record<string, any> {
  const payload: Record<string, any> = {
    id: reflection.id,
    userId: verifiedUserId, // Always bind to verified authenticated user
    title: (reflection.title || 'Untitled Reflection').slice(0, 200),
    mode: reflection.mode || 'understand',
    status: reflection.status || 'active',
    createdAt: reflection.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: Array.isArray(reflection.messages)
      ? reflection.messages.map((m, idx) => {
          const msgObj: Record<string, any> = {
            id: m.id || `msg_${Date.now()}_${idx}`,
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: typeof m.content === 'string' ? m.content : '',
            timestamp: m.timestamp || new Date().toISOString(),
          };

          if (m.stageLabel && typeof m.stageLabel === 'string') {
            msgObj.stageLabel = m.stageLabel;
          }
          if (m.agencyPrompt && typeof m.agencyPrompt === 'string') {
            msgObj.agencyPrompt = m.agencyPrompt;
          }
          if (m.widerLens && typeof m.widerLens === 'string' && m.widerLens.trim()) {
            msgObj.widerLens = m.widerLens.trim();
          }
          if (m.tensionLens && typeof m.tensionLens === 'string' && m.tensionLens.trim()) {
            msgObj.tensionLens = m.tensionLens.trim();
          }
          if (m.complexityCheck && typeof m.complexityCheck === 'string' && m.complexityCheck.trim()) {
            msgObj.complexityCheck = m.complexityCheck.trim();
          }
          const normalizedMsgRC = normalizeRealityCheck(m.realityCheck);
          if (normalizedMsgRC) {
            msgObj.realityCheck = normalizedMsgRC;
          }
          return msgObj;
        })
      : [],
  };

  if (typeof reflection.initialPrompt === 'string' && reflection.initialPrompt.trim()) {
    payload.initialPrompt = reflection.initialPrompt.trim();
  }
  if (typeof reflection.widerLens === 'string' && reflection.widerLens.trim()) {
    payload.widerLens = reflection.widerLens.trim();
  }
  if (typeof reflection.tensionLens === 'string' && reflection.tensionLens.trim()) {
    payload.tensionLens = reflection.tensionLens.trim();
  }
  if (typeof reflection.complexityCheck === 'string' && reflection.complexityCheck.trim()) {
    payload.complexityCheck = reflection.complexityCheck.trim();
  }

  const normalizedTopRC = normalizeRealityCheck(reflection.realityCheck);
  if (normalizedTopRC) {
    payload.realityCheck = normalizedTopRC;
  }

  if (reflection.structuredSummary && typeof reflection.structuredSummary === 'object') {
    payload.structuredSummary = {
      title: reflection.structuredSummary.title || payload.title,
      whatHappened: reflection.structuredSummary.whatHappened || '',
      whatInitiallyThought: reflection.structuredSummary.whatInitiallyThought || '',
      whatMayHaveAssumed: reflection.structuredSummary.whatMayHaveAssumed || '',
      widerLens: reflection.structuredSummary.widerLens || '',
      whatBecameClearer: reflection.structuredSummary.whatBecameClearer || '',
      whatLearned: reflection.structuredSummary.whatLearned || '',
      whatCanChange: reflection.structuredSummary.whatCanChange || '',
      whatToRemember: reflection.structuredSummary.whatToRemember || '',
      before: reflection.structuredSummary.before || '',
      now: reflection.structuredSummary.now || '',
    };
  }

  // Final recursive sanitization pass to eliminate any nested undefined values
  return sanitizeForFirestore(payload);
}

/**
 * Hydrates raw Firestore document snapshot data into a strictly typed ReflectionDoc with safe defaults.
 */
export function normalizeReflectionDocFromFirestore(raw: any): ReflectionDoc {
  return {
    id: raw.id || '',
    userId: raw.userId || '',
    title: raw.title || 'Untitled Reflection',
    mode: raw.mode || 'understand',
    status: raw.status || 'active',
    initialPrompt: raw.initialPrompt || '',
    messages: Array.isArray(raw.messages)
      ? raw.messages.map((m: any, idx: number) => ({
          id: m.id || `msg_${Date.now()}_${idx}`,
          role: m.role || 'user',
          content: m.content || '',
          timestamp: m.timestamp || new Date().toISOString(),
          stageLabel: m.stageLabel || null,
          realityCheck: normalizeRealityCheck(m.realityCheck),
          widerLens: m.widerLens || null,
          tensionLens: m.tensionLens || null,
          complexityCheck: m.complexityCheck || null,
          agencyPrompt: m.agencyPrompt || null,
        }))
      : [],
    realityCheck: normalizeRealityCheck(raw.realityCheck),
    widerLens: raw.widerLens || null,
    tensionLens: raw.tensionLens || null,
    complexityCheck: raw.complexityCheck || null,
    structuredSummary: raw.structuredSummary || null,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

export function subscribeToUserReflections(
  userId: string,
  onUpdate: (reflections: ReflectionDoc[]) => void,
  onError?: (err: any) => void
) {
  // Ensure we are operating with the verified authenticated user
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== userId) {
    const error = new Error('Unauthorized: Cannot subscribe to reflections of an unauthenticated or mismatched user.');
    if (onError) onError(error);
    return () => {};
  }

  const collectionPath = `users/${userId}/reflections`;
  try {
    const q = query(
      collection(db, 'users', userId, 'reflections'),
      orderBy('updatedAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const docs: ReflectionDoc[] = [];
        snapshot.forEach((docSnap) => {
          docs.push(normalizeReflectionDocFromFirestore(docSnap.data()));
        });
        onUpdate(docs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
    return () => {};
  }
}

export async function saveReflectionDoc(userId: string, reflection: ReflectionDoc): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== userId) {
    throw new Error('Unauthorized: Authentication required to save reflection data.');
  }

  const path = `users/${userId}/reflections/${reflection.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'reflections', reflection.id);
    const sanitizedPayload = normalizeReflectionDocForSave(reflection, currentUid);
    await setDoc(docRef, sanitizedPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function fetchReflectionDoc(userId: string, reflectionId: string): Promise<ReflectionDoc | null> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== userId) {
    return null;
  }

  const path = `users/${userId}/reflections/${reflectionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'reflections', reflectionId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return null;
    }
    return normalizeReflectionDocFromFirestore(snap.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function deleteReflectionDoc(userId: string, reflectionId: string): Promise<void> {
  const currentUid = auth.currentUser?.uid;
  if (!currentUid || currentUid !== userId) {
    throw new Error('Unauthorized: Cannot delete reflection of another user.');
  }

  const path = `users/${userId}/reflections/${reflectionId}`;
  try {
    const docRef = doc(db, 'users', userId, 'reflections', reflectionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    throw error;
  }
}

