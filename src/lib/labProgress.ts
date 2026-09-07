// Progreso del alumno en MODELTEX LAB. Sin cuenta: vive en localStorage
// (mismo criterio que el carrito, CartContext.tsx — cero fricción para
// empezar el curso). Con cuenta: vive en la tabla lab_progress (RLS: cada
// usuario solo ve/edita sus propias filas). Al iniciar sesión se migra una
// sola vez lo guardado en localStorage hacia la tabla y se limpia el local.

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../contexts/AuthContext';

const LOCAL_KEY = 'modeltex_lab_progress';

interface LocalProgressEntry {
  lessonId: string;
  courseId: string;
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  completed: boolean;
  exerciseDone: boolean;
  completedAt: string;
}

type ProgressMap = Record<string, LocalProgressEntry>; // key: lessonId

function readLocal(): ProgressMap {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeLocal(map: ProgressMap) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    /* best-effort */
  }
}

export interface MarkCompleteInput {
  lessonId: string;
  courseId: string;
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  exerciseDone?: boolean;
}

export function useLabProgress() {
  const { user } = useAuth();
  const [map, setMap] = useState<ProgressMap>(() => readLocal());
  const migrated = useRef(false);

  // Migración única: al detectar sesión, sube el progreso local a Supabase,
  // trae el progreso real del usuario y limpia el localStorage.
  useEffect(() => {
    if (!user || migrated.current) return;
    migrated.current = true;

    (async () => {
      try {
        const local = readLocal();
        const localEntries = Object.values(local);

        if (localEntries.length > 0) {
          const rows = localEntries.map((e) => ({
            user_id: user.id,
            course_id: e.courseId,
            lesson_id: e.lessonId,
            completed: e.completed,
            exercise_done: e.exerciseDone,
            completed_at: e.completedAt,
          }));
          await supabase.from('lab_progress').upsert(rows, { onConflict: 'user_id,lesson_id' });
        }

        const { data, error } = await supabase
          .from('lab_progress')
          .select('lesson_id, course_id, completed, exercise_done, completed_at')
          .eq('user_id', user.id);

        if (!error && data) {
          // El servidor no guarda course_slug/module_slug/lesson_slug (no
          // hacen falta para RLS); se completan desde lo que ya teníamos en
          // local cuando exista, y si no, quedan vacíos (no afecta el cálculo
          // de progreso, solo el link directo de "continuar").
          const merged: ProgressMap = {};
          for (const row of data) {
            const prevLocal = local[row.lesson_id];
            merged[row.lesson_id] = {
              lessonId: row.lesson_id,
              courseId: row.course_id,
              courseSlug: prevLocal?.courseSlug || '',
              moduleSlug: prevLocal?.moduleSlug || '',
              lessonSlug: prevLocal?.lessonSlug || '',
              completed: row.completed,
              exerciseDone: row.exercise_done,
              completedAt: row.completed_at,
            };
          }
          setMap(merged);
        }

        writeLocal({});
      } catch (err) {
        console.error('lab progress migration', err);
      }
    })();
  }, [user]);

  const markComplete = useCallback(
    async (input: MarkCompleteInput) => {
      const entry: LocalProgressEntry = {
        lessonId: input.lessonId,
        courseId: input.courseId,
        courseSlug: input.courseSlug,
        moduleSlug: input.moduleSlug,
        lessonSlug: input.lessonSlug,
        completed: true,
        exerciseDone: input.exerciseDone ?? false,
        completedAt: new Date().toISOString(),
      };

      setMap((prev) => {
        const next = { ...prev, [entry.lessonId]: entry };
        if (!user) writeLocal(next);
        return next;
      });

      if (user) {
        await supabase.from('lab_progress').upsert(
          [
            {
              user_id: user.id,
              course_id: entry.courseId,
              lesson_id: entry.lessonId,
              completed: true,
              exercise_done: entry.exerciseDone,
              completed_at: entry.completedAt,
            },
          ],
          { onConflict: 'user_id,lesson_id' },
        );
      }
    },
    [user],
  );

  const isComplete = useCallback((lessonId: string) => !!map[lessonId]?.completed, [map]);

  const courseProgress = useCallback(
    (courseSlug: string, lessonIds: string[]) => {
      const completed = lessonIds.filter((id) => map[id]?.completed);
      const entries = Object.values(map)
        .filter((e) => e.courseSlug === courseSlug)
        .sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));
      const last = entries[0];
      return {
        courseSlug,
        completedLessonIds: completed,
        totalLessons: lessonIds.length,
        percent: lessonIds.length > 0 ? Math.round((completed.length / lessonIds.length) * 100) : 0,
        lastLessonSlug: last?.lessonSlug,
        lastModuleSlug: last?.moduleSlug,
      };
    },
    [map],
  );

  return { markComplete, isComplete, courseProgress };
}
