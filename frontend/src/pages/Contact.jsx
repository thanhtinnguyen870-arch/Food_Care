import { useState } from 'react';
import { Mail, MapPin, Phone, Send, Clock, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

const initialForm = { name: '', email: '', subject: '', message: '' };

const contactInfos = [
  {
    icon: <MapPin size={22} />,
    label: 'Địa chỉ',
    value: 'Số 21 Tân Hòa 10, Quận Thanh Khê, Thành phố Đà Nẵng',
    color: 'bg-orange-100 text-primary',
  },
  {
    icon: <Phone size={22} />,
    label: 'Điện thoại',
    value: '0383 024 159',
    href: 'tel:0383024159',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: <Mail size={22} />,
    label: 'Email',
    value: 'thanhtinnguyen870@gmail.com',
    href: 'mailto:thanhtinnguyen870@gmail.com',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: <Clock size={22} />,
    label: 'Giờ hoạt động',
    value: 'Thứ 2 – Chủ nhật: 07:00 – 21:00',
    color: 'bg-purple-100 text-purple-600',
  },
];

const Contact = () => {
  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await axiosClient.post('/contact', formData);
      toast.success(data.message);
      setFormData(initialForm);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Chưa thể gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="blob bg-primary/10 w-96 h-96 rounded-full -top-20 -left-20" />
        <div className="blob bg-blue-300/10 w-80 h-80 rounded-full top-1/2 right-0" />
        <div className="blob bg-amber-200/10 w-72 h-72 rounded-full bottom-0 left-1/3" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-16">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="inline-flex items-center gap-2 bg-orange-100 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            <MessageCircle size={16} /> Liên hệ với chúng tôi
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-dark mb-4">
            Chúng tôi luôn lắng <span className="text-gradient">nghe bạn</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-500 leading-relaxed">
            Có câu hỏi về dinh dưỡng, đơn hàng hay ứng dụng? Đội ngũ FoodCare sẵn sàng hỗ trợ bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfos.map((info) => (
              <div
                key={info.label}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center ${info.color}`}>
                  {info.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{info.label}</p>
                  {info.href ? (
                    <a href={info.href} className="text-gray-700 font-semibold hover:text-primary transition-colors text-sm leading-relaxed">
                      {info.value}
                    </a>
                  ) : (
                    <p className="text-gray-700 font-semibold text-sm leading-relaxed">{info.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-48">
              <iframe
                title="FoodCare Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.197!2d108.1800!3d16.0700!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDA0JzEyLjAiTiAxMDjCsDEwJzQ4LjAiRQ!5e0!3m2!1svi!2svn!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(20%)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-dark mb-6 flex items-center gap-2">
                <Send size={22} className="text-primary" /> Gửi tin nhắn
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-1.5">Họ tên <span className="text-red-500">*</span></label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      maxLength={100}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-sm font-semibold text-gray-700 mb-1.5">Chủ đề</label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    maxLength={150}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    placeholder="Vấn đề bạn quan tâm..."
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-1.5">Nội dung tin nhắn <span className="text-red-500">*</span></label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={5000}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    placeholder="Viết tin nhắn của bạn ở đây..."
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{formData.message.length}/5000</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={18} />
                  {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
