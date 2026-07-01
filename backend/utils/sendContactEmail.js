import nodemailer from 'nodemailer';

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const sendContactEmail = async ({ name, email, subject, message }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Dịch vụ email chưa được cấu hình.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject || 'Không có chủ đề');
  const safeMessage = escapeHtml(message).replaceAll('\n', '<br />');
  const recipient = process.env.CONTACT_EMAIL || process.env.EMAIL_USER;

  await transporter.sendMail({
    from: `"FoodCare Website" <${process.env.EMAIL_USER}>`,
    to: recipient,
    replyTo: email,
    subject: `[FoodCare liên hệ] ${subject || 'Tin nhắn mới'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #1f2937;">
        <div style="background: #ff7a00; padding: 20px 24px; color: #ffffff;">
          <h2 style="margin: 0;">Tin nhắn mới từ FoodCare</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: 0; padding: 24px;">
          <p><strong>Họ tên:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Chủ đề:</strong> ${safeSubject}</p>
          <div style="margin-top: 24px; padding: 18px; background: #f9fafb; border-radius: 8px; line-height: 1.6;">
            ${safeMessage}
          </div>
          <p style="margin-top: 24px; color: #6b7280; font-size: 13px;">
            Bạn có thể trả lời trực tiếp email này để phản hồi người gửi.
          </p>
        </div>
      </div>
    `,
  });
};

export default sendContactEmail;
