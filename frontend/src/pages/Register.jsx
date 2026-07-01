import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, X } from 'lucide-react';

/* ── Same animated background elements as Login ── */
const ORBS = [
  { emoji: '🥗', size: 52, x: 6,  y: 10, dur: 7,  delay: 0   },
  { emoji: '🍜', size: 44, x: 87, y: 7,  dur: 9,  delay: 1.5 },
  { emoji: '🍣', size: 48, x: 78, y: 70, dur: 8,  delay: 0.8 },
  { emoji: '🥑', size: 40, x: 12, y: 68, dur: 10, delay: 2   },
  { emoji: '🍱', size: 56, x: 50, y: 4,  dur: 11, delay: 0.4 },
  { emoji: '🍇', size: 38, x: 94, y: 42, dur: 7,  delay: 3   },
  { emoji: '🥦', size: 42, x: 2,  y: 42, dur: 9,  delay: 1.2 },
  { emoji: '🍓', size: 40, x: 62, y: 88, dur: 8,  delay: 2.5 },
  { emoji: '🥕', size: 36, x: 28, y: 86, dur: 12, delay: 0.6 },
  { emoji: '🫐', size: 46, x: 40, y: 1,  dur: 7,  delay: 3.5 },
];

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 3 + Math.random() * 6,
  dur: 4 + Math.random() * 8,
  delay: Math.random() * 5,
  opacity: 0.15 + Math.random() * 0.35,
}));

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  /* lock scroll on mount, restore on unmount */
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const rules = [
    { label: 'Ít nhất 6 ký tự', test: password.length >= 6 },
    { label: 'Có chữ hoa', test: /[A-Z]/.test(password) },
    { label: 'Có chữ số', test: /\d/.test(password) },
  ];
  const strength = rules.filter((r) => r.test).length;
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh'][strength];
  const strengthColors = ['', '#f87171', '#fbbf24', '#34d399'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    setIsLoading(true);
    const res = await register(name, email, password);
    setIsLoading(false);
    if (res.success) {
      toast.success('Đăng ký thành công! Chào mừng bạn đến với FoodCare 🎉');
      navigate('/');
    } else {
      toast.error(res.message || 'Đăng ký thất bại, vui lòng thử lại.');
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
  };
  const onFocus = (e) => {
    e.target.style.border = '1px solid rgba(251,146,60,0.7)';
    e.target.style.boxShadow = '0 0 0 3px rgba(251,146,60,0.15)';
  };
  const onBlur = (e) => {
    e.target.style.border = '1px solid rgba(255,255,255,0.12)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <>
      <style>{`
        @keyframes floatY {
          0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33%      { transform: translateY(-20px) rotate(6deg) scale(1.07); }
          66%      { transform: translateY(10px) rotate(-4deg) scale(0.95); }
        }
        @keyframes pulse-glow-r {
          0%,100% { opacity: var(--op); transform: scale(1); }
          50%      { opacity: calc(var(--op) * 1.8); transform: scale(1.4); }
        }
        @keyframes drift-r {
          0%   { transform: translate(0,0) scale(1);   }
          25%  { transform: translate(40px,-30px) scale(1.05); }
          50%  { transform: translate(80px,20px) scale(0.97); }
          75%  { transform: translate(20px,50px) scale(1.03); }
          100% { transform: translate(0,0) scale(1);   }
        }
        @keyframes spin-slow-r {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp-r {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes shimmer-r {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .reg-card-anim { animation: fadeSlideUp-r .65s cubic-bezier(.22,.68,0,1.2) both; }
        .reg-orb  { animation: floatY var(--dur,8s) ease-in-out var(--delay,0s) infinite; }
        .reg-particle { animation: pulse-glow-r var(--pdur,6s) ease-in-out var(--pdelay,0s) infinite; }
        @keyframes marquee-ltr-r {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes marquee-rtl-r {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .mq-ltr-r { animation: marquee-ltr-r var(--mq-dur,28s) linear infinite; }
        .mq-rtl-r { animation: marquee-rtl-r var(--mq-dur,28s) linear infinite; }
      `}</style>

      {/* ── Full-page background ── */}
      <div
        className="fixed inset-0 w-screen h-screen overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,#0f0c29 0%,#1a1035 25%,#1e3c72 55%,#0f3460 75%,#16213e 100%)',
          zIndex: 0,
        }}
      >
        {/* Rotating rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[520, 700, 900, 1100].map((sz, i) => (
            <div key={sz} style={{
              position: 'absolute', width: sz, height: sz, borderRadius: '50%',
              border: `1px solid rgba(52,211,153,${0.12 - i * 0.02})`,
              animation: `spin-slow-r ${28 + i * 14}s linear ${i % 2 === 0 ? '' : 'reverse'} infinite`,
              boxShadow: `0 0 ${20 + i * 8}px rgba(52,211,153,${0.06 - i * 0.01}) inset`,
            }} />
          ))}
        </div>

        {/* Blob lights */}
        {[
          { color: 'rgba(52,211,153,0.18)',  size: 420, x: '10%', y: '5%',  dur: '22s' },
          { color: 'rgba(139,92,246,0.15)',  size: 380, x: '65%', y: '60%', dur: '28s', delay: '4s' },
          { color: 'rgba(34,211,238,0.12)',  size: 320, x: '75%', y: '5%',  dur: '20s', delay: '8s' },
          { color: 'rgba(16,185,129,0.10)',  size: 280, x: '5%',  y: '60%', dur: '25s', delay: '2s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%',
            width: b.size, height: b.size, left: b.x, top: b.y,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            animation: `drift-r ${b.dur} ease-in-out ${b.delay || '0s'} infinite`,
          }} />
        ))}

        {/* Particles */}
        {PARTICLES.map(p => (
          <div key={p.id} className="reg-particle absolute rounded-full" style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.id % 3 === 0 ? 'rgba(52,211,153,0.8)' : p.id % 3 === 1 ? 'rgba(139,92,246,0.7)' : 'rgba(34,211,238,0.7)',
            '--op': p.opacity, '--pdur': `${p.dur}s`, '--pdelay': `${p.delay}s`,
            opacity: p.opacity, boxShadow: `0 0 ${p.size * 2}px currentColor`,
          }} />
        ))}

        {/* Floating food orbs */}
        {ORBS.map((o, i) => (
          <div key={i} className="reg-orb absolute select-none pointer-events-none"
            style={{
              left: `${o.x}%`, top: `${o.y}%`,
              '--dur': `${o.dur}s`, '--delay': `${o.delay}s`,
              fontSize: o.size,
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))',
              zIndex: 1,
            }}>
            {o.emoji}
          </div>
        ))}

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* ── 3D Marquee text ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-around"
          style={{ perspective: '600px', perspectiveOrigin: '50% 50%' }}>
          {[
            { dir: 'ltr', dur: '34s', size: '5.5rem', op: 0.055, ry: '-8deg'  },
            { dir: 'rtl', dur: '24s', size: '3.8rem', op: 0.038, ry: '6deg'   },
            { dir: 'ltr', dur: '42s', size: '7rem',   op: 0.045, ry: '-12deg' },
            { dir: 'rtl', dur: '20s', size: '3rem',   op: 0.03,  ry: '10deg'  },
            { dir: 'ltr', dur: '36s', size: '4.5rem', op: 0.042, ry: '-6deg'  },
          ].map((row, i) => {
            const text = '\u00A0\u00A0\u00A0Ch\u00E0o m\u1EEBng b\u1EA1n \u0111\u1EBFn v\u1EDBi FoodCare\u00A0\u00A0\u00A0\u2605\u00A0\u00A0\u00A0';
            const repeated = text.repeat(6);
            return (
              <div key={i} style={{
                overflow: 'hidden',
                transform: `rotateY(${row.ry}) rotateX(${i % 2 === 0 ? '-4deg' : '4deg'})`,
                transformStyle: 'preserve-3d',
              }}>
                <div
                  className={row.dir === 'ltr' ? 'mq-ltr-r' : 'mq-rtl-r'}
                  style={{
                    '--mq-dur': row.dur,
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    fontSize: row.size,
                    fontWeight: 900,
                    letterSpacing: '0.05em',
                    fontFamily: 'system-ui, sans-serif',
                    color: 'transparent',
                    WebkitTextStroke: `1.5px rgba(255,255,255,${row.op * 3})`,
                    textShadow: `0 0 40px rgba(52,211,153,${row.op * 2}), 0 0 80px rgba(52,211,153,${row.op})`,
                    opacity: row.op * 10,
                    userSelect: 'none',
                  }}>
                  {repeated}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Page wrapper ── */}
      <div
        className="relative z-10 flex items-center justify-center px-4"
        style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}
      >
        {/* ── Glassmorphism card ── */}
        <div className="reg-card-anim w-full max-w-[420px]" style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 28,
          boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
          padding: '36px 40px 32px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-6 group">
            <img src="/logo.png" alt="FoodCare" className="h-8 w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-110" />
            <span className="text-lg font-black text-white tracking-tight drop-shadow">FoodCare</span>
          </Link>

          {/* Heading */}
          <h1 className="text-2xl font-black mb-1" style={{
            background: 'linear-gradient(90deg,#34d399,#6ee7b7,#34d399)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer-r 3s linear infinite',
          }}>
            Tạo tài khoản
          </h1>
          <p className="text-white/50 text-sm mb-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Đăng nhập
            </Link>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1.5">Họ và tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                style={inputStyle}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: strength >= i ? strengthColors[strength] : 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {rules.map((r) => (
                      <span key={r.label} className="flex items-center gap-1 text-xs"
                        style={{ color: r.test ? '#34d399' : 'rgba(255,255,255,0.35)' }}>
                        {r.test ? <Check size={11} /> : <X size={11} />}
                        {r.label}
                      </span>
                    ))}
                  </div>
                  {strengthLabel && (
                    <p className="text-xs font-semibold mt-0.5" style={{ color: strengthColors[strength] }}>
                      {strengthLabel}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 pr-11 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: confirmPassword
                      ? confirmPassword === password
                        ? '1px solid rgba(52,211,153,0.7)'
                        : '1px solid rgba(248,113,113,0.7)'
                      : '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={onFocus} onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <X size={11} /> Mật khẩu không khớp
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
              style={{
                background: isLoading
                  ? 'rgba(52,211,153,0.5)'
                  : 'linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.45)',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang tạo tài khoản...
                </>
              ) : 'Đăng ký ngay 🎉'}
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-5">© 2026 FoodCare · Đà Nẵng, Việt Nam</p>
        </div>
      </div>
    </>
  );
};

export default Register;
