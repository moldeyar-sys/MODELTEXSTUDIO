import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { LabCourseForm } from './LabCourseForm';
import { LabModuleForm } from './LabModuleForm';
import { LabLessonForm } from './LabLessonForm';
import { LabGlossaryAdmin } from './LabGlossaryAdmin';
import type { LabCourse, LabLesson, LabModule } from '../../../lib/labTypes';

type PanelTab = 'cursos' | 'glosario';

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {status === 'published' ? 'Publicado' : 'Borrador'}
    </span>
  );
}

export function LabAdminPanel() {
  const [tab, setTab] = useState<PanelTab>('cursos');
  const [courses, setCourses] = useState<LabCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [editingCourse, setEditingCourse] = useState<LabCourse | null | undefined>(undefined);
  const [selectedCourse, setSelectedCourse] = useState<LabCourse | null>(null);

  const [modules, setModules] = useState<LabModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [editingModule, setEditingModule] = useState<LabModule | null | undefined>(undefined);
  const [selectedModule, setSelectedModule] = useState<LabModule | null>(null);

  const [lessons, setLessons] = useState<LabLesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LabLesson | null | undefined>(undefined);

  const [embedding, setEmbedding] = useState(false);
  const [embedResult, setEmbedResult] = useState('');

  const loadCourses = () => {
    setLoadingCourses(true);
    supabase
      .from('lab_courses')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setCourses((data as LabCourse[]) || []);
        setLoadingCourses(false);
      });
  };
  useEffect(loadCourses, []);

  const loadModules = (courseId: string) => {
    setLoadingModules(true);
    supabase
      .from('lab_modules')
      .select('*')
      .eq('course_id', courseId)
      .order('level_order', { ascending: true })
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setModules((data as LabModule[]) || []);
        setLoadingModules(false);
      });
  };

  const loadLessons = (moduleId: string) => {
    setLoadingLessons(true);
    supabase
      .from('lab_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setLessons((data as LabLesson[]) || []);
        setLoadingLessons(false);
      });
  };

  const removeCourse = async (id: string) => {
    if (!confirm('¿Eliminar este curso? Se eliminan también sus módulos y clases.')) return;
    await supabase.from('lab_courses').delete().eq('id', id);
    loadCourses();
  };
  const removeModule = async (id: string) => {
    if (!confirm('¿Eliminar este módulo? Se eliminan también sus clases.')) return;
    await supabase.from('lab_modules').delete().eq('id', id);
    if (selectedCourse) loadModules(selectedCourse.id);
  };
  const removeLesson = async (id: string) => {
    if (!confirm('¿Eliminar esta clase?')) return;
    await supabase.from('lab_lessons').delete().eq('id', id);
    if (selectedModule) loadLessons(selectedModule.id);
  };

  const runEmbeddings = async () => {
    setEmbedding(true);
    setEmbedResult('');
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/embed-lab-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
      });
      const data = await res.json();
      setEmbedResult(data.error ? `Error: ${data.error}` : `Listo: ${data.processed} fragmentos indexados.`);
    } catch {
      setEmbedResult('Error de conexión.');
    } finally {
      setEmbedding(false);
    }
  };

  // ==================== Vista: clase (dentro de módulo) ====================
  if (selectedCourse && selectedModule) {
    return (
      <div>
        <button
          onClick={() => setSelectedModule(null)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> {selectedModule.title}
        </button>

        {editingLesson !== undefined ? (
          <LabLessonForm
            moduleId={selectedModule.id}
            lesson={editingLesson}
            onClose={() => {
              setEditingLesson(undefined);
              loadLessons(selectedModule.id);
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Clases de "{selectedModule.title}"</h3>
              <button onClick={() => setEditingLesson(null)} className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Nueva clase
              </button>
            </div>
            {loadingLessons ? (
              <p className="text-sm text-gray-400">Cargando...</p>
            ) : lessons.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no hay clases en este módulo.</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((l) => (
                  <div key={l.id} className="card p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">{l.title}</p>
                      <StatusBadge status={l.status} />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {l.status === 'published' && (
                        <a
                          href={`/lab/${selectedCourse.slug}/${selectedModule.slug}/${l.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-primary-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button onClick={() => setEditingLesson(l)} className="p-2 text-gray-400 hover:text-primary-700"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => removeLesson(l.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ==================== Vista: módulos (dentro de curso) ====================
  if (selectedCourse) {
    return (
      <div>
        <button
          onClick={() => setSelectedCourse(null)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Cursos
        </button>

        {editingModule !== undefined ? (
          <LabModuleForm
            courseId={selectedCourse.id}
            moduleItem={editingModule}
            onClose={() => {
              setEditingModule(undefined);
              loadModules(selectedCourse.id);
            }}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Módulos de "{selectedCourse.title}"</h3>
              <button onClick={() => setEditingModule(null)} className="btn-primary inline-flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> Nuevo módulo
              </button>
            </div>
            {loadingModules ? (
              <p className="text-sm text-gray-400">Cargando...</p>
            ) : modules.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no hay módulos en este curso.</p>
            ) : (
              <div className="space-y-2">
                {modules.map((m) => (
                  <div key={m.id} className="card p-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => {
                        setSelectedModule(m);
                        loadLessons(m.id);
                      }}
                      className="min-w-0 flex-1 text-left flex items-center gap-2"
                    >
                      {m.level_label && <span className="text-[11px] text-primary-500 font-bold flex-shrink-0">{m.level_label}</span>}
                      <p className="font-medium text-gray-900 truncate">{m.title}</p>
                      <StatusBadge status={m.status} />
                    </button>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setEditingModule(m)} className="p-2 text-gray-400 hover:text-primary-700"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => removeModule(m.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ==================== Vista raíz: tabs Cursos / Glosario ====================
  return (
    <div>
      <div className="flex items-center gap-2 mb-6 border-b border-gray-100">
        {(['cursos', 'glosario'] as PanelTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-primary-800 text-primary-800' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t === 'cursos' ? 'Cursos' : 'Glosario'}
          </button>
        ))}
      </div>

      {tab === 'glosario' ? (
        <LabGlossaryAdmin />
      ) : editingCourse !== undefined ? (
        <LabCourseForm
          course={editingCourse}
          onClose={() => {
            setEditingCourse(undefined);
            loadCourses();
          }}
        />
      ) : (
        <>
          <div className="card p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary-700" /> Tutor IA de MODELTEX LAB</p>
              <p className="text-sm text-gray-500 mt-1">Genera los embeddings del contenido publicado para que la IA pueda buscar por significado.</p>
              {embedResult && <p className="text-xs text-gray-500 mt-1">{embedResult}</p>}
            </div>
            <button onClick={runEmbeddings} disabled={embedding} className="btn-secondary inline-flex items-center gap-2 text-sm disabled:opacity-50 flex-shrink-0">
              {embedding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {embedding ? 'Generando...' : 'Generar embeddings del Lab'}
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Cursos</h3>
            <button onClick={() => setEditingCourse(null)} className="btn-primary inline-flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Nuevo curso
            </button>
          </div>
          {loadingCourses ? (
            <p className="text-sm text-gray-400">Cargando...</p>
          ) : courses.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no hay cursos. Creá el primero para que aparezca en /lab.</p>
          ) : (
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c.id} className="card p-4 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setSelectedCourse(c);
                      loadModules(c.id);
                    }}
                    className="min-w-0 flex-1 text-left flex items-center gap-2"
                  >
                    <p className="font-medium text-gray-900 truncate">{c.title}</p>
                    <StatusBadge status={c.status} />
                  </button>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {c.status === 'published' && (
                      <a href={`/lab/${c.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-primary-700">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => setEditingCourse(c)} className="p-2 text-gray-400 hover:text-primary-700"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => removeCourse(c.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
