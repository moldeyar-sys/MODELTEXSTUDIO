import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { formatMoney } from '../../lib/locale';
import type { PaymentMethod } from '../../lib/types';
import type { PaymentSettings } from '../../lib/paymentSettings';

/**
 * Instrucciones de pago manual (transferencia/cripto/PayPal/Payoneer/Wise) o
 * botón para reintentar Mercado Pago, para un pedido YA CREADO que sigue
 * "pendiente". Antes esta información SOLO existía en el estado de React de
 * CheckoutPage justo después de confirmar el pedido (ver CheckoutPage.tsx):
 * si el comprador cerraba la pestaña, recargaba, o volvía más tarde desde
 * /mis-compras o /mi-pedido, no había forma de ver de nuevo el alias, la
 * wallet, el link de pago o el monto exacto — el pedido quedaba "pendiente"
 * sin que el comprador supiera cómo terminar de pagarlo. Se usa acá y en
 * MyGuestOrderPage.tsx.
 */
export function PaymentInstructions({
  method,
  total,
  currency,
  settings,
  orderId,
  payerEmail,
}: {
  method: PaymentMethod;
  total: number;
  currency: 'ARS' | 'USD' | null | undefined;
  settings: PaymentSettings;
  orderId: string;
  /** Email a mandar como payerEmail a create-preference (dueño del pedido). */
  payerEmail: string;
}) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState('');
  const amount = formatMoney(total, currency);

  const retryMercadoPago = async () => {
    setRetrying(true);
    setRetryError('');
    try {
      const res = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, payerEmail }),
      });
      const data = await res.json();
      if (res.ok && data.init_point) {
        window.location.href = data.init_point;
        return;
      }
      setRetryError(data.error || 'No se pudo generar el link de pago. Probá de nuevo o escribinos por WhatsApp.');
    } catch {
      setRetryError('No se pudo generar el link de pago. Probá de nuevo o escribinos por WhatsApp.');
    } finally {
      setRetrying(false);
    }
  };

  if (method === 'mercadopago') {
    return (
      <div className="mt-3 bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-700 mb-2">Monto a pagar: <strong>{amount}</strong></p>
        <button
          onClick={retryMercadoPago}
          disabled={retrying}
          className="btn-primary w-full inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Wallet className="w-4 h-4" /> {retrying ? 'Generando link...' : 'Pagar con Mercado Pago'}
        </button>
        {retryError && <p className="text-xs text-red-600 mt-2">{retryError}</p>}
      </div>
    );
  }

  if (method === 'transfer') {
    return (
      <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-900 mb-1">Monto: {amount}</p>
        {settings.transfer_alias && <p><span className="font-medium text-gray-700">Alias:</span> {settings.transfer_alias}</p>}
        {settings.transfer_holder && <p><span className="font-medium text-gray-700">Titular:</span> {settings.transfer_holder}</p>}
        {settings.transfer_bank && <p><span className="font-medium text-gray-700">Banco:</span> {settings.transfer_bank}</p>}
        {settings.transfer_cbu && <p><span className="font-medium text-gray-700">CBU/CVU:</span> {settings.transfer_cbu}</p>}
        <p className="text-xs text-petroleum-600 pt-1">Enviá el comprobante por WhatsApp para agilizar la confirmación.</p>
      </div>
    );
  }

  if (method === 'binance') {
    return (
      <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-gray-900 mb-1">Monto de referencia: {amount} (convertilo a USDT)</p>
        {settings.binance_wallet && <p><span className="font-medium text-gray-700">Wallet:</span> <span className="font-mono text-xs break-all">{settings.binance_wallet}</span></p>}
        {settings.binance_network && <p><span className="font-medium text-gray-700">Red:</span> {settings.binance_network}</p>}
        <p className="text-xs text-petroleum-600 pt-1">Enviá el hash de la transacción por WhatsApp para confirmar.</p>
      </div>
    );
  }

  if (method === 'paypal' || method === 'payoneer' || method === 'wise') {
    const link = method === 'paypal' ? settings.paypal_link : method === 'payoneer' ? settings.payoneer_link : settings.wise_link;
    const email = method === 'payoneer' ? settings.payoneer_email : method === 'wise' ? settings.wise_email : null;
    return (
      <div className="mt-3 bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2">
        <p className="font-semibold text-gray-900">Monto: {amount} (equivalente en USD)</p>
        {email && <p><span className="font-medium text-gray-700">Email:</span> {email}</p>}
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center justify-center gap-2 w-full">
            Pagar con {method === 'paypal' ? 'PayPal' : method === 'payoneer' ? 'Payoneer' : 'Wise'}
          </a>
        )}
        <p className="text-xs text-petroleum-600">Enviá el comprobante por WhatsApp para confirmar tu compra.</p>
      </div>
    );
  }

  return null;
}
