import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, ShoppingCart, User, X, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorite } from '../context/FavoriteContext';

const navLinks = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Thực đơn', path: '/foods' },
  { name: 'Ưu đãi', path: '/offers' },
  { name: 'Giới thiệu', path: '/about' },
  { name: 'Liên hệ', path: '/contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { favoriteIds } = useFavorite();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full border-b border-orange-100 transition-all duration-300 py-5 ${isScrolled ? 'bg-white/95 shadow-md backdrop-blur-md py-3' : 'bg-orange-50/80 backdrop-blur-sm'}`}>
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12">
        <Link to="/" className="-mt-2 flex items-center gap-4 md:-mt-4">
          <img src="/logo.png" alt="FoodCare Icon" className="h-14 w-auto object-contain transition-transform hover:scale-110 md:h-20" />
          <span className="text-3xl font-black tracking-tight text-dark md:text-4xl">FoodCare</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-semibold transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-gray-700'}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          {user && user.role !== 'admin' && (
            <>
              <Link to="/favorites" className="relative text-gray-700 transition-colors hover:text-red-500" title="Yêu thích">
                <Heart size={24} fill={favoriteIds.size > 0 ? 'currentColor' : 'none'} className={favoriteIds.size > 0 ? 'text-red-500' : ''} />
                {favoriteIds.size > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {favoriteIds.size}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative text-gray-700 transition-colors hover:text-primary">
                <ShoppingCart size={24} />
                {cartItems.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </>
          )}

          {user ? (
            <div className="flex items-center gap-3">
              <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="flex items-center gap-2 font-semibold text-gray-700 transition-colors hover:text-primary">
                <img src={user.avatar} alt="avatar" className="h-8 w-8 rounded-full border border-primary" />
                <span>{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 hover:text-red-700">
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-2 rounded-full bg-dark px-5 py-2 font-semibold text-white transition-colors hover:bg-gray-800">
              <User size={18} /> Đăng nhập
            </Link>
          )}
        </div>

        <button className="text-dark md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Mở menu">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 top-full flex w-full flex-col gap-2 bg-white p-5 shadow-lg md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-lg font-semibold hover:text-primary py-1 ${location.pathname === link.path ? 'text-primary' : 'text-gray-800'}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-3 border-t border-gray-100 pt-3 flex flex-col gap-3">
            {user && user.role !== 'admin' && (
              <>
                <Link
                  to="/favorites"
                  className="flex items-center gap-3 font-semibold text-gray-700 hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart size={20} fill={favoriteIds.size > 0 ? 'currentColor' : 'none'} className={favoriteIds.size > 0 ? 'text-red-500' : ''} />
                  <span>Yêu thích</span>
                  {favoriteIds.size > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {favoriteIds.size}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="flex items-center gap-3 font-semibold text-gray-700 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingCart size={20} />
                  <span>Giỏ hàng</span>
                  {cartItems.length > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              </>
            )}
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/profile'}
                  className="flex items-center gap-3 font-semibold text-gray-700 hover:text-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <img src={user.avatar} alt="avatar" className="h-7 w-7 rounded-full border border-primary" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 font-semibold text-red-600 hover:text-red-700"
                >
                  <LogOut size={20} />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-3 font-semibold text-gray-700 hover:text-primary"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={20} />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
