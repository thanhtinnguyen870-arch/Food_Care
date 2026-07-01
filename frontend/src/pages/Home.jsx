import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Leaf, Bot, Zap, ShieldCheck } from 'lucide-react';
import Hero3D from '../components/Hero3D';
import axiosClient from '../api/axiosClient';

const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000&auto=format&fit=crop';

const whyFeatures = [
  {
    icon: <Leaf size={28} />,
    color: 'from-emerald-400 to-green-500',
    bg: 'bg-emerald-50',
    title: 'Thực đơn khoa học',
    desc: 'Mỗi món ăn được nghiên cứu và thiết kế bởi chuyên gia dinh dưỡng, đảm bảo đủ chất và lành mạnh.',
  },
  {
    icon: <Bot size={28} />,
    color: 'from-primary to-orange-400',
    bg: 'bg-orange-50',
    title: 'AI tư vấn thông minh',
    desc: 'Hệ thống AI phân tích tình trạng sức khỏe và gợi ý thực đơn phù hợp nhất cho từng người.',
  },
  {
    icon: <Zap size={28} />,
    color: 'from-amber-400 to-yellow-500',
    bg: 'bg-amber-50',
    title: 'Giao hàng siêu tốc',
    desc: 'Đảm bảo giao trong vòng 30 phút nội thành Đà Nẵng. Đồ ăn nóng hổi, tươi ngon đến tận nhà.',
  },
  {
    icon: <ShieldCheck size={28} />,
    color: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50',
    title: 'Nguyên liệu sạch 100%',
    desc: 'Cam kết sử dụng nguyên liệu tươi sạch, có nguồn gốc rõ ràng, không chất bảo quản, không phẩm màu.',
  },
];

const Home = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [menuFoods, setMenuFoods] = useState([]);
  const [foodsLoading, setFoodsLoading] = useState(true);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const { data } = await axiosClient.get('/foods');
        setMenuFoods(data);
      } catch (error) {
        console.error(error);
      } finally {
        setFoodsLoading(false);
      }
    };
    fetchFoods();
  }, []);

  const visibleFoods = menuFoods.slice(startIndex, startIndex + 2);
  const canSlide = menuFoods.length > 2;

  const goPrev = () => {
    if (!canSlide) return;
    setStartIndex((current) => (current - 2 < 0 ? Math.max(menuFoods.length - 2, 0) : current - 2));
  };

  const goNext = () => {
    if (!canSlide) return;
    setStartIndex((current) => (current + 2 >= menuFoods.length ? 0 : current + 2));
  };

  return (
    <div>
      <Hero3D />

      {/* ========== WHY FOODCARE SECTION ========== */}
      <section className="py-20 px-6 md:px-16 bg-gradient-to-b from-white to-orange-50/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-100 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Tại sao chọn chúng tôi?
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-dark leading-tight">
              FoodCare – Ăn đúng cách,{' '}
              <span className="text-gradient">sống khỏe hơn</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
              Chúng tôi kết hợp khoa học dinh dưỡng và công nghệ AI để mang lại trải nghiệm ăn uống tốt nhất cho bạn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyFeatures.map((feat) => (
              <div
                key={feat.title}
                className="group bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="font-bold text-dark text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== AI SECTION ========== */}
      <section className="px-6 py-20 md:px-16 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="inline-block bg-orange-100 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
              Trợ lý AI
            </span>
            <h2 className="mb-3 text-4xl font-extrabold text-dark">
              Không biết ăn gì? Hãy để{' '}
              <span className="text-gradient">chuyên gia AI</span> gợi ý
            </h2>
            <p className="text-gray-500 max-w-lg mx-auto">Trải nghiệm tính năng tư vấn món ăn thông minh theo tình trạng sức khỏe của bạn.</p>
          </div>

          <div className="flex flex-col gap-10 md:flex-row items-start">
            {/* AI Chat Preview */}
            <div className="glassmorphism relative flex-1 overflow-hidden rounded-3xl p-6 shadow-3d">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center font-bold text-white shadow-md">
                  FC
                </div>
                <div>
                  <h4 className="font-bold text-dark">FoodCare Assistant</h4>
                  <p className="text-xs text-emerald-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                    Online
                  </p>
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gray-100 px-4 py-3 text-sm">
                    Tôi bị tiểu đường, nên ăn gì?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-orange-200 bg-orange-50 px-4 py-3 text-orange-900 text-sm leading-relaxed">
                    Chào bạn! Với người bị tiểu đường, bạn nên ưu tiên món ít đường, giàu chất xơ và protein. Tôi gợi ý <b>Salad ức gà rau củ</b> hoặc <b>Cá hồi áp chảo</b> nhé! 🥗
                  </div>
                </div>
              </div>

              <Link
                to="/ai-recommend"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 font-semibold text-white shadow-md transition-all hover:bg-orange-600 hover:-translate-y-0.5"
              >
                <Bot size={18} /> Tư vấn ngay
              </Link>
            </div>

            {/* Food Slider */}
            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">Gợi ý hôm nay</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canSlide}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-primary shadow-sm transition-colors hover:bg-orange-50 disabled:opacity-40"
                    aria-label="Món trước"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canSlide}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-primary shadow-sm transition-colors hover:bg-orange-50 disabled:opacity-40"
                    aria-label="Món tiếp theo"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {foodsLoading ? (
                  <>
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-2xl bg-white p-4 shadow-lg animate-pulse">
                        <div className="h-40 w-full rounded-xl bg-gray-100 mb-4" />
                        <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    ))}
                  </>
                ) : visibleFoods.length ? (
                  visibleFoods.map((food) => (
                    <Link
                      key={food._id}
                      to={`/food/${food._id}`}
                      className="group rounded-2xl bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-50"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={food.images?.[0] || fallbackImage}
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = fallbackImage;
                          }}
                          alt={food.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="text-base font-bold text-dark group-hover:text-primary transition-colors line-clamp-1">{food.name}</h4>
                        <p className="text-xs text-gray-500 mb-1">{food.category?.name || 'Món healthy'}</p>
                        <p className="font-extrabold text-primary">{Number(food.price || 0).toLocaleString('vi-VN')}đ</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full rounded-2xl bg-white p-8 text-center font-semibold text-gray-500 shadow-lg">
                    Chưa có món ăn trong thực đơn.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA BANNER ========== */}
      <section className="py-20 px-6 md:px-16">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-amber-400 p-10 md:p-14 text-center shadow-float">
            <div className="absolute -top-12 -left-12 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Bắt đầu hành trình sống khỏe ngay hôm nay! 🌿
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Khám phá hàng trăm món ăn lành mạnh, nhận tư vấn từ AI và đặt hàng chỉ trong vài giây.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/foods"
                  className="bg-white text-primary px-8 py-3.5 rounded-full font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-base"
                >
                  🍜 Khám phá thực đơn
                </Link>
                <Link
                  to="/ai-recommend"
                  className="bg-white/20 backdrop-blur-sm text-white border border-white/40 px-8 py-3.5 rounded-full font-bold hover:bg-white/30 transition-all text-base"
                >
                  🤖 Nhận tư vấn AI
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
