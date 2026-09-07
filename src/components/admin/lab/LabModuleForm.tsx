import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { LabModule } from '../../../lib/labTypes';

export function LabModuleForm({
  courseId,
  moduleItem,
  onClose,
}: {
  courseId: string;
  moduleItem: LabModule | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    slug: moduleItem?.slug || '',
    level_label: moduleItem?.level_label || '',
    level_order: moduleItem?.level_order?.toString() || '0',
    title: moduleItem?.title || '',
    description: moduleItem?.description || '',
    objectives: moduleItem?.objectives?.join('\n') || '',
    order_index: moduleItem?.order_index?.toString() || '0',
    status: moduleItem?.status || 'draft',
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
      course_id: courseId,
      slug: form.slug.trim(),
      level_label: form.level_label,
      level_order: parseInt(form.level_order, 10) || 0,
      title: form.title,
      description: form.description,
      objectives: form.objectives.split('\n').map((s) => s.trim()).filter(Boolean),
      order_index: parseInt(form.order_index, 10) || 0,
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error: err } = moduleItem
        ? await supabase.from('lab_modules').update(payload).eq('id', moduleItem.id)
        : await supabase.from('lab_modules').insert(payload);
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
      <h3 className="font-semibold text-gray-900 text-lg mb-6">{moduleItem ? 'Editar módulo' : 'Nuevo módulo'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Fundamentos" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (dentro del curso) *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required className="input-field" placeholder="fundamentos" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Etiqueta de nivel</label>
            <input name="level_label" value={form.level_label} onChange={handleChange} className="input-field" placeholder="Nivel 1 — Fundamentos" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden del nivel</label>
            <input name="level_order" type="number" value={form.level_order} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden del módulo</label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Objetivos (uno por línea)</label>
          <textarea name="objectives" value={form.objectives} onChange={handleChange} rows={3} className="input-field resize-none" />
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Guardando...' : moduleItem ? 'Guardar cambios' : 'Crear módulo'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
