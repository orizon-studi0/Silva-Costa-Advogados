import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBrPhone,
  validateContactFields,
  buildWhatsAppUrl,
  wrapSlideIndex,
} from '../script.js';

test('formatBrPhone formats mobile and landline Brazilian numbers properly', () => {
  assert.equal(formatBrPhone(''), '');
  assert.equal(formatBrPhone('19'), '(19');
  assert.equal(formatBrPhone('199988'), '(19) 9988');
  assert.equal(formatBrPhone('19998887766'), '(19) 99888-7766');
  assert.equal(formatBrPhone('(19) 99888-7766999'), '(19) 99888-7766');
});

test('validateContactFields enforces minimum name and phone digit counts', () => {
  const invalidEmpty = validateContactFields('  ', '');
  assert.equal(invalidEmpty.nomeValid, false);
  assert.equal(invalidEmpty.telefoneValid, false);

  const invalidShort = validateContactFields('Ab', '(19) 9988-776');
  assert.equal(invalidShort.nomeValid, false);
  assert.equal(invalidShort.telefoneValid, false);

  const valid = validateContactFields('  Carlos Eduardo  ', '(19) 99888-7766');
  assert.equal(valid.nomeValid, true);
  assert.equal(valid.telefoneValid, true);
  assert.equal(valid.cleanName, 'Carlos Eduardo');
  assert.equal(valid.phoneDigits, '19998887766');
});

test('buildWhatsAppUrl builds properly encoded wa.me link with default fallback message', () => {
  const url = buildWhatsAppUrl({
    nome: 'Carlos Eduardo',
    telefone: '(19) 99888-7766',
    area: 'Direito Trabalhista',
    mensagem: '  ',
  });
  assert.ok(url.startsWith('https://wa.me/5511999998888?text='));
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.match(decoded, /\*Nome:\* Carlos Eduardo/);
  assert.match(decoded, /\*Telefone:\* \(19\) 99888-7766/);
  assert.match(decoded, /\*Área de Interesse:\* Direito Trabalhista/);
  assert.match(decoded, /Solicito agendamento de consulta inicial\./);
});

test('wrapSlideIndex wraps forward and backward within gallery bounds', () => {
  assert.equal(wrapSlideIndex(0, 6), 0);
  assert.equal(wrapSlideIndex(6, 6), 0);
  assert.equal(wrapSlideIndex(-1, 6), 5);
  assert.equal(wrapSlideIndex(7, 6), 1);
  assert.equal(wrapSlideIndex(3, 0), 0);
});
