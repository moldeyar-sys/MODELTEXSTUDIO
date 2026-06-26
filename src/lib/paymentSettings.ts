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
  // PayPal
  paypal_link: string;
  paypal_qr_url: string;
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
  paypal_link: '',
  paypal_qr_url: '/brand/paypal-qr.png',
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
