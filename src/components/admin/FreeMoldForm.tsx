import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, ImagePlus, Loader2, Trash2, FileDown } from 'lucide-react';
import { uploadProductImage, uploadFreeMoldFile } from '../../lib/storage';
import { CATEGORIES, FREE_MOLD_TAGS } from '../../lib/types';
import type { FreeMold, FreeMoldFile } from '../../lib/types';

const SEASONS = ['Todo el año', 'Verano', 'Invierno', 'Primavera', 'Otoño'];

function inferLabel(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf': return 'PDF';
    case 'plt': return 'Plotter (PLT)';
    case 'dxf': return 'DXF';
    case 'cdr': return 'CDR';
    case 'zip': return 'ZIP';
    default: return ext.toUpperCase() || 'Archivo';
  }
}

export function FreeMoldForm({
  mold,
  onClose,
}: {
  mold: FreeMold | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: mold?.title || '',
    code: mold?.code || '',
    category: mold?.category || 'dama',
    product_type: mold?.product_type || '',
    fabric_recommendation: mold?.fabric_recommendation || '',
    sizes: mold?.sizes?.join(', ') || '',
    formats: mold?.formats?.join(', ') || '',
    season: mold?.season || 'Todo el año',
    image_url: mold?.image_url || '',
    description: mold?.description || '',
    is_active: mold?.is_active ?? true,
    sort_order: mold?.sort_order?.toString() || '0',
  });
  const [tags, setTags] = useState<string[]>(mold?.tags || []);
  const [files, setFiles] = useState<FreeMoldFile[]>(mold?.files || []);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
  };

  const toggleTag = (tagItem: string) =>
    setTags(prev => (prev.includes(tagItem) ? prev.filter(x => x !== tagItem) : [...prev, tagItem]));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadProductImage(file);
      setForm(prev => ({ ...prev, image_url: url }));
    } catch {
      setError('Error al subir la imagen.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    setUploadingFile(true);
    setError('');
    try {
      const added: FreeMoldFile[] = [];
      for (const f of list) {
        const url = await uploadFreeMoldFile(f);
        added.push({ label: inferLabel(f.name), name: f.name, url });
      }
      setFiles(prev => [...prev, ...added]);
    } catch {
      setError('Error al subir archivos. Revisá que el bucket "free-files" exista (SQL).');
    } finally {
      setUploadingFile(false);
    }
  };

  const updateFileLabel = (i: number, label: string) =>
    setFiles(prev => prev.map((f, idx) => (idx === i ? { ...f, label } : f)));

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      title: form.title,
      code: form.code,
      category: form.category,
      product_type: form.product_type,
      fabric_recommendation: form.fabric_recommendation,
      sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
      formats: form.formats.split(',').map(s => s.trim()).filter(Boolean),
      tags,
      season: form.season,
      image_url: form.image_url,
      files,
      description: form.description,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order, 10) || 0,
    };

    try {
      if (mold) {
        const { error: upErr } = await supabase.from('free_molds').update(payload).eq('id', mold.id);
        if (upErr) throw upErr;
      } else {
        const { error: insErr } = await supabase.from('free_molds').insert(payload);
        if (insErr) throw insErr;
      }
      onClose();
    } catch (err) {
      const msg = (err as { message?: string })?.message || '';
      if (msg.includes('free_molds')) {
        setError('Falta crear la tabla "free_molds" en Supabase. Corré el SQL de Moldes Gratis y reintentá.');
      } else {
        setError(`Error al guardar: ${msg || 'desconocido'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 mb-6">
      <h3 className="font-semibold text-gray-900 text-lg mb-6">{mold ? 'Editar molde gratis' : 'Nuevo molde gratis'}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre - Código *</label>
            <input name="title" value={form.title} onChange={handleChange} required className="input-field" placeholder="Ej: Remera básica" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Código</label>
            <input name="code" value={form.code} onChange={handleChange} className="input-field" placeholder="Ej: GRAT-01" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoría</label>
            <select name="category" value={form.category} onChange={handleChange} className="input-field">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de prenda</label>
            <input name="product_type" value={form.product_type} onChange={handleChange} className="input-field" placeholder="Remera, Pantalón..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tela recomendada</label>
            <input name="fabric_recommendation" value={form.fabric_recommendation} onChange={handleChange} className="input-field" placeholder="Morley, Frisa..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Temporada</label>
            <select name="season" value={form.season} onChange={handleChange} className="input-field">
              {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Talles (separados por coma)</label>
            <input name="sizes" value={form.sizes} onChange={handleChange} className="input-field" placeholder="S, M, L, XL" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Formatos (separados por coma)</label>
            <input name="formats" value={form.formats} onChange={handleChange} className="input-field" placeholder="PDF A4, PDF Plotter, DXF" />
          </div>
        </div>

        {/* Etiquetas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Etiquetas</label>
          <div className="flex flex-wrap gap-2">
            {FREE_MOLD_TAGS.map(tagItem => (
              <button
                type="button"
                key={tagItem}
                onClick={() => toggleTag(tagItem)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                  tags.includes(tagItem)
                    ? 'bg-primary-800 text-white border-primary-800'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tagItem}
              </button>
            ))}
          </div>
        </div>

        {/* Imagen principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagen principal</label>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
              {form.image_url ? (
                <img src={form.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImagePlus className="w-7 h-7" /></div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer text-sm">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
              </label>
              <input name="image_url" value={form.image_url} onChange={handleChange} className="input-field text-xs" placeholder="...o pegá una URL https://" />
            </div>
          </div>
        </div>

        {/* Archivos descargables (bucket PUBLICO free-files) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
            <FileDown className="w-4 h-4 text-primary-700" /> Archivos para descargar (gratis)
          </label>
          {files.length > 0 && (
            <div className="space-y-2 mb-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={f.label}
                    onChange={e => updateFileLabel(i, e.target.value)}
                    className="input-field text-sm flex-shrink-0 w-40"
                    placeholder="Etiqueta (PDF A4...)"
                  />
                  <span className="text-xs text-gray-500 truncate flex-1">{f.name}</span>
                  <button type="button" onClick={() => removeFile(i)} className="p-1.5 text-gray-400 hover:text-red-600 rounded flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer text-sm">
            {uploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploadingFile ? 'Subiendo...' : 'Subir archivos'}
            <input type="file" multiple className="hidden" onChange={handleFilesUpload} disabled={uploadingFile} />
          </label>
          <p className="text-xs text-gray-400 mt-1">Se guardan en el bucket público "free-files". Editá la etiqueta de cada archivo (ej: PDF A4, Plotter).</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción corta</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            Activo (visible al público)
          </label>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Orden</span>
            <input name="sort_order" type="number" value={form.sort_order} onChange={handleChange} className="input-field w-20 py-1.5" />
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Guardando...' : mold ? 'Guardar cambios' : 'Crear molde gratis'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
