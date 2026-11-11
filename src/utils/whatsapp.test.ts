import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePhoneNumber,
  formatWhatsAppMessage,
  buildWhatsAppUrl,
  validateContactForm,
  WA_PHONE_NUMBER,
  DEFAULT_WA_MESSAGE,
} from './whatsapp.ts';

test('sanitizePhoneNumber removes non-numeric characters', () => {
  assert.equal(sanitizePhoneNumber('(19) 98765-4321'), '19987654321');
  assert.equal(sanitizePhoneNumber('+55 11 99999-8888'), '5511999998888');
  assert.equal(sanitizePhoneNumber('12345'), '12345');
});

test('buildWhatsAppUrl returns default message when empty', () => {
  const url = buildWhatsAppUrl();
  assert.equal(url, `https://wa.me/${WA_PHONE_NUMBER}?text=${encodeURIComponent(DEFAULT_WA_MESSAGE)}`);
});

test('formatWhatsAppMessage compiles formatted message with user data', () => {
  const message = formatWhatsAppMessage({
    nome: 'Carlos Eduardo',
    telefone: '(19) 99888-7766',
    area: 'Direito Trabalhista',
    mensagem: 'Gostaria de agendar atendimento sobre rescisão.',
  });

  assert.ok(message.includes('*Nome:* Carlos Eduardo'));
  assert.ok(message.includes('*Telefone:* (19) 99888-7766'));
  assert.ok(message.includes('*Área de Interesse:* Direito Trabalhista'));
  assert.ok(message.includes('Silva & Costa Advogados'));
});

test('buildWhatsAppUrl encodes query parameters properly', () => {
  const url = buildWhatsAppUrl({
    nome: 'Mariana Silva',
    telefone: '19988887777',
    area: 'Direito Empresarial',
    mensagem: 'Dúvidas contratuais.',
  });

  assert.ok(url.startsWith(`https://wa.me/${WA_PHONE_NUMBER}?text=`));
  assert.ok(url.includes(encodeURIComponent('Mariana Silva')));
  assert.ok(url.includes(encodeURIComponent('Direito Empresarial')));
});

test('validateContactForm checks name and phone rules', () => {
  const invalidResult = validateContactForm({ nome: 'Jo', telefone: '123' });
  assert.equal(invalidResult.isValid, false);
  assert.ok(invalidResult.errors.nome);
  assert.ok(invalidResult.errors.telefone);

  const validResult = validateContactForm({
    nome: 'Dr. Roberto Mendes',
    telefone: '(19) 98765-4321',
  });
  assert.equal(validResult.isValid, true);
  assert.equal(Object.keys(validResult.errors).length, 0);
});
