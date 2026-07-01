import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus, Tag } from 'lucide-react';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();

  // Chưa đăng nhập → chuyển về trang login
  if (!user) {
    return <Navigate to="/login" state={{ from: '/cart' }} replace />;
  }

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountPercent = 0;
  let tierLabel = '';
  if (user?.tier === 'Kim Cương') {
    discountPercent = 10;
    tierLabel = '💎 Kim Cương';
  } else if (user?.tier === 'Vàng') {
    discountPercent = 5;
    tierLabel = '🥇 Vàng';
  }

  const discountAmount = total * (discountPercent / 100);
  const finalAmount = total - discountAmount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="relative mb-8">
          <div className="w-40 h-40 rounded-full bg-orange-50 flex items-center justify-center">
            <ShoppingBag size={72} className="text-primary opacity-30" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🥗</div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Hãy thêm những món ăn lành mạnh vào giỏ để bắt đầu đặt hàng nhé!
        </p>
        <Link
          to="/foods"
          className="bg-primary text-white px-10 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all hover:-translate-y-1"
        >
          Xem thực đơn
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-12 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-dark">Giỏ Hàng</h1>
          <p className="text-gray-500 mt-1">{cartItems.length} món trong giỏ</p>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors font-medium"
        >
          <Trash2 size={16} /> Xóa tất cả
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.food}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 p-4 transition-all hover:shadow-md"
            >
              {/* Image */}
              <Link to={`/food/${item.food}`} className="flex-shrink-0">
                <img
                  src={item.images?.[0]}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop'; }}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/food/${item.food}`}>
                  <h3 className="font-bold text-base hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                </Link>
                <p className="text-primary font-bold mt-1">{item.price.toLocaleString('vi-VN')}đ / phần</p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.food, item.quantity - 1)}
                      className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                      aria-label="Giảm"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-dark select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.food, item.quantity + 1)}
                      className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors"
                      aria-label="Tăng"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-sm text-gray-400">×</span>
                  <span className="font-extrabold text-dark">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => removeFromCart(item.food)}
                className="flex-shrink-0 w-9 h-9 bg-red-50 text-red-400 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                aria-label="Xóa món"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-3xl shadow-3d border border-gray-50 sticky top-28">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Tag size={20} className="text-primary" /> Tóm tắt đơn hàng
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Tạm tính ({cartItems.reduce((s, i) => s + i.quantity, 0)} phần)</span>
                <span>{total.toLocaleString('vi-VN')}đ</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold text-sm bg-emerald-50 rounded-xl px-3 py-2">
                  <span className="flex items-center gap-1">
                    <span>{tierLabel}</span> (-{discountPercent}%)
                  </span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 text-sm">
                <span>Phí giao hàng</span>
                <span className="text-emerald-600 font-semibold">Miễn phí</span>
              </div>

              <div className="h-px bg-gray-100 my-2" />

              <div className="flex justify-between text-xl font-bold text-dark">
                <span>Tổng cộng</span>
                <span className="text-primary">{finalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-md flex items-center justify-center gap-2 hover:bg-orange-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Thanh toán <ArrowRight size={20} />
            </Link>

            <Link
              to="/foods"
              className="w-full text-center block mt-4 text-gray-500 text-sm hover:text-primary transition-colors font-medium"
            >
              ← Tiếp tục mua hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
