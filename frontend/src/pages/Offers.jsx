import { Link } from 'react-router-dom';
import {
  Bell,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ClipboardList,
  Crown,
  Diamond,
  Gift,
  Megaphone,
  ShoppingBag,
  ShoppingBasket,
  Sparkles,
  Star,
  TicketPercent,
  UserRound,
  Utensils,
} from 'lucide-react';

const tierCards = [
  {
    name: 'Thành viên',
    tag: 'Cơ bản',
    intro: 'Dành cho tất cả khách hàng sau khi đăng ký tài khoản',
    icon: UserRound,
    color: 'emerald',
    border: 'border-emerald-300 shadow-glow-emerald',
    bg: 'glass-card bg-emerald-50/20',
    iconBg: 'bg-gradient-to-br from-emerald-300 to-emerald-600 text-white shadow-lg border border-emerald-200/50',
    text: 'text-emerald-900',
    check: 'text-emerald-500',
    benefits: [
      'Theo dõi lịch sử đơn hàng',
      'Nhận thông báo món mới',
      'Nhận thông báo ưu đãi và món mới',
      'Tích lũy chi tiêu để nâng hạng',
    ],
  },
  {
    name: 'Thành viên Vàng',
    tag: 'Nổi bật',
    intro: 'Khi tổng chi tiêu đạt từ 5.000.000đ trở lên',
    icon: Crown,
    color: 'gold',
    border: 'border-amber-300 shadow-glow-gold z-10 md:-translate-y-4',
    bg: 'glass-card bg-amber-50/30',
    iconBg: 'bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-lg border border-amber-200/50',
    text: 'text-amber-900',
    check: 'text-amber-500',
    featured: true,
    benefits: [
      'Giảm 5% cho tất cả sản phẩm',
      'Ưu tiên nhận mã giảm giá theo mùa',
      'Nhận đề xuất combo ưu đãi phù hợp hơn',
      'Tích lũy tiếp để lên hạng Kim Cương',
    ],
  },
  {
    name: 'Thành viên Kim Cương',
    tag: 'Cao cấp',
    intro: 'Khi tổng chi tiêu đạt từ 20.000.000đ trở lên',
    icon: Diamond,
    color: 'amethyst',
    border: 'border-violet-300 shadow-glow-amethyst',
    bg: 'glass-card bg-violet-50/20',
    iconBg: 'bg-gradient-to-br from-violet-300 to-violet-600 text-white shadow-lg border border-violet-200/50',
    text: 'text-violet-900',
    check: 'text-violet-500',
    benefits: [
      'Giảm 10% cho tất cả sản phẩm',
      'Ưu tiên ưu đãi đặc biệt',
      'Trải nghiệm quyền lợi cao cấp nhất tại FoodCare',
      'Nhận thông tin chương trình hấp dẫn sớm hơn',
    ],
  },
];

const tableRows = [
  { label: 'Điều kiện tham gia', icon: ClipboardList, values: ['Sau khi đăng ký tài khoản', 'Từ 5.000.000đ', 'Từ 20.000.000đ'] },
  { label: 'Theo dõi đơn hàng', icon: ClipboardList, values: [true, true, true] },
  { label: 'Thông báo món mới', icon: Bell, values: [true, true, true] },
  { label: 'Giảm giá toàn bộ sản phẩm', icon: TicketPercent, values: ['0%', '5%', '10%'], highlight: true },
  { label: 'Ưu tiên mã giảm giá', icon: Gift, values: [false, true, true] },
  { label: 'Thông báo sớm chương trình mới', icon: Megaphone, values: [false, false, true] },
];

const steps = [
  {
    title: 'Đăng ký tài khoản',
    description: 'Tạo tài khoản miễn phí chỉ trong vài giây.',
    icon: UserRound,
  },
  {
    title: 'Mua món và tích lũy chi tiêu',
    description: 'Mua các món ăn lành mạnh và tích lũy chi tiêu.',
    icon: ShoppingBasket,
  },
  {
    title: 'Tự động nâng hạng khi đủ điều kiện',
    description: 'Hệ thống tự động cập nhật hạng thành viên của bạn.',
    icon: ChartNoAxesColumnIncreasing,
  },
];

