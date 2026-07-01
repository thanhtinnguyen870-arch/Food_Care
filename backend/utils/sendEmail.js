import nodemailer from 'nodemailer';

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const formatCurrency = (value) =>
  Number(value).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

export const createOrderEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Dich vu email chua duoc cau hinh.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const buildOrderConfirmationMail = (order, email) => {
  const orderId = order._id.toString();
  const itemRows = order.items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px 0;">${escapeHtml(item.name)}</td>
          <td style="padding: 8px 0; text-align: center;">${Number(item.quantity)}</td>
          <td style="padding: 8px 0; text-align: right;">
            ${formatCurrency(Number(item.price) * Number(item.quantity))}
          </td>
        </tr>
      `,
    )
    .join('');

  return {
    from: `"FoodCare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `FoodCare - Xác nhận đơn hàng #${orderId.slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #ff6b00; text-align: center;">Xác nhận đặt hàng thành công!</h2>
        <p>Chào bạn,</p>
        <p>Cảm ơn bạn đã đặt hàng tại <strong>FoodCare</strong>. Dưới đây là thông tin đơn hàng của bạn:</p>

        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Mã đơn hàng: ${escapeHtml(orderId)}</h3>
          <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
          <p><strong>Phương thức thanh toán:</strong> ${escapeHtml(order.paymentMethod)}</p>
          <p><strong>Trạng thái:</strong> ${
            order.paymentMethod === 'BANK' || order.paymentMethod === 'MOMO'
              ? 'Chờ thanh toán / Xác nhận'
              : 'Chờ giao hàng (COD)'
          }</p>
        </div>

        <h3 style="color: #333;">Chi tiết món ăn:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 2px solid #ddd; text-align: left;">
            <th style="padding: 8px 0;">Tên món</th>
            <th style="padding: 8px 0; text-align: center;">Số lượng</th>
            <th style="padding: 8px 0; text-align: right;">Giá</th>
          </tr>
          ${itemRows}
        </table>

        <div style="text-align: right; font-size: 18px;">
          <strong>Tổng thanh toán:
            <span style="color: #ff6b00;">${formatCurrency(order.totalAmount)}</span>
          </strong>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
          Mọi thắc mắc vui lòng liên hệ hotline: 0987 654 321 hoặc trả lời email này.<br />
          Chúc bạn có một bữa ăn ngon miệng cùng FoodCare!
        </p>
      </div>
    `,
  };
};

const sendOrderConfirmationEmail = async (order, email, options = {}) => {
  try {
    const transporter = options.transporter || createOrderEmailTransporter();
    const info = await transporter.sendMail(buildOrderConfirmationMail(order, email));

    console.log('Order confirmation email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error.message);
    return false;
  }
};

export default sendOrderConfirmationEmail;
