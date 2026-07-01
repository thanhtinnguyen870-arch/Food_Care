import { Link } from 'react-router-dom';
import { Globe, Share2, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-gray-300 pt-16 pb-8 border-t-4 border-primary">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-4 mb-6 -mt-2 md:-mt-4">
              <img src="/logo.png" alt="FoodCare Icon" className="h-16 md:h-24 w-auto object-contain" />
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight">FoodCare</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Quán ăn khoa học cung cấp thực đơn dinh dưỡng cá nhân hóa, giúp bạn ăn ngon hơn và sống khỏe hơn mỗi ngày.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Globe size={18}/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><MessageCircle size={18}/></a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"><Share2 size={18}/></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link></li>
              <li><Link to="/foods" className="hover:text-primary transition-colors">Thực đơn nổi bật</Link></li>
              <li><Link to="/ai-recommend" className="hover:text-primary transition-colors">Tư vấn sức khỏe</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Danh mục Healthy</h4>
            <ul className="space-y-3">
              <li><Link to="/foods?category=mon-cho-nguoi-tieu-duong" className="hover:text-primary transition-colors">Món cho người Tiểu đường</Link></li>
              <li><Link to="/foods?category=mon-giam-can" className="hover:text-primary transition-colors">Thực đơn Giảm cân</Link></li>
              <li><Link to="/foods?category=mon-tang-co" className="hover:text-primary transition-colors">Tăng cơ - Tập Gym</Link></li>
              <li><Link to="/foods?category=mon-chay" className="hover:text-primary transition-colors">Ăn chay thanh đạm</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Liên hệ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-primary flex-shrink-0 mt-1" size={18} />
                <span>Số 21 Tân Hòa 10, Quận Thanh Khê, Thành Phố Đà Nẵng</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-primary flex-shrink-0" size={18} />
                <span>0383024159</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-primary flex-shrink-0" size={18} />
                <span>thanhtinnguyen870@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} FoodCare. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
