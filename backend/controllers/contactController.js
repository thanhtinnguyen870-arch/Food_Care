import sendContactEmail from '../utils/sendContactEmail.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContact = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const subject = String(req.body.subject || '').trim();
    const message = String(req.body.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và nội dung.' });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Địa chỉ email không hợp lệ.' });
    }

    if (name.length > 100 || subject.length > 150 || message.length > 5000) {
      return res.status(400).json({ message: 'Nội dung vượt quá độ dài cho phép.' });
    }

    await sendContactEmail({ name, email, subject, message });

    return res.json({ message: 'Tin nhắn đã được gửi. FoodCare sẽ phản hồi bạn sớm nhất!' });
  } catch (error) {
    console.error('Contact email error:', error);
    return res.status(500).json({ message: 'Chưa thể gửi tin nhắn. Vui lòng thử lại sau.' });
  }
};
