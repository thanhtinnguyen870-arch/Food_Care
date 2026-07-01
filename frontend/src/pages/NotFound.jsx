import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="blob bg-primary/10 w-96 h-96 rounded-full top-0 left-10" />
        <div className="blob bg-amber-300/10 w-80 h-80 rounded-full bottom-10 right-10" />
      </div>

      <div className="text-center max-w-lg">
        {/* Animated emoji */}
        <div className="text-9xl mb-4 animate-float select-none">🥗</div>

        {/* Error code */}
        <h1 className="text-8xl font-black text-gray-100 leading-none select-none mb-2">404</h1>

        <h2 className="text-2xl font-bold text-dark mb-3">Trang không tìm thấy</h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          Ồ! Có vẻ như trang bạn đang tìm kiếm đã được chuyển đi hoặc không tồn tại. 
          Đừng lo, hãy để FoodCare giúp bạn tìm điều gì đó ngon lành hơn!
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-all hover:-translate-y-1"
          >
            🏠 Về trang chủ
          </Link>
          <Link
            to="/foods"
            className="border border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition-all hover:-translate-y-1"
          >
            🍜 Xem thực đơn
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
