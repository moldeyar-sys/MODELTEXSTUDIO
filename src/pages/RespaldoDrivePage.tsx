import { useSeo } from '../lib/seo';

export default function RespaldoDrivePage() {
  useSeo({
    title: 'Política de privacidad — Respaldo Denis Restic',
    description:
      'Política de privacidad de la herramienta interna "Respaldo Denis Restic", no relacionada con las compras en Modeltex.',
    path: '/legal/respaldo-drive-denis',
  });

  return (
    <div className="container-custom py-12 sm:py-16 max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-primary-900 mb-6">
        Política de privacidad — Respaldo Denis Restic
      </h1>

      <p className="text-gray-600 mb-4">
        Esta página no tiene relación con las compras ni los datos de clientes
        de Modeltex. Corresponde a una herramienta de uso personal e interno
        de Denis Espinoza: un sistema de respaldo cifrado que copia sus
        propias carpetas de trabajo a su propia cuenta de Google Drive.
      </p>

      <h2 className="font-display text-xl font-bold text-primary-900 mt-8 mb-3">
        Qué hace esta app
      </h2>
      <p className="text-gray-600 mb-4">
        &quot;Respaldo Denis Restic&quot; es un script que corre en la
        computadora personal de Denis. Usa el permiso de Google Drive{' '}
        <code>drive.file</code>, el más restringido que ofrece Google: solo
        puede ver, crear y administrar los archivos que la propia app sube.
        No puede acceder a ningún otro archivo de la cuenta de Drive, ni leer
        contactos, correos u otra información de Google.
      </p>

      <h2 className="font-display text-xl font-bold text-primary-900 mt-8 mb-3">
        Qué datos se suben
      </h2>
      <p className="text-gray-600 mb-4">
        Copias de seguridad cifradas (formato restic, cifrado AES-256 antes de
        salir de la computadora) de carpetas de proyectos personales de Denis.
        Nadie más que Denis tiene la clave de cifrado. Google nunca ve el
        contenido en claro.
      </p>

      <h2 className="font-display text-xl font-bold text-primary-900 mt-8 mb-3">
        Con quién se comparte
      </h2>
      <p className="text-gray-600 mb-4">
        Con nadie. Es una herramienta de un solo usuario, sin terceros
        involucrados.
      </p>

      <p className="text-sm text-gray-400 mt-10 border-t pt-4">
        Última actualización: agosto de 2026. Contacto:{' '}
        j.denis.ia.1305@gmail.com
      </p>
    </div>
  );
}
