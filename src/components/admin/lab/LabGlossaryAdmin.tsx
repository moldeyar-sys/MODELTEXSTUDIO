import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { LabGlossaryTerm } from '../../../lib/labTypes';

function TermForm({ term, onClose }: { term: LabGlossaryTerm | null; onClose: () => void }) {
  const [form, setForm] = useState({
    slug: term?.slug || '',
    term: term?.term || '',
    short_definition: term?.short_definition || '',
    explanation: term?.explanation || '',
    example: term?.example || '',
    order_index: term?.order_index?.toString() || '0',
    status: term?.status || 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      slug: form.slug.trim(),
      term: form.term,
      short_definition: form.short_definition,
      explanation: form.explanation,
      example: form.example,
      order_index: parseInt(form.order_index, 10) || 0,
      status: form.status,
      updated_at: new Date().toISOString(),
    };
    try {
      const { error: err } = term
        ? await supabase.from('lab_glossary_terms').update(payload).eq('id', term.id)
        : await supabase.from('lab_glossary_terms').insert(payload);
      if (err) throw err;
      onClose();
    } catch (err) {
      setError(`Error al guardar: ${(err as { message?: string })?.message || 'desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 mb-6">
      <h3 className="font-semibold text-gray-900 text-lg mb-6">{term ? 'Editar término' : 'Nuevo término'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Término *</label>
            <input name="term" value={form.term} onChange={handleChange} required className="input-field" placeholder="Holgura" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required className="input-field" placeholder="holgura" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Definición corta</label>
          <textarea name="short_definition" value={form.short_definition} onChange={handleChange} rows={2} className="input-field resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Explicación</label>
          <textarea name="explanation" value={form.explanation} onChange={handleChange} rows={3} className="input-field resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ejemplo</label>
          <textarea name="example" value={form.example} onChange={handleChange} rows={2} className="input-field resize-none" />
        </div>
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
            {saving ? 'Guardando...' : term ? 'Guardar cambios' : 'Crear término'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export function LabGlossaryAdmin() {
  const [terms, setTerms] = useState<LabGlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LabGlossaryTerm | null | undefined>(undefined);

  const load = () => {
    setLoading(true);
    supabase
      .from('lab_glossary_terms')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setTerms((data as LabGlossaryTerm[]) || []);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este término del glosario?')) return;
    await supabase.from('lab_glossary_terms').delete().eq('id', id);
    load();
  };

  if (editing !== undefined) {
    return (
      <TermForm
        term={editing}
        onClose={() => {
          setEditing(undefined);
          load();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Glosario</h3>
        <button onClick={() => setEditing(null)} className="btn-primary inline-flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nuevo término
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : terms.length === 0 ? (
        <p className="text-sm text-gray-400">Todavía no hay términos en el glosario.</p>
      ) : (
        <div className="space-y-2">
          {terms.map((t) => (
            <div key={t.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  {t.term}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {t.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                </p>
                <p className="text-sm text-gray-500 truncate">{t.short_definition}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setEditing(t)} className="p-2 text-gray-400 hover:text-primary-700"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(t.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
