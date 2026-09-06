import { supabase } from './supabase';

export interface PaymentSettings {
  id: string;
  // Transferencia bancaria
  transfer_alias: string;
  transfer_holder: string;
  transfer_bank: string;
  transfer_cbu: string;
  // Binance / Cripto
  binance_wallet: string;
  binance_network: string;
  binance_qr_url: string;
  // PayPal (debe ser una cuenta Business a nombre de "Modeltex", no personal)
  paypal_link: string;
  paypal_qr_url: string;
  // Payoneer (cobro internacional en USD)
  payoneer_email: string;
  payoneer_link: string;
  // Wise (cobro internacional en USD/EUR)
  wise_email: string;
  wise_link: string;
  // Mercado Pago
  mp_payment_link: string;
}

export const PAYMENT_SETTINGS_DEFAULTS: PaymentSettings = {
  id: 'default',
  transfer_alias: 'MOLDEY.DIGITAL',
  transfer_holder: 'Modeltex',
  transfer_bank: '',
  transfer_cbu: '',
  binance_wallet: '',
  binance_network: 'BSC (BEP20)',
  binance_qr_url: '/brand/binance-qr.jpeg',
  // Sin valor por defecto a propósito: el link personal paypal.me/JHONDESPINOZA
  // generaba desconfianza (nombre distinto a "Modeltex"). Cargar acá el link
  // de la cuenta PayPal Business "Modeltex" desde el panel admin.
  paypal_link: '',
  paypal_qr_url: '/brand/paypal-qr.png',
  payoneer_email: '',
  payoneer_link: '',
  wise_email: '',
  wise_link: '',
  mp_payment_link: 'https://link.mercadopago.com.ar/modeltex',
};

/** Carga los datos de pago. Si la tabla no existe aún, devuelve los defaults. */
export async function fetchPaymentSettings(): Promise<PaymentSettings> {
  try {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .eq('id', 'default')
      .single();
    if (error || !data) return PAYMENT_SETTINGS_DEFAULTS;
    return { ...PAYMENT_SETTINGS_DEFAULTS, ...(data as PaymentSettings) };
  } catch {
    return PAYMENT_SETTINGS_DEFAULTS;
  }
}

/** Guarda (upsert) los datos de pago. Devuelve true si tuvo éxito. */
export async function savePaymentSettings(
  settings: Partial<Omit<PaymentSettings, 'id'>>,
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payment_settings')
      .upsert({ id: 'default', ...settings });
    return !error;
  } catch {
    return false;
  }
}



