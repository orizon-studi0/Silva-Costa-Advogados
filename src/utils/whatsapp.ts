/**
 * Utility functions for contact form formatting and WhatsApp URL generation.
 */

export interface ContactFormData {
  nome: string;
  telefone: string;
  area: string;
  mensagem: string;
}

export const WA_PHONE_NUMBER = '5511999998888';
export const DEFAULT_WA_MESSAGE = 'Olá! Gostaria de entrar em contato.';

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatWhatsAppMessage(data: ContactFormData): string {
  const nome = data.nome?.trim() || 'Não informado';
  const telefone = data.telefone?.trim() || 'Não informado';
  const area = data.area?.trim() || 'Geral';
  const mensagem = data.mensagem?.trim() || 'Solicitação de contato para esclarecimento de dúvidas.';

  return (
    `Olá! Gostaria de agendar uma consulta inicial com a Silva & Costa Advogados.\n\n` +
    `*Nome:* ${nome}\n` +
    `*Telefone:* ${telefone}\n` +
    `*Área de Interesse:* ${area}\n` +
    `*Mensagem:* ${mensagem}`
  );
}

export function buildWhatsAppUrl(data?: Partial<ContactFormData>): string {
  if (!data || !data.nome) {
    return `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(DEFAULT_WA_MESSAGE)}`;
  }
  const fullText = formatWhatsAppMessage({
    nome: data.nome || '',
    telefone: data.telefone || '',
    area: data.area || 'Geral',
    mensagem: data.mensagem || '',
  });
  return `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(fullText)}`;
}

export function validateContactForm(data: { nome?: string; telefone?: string }): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  if (!data.nome || data.nome.trim().length < 3) {
    errors.nome = 'Por favor, informe seu nome completo.';
  }

  const cleanPhone = sanitizePhoneNumber(data.telefone || '');
  if (!cleanPhone || cleanPhone.length < 10) {
    errors.telefone = 'Por favor, informe um telefone válido com DDD (mínimo 10 dígitos).';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
