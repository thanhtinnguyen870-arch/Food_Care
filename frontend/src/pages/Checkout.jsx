import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'react-toastify';

const daNangDistricts = [
  'Quận Hải Châu',
  'Quận Thanh Khê',
  'Quận Sơn Trà',
  'Quận Ngũ Hành Sơn',
  'Quận Liên Chiểu',
  'Quận Cẩm Lệ',
];

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [houseAddress, setHouseAddress] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (user?.tier === 'Kim Cương') {
    discountAmount = totalAmount * 0.1;
  } else if (user?.tier === 'Vàng') {
    discountAmount = totalAmount * 0.05;
  }

  const finalAmount = totalAmount - discountAmount;

  const placeOrder = async (e) => {
    e.preventDefault();
    
    // Validation số điện thoại Việt Nam
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error('Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam (VD: 0912345678)');
      return;
    }

    if (!houseAddress.trim()) {
      toast.error('Vui lòng nhập số nhà / tên đường!');
      return;
    }

    if (!ward.trim()) {
      toast.error('Vui lòng nhập phường/xã!');
      return;
    }

    if (!district) {
      toast.error('Vui lòng chọn quận!');
      return;
    }

    setLoading(true);
    try {
      const finalAddress = `${houseAddress}, ${ward}, ${district}, Đà Nẵng`;
      const orderData = {
        items: cartItems.map(item => ({
          food: item.food,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0]
        })),
        shippingAddress: finalAddress,
        phone: phone.trim(),
        email,
        recipientName, // we might need to send this to backend or just keep in address. For now backend Order schema doesn't have recipientName specifically, so we'll append to note or it's fine.
        paymentMethod,
        totalAmount: finalAmount,
        note: note ? `Người nhận: ${recipientName}. Ghi chú: ${note}` : `Người nhận: ${recipientName}`
      };
      const { data: createdOrder } = await axiosClient.post('/orders', orderData);

      if (paymentMethod === 'MOMO') {
        localStorage.setItem('pendingMomoOrderId', createdOrder._id);
        clearCart();

        try {
          const { data: momoPayment } = await axiosClient.post('/payments/momo/create', {
            orderId: createdOrder._id,
          });

          window.location.href = momoPayment.payUrl;
        } catch (paymentError) {
          const paymentMessage =
            paymentError.response?.data?.message ||
            'Không thể kết nối cổng MoMo. Bạn có thể dùng chức năng giả lập.';

          navigate(`/payment/momo-return?simulation=1&message=${encodeURIComponent(paymentMessage)}`);
        }
        return;
      }

      setSuccess(true);
      clearCart();
    } catch (error) {
      toast.error('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="relative mb-8">
          <div className="w-28 h-28 rounded-full bg-green-50 flex items-center justify-center shadow-lg">
            <CheckCircle size={64} className="text-healthy" />
          </div>
          <div className="absolute -top-1 -right-1 text-3xl animate-bounce">🎉</div>
        </div>
        <h2 className="text-4xl font-black text-dark mb-3">Đặt hàng thành công!</h2>
        <p className="text-gray-500 mb-10 max-w-sm leading-relaxed">
          Cảm ơn bạn đã lựa chọn FoodCare. Đơn hàng đang được xử lý và sẽ sớm được giao đến bạn.
        </p>
        <div className="flex gap-3">
          <Link to="/profile?tab=tracking" className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all hover:-translate-y-1">
            Theo dõi đơn hàng
          </Link>
          <Link to="/foods" className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-all hover:-translate-y-1">
            Tiếp tục mua
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
        <Link to="/foods" className="inline-flex items-center bg-gray-100 text-gray-700 hover:bg-primary hover:text-white px-6 py-3 rounded-full font-semibold transition-all shadow-sm mt-4">
          <ArrowLeft size={20} className="mr-2" /> Quay lại chọn món
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-12 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/cart" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium text-sm">
          <ArrowLeft size={18} /> Quay lại giỏ hàng
        </Link>
        <span className="text-gray-300">|</span>
        <h1 className="text-2xl font-bold text-dark">Thanh Toán</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Form */}
        <div className="lg:w-2/3">
          <form onSubmit={placeOrder} className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                <MapPin size={18} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-dark">Thông tin giao hàng</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Họ tên người nhận <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={recipientName} 
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Tên người nhận hàng"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0912345678"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email nhận thông báo <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập địa chỉ email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="hidden">
                  <label className="block text-gray-700 font-semibold mb-2">Tỉnh / Thành phố</label>
                  <input 
                    type="text" 
                    value="Đà Nẵng"
                    readOnly
                    placeholder="VD: TP. HCM"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Quận <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Chọn quận giao hàng</option>
                    {daNangDistricts.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Phường <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="VD: Phường Hải Châu 1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Số nhà / Tên đường <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required
                  value={houseAddress}
                  onChange={(e) => setHouseAddress(e.target.value)}
                  placeholder="VD: 21 Tân Hòa 10"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-2 text-sm text-gray-500">FoodCare hiện chỉ nhận đơn giao trong nội thành Đà Nẵng.</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea 
                  rows="2"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Ví dụ: Xin ít cay, gọi trước khi giao..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3 mb-4 mt-8 pt-6 border-t border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-dark">Phương thức thanh toán</h3>
              </div>
              <div className="space-y-3">
                <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'bg-orange-50 border-primary shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-2xl">💵</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-dark">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi shipper giao hàng tới</span>
                  </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'BANK' ? 'bg-orange-50 border-primary shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="BANK"
                    checked={paymentMethod === 'BANK'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-2xl">🏦</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-dark">Chuyển khoản Ngân hàng</span>
                    <span className="text-sm text-gray-500">Chuyển khoản qua ứng dụng Mobile Banking</span>
                  </div>
                </label>

                {paymentMethod === 'BANK' && (
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl ml-8 animate-fade-in">
                    <p className="text-sm text-blue-800 mb-2">Vui lòng chuyển khoản tới thông tin sau. Đơn hàng sẽ được xác nhận ngay khi chúng tôi nhận được thanh toán.</p>
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <p><strong>Ngân hàng:</strong> Vietcombank (VCB)</p>
                      <p><strong>Số tài khoản:</strong> 1234567890</p>
                      <p><strong>Chủ tài khoản:</strong> FOODCARE COMPANY</p>
                      <p><strong>Nội dung:</strong> FC {phone || 'SĐT_CUA_BAN'}</p>
                    </div>
                  </div>
                )}

                <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${paymentMethod === 'MOMO' ? 'bg-orange-50 border-primary shadow-sm' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="MOMO"
                    checked={paymentMethod === 'MOMO'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-primary"
                  />
                  <span className="text-2xl">💳</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-dark">Thanh toán qua Ví MoMo</span>
                    <span className="text-sm text-gray-500">Chuyển sang cổng thanh toán MoMo</span>
                  </div>
                </label>

                {paymentMethod === 'MOMO' && (
                  <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl ml-8 animate-fade-in">
                    <div>
                      <p className="text-sm text-pink-800 mb-2">Sau khi xác nhận đặt hàng, bạn sẽ được chuyển sang cổng thanh toán MoMo.</p>
                      <p className="text-sm text-pink-700">Vui lòng không tắt trang trong quá trình chuyển hướng.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-600 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang xử lý...
                </>
              ) : paymentMethod === 'MOMO' ? '💳 Thanh toán với MoMo' : '✅ Xác nhận Đặt Hàng'}
            </button>
          </form>
        </div>

        {/* Right: Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-28">
            <h3 className="text-xl font-bold mb-6 border-b pb-4">Tóm tắt đơn hàng</h3>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      <img src={item.images?.[0]} onError={(e) => { e.target.onerror = null; e.target.src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"; }} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 text-xs">SL: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm">{(item.price * item.quantity).toLocaleString()}đ</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{totalAmount.toLocaleString()}đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Ưu đãi hạng {user?.tier}</span>
                  <span>-{discountAmount.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Phí giao hàng</span>
                <span>Miễn phí</span>
              </div>
              <div className="flex justify-between text-xl font-extrabold text-dark pt-4 border-t">
                <span>Tổng thanh toán</span>
                <span className="text-primary">{finalAmount.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