const CheckValue = ({ value, index, highlight }) => {
  if (value === true) return <div className="flex justify-center"><div className="rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 p-1 shadow-inner"><CheckCircle2 className="text-emerald-600 drop-shadow-md" size={17} /></div></div>;
  if (value === false) return <span className="text-gray-400 font-bold">-</span>;

  const colors = ['text-emerald-700', 'text-amber-600', 'text-violet-700'];
  return <span className={`${highlight ? `text-lg font-black ${colors[index]} drop-shadow-sm` : 'font-semibold text-gray-700'}`}>{value}</span>;
};

const CrystalHeroCard = ({ children, className = '', glowColor = '' }) => (
  <div className={`relative flex h-48 w-36 flex-col items-center justify-center rounded-2xl border bg-white/40 p-3 text-center shadow-glass backdrop-blur-xl transition-transform duration-700 hover:-translate-y-3 ${className} ${glowColor}`}>
    {/* Inner glass reflection */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 via-white/50 to-transparent pointer-events-none" />
    <div className="relative z-10 flex flex-col items-center">{children}</div>
  </div>
);

const Offers = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F8F9FB] text-dark font-sans relative">
      {/* Global Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-[800px] overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 rounded-full bg-emerald-300/30 blur-[100px] animate-pulse-glow" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-200/20 blur-[120px] animate-pulse-glow" style={{animationDelay: '1s'}} />
        <div className="absolute top-[60%] left-[20%] w-[400px] h-[400px] rounded-full bg-violet-300/20 blur-[100px] animate-pulse-glow" style={{animationDelay: '2s'}} />
      </div>

      <section className="relative z-10 px-4 py-12 md:py-16">
        <div className="container mx-auto min-w-[980px] max-w-6xl">
          <div className="grid grid-cols-[0.95fr_1.05fr] items-center gap-12">
            
            {/* Left Content */}
            <div className="relative z-20">
              <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-emerald-200 bg-emerald-50/50 backdrop-blur-sm text-sm font-bold text-emerald-700 shadow-sm">
                <Sparkles size={16} className="inline mr-2 -mt-0.5" />
                Đặc quyền hội viên
              </div>
              <h1 className="max-w-xl text-5xl font-black leading-tight text-slate-800 md:text-6xl drop-shadow-sm">
                Ưu đãi thành viên <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">FoodCare</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600 font-medium">
                Tích lũy chi tiêu, nâng hạng thành viên và nhận ngay những đặc quyền hấp dẫn khi mua các món ăn lành mạnh tại FoodCare.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#tiers" className="neo-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-glow-emerald">
                  <Gift size={18} />
                  Khám phá ưu đãi
                </a>
                <Link to="/foods" className="neo-button inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-6 py-3.5 text-sm font-bold text-slate-700 shadow-lg hover:border-amber-300 hover:text-amber-600">
                  <ShoppingBag size={18} />
                  Mua món ngay
                </Link>
              </div>
            </div>

            {/* Right 3D Showcase */}
            <div className="relative min-h-[450px] flex justify-center items-center perspective-[1000px]">
              
              {/* Floating Elements */}
              <div className="absolute top-10 left-10 animate-float-delay z-30">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-500 shadow-glow-gold flex items-center justify-center text-white border border-white/40 backdrop-blur-sm">
                  <Star size={20} fill="currentColor" />
                </div>
              </div>
              
              <div className="absolute bottom-20 right-10 animate-float z-30">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-200 to-emerald-500 shadow-glow-emerald flex items-center justify-center text-white border border-white/40 backdrop-blur-sm rotate-12">
                  <span className="font-black text-xl">%</span>
                </div>
              </div>

              {/* Pedestal Base */}
              <div className="absolute bottom-10 left-1/2 w-[400px] h-[100px] -translate-x-1/2 rounded-[50%] bg-white/40 border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.1),inset_0_-10px_20px_rgba(255,255,255,0.8)] backdrop-blur-md z-0" style={{ transform: 'translateX(-50%) rotateX(60deg)' }}></div>
              <div className="absolute bottom-6 left-1/2 w-[350px] h-[80px] -translate-x-1/2 rounded-[50%] bg-gradient-to-r from-emerald-200/50 via-amber-200/50 to-violet-200/50 blur-xl z-0"></div>

              {/* 3D Crystal Cards */}
              <div className="relative z-20 w-full h-full flex justify-center items-end pb-16 gap-4">
                
                <CrystalHeroCard className="mb-4 animate-float border-emerald-200" glowColor="shadow-glow-emerald">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mb-4 shadow-inner border border-emerald-50">
                    <UserRound className="text-emerald-600 drop-shadow-md" size={28} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600/70 mb-1">Thành viên</p>
                  <p className="text-lg font-black text-emerald-800">Cơ Bản</p>
                </CrystalHeroCard>

                <CrystalHeroCard className="z-30 h-56 w-40 -mt-8 animate-float-delay border-amber-300 bg-gradient-to-b from-white/60 to-amber-50/60" glowColor="shadow-glow-gold">
                  <div className="absolute -top-4 w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-glow-gold flex items-center justify-center border border-white text-white">
                    <Crown size={16} fill="currentColor" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-4 shadow-inner border border-amber-50 mt-2">
                    <Crown className="text-amber-600 drop-shadow-md" size={32} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-600/70 mb-1">Thành viên</p>
                  <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-orange-600 drop-shadow-sm">Vàng</p>
                </CrystalHeroCard>

                <CrystalHeroCard className="mb-4 animate-float border-violet-200" glowColor="shadow-glow-amethyst">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center mb-4 shadow-inner border border-violet-50">
                    <Diamond className="text-violet-600 drop-shadow-md" size={28} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-violet-600/70 mb-1">Thành viên</p>
                  <p className="text-lg font-black text-violet-800">Kim Cương</p>
                </CrystalHeroCard>

              </div>
              
              <div className="absolute right-0 top-10 rounded-2xl border border-white/60 bg-white/50 backdrop-blur-md px-5 py-3 text-center shadow-glass z-30 transform rotate-3 hover:rotate-0 transition-transform">
                <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Ăn lành</p>
                <p className="text-xs font-black uppercase tracking-widest text-emerald-700">Sống khỏe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section id="tiers" className="relative z-10 px-4 py-16">
        <div className="container mx-auto min-w-[980px] max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-slate-800 md:text-5xl drop-shadow-sm">3 hạng thành viên</h2>
            <p className="mt-3 text-lg text-slate-600 font-medium">Càng mua nhiều, quyền lợi càng hấp dẫn</p>
          </div>

          <div className="grid grid-cols-3 gap-8 relative">
            {tierCards.map((tier) => {
              const Icon = tier.icon;
              return (
                <div key={tier.name} className={`rounded-3xl p-8 transition-all duration-500 hover:-translate-y-2 ${tier.bg} ${tier.border}`}>
                  {tier.featured && (
                    <div className="absolute -top-4 right-8 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-4 py-1.5 text-xs font-bold text-white shadow-glow-gold">
                      <Star size={14} fill="currentColor" /> Nổi bật
                    </div>
                  )}
                  <div className="flex items-start gap-5">
                    <div className={`flex h-16 w-16 flex-none items-center justify-center rounded-2xl ${tier.iconBg} transform -rotate-3`}>
                      <Icon size={32} className="drop-shadow-md" />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black ${tier.text} drop-shadow-sm`}>{tier.name}</h3>
                      <span className={`inline-block mt-2 rounded-lg px-3 py-1 text-xs font-bold bg-white/50 border border-white/50 backdrop-blur-sm ${tier.text}`}>{tier.tag}</span>
                    </div>
                  </div>
                  <p className="mt-6 text-sm leading-relaxed text-slate-600 font-medium min-h-[40px]">{tier.intro}</p>
                  <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />
                  <ul className="space-y-4">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-slate-700 font-medium">
                        <CheckCircle2 className={`mt-0.5 flex-none drop-shadow-sm ${tier.check}`} size={18} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {tier.featured && (
                    <div className="mt-8">
                       <button className="w-full neo-button py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white font-bold shadow-glow-gold">
                         Đạt hạng Vàng ngay
                       </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Table Section */}
      <section className="relative z-10 px-4 pb-16">
        <div className="container mx-auto min-w-[980px] max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-800 drop-shadow-sm">Bảng quyền lợi</h2>
          </div>
          
          <div className="glass-premium rounded-3xl overflow-hidden p-2">
            <div className="rounded-2xl overflow-hidden border border-white/40 bg-white/30 backdrop-blur-md">
              <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr] border-b border-white/40 bg-white/50 text-xs font-black uppercase text-slate-800 md:text-sm">
                <div className="p-4 md:p-5">Quyền lợi</div>
                <div className="p-4 text-center text-emerald-700 md:p-5 flex items-center justify-center gap-2"><UserRound size={16}/> Thành viên</div>
                <div className="p-4 text-center text-amber-600 md:p-5 flex items-center justify-center gap-2"><Crown size={16}/> Vàng</div>
                <div className="p-4 text-center text-violet-700 md:p-5 flex items-center justify-center gap-2"><Diamond size={16}/> Kim Cương</div>
              </div>
              <div className="bg-white/20">
                {tableRows.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className={`grid grid-cols-[1.3fr_1fr_1fr_1fr] border-b border-white/20 text-xs last:border-b-0 md:text-sm transition-colors hover:bg-white/40`}>
                      <div className="flex items-center gap-3 p-4 font-bold text-slate-700 md:p-5">
                        <div className="p-1.5 rounded-lg bg-white/60 shadow-sm border border-white/50 text-emerald-600">
                          <Icon size={16} />
                        </div>
                        {row.label}
                      </div>
                      {row.values.map((value, index) => (
                        <div key={`${row.label}-${index}`} className="flex items-center justify-center p-4 text-center md:p-5 border-l border-white/10">
                          <CheckValue value={value} index={index} highlight={row.highlight} />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to level up */}
      <section className="relative z-10 px-4 pb-20">
        <div className="container mx-auto min-w-[980px] max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-slate-800 drop-shadow-sm">Cách lên hạng</h2>
          </div>
          
          <div className="relative">
            {/* Connecting light beam */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-emerald-200 via-amber-200 to-emerald-200 -translate-y-1/2 z-0 hidden md:block shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            
            <div className="grid grid-cols-3 gap-8 relative z-10">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative pt-4 transform transition-transform hover:-translate-y-2">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-black text-white shadow-glow-emerald border-2 border-white z-20">
                      {index + 1}
                    </div>
                    <div className="glass-card rounded-3xl p-6 text-center h-full">
                      <div className="flex justify-center mt-2 mb-5">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white to-emerald-50 text-emerald-600 shadow-glass border border-white">
                          <Icon size={38} className="drop-shadow-md" />
                        </div>
                      </div>
                      <h3 className="font-black text-lg text-slate-800 mb-2">{step.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-600 font-medium">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-10 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 rounded-full glass-premium px-6 py-2.5 text-sm font-bold text-slate-700">
              <Sparkles className="text-amber-500" size={18} />
              Hệ thống sẽ tự động cập nhật hạng thành viên khi bạn đạt mức chi tiêu tương ứng.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 px-4 pb-16">
        <div className="container mx-auto min-w-[980px] max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl glass-premium p-8 md:p-12 border-emerald-200/50 shadow-glow-emerald">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl"></div>
            
            <div className="grid grid-cols-[0.4fr_1fr_0.3fr] items-center gap-8 relative z-10">
              <div className="relative">
                {/* 3D Image representation */}
                <div className="absolute inset-0 bg-emerald-100 rounded-3xl blur-md transform translate-y-4 scale-95 opacity-60"></div>
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=700&auto=format&fit=crop"
                  alt="Salad"
                  className="relative h-48 w-full rounded-3xl object-cover shadow-2xl border-4 border-white/50"
                />
              </div>
              
              <div className="text-center px-4">
                <h2 className="text-3xl font-black text-slate-800 md:text-4xl drop-shadow-sm mb-4">Bắt đầu tích lũy ưu đãi ngay hôm nay</h2>
                <p className="text-slate-600 text-lg font-medium max-w-xl mx-auto">Thưởng thức những món ăn lành mạnh, nhận ưu đãi hấp dẫn và nâng hạng cùng FoodCare.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <Link to="/foods" className="neo-button inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-glow-emerald">
                    <Utensils size={18} />
                    Xem thực đơn
                  </Link>
                  <Link to="/register" className="neo-button inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-700 shadow-lg hover:border-amber-300 hover:text-amber-600">
                    <UserRound size={18} />
                    Đăng ký thành viên
                  </Link>
                </div>
              </div>
              
              <div className="flex justify-center relative">
                <div className="absolute inset-0 bg-amber-100 rounded-3xl blur-md transform translate-y-4 scale-95 opacity-60"></div>
                <div className="relative flex h-40 w-40 items-center justify-center rounded-[2rem] glass-card text-amber-500 shadow-2xl border-2 border-white/60 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <Gift size={80} className="drop-shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;
