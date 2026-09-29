import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, ImagePlus, Loader2, Trash2, FileDown } from 'lucide-react';
import { uploadProductImage, uploadFreeMoldFile } from '../../lib/storage';
import { CATEGORIES, FREE_MOLD_TAGS } from '../../lib/types';
import type { FreeMold, FreeMoldFile } from '../../lib/types';
import type { LabCourse, LabLesson } from '../../lib/labTypes';
import {
  FREE_FILE_FORMATS, PLOTTER_WIDTHS, compareSizes, groupFiles, inferFormat, inferSize, inferWidth, normalizeFile,
  type FreeFileFormat,
} from '../../lib/freeMoldFormats';
import { formatBytes } from '../../lib/freeDownloads';

const SEASONS = ['Todo el año', 'Verano', 'Invierno', 'Primavera', 'Otoño'];

// Una sección de carga por tipo de archivo: el formato lo define la sección
// (salvo CAD, que se deduce por extensión) y el talle/ancho se sacan del nombre.
const UPLOAD_GROUPS: { key: string; title: string; hint: string; accept: string; formats: FreeFileFormat[]; preset: FreeFileFormat | null }[] = [
  { key: 'a4', title: 'PDF para imprimir en A4', hint: 'Un PDF por talle. Si el nombre dice "TALLE M", el talle se completa solo.', accept: '.pdf', formats: ['pdf-a4'], preset: 'pdf-a4' },
  { key: 'plotter', title: 'PDF para plotter', hint: 'Un PDF por ancho: 60, 90, 100, 120 y 150 cm. Si el nombre dice "90CM" o "ANCHO 90", el ancho se completa solo.', accept: '.pdf', formats: ['pdf-plotter'], preset: 'pdf-plotter' },
  { key: 'editable', title: 'Editables PDF + CDR (sublimación / Corel)', hint: 'Los PDF y CDR editables.', accept: '.pdf,.cdr', formats: ['editable'], preset: 'editable' },
  { key: 'cad', title: 'Formatos industriales (DXF, PDS, MRK, ADS, PLT)', hint: 'El formato se detecta por la extensión del archivo.', accept: '.dxf,.rul,.pds,.mrk,.ads,.plt', formats: ['dxf', 'pds', 'mrk', 'ads', 'plt'], preset: null },
  { key: 'otro', title: 'Otros archivos', hint: 'Guías de armado, ZIP, etc.', accept: '', formats: ['otro'], preset: 'otro' },
];

