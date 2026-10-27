// TODO(Caio): replace the placeholder phone number (5516999999999) with the real ArenaHub WhatsApp number.
export const WHATSAPP_URL = 'https://wa.me/5516999999999?text=Olá%2C%20gostaria%20de%20conhecer%20o%20ArenaHub';

export function openWhatsApp() {
  window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
}
