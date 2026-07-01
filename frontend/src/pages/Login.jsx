import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/* ─── floating food orbs config ─── */
const ORBS = [
  { emoji: '🥗', size: 56, x: 8,  y: 12, dur: 7,  delay: 0   },
  { emoji: '🍜', size: 48, x: 85, y: 8,  dur: 9,  delay: 1.5 },
  { emoji: '🍣', size: 52, x: 75, y: 72, dur: 8,  delay: 0.8 },
  { emoji: '🥑', size: 44, x: 15, y: 70, dur: 10, delay: 2   },
  { emoji: '🍱', size: 60, x: 50, y: 5,  dur: 11, delay: 0.4 },
  { emoji: '🍇', size: 40, x: 92, y: 45, dur: 7,  delay: 3   },
  { emoji: '🥦', size: 46, x: 3,  y: 45, dur: 9,  delay: 1.2 },
  { emoji: '🍓', size: 42, x: 60, y: 85, dur: 8,  delay: 2.5 },
  { emoji: '🥕', size: 38, x: 30, y: 88, dur: 12, delay: 0.6 },
  { emoji: '🫐', size: 50, x: 42, y: 2,  dur: 7,  delay: 3.5 },
];

/* ─── glowing particle config ─── */
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 3 + Math.random() * 6,
  dur: 4 + Math.random() * 8,
  delay: Math.random() * 5,
  opacity: 0.15 + Math.random() * 0.35,
}));

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef(null);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterLogin = useCallback((user) => {
    const redirectPath = location.state?.from || (user?.role === 'admin' ? '/admin' : '/');
    navigate(redirectPath, { replace: true });
  }, [location.state, navigate]);

  /* lock scroll while on login page */
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          const result = await googleLogin(credential);
          if (result.success) {
            redirectAfterLogin(result.user);
          } else {
            toast.error(result.message);
          }
        },
      });

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'icon',
        theme: 'filled_blue',
        size: 'large',
        shape: 'circle',
        locale: 'vi',
      });
    };

    const existingScript = document.querySelector('script[data-google-identity]');
    if (existingScript) {
      initializeGoogle();
      existingScript.addEventListener('load', initializeGoogle);
      return () => existingScript.removeEventListener('load', initializeGoogle);
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = 'true';
    script.addEventListener('load', initializeGoogle);
    document.head.appendChild(script);

    return () => script.removeEventListener('load', initializeGoogle);
  }, [googleLogin, redirectAfterLogin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      redirectAfterLogin(result.user);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      {/* ── Inject keyframes ── */}
      <style>{`
        @keyframes floatY {
          0%,100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33%      { transform: translateY(-22px) rotate(6deg) scale(1.07); }
          66%      { transform: translateY(10px) rotate(-4deg) scale(0.95); }
        }
        @keyframes pulse-glow {
          0%,100% { opacity: var(--op); transform: scale(1); }
          50%      { opacity: calc(var(--op) * 1.8); transform: scale(1.4); }
        }
        @keyframes drift {
          0%   { transform: translate(0,0) scale(1);   }
          25%  { transform: translate(40px,-30px) scale(1.05); }
          50%  { transform: translate(80px,20px) scale(0.97); }
          75%  { transform: translate(20px,50px) scale(1.03); }
          100% { transform: translate(0,0) scale(1);   }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .login-card-anim { animation: fadeSlideUp .65s cubic-bezier(.22,.68,0,1.2) both; }
        .orb-float { animation: floatY var(--dur,8s) ease-in-out var(--delay,0s) infinite; }
        .particle  { animation: pulse-glow var(--pdur,6s) ease-in-out var(--pdelay,0s) infinite; }
        @keyframes marquee-ltr {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        @keyframes marquee-rtl {
          0%   { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-ltr { animation: marquee-ltr var(--mq-dur,28s) linear infinite; }
        .marquee-rtl { animation: marquee-rtl var(--mq-dur,28s) linear infinite; }
      `}</style>

      {/* ── Full-page scene ── */}
      <div className="fixed inset-0 top-0 left-0 w-screen h-screen overflow-hidden -z-0"
           style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#1a1035 25%,#1e3c72 55%,#0f3460 75%,#16213e 100%)' }}>

        {/* ── Rotating giant rings ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[520, 700, 900, 1100].map((sz, i) => (
            <div key={sz}
              style={{
                position:'absolute',
                width: sz, height: sz,
                borderRadius:'50%',
                border: `1px solid rgba(251,146,60,${0.12 - i*0.02})`,
                animation: `spin-slow ${28+i*14}s linear ${i%2===0?'':'reverse'} infinite`,
                boxShadow: `0 0 ${20+i*8}px rgba(251,146,60,${0.06 - i*0.01}) inset`,
              }}
            />
          ))}
        </div>

        {/* ── Drifting blob lights ── */}
        {[
          { color:'rgba(251,146,60,0.18)', size:420, x:'10%', y:'5%',  dur:'22s' },
          { color:'rgba(139,92,246,0.15)', size:380, x:'65%', y:'60%', dur:'28s', delay:'4s' },
          { color:'rgba(34,211,238,0.12)', size:320, x:'75%', y:'5%',  dur:'20s', delay:'8s' },
          { color:'rgba(251,191,36,0.10)', size:280, x:'5%',  y:'60%', dur:'25s', delay:'2s' },
        ].map((b, i) => (
          <div key={i} style={{
            position:'absolute', borderRadius:'50%',
            width: b.size, height: b.size, left: b.x, top: b.y,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            filter:'blur(40px)',
            animation: `drift ${b.dur} ease-in-out ${b.delay||'0s'} infinite`,
          }} />
        ))}

        {/* ── Glowing particles ── */}
        {PARTICLES.map(p => (
          <div key={p.id} className="particle absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: p.id % 3 === 0
                ? 'rgba(251,146,60,0.8)'
                : p.id % 3 === 1
                ? 'rgba(139,92,246,0.7)'
                : 'rgba(34,211,238,0.7)',
              '--op': p.opacity,
              '--pdur': `${p.dur}s`,
              '--pdelay': `${p.delay}s`,
              opacity: p.opacity,
              boxShadow: `0 0 ${p.size*2}px currentColor`,
            }}
          />
        ))}

        {/* ── Floating food orbs ── */}
        {ORBS.map((o, i) => (
          <div key={i} className="orb-float absolute select-none pointer-events-none"
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

        {/* ── Grid overlay ── */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* ── 3D Marquee text ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col justify-around"
          style={{ perspective: '600px', perspectiveOrigin: '50% 50%' }}>
          {[
            { dir: 'ltr', dur: '32s', size: '5.5rem', op: 0.055, ry: '-8deg',  ty: '0px'   },
            { dir: 'rtl', dur: '26s', size: '3.8rem', op: 0.038, ry: '6deg',   ty: '0px'   },
            { dir: 'ltr', dur: '40s', size: '7rem',   op: 0.045, ry: '-12deg', ty: '0px'   },
            { dir: 'rtl', dur: '22s', size: '3rem',   op: 0.03,  ry: '10deg',  ty: '0px'   },
            { dir: 'ltr', dur: '35s', size: '4.5rem', op: 0.042, ry: '-6deg',  ty: '0px'   },
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
                  className={row.dir === 'ltr' ? 'marquee-ltr' : 'marquee-rtl'}
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
                    textShadow: `0 0 40px rgba(251,146,60,${row.op * 2}), 0 0 80px rgba(251,146,60,${row.op})`,
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

      {/* ── Page wrapper (sits above background) ── */}
      <div className="relative z-10 flex items-center justify-center px-4"
           style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>

        {/* ── Glassmorphism card ── */}
        <div className="login-card-anim w-full max-w-[420px]"
          style={{
            background: 'rgba(255,255,255,0.07)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 28,
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06) inset',
            padding: '44px 40px 36px',
          }}>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 group">
            <img src="/logo.png" alt="FoodCare" className="h-9 w-auto object-contain drop-shadow-lg transition-transform group-hover:scale-110" />
            <span className="text-xl font-black text-white tracking-tight drop-shadow">FoodCare</span>
          </Link>

          {/* Heading */}
          <h1 className="text-3xl font-black mb-1"
            style={{
              background: 'linear-gradient(90deg,#fb923c,#fbbf24,#fb923c)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 3s linear infinite',
            }}>
            Đăng nhập
          </h1>
          <p className="text-white/50 text-sm mb-8">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-orange-400 font-semibold hover:text-orange-300 transition-colors">
              Đăng ký ngay
            </Link>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => { e.target.style.border='1px solid rgba(251,146,60,0.7)'; e.target.style.boxShadow='0 0 0 3px rgba(251,146,60,0.15)'; }}
                onBlur={e  => { e.target.style.border='1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-white/60 uppercase tracking-widest mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={e => { e.target.style.border='1px solid rgba(251,146,60,0.7)'; e.target.style.boxShadow='0 0 0 3px rgba(251,146,60,0.15)'; }}
                  onBlur={e  => { e.target.style.border='1px solid rgba(255,255,255,0.12)'; e.target.style.boxShadow='none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{
                background: isLoading
                  ? 'rgba(251,146,60,0.6)'
                  : 'linear-gradient(135deg,#f97316 0%,#fb923c 50%,#fbbf24 100%)',
                boxShadow: '0 8px 32px rgba(249,115,22,0.45)',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.12)' }} />
            <span className="text-xs text-white/35 font-medium whitespace-nowrap">Hoặc đăng nhập với</span>
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.12)' }} />
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <div
              ref={googleButtonRef}
              className="transition hover:scale-110"
              style={{ borderRadius: '50%', boxShadow: '0 4px 20px rgba(66,133,244,0.5)' }}
              title="Đăng nhập bằng Google"
            ></div>
          </div>

          {/* Footer */}
          <p className="text-center text-white/20 text-xs mt-8">© 2026 FoodCare · Đà Nẵng, Việt Nam</p>
        </div>
      </div>
    </>
  );
};

export default Login;