/** Completa formato/talle/ancho (deducidos del nombre en archivos viejos) y la etiqueta visible. */
function withMeta(f: FreeMoldFile): FreeMoldFile {
  const n = normalizeFile(f);
  return { ...f, format: n.format, size: n.size || undefined, width: n.width ?? undefined, label: n.display };
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
    lab_course_id: mold?.lab_course_id || '',
    lab_lesson_id: mold?.lab_lesson_id || '',
  });
  const [tags, setTags] = useState<string[]>(mold?.tags || []);
  const [files, setFiles] = useState<FreeMoldFile[]>((mold?.files || []).map(withMeta));
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploading, setUploading] = useState<{ group: string; done: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const [labCourses, setLabCourses] = useState<LabCourse[]>([]);
  const [labLessons, setLabLessons] = useState<LabLesson[]>([]);

  // Vínculo opcional con MODELTEX LAB: cursos publicados + clases del curso elegido.
  useEffect(() => {
    supabase.from('lab_courses').select('*').order('order_index', { ascending: true }).then(({ data }) => {
      setLabCourses((data as LabCourse[]) || []);
    });
  }, []);

  useEffect(() => {
    if (!form.lab_course_id) {
      setLabLessons([]);
      return;
    }
    supabase
      .from('lab_lessons')
      .select('*, lab_modules!inner(course_id)')
      .eq('lab_modules.course_id', form.lab_course_id)
      .order('order_index', { ascending: true })
      .then(({ data }) => setLabLessons((data as LabLesson[]) || []));
  }, [form.lab_course_id]);

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

  const handleFilesUpload = async (group: (typeof UPLOAD_GROUPS)[number], e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    if (!list.length) return;
    setError('');
    setUploading({ group: group.key, done: 0, total: list.length });
    const failed: string[] = [];
    for (const [i, f] of list.entries()) {
      try {
        const url = await uploadFreeMoldFile(f);
        let format = group.preset ?? inferFormat(f.name);
        if (!group.formats.includes(format)) format = group.formats.length === 1 ? group.formats[0] : 'otro';
        const added = withMeta({
          label: '',
          name: f.name,
          url,
          free: false,
          format,
          size: inferSize(f.name) || undefined,
          width: format === 'pdf-plotter' ? inferWidth(f.name) ?? undefined : undefined,
          bytes: f.size,
        });
        setFiles(prev => [...prev, added]);
      } catch {
        failed.push(f.name);
      }
      setUploading({ group: group.key, done: i + 1, total: list.length });
    }
    setUploading(null);
    if (failed.length) setError(`No se pudieron subir: ${failed.join(', ')}. Probá de nuevo con esos.`);
  };

  const updateFile = (url: string, patch: Partial<FreeMoldFile>) =>
    setFiles(prev => prev.map(f => (f.url === url ? withMeta({ ...f, ...patch }) : f)));

  const removeFile = (url: string) => setFiles(prev => prev.filter(f => f.url !== url));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Formatos y talles salen de los archivos cargados (se muestran en la
    // tarjeta y en la página del molde); los talles escritos a mano mandan.
    const sections = groupFiles(files);
    const sizesTyped = form.sizes.split(',').map(s => s.trim()).filter(Boolean);
    const sizesFromFiles = [...new Set(sections.flatMap(s => s.files.map(f => f.size)).filter(Boolean))].sort(compareSizes);
    const payload = {
      title: form.title,
      code: form.code,
      category: form.category,
      product_type: form.product_type,
      fabric_recommendation: form.fabric_recommendation,
      sizes: sizesTyped.length ? sizesTyped : sizesFromFiles,
      formats: sections.length ? sections.map(s => s.format.short) : form.formats.split(',').map(s => s.trim()).filter(Boolean),
      tags,
      season: form.season,
      image_url: form.image_url,
      files,
      description: form.description,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order, 10) || 0,
      lab_course_id: form.lab_course_id || null,
      lab_lesson_id: form.lab_lesson_id || null,
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Formatos</label>
            <p className="input-field bg-gray-50 text-sm text-gray-500">
              {groupFiles(files).map(s => s.format.short).join(', ') || 'Se completan solos con los archivos que subas'}
            </p>
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

        {/* Archivos descargables (bucket PUBLICO free-files), ordenados por formato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <FileDown className="w-4 h-4 text-primary-700" /> Archivos para descargar (gratis)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Subí cada tipo de archivo en su sección. Marcá <b>"Sin cuenta"</b> en los que se pueden bajar sin crear cuenta (ej: un talle de muestra); el resto pide cuenta gratis.
          </p>
          <div className="space-y-3">
            {UPLOAD_GROUPS.map(group => {
              const groupFilesList = files.filter(f => group.formats.includes((f.format || 'otro') as FreeFileFormat));
              const busy = uploading?.group === group.key;
              return (
                <div key={group.key} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {group.title} {groupFilesList.length > 0 && <span className="text-gray-400 font-normal">({groupFilesList.length})</span>}
                      </p>
                      <p className="text-xs text-gray-500">{group.hint}</p>
                    </div>
                    <label className={`btn-secondary inline-flex items-center gap-2 cursor-pointer text-xs flex-shrink-0 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {busy ? `Subiendo ${uploading?.done} de ${uploading?.total}...` : 'Subir archivos'}
                      <input type="file" multiple accept={group.accept || undefined} className="hidden" onChange={e => handleFilesUpload(group, e)} disabled={!!uploading} />
                    </label>
                  </div>
                  {groupFilesList.length > 0 && (
                    <div className="space-y-1.5">
                      {groupFilesList.map(f => (
                        <div key={f.url} className="flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5">
                          <span className="text-xs text-gray-700 truncate flex-1 min-w-[10rem]" title={f.name}>
                            {f.name} {f.bytes ? <span className="text-gray-400">· {formatBytes(f.bytes)}</span> : null}
                          </span>
                          {group.key === 'cad' && (
                            <select value={f.format} onChange={e => updateFile(f.url, { format: e.target.value as FreeFileFormat })} className="input-field py-1 text-xs w-24">
                              {FREE_FILE_FORMATS.filter(x => group.formats.includes(x.id)).map(x => <option key={x.id} value={x.id}>{x.short}</option>)}
                            </select>
                          )}
                          {f.format === 'pdf-plotter' && (
                            <select
                              value={f.width ?? ''}
                              onChange={e => updateFile(f.url, { width: e.target.value ? Number(e.target.value) : undefined })}
                              className={`input-field py-1 text-xs w-32 ${f.width ? '' : 'border-amber-400 bg-amber-50'}`}
                              title="Ancho de papel del plotter"
                            >
                              <option value="">Elegí ancho</option>
                              {PLOTTER_WIDTHS.map(w => <option key={w} value={w}>{w} cm</option>)}
                            </select>
                          )}
                          <input
                            value={f.size || ''}
                            onChange={e => updateFile(f.url, { size: e.target.value.trim().toUpperCase() || undefined })}
                            placeholder="Talle"
                            title="Talle (dejalo vacío si el archivo trae todos)"
                            className="input-field py-1 text-xs w-20"
                          />
                          <label className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg cursor-pointer ${f.free ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-gray-200'}`} title="Se descarga sin crear cuenta">
                            <input type="checkbox" checked={!!f.free} onChange={() => updateFile(f.url, { free: !f.free })} className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            Sin cuenta
                          </label>
                          <button type="button" onClick={() => removeFile(f.url)} className="p-1 text-gray-400 hover:text-red-600 rounded" aria-label={`Quitar ${f.name}`}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción corta</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="input-field resize-none" />
        </div>

        {/* Vínculo opcional con MODELTEX LAB */}
        <div className="grid sm:grid-cols-2 gap-4 p-3 rounded-xl bg-primary-50/50 border border-primary-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Curso de Modeltex Lab (opcional)</label>
            <select
              name="lab_course_id"
              value={form.lab_course_id}
              onChange={(e) => setForm(prev => ({ ...prev, lab_course_id: e.target.value, lab_lesson_id: '' }))}
              className="input-field"
            >
              <option value="">Sin vincular</option>
              {labCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Clase (opcional)</label>
            <select
              name="lab_lesson_id"
              value={form.lab_lesson_id}
              onChange={handleChange}
              disabled={!form.lab_course_id}
              className="input-field disabled:opacity-50"
            >
              <option value="">Sin vincular a una clase puntual</option>
              {labLessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>
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
