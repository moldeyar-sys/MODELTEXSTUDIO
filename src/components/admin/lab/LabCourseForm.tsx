import { useState } from 'react';
import { Upload, ImagePlus, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { uploadLabFile } from '../../../lib/storage';
import type { LabCourse } from '../../../lib/labTypes';

export function LabCourseForm({ course, onClose }: { course: LabCourse | null; onClose: () => void }) {
  const [form, setForm] = useState({
    slug: course?.slug || '',
    track_slug: course?.track_slug || '',
    title: course?.title || '',
    subtitle: course?.subtitle || '',
    description: course?.description || '',
    objectives: course?.objectives?.join('\n') || '',
    requirements: course?.requirements?.join('\n') || '',
    estimated_duration: course?.estimated_duration || '',
    cover_image_url: course?.cover_image_url || '',
    author: course?.author || 'Modeltex',
    order_index: course?.order_index?.toString() || '0',
    status: course?.status || 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadLabFile(file);
      setForm((prev) => ({ ...prev, cover_image_url: url }));
    } catch {
      setError('Error al subir la portada.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      slug: form.slug.trim(),
      track_slug: form.track_slug.trim(),
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      objectives: form.objectives.split('\n').map((s) => s.trim()).filter(Boolean),
      requirements: form.requirements.split('\n').map((s) => s.trim()).filter(Boolean),
      estimated_duration: form.estimated_duration,
      cover_image_url: form.cover_image_url,
      author: form.author,
      order_index: parseInt(form.order_index, 10) || 0,
      status: form.status,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error: err } = course
        ? await supabase.from('lab_courses').update(payload).eq('id', course.id)
        : await supabase.from('lab_courses').insert(payload);
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
      <h3 className="font-semibold text-gray-900 text-lg mb-6">{course ? 'Editar curso' : 'Nuevo curso'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Moldería a Medida" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (URL: /lab/...) *</label>
            <input name="slug" value={form.slug} onChange={handleChange} required className="input-field" placeholder="molderia-a-medida" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Track (agrupador libre)</label>
            <input name="track_slug" value={form.track_slug} onChange={handleChange} className="input-field" placeholder="molderia-a-medida" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duración estimada</label>
            <input name="estimated_duration" value={form.estimated_duration} onChange={handleChange} className="input-field" placeholder="8 horas" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Autor</label>
            <input name="author" value={form.author} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Orden</label>
            <input name="order_index" type="number" value={form.order_index} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtítulo</label>
          <input name="subtitle" value={form.subtitle} onChange={handleChange} className="input-field" placeholder="Aprendé moldería desde cero hasta producción profesional" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input-field resize-none" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Objetivos (uno por línea)</label>
            <textarea name="objectives" value={form.objectives} onChange={handleChange} rows={4} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Requisitos (uno por línea)</label>
            <textarea name="requirements" value={form.requirements} onChange={handleChange} rows={4} className="input-field resize-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Portada</label>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
              {form.cover_image_url ? (
                <img src={form.cover_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImagePlus className="w-7 h-7" /></div>
              )}
            </div>
            <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer text-sm">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'Subiendo...' : 'Subir portada'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field w-40">
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Guardando...' : course ? 'Guardar cambios' : 'Crear curso'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
