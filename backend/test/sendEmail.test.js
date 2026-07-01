import test from 'node:test';
import assert from 'node:assert/strict';
import nodemailer from 'nodemailer';
import sendOrderConfirmationEmail, {
  buildOrderConfirmationMail,
} from '../utils/sendEmail.js';

const order = {
  _id: {
    toString: () => '665f17cd76136d98f65abc12',
  },
  createdAt: new Date('2026-06-10T08:00:00.000Z'),
  paymentMethod: 'COD',
  totalAmount: 125000,
  items: [
    {
      name: 'Cơm gạo lứt <healthy>',
      price: 62500,
      quantity: 2,
    },
  ],
};

test('builds an order confirmation addressed to the customer', () => {
  process.env.EMAIL_USER = 'foodcare@example.com';

  const mail = buildOrderConfirmationMail(order, 'customer@example.com');

  assert.equal(mail.to, 'customer@example.com');
  assert.equal(mail.from, '"FoodCare" <foodcare@example.com>');
  assert.match(mail.subject, /#5abc12$/);
  assert.match(mail.html, /Xác nhận đặt hàng thành công/);
  assert.match(mail.html, /125\.000/);
  assert.match(mail.html, /Cơm gạo lứt &lt;healthy&gt;/);
  assert.doesNotMatch(mail.html, /Cơm gạo lứt <healthy>/);
});

test('reports success after the mail transport accepts the message', async () => {
  process.env.EMAIL_USER = 'foodcare@example.com';
  const transporter = nodemailer.createTransport({ jsonTransport: true });

  const sent = await sendOrderConfirmationEmail(order, 'customer@example.com', {
    transporter,
  });

  assert.equal(sent, true);
});

test('reports failure without configured credentials', async () => {
  const previousUser = process.env.EMAIL_USER;
  const previousPass = process.env.EMAIL_PASS;
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;

  const sent = await sendOrderConfirmationEmail(order, 'customer@example.com');

  assert.equal(sent, false);
  if (previousUser === undefined) delete process.env.EMAIL_USER;
  else process.env.EMAIL_USER = previousUser;

  if (previousPass === undefined) delete process.env.EMAIL_PASS;
  else process.env.EMAIL_PASS = previousPass;
});
