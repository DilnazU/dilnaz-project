import { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import gsap from 'gsap';

export default function Login() {
  const { user, login, signup } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get('signup') === 'true');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cardRef = useRef(null);
  const logoRef = useRef(null);

  const accent = dark ? '#00ff87' : '#059669';
  const accentBlue = dark ? '#0ea5e9' : '#0284c7';
  const bgMain = dark ? '#020817' : '#f8fafc';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)';
  const cardBorder = dark ? 'rgba(0,255,135,0.15)' : 'rgba(5,150,105,0.2)';
  const cardShadow = dark ? '0 0 60px rgba(0,255,135,0.05), 0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(5,150,105,0.1), 0 0 0 1px rgba(5,150,105,0.05)';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)';
  const inputBorder = dark ? 'rgba(0,255,135,0.15)' : 'rgba(5,150,105,0.2)';
  const inputFocusBorder = dark ? 'rgba(0,255,135,0.4)' : 'rgba(5,150,105,0.5)';
  const inputFocusShadow = dark ? '0 0 15px rgba(0,255,135,0.08)' : '0 0 15px rgba(5,150,105,0.1)';
  const textColor = dark ? 'white' : '#0f172a';
  const textMuted = dark ? 'rgba(148,163,184,0.7)' : '#475569';
  const textFaint = dark ? 'rgba(148,163,184,0.4)' : '#94a3b8';
  const iconColor = dark ? `rgba(0,255,135,0.5)` : 'rgba(5,150,105,0.6)';
  const topLineColor = dark ? 'linear-gradient(90deg, transparent, rgba(0,255,135,0.5), transparent)' : 'linear-gradient(90deg, transparent, rgba(5,150,105,0.4), transparent)';
  const logoBg = dark ? 'linear-gradient(135deg, rgba(0,255,135,0.1), rgba(14,165,233,0.1))' : 'linear-gradient(135deg, rgba(5,150,105,0.1), rgba(2,132,199,0.1))';
  const logoBorder = dark ? 'rgba(0,255,135,0.2)' : 'rgba(5,150,105,0.25)';
  const logoShadow = dark ? '0 0 25px rgba(0,255,135,0.1)' : '0 0 25px rgba(5,150,105,0.1)';
  const blob1 = dark ? 'rgba(0,255,135,0.08)' : 'rgba(5,150,105,0.08)';
  const blob2 = dark ? 'rgba(14,165,233,0.1)' : 'rgba(2,132,199,0.08)';
  const logoTextColor = dark ? 'white' : '#0f172a';
  const btnTextColor = dark ? '#020817' : '#ffffff';

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(logoRef.current, { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.6 })
      .fromTo(cardRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3');
  }, []);

  if (user) return <Navigate to="/chat" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden"
      style={{ background: bgMain, transition: 'background 0.3s ease' }}>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Particles — только в тёмной теме */}
      {dark && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(80)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: Math.random() * 5 + 2 + 'px',
                height: Math.random() * 5 + 2 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                background: i % 3 === 0 ? '#00ff87' : i % 3 === 1 ? '#0ea5e9' : '#ffffff',
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`,
                animationDelay: Math.random() * 4 + 's',
              }}
            />
          ))}
        </div>
      )}

      {/* Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${blob1} 0%, transparent 70%)`, filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${blob2} 0%, transparent 70%)`, filter: 'blur(40px)' }} />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.8); }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div ref={cardRef} className="relative rounded-2xl p-8 overflow-hidden" style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          backdropFilter: 'blur(20px)',
          boxShadow: cardShadow,
          opacity: 0,
        }}>

          {/* Верхняя линия свечения */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: topLineColor }} />

          {/* Logo */}
          <div className="text-center mb-8">
            <div ref={logoRef} className="relative w-20 h-20 mx-auto mb-3">
              <div className="absolute inset-0 rounded-2xl"
                style={{ background: logoBg, border: `1px solid ${logoBorder}`, boxShadow: logoShadow }} />
              <div className="relative w-full h-full flex items-center justify-center">
                <svg width="64" height="74" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="lg-login" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={accent}/>
                      <stop offset="100%" stopColor={accentBlue}/>
                    </linearGradient>
                  </defs>
                  <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#lg-login)" strokeWidth="2.5"/>
                  <polygon points="60,24 88,60 60,96 32,60" fill="url(#lg-login)" fillOpacity="0.1"/>
                  <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#lg-login)" strokeWidth="1.2"/>
                  <line x1="60" y1="4" x2="60" y2="24" stroke={accent} strokeWidth="2"/>
                  <line x1="105" y1="60" x2="88" y2="60" stroke={accent} strokeWidth="2"/>
                  <line x1="60" y1="116" x2="60" y2="96" stroke={accentBlue} strokeWidth="2"/>
                  <line x1="15" y1="60" x2="32" y2="60" stroke={accentBlue} strokeWidth="2"/>
                  <circle cx="60" cy="4" r="4.5" fill={accent}/>
                  <circle cx="105" cy="60" r="4.5" fill={accent}/>
                  <circle cx="60" cy="116" r="4.5" fill={accentBlue}/>
                  <circle cx="15" cy="60" r="4.5" fill={accentBlue}/>
                  <line x1="32" y1="60" x2="60" y2="24" stroke="url(#lg-login)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="88" y1="60" x2="60" y2="24" stroke="url(#lg-login)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="32" y1="60" x2="60" y2="96" stroke="url(#lg-login)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="88" y1="60" x2="60" y2="96" stroke="url(#lg-login)" strokeWidth="0.8" opacity="0.35"/>
                  <text x="60" y="134" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="Arial" fill={logoTextColor} letterSpacing="2">MSB HELP</text>
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
              {isSignup ? 'Создать аккаунт' : 'Добро пожаловать'}
            </h1>
            <p className="text-sm" style={{ color: textMuted }}>
              {isSignup ? 'Начните использовать MSB Help' : 'Войдите в ваш AI-ассистент'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm text-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignup && (
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: iconColor }} />
                <input
                  type="text"
                  placeholder="Полное имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor, caretColor: accent }}
                  onFocus={(e) => { e.target.style.border = `1px solid ${inputFocusBorder}`; e.target.style.boxShadow = inputFocusShadow; }}
                  onBlur={(e) => { e.target.style.border = `1px solid ${inputBorder}`; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: iconColor }} />
              <input
                type="email"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor, caretColor: accent }}
                onFocus={(e) => { e.target.style.border = `1px solid ${inputFocusBorder}`; e.target.style.boxShadow = inputFocusShadow; }}
                onBlur={(e) => { e.target.style.border = `1px solid ${inputBorder}`; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: iconColor }} />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textColor, caretColor: accent }}
                onFocus={(e) => { e.target.style.border = `1px solid ${inputFocusBorder}`; e.target.style.boxShadow = inputFocusShadow; }}
                onBlur={(e) => { e.target.style.border = `1px solid ${inputBorder}`; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {isSignup && (
              <p className="text-xs -mt-2 px-1" style={{ color: iconColor }}>
                Минимум 6 символов, хотя бы одна буква и одна цифра
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accentBlue})`,
                color: btnTextColor,
                boxShadow: `0 0 25px ${accent}40`,
              }}
            >
              {submitting ? 'Подождите...' : isSignup ? 'Создать аккаунт' : 'Войти'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: textMuted }}>
            {isSignup ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="font-semibold transition-all hover:opacity-80"
              style={{ color: accent }}
            >
              {isSignup ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>

          <button
            onClick={() => navigate('/')}
            className="mt-3 flex items-center justify-center gap-1.5 w-full text-sm transition-all hover:opacity-80"
            style={{ color: textFaint }}
          >
            <ArrowLeft size={13} />
            Продолжить без аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}