import crypto from 'crypto';
import Order from '../models/Order.js';

const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  endpoint: process.env.MOMO_ENDPOINT,
  redirectUrl: process.env.MOMO_REDIRECT_URL,
  ipnUrl: process.env.MOMO_IPN_URL,
};

const createMomoSignature = (payload) => {
  const rawSignature = [
    `accessKey=${momoConfig.accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData}`,
    `ipnUrl=${payload.ipnUrl}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo}`,
    `partnerCode=${payload.partnerCode}`,
    `redirectUrl=${payload.redirectUrl}`,
    `requestId=${payload.requestId}`,
    `requestType=${payload.requestType}`,
  ].join('&');

  return crypto
    .createHmac('sha256', momoConfig.secretKey)
    .update(rawSignature)
    .digest('hex');
};

const verifyMomoSignature = (payload) => {
  if (!payload.signature) return false;

  const rawSignature = [
    `accessKey=${momoConfig.accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData || ''}`,
    `message=${payload.message}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo}`,
    `orderType=${payload.orderType}`,
    `partnerCode=${payload.partnerCode}`,
    `payType=${payload.payType}`,
    `requestId=${payload.requestId}`,
    `responseTime=${payload.responseTime}`,
    `resultCode=${payload.resultCode}`,
    `transId=${payload.transId}`,
  ].join('&');

  const expectedSignature = crypto
    .createHmac('sha256', momoConfig.secretKey)
    .update(rawSignature)
    .digest('hex');

  return expectedSignature === payload.signature;
};

const ensureMomoConfig = () => {
  const missingKey = Object.entries(momoConfig).find(([, value]) => !value)?.[0];
  return missingKey ? `Missing MoMo config: ${missingKey}` : null;
};

export const markOrderAsPaid = async (order) => {
  order.paymentStatus = 'paid';
  order.orderStatus = order.orderStatus === 'pending' ? 'confirmed' : order.orderStatus;
  const updatedOrder = await order.save();
  return updatedOrder;
};

export const createMomoPayment = async (req, res) => {
  try {
    const configError = ensureMomoConfig();
    if (configError) {
      return res.status(500).json({ message: configError });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    if (order.paymentMethod !== 'MOMO') {
      return res.status(400).json({ message: 'Order payment method is not MoMo' });
    }

    const requestId = `${momoConfig.partnerCode}-${order._id}-${Date.now()}`;
    const momoOrderId = `${order._id}-${Date.now()}`;
    const amount = Math.round(order.totalAmount).toString();
    const requestBody = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount,
      orderId: momoOrderId,
      orderInfo: `Thanh toan don hang ${order._id}`,
      redirectUrl: momoConfig.redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      extraData: Buffer.from(JSON.stringify({ orderId: order._id.toString() })).toString('base64'),
      requestType: 'captureWallet',
      lang: 'vi',
    };

    requestBody.signature = createMomoSignature(requestBody);

    const momoResponse = await fetch(momoConfig.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await momoResponse.json();

    if (!momoResponse.ok || !data.payUrl) {
      return res.status(400).json({
        message: data.message || 'Cannot create MoMo payment',
        momo: data,
      });
    }

    res.json({
      payUrl: data.payUrl,
      deeplink: data.deeplink,
      qrCodeUrl: data.qrCodeUrl,
      orderId: order._id,
      momoOrderId,
      requestId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const handleMomoIpn = async (req, res) => {
  try {
    const configError = ensureMomoConfig();
    if (configError) {
      return res.status(500).json({ message: configError });
    }

    const isValidSignature = verifyMomoSignature(req.body);
    if (!isValidSignature) {
      return res.status(400).json({ message: 'Invalid MoMo signature' });
    }

    let appOrderId = req.body.orderId?.split('-')?.[0];
    if (req.body.extraData) {
      try {
        const extraData = JSON.parse(Buffer.from(req.body.extraData, 'base64').toString('utf8'));
        appOrderId = extraData.orderId || appOrderId;
      } catch {
        // Fallback to MoMo orderId parsing above.
      }
    }

    const order = await Order.findById(appOrderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentMethod !== 'MOMO') {
      return res.status(400).json({ message: 'Order payment method is not MoMo' });
    }

    if (Number(req.body.amount) !== Math.round(order.totalAmount)) {
      return res.status(400).json({ message: 'MoMo payment amount does not match order total' });
    }

    if (Number(req.body.resultCode) === 0) {
      const updatedOrder = await markOrderAsPaid(order);

      const io = req.app.get('io');
      if (io) io.emit('orderUpdated', updatedOrder);
    }

    res.json({ message: 'MoMo IPN received' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmMomoPaymentForDev = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Dev payment confirmation is disabled in production' });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (order.paymentMethod !== 'MOMO') {
      return res.status(400).json({ message: 'Order payment method is not MoMo' });
    }

    const updatedOrder = await markOrderAsPaid(order);
    const io = req.app.get('io');
    if (io) io.emit('orderUpdated', updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
