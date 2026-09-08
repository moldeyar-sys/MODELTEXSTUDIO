import { useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { Plus, Trash2, Upload, Loader2, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { uploadLabFile } from '../../../lib/storage';
import { GUIAS } from '../../../lib/guiasData';
import type { LabDevelopmentBlock, LabFaq, LabLesson, LabMistake, LabResource, LabResourceType } from '../../../lib/labTypes';

const RESOURCE_TYPES: { value: LabResourceType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Imagen' },
  { value: 'table', label: 'Tabla' },
  { value: 'link', label: 'Enlace' },
  { value: 'molde', label: 'Molde' },
  { value: 'cad', label: 'CAD' },
];

function blockToText(b: LabDevelopmentBlock) {
  return {
    h3: b.h3 || '',
    paragraphs: (b.paragraphs || []).join('\n'),
    bullets: (b.bullets || []).join('\n'),
    checkQuestion: b.check?.question || '',
    checkAnswer: b.check?.answer || '',
  };
}

export function LabLessonForm({
  moduleId,
  lesson,
  onClose,
}: {
  moduleId: string;
  lesson: LabLesson | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    slug: lesson?.slug || '',
    title: lesson?.title || '',
    objective: lesson?.objective || '',
    before_start: lesson?.before_start || '',
    concept: lesson?.concept || '',
    steps: lesson?.steps?.join('\n') || '',
    example: lesson?.example || '',
    modeltex_tip: lesson?.modeltex_tip || '',
    exercise_instructions: lesson?.exercise_instructions || '',
    summary: lesson?.summary || '',
    order_index: lesson?.order_index?.toString() || '0',
    status: lesson?.status || 'draft',
  });
  const [development, setDevelopment] = useState(
    lesson?.development?.length
      ? lesson.development.map(blockToText)
      : [{ h3: '', paragraphs: '', bullets: '', checkQuestion: '', checkAnswer: '' }],
  );
  const [mistakes, setMistakes] = useState<LabMistake[]>(lesson?.common_mistakes?.length ? lesson.common_mistakes : []);
  const [faqs, setFaqs] = useState<LabFaq[]>(lesson?.faqs?.length ? lesson.faqs : []);
  const [relatedGuides, setRelatedGuides] = useState<string[]>(lesson?.related_guide_slugs || []);
  const [resources, setResources] = useState<LabResource[]>([]);
  const [resourceType, setResourceType] = useState<LabResourceType>('pdf');
  const [uploadingResource, setUploadingResource] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lesson) return;
    supabase
      .from('lab_resources')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('order_index', { ascending: true })
      .then(({ data }) => setResources((data as LabResource[]) || []));
  }, [lesson]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleGuide = (slug: string) =>
    setRelatedGuides((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      module_id: moduleId,
      slug: form.slug.trim(),
      title: form.title,
      objective: form.objective,
      before_start: form.before_start,
      concept: form.concept,
      development: development
        .map((b) => ({
          h3: b.h3.trim() || undefined,
          paragraphs: b.paragraphs.split('\n').map((s) => s.trim()).filter(Boolean),
          bullets: b.bullets.split('\n').map((s) => s.trim()).filter(Boolean),
          check: b.checkQuestion.trim() && b.checkAnswer.trim() ? { question: b.checkQuestion.trim(), answer: b.checkAnswer.trim() } : undefined,
        }))
        .filter((b) => b.h3 || b.paragraphs.length > 0 || (b.bullets && b.bullets.length > 0)),
      steps: form.steps.split('\n').map((s) => s.trim()).filter(Boolean),
      example: form.example,
      common_mistakes: mistakes.filter((m) => m.mistake.trim() || m.fix.trim()),
      modeltex_tip: form.modeltex_tip,
      exercise_instructions: form.exercise_instructions,
      faqs: faqs.filter((f) => f.q.trim() || f.a.trim()),
      summary: form.summary,
      related_guide_slugs: relatedGuides,
      order_index: parseInt(form.order_index, 10) || 0,
      status: form.status,
      published_at: form.status === 'published' ? lesson?.published_at || new Date().toISOString() : lesson?.published_at || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error: err } = lesson
        ? await supabase.from('lab_lessons').update(payload).eq('id', lesson.id)
        : await supabase.from('lab_lessons').insert(payload);
      if (err) throw err;
      onClose();
    } catch (err) {
      setError(`Error al guardar: ${(err as { message?: string })?.message || 'desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  const addResource = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !lesson) return;
    setUploadingResource(true);
    try {
      const url = await uploadLabFile(file);
      const { data, error: err } = await supabase
        .from('lab_resources')
        .insert({ lesson_id: lesson.id, type: resourceType, title: file.name, url, order_index: resources.length })
        .select()
        .single();
      if (err) throw err;
      setResources((prev) => [...prev, data as LabResource]);
    } catch {
      setError('Error al subir el recurso.');
    } finally {
      setUploadingResource(false);
    }
  };

  const removeResource = async (id: string) => {
    await supabase.from('lab_resources').delete().eq('id', id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="card p-6 mb-6">
      <h3 className="font-semibold text-gray-900 text-lg mb-6">{lesson ? 'Editar clase' : 'Nueva clase'}</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Qué es la moldería" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (dentro del módulo) *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required className="input-field" placeholder="que-es-la-molderia" />
          </div>
        </div>

        <Field label="Qué vas a aprender (objetivo)">
          <textarea name="objective" value={form.objective} onChange={handleChange} rows={2} className="input-field resize-none" />
        </Field>
        <Field label="Antes de empezar">
          <textarea name="before_start" value={form.before_start} onChange={handleChange} rows={2} className="input-field resize-none" />
        </Field>
        <Field label="Concepto">
          <textarea name="concept" value={form.concept} onChange={handleChange} rows={2} className="input-field resize-none" />
        </Field>

        {/* Desarrollo: repeater de bloques */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Desarrollo (uno o más bloques)</label>
          <div className="space-y-3">
            {development.map((b, i) => (
              <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={b.h3}
                    onChange={(e) => setDevelopment((prev) => prev.map((x, xi) => (xi === i ? { ...x, h3: e.target.value } : x)))}
                    placeholder="Subtítulo (opcional)"
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setDevelopment((prev) => prev.filter((_, xi) => xi !== i))}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={b.paragraphs}
                  onChange={(e) => setDevelopment((prev) => prev.map((x, xi) => (xi === i ? { ...x, paragraphs: e.target.value } : x)))}
                  placeholder="Párrafos (uno por línea)"
                  rows={3}
                  className="input-field resize-none text-sm"
                />
                <textarea
                  value={b.bullets}
                  onChange={(e) => setDevelopment((prev) => prev.map((x, xi) => (xi === i ? { ...x, bullets: e.target.value } : x)))}
                  placeholder="Lista con viñetas (opcional, una por línea)"
                  rows={2}
                  className="input-field resize-none text-sm"
                />
                <div className="grid sm:grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                  <input
                    value={b.checkQuestion}
                    onChange={(e) => setDevelopment((prev) => prev.map((x, xi) => (xi === i ? { ...x, checkQuestion: e.target.value } : x)))}
                    placeholder="Pregunta de repaso (opcional, antes de seguir)"
                    className="input-field text-sm"
                  />
                  <input
                    value={b.checkAnswer}
                    onChange={(e) => setDevelopment((prev) => prev.map((x, xi) => (xi === i ? { ...x, checkAnswer: e.target.value } : x)))}
                    placeholder="Respuesta"
                    className="input-field text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDevelopment((prev) => [...prev, { h3: '', paragraphs: '', bullets: '', checkQuestion: '', checkAnswer: '' }])}
            className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-900"
          >
            <Plus className="w-4 h-4" /> Agregar bloque
          </button>
        </div>

        <Field label="Paso a paso (uno por línea)">
          <textarea name="steps" value={form.steps} onChange={handleChange} rows={3} className="input-field resize-none" />
        </Field>
        <Field label="Ejemplo práctico">
          <textarea name="example" value={form.example} onChange={handleChange} rows={2} className="input-field resize-none" />
        </Field>

        {/* Errores frecuentes */}
        <RepeaterMistakes mistakes={mistakes} setMistakes={setMistakes} />

        <Field label="Consejo Modeltex">
          <textarea name="modeltex_tip" value={form.modeltex_tip} onChange={handleChange} rows={2} className="input-field resize-none" />
        </Field>
        <Field label="Ejercicio">
          <textarea name="exercise_instructions" value={form.exercise_instructions} onChange={handleChange} rows={3} className="input-field resize-none" />
        </Field>

        {/* FAQs */}
        <RepeaterFaqs faqs={faqs} setFaqs={setFaqs} />

        <Field label="Resumen">
          <textarea name="summary" value={form.summary} onChange={handleChange} rows={2} className="input-field resize-none" />
        </Field>

        {/* Guías relacionadas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Guías relacionadas (/guias)</label>
          <div className="flex flex-wrap gap-2">
            {GUIAS.map((g) => (
              <button
                type="button"
                key={g.slug}
                onClick={() => toggleGuide(g.slug)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  relatedGuides.includes(g.slug)
                    ? 'bg-primary-800 text-white border-primary-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Recursos (solo si la clase ya existe) */}
        {lesson && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Recursos adjuntos</label>
            {resources.length > 0 && (
              <ul className="space-y-2 mb-2">
                {resources.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-sm">
                    <Download className="w-3.5 h-3.5 text-gray-400" />
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline flex-1 truncate">
                      {r.title}
                    </a>
                    <button type="button" onClick={() => removeResource(r.id)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2">
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as LabResourceType)}
                className="input-field w-36 text-sm"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer text-sm">
                {uploadingResource ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingResource ? 'Subiendo...' : 'Subir recurso'}
                <input type="file" className="hidden" onChange={addResource} disabled={uploadingResource} />
              </label>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
            <input name="order_index" type="number" value={form.order_index} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field">
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Guardando...' : lesson ? 'Guardar cambios' : 'Crear clase'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
        {!lesson && (
          <p className="text-xs text-gray-400">Guardá la clase primero para poder adjuntarle recursos.</p>
        )}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function RepeaterMistakes({
  mistakes,
  setMistakes,
}: {
  mistakes: LabMistake[];
  setMistakes: Dispatch<SetStateAction<LabMistake[]>>;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Errores frecuentes</label>
      <div className="space-y-2">
        {mistakes.map((m, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={m.mistake}
              onChange={(e) => setMistakes((prev) => prev.map((x, xi) => (xi === i ? { ...x, mistake: e.target.value } : x)))}
              placeholder="Error"
              className="input-field flex-1 text-sm"
            />
            <input
              value={m.fix}
              onChange={(e) => setMistakes((prev) => prev.map((x, xi) => (xi === i ? { ...x, fix: e.target.value } : x)))}
              placeholder="Cómo evitarlo"
              className="input-field flex-1 text-sm"
            />
            <button type="button" onClick={() => setMistakes((prev) => prev.filter((_, xi) => xi !== i))} className="p-2 text-gray-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setMistakes((prev) => [...prev, { mistake: '', fix: '' }])}
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-900"
      >
        <Plus className="w-4 h-4" /> Agregar error frecuente
      </button>
    </div>
  );
}

function RepeaterFaqs({ faqs, setFaqs }: { faqs: LabFaq[]; setFaqs: Dispatch<SetStateAction<LabFaq[]>> }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">Preguntas frecuentes</label>
      <div className="space-y-2">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-gray-200 p-3 space-y-2">
            <div className="flex gap-2">
              <input
                value={f.q}
                onChange={(e) => setFaqs((prev) => prev.map((x, xi) => (xi === i ? { ...x, q: e.target.value } : x)))}
                placeholder="Pregunta"
                className="input-field flex-1 text-sm"
              />
              <button type="button" onClick={() => setFaqs((prev) => prev.filter((_, xi) => xi !== i))} className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={f.a}
              onChange={(e) => setFaqs((prev) => prev.map((x, xi) => (xi === i ? { ...x, a: e.target.value } : x)))}
              placeholder="Respuesta"
              rows={2}
              className="input-field resize-none text-sm"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setFaqs((prev) => [...prev, { q: '', a: '' }])}
        className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary-700 hover:text-primary-900"
      >
        <Plus className="w-4 h-4" /> Agregar pregunta frecuente
      </button>
    </div>
  );
}
