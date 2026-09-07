import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';
import type { LabCourseWithContent } from '../../lib/labTypes';

interface Props {
  course: LabCourseWithContent;
  activeLessonId?: string;
  isComplete: (lessonId: string) => boolean;
}

export function LabSidebar({ course, activeLessonId, isComplete }: Props) {
  let lastLevel: string | null = null;

  return (
    <nav className="space-y-5">
      {course.modules.map((m) => {
        const showLevelHeading = m.level_label && m.level_label !== lastLevel;
        lastLevel = m.level_label || lastLevel;
        return (
          <div key={m.id}>
            {showLevelHeading && (
              <p className="text-[11px] font-bold uppercase tracking-wide text-primary-500 mb-2">{m.level_label}</p>
            )}
            <p className="text-sm font-semibold text-primary-900 mb-2">{m.title}</p>
            <ul className="space-y-1 mb-3">
              {m.lessons.map((l) => {
                const active = l.id === activeLessonId;
                const done = isComplete(l.id);
                return (
                  <li key={l.id}>
                    <Link
                      to={`/lab/${course.slug}/${m.slug}/${l.slug}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-primary-800 text-white font-medium'
                          : 'text-gray-600 hover:bg-primary-50 hover:text-primary-800'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${active ? 'text-green-300' : 'text-green-600'}`} />
                      ) : active ? (
                        <PlayCircle className="w-4 h-4 flex-shrink-0 text-white" />
                      ) : (
                        <Circle className="w-4 h-4 flex-shrink-0 text-gray-300" />
                      )}
                      <span className="truncate">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
