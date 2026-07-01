import test from 'node:test';
import assert from 'node:assert/strict';
import { markOrderAsPaid } from '../controllers/paymentController.js';

test('simulated MoMo payment marks a pending order as paid and confirmed', async () => {
  let saveCalled = false;
  const order = {
    paymentStatus: 'unpaid',
    orderStatus: 'pending',
    async save() {
      saveCalled = true;
      return this;
    },
  };

  const updatedOrder = await markOrderAsPaid(order);

  assert.equal(saveCalled, true);
  assert.equal(updatedOrder.paymentStatus, 'paid');
  assert.equal(updatedOrder.orderStatus, 'confirmed');
});

test('payment confirmation keeps an order status that already progressed', async () => {
  const order = {
    paymentStatus: 'unpaid',
    orderStatus: 'shipping',
    async save() {
      return this;
    },
  };

  const updatedOrder = await markOrderAsPaid(order);

  assert.equal(updatedOrder.paymentStatus, 'paid');
  assert.equal(updatedOrder.orderStatus, 'shipping');
});
