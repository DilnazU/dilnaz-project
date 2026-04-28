import { useState, useRef, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowLeft, Sparkles } from 'lucide-react';
import gsap from 'gsap';

export default function Login() {
  const { user, login, signup } = useAuth();
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
      style={{ background: '#020817' }}>

      {/* Particles */}
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

      {/* Свечения фона */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.04) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.8); }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div ref={cardRef} className="relative rounded-2xl p-8 overflow-hidden" style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(0,255,135,0.15)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 60px rgba(0,255,135,0.05), 0 25px 50px rgba(0,0,0,0.5)',
          opacity: 0,
        }}>

          {/* Верхняя линия свечения */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,135,0.5), transparent)' }} />

          {/* Logo — новый SVG */}
          <div className="text-center mb-8">
            <div ref={logoRef} className="relative w-20 h-20 mx-auto mb-3">
              <div className="absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,135,0.1), rgba(14,165,233,0.1))', border: '1px solid rgba(0,255,135,0.2)', boxShadow: '0 0 25px rgba(0,255,135,0.1)' }} />
              <div className="relative w-full h-full flex items-center justify-center">
                <svg width="64" height="74" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00ff87"/>
                      <stop offset="100%" stopColor="#0ea5e9"/>
                    </linearGradient>
                  </defs>
                  <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#lg1)" strokeWidth="2.5"/>
                  <polygon points="60,24 88,60 60,96 32,60" fill="url(#lg1)" fillOpacity="0.1"/>
                  <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#lg1)" strokeWidth="1.2"/>
                  <line x1="60" y1="4" x2="60" y2="24" stroke="#00ff87" strokeWidth="2"/>
                  <line x1="105" y1="60" x2="88" y2="60" stroke="#00ff87" strokeWidth="2"/>
                  <line x1="60" y1="116" x2="60" y2="96" stroke="#0ea5e9" strokeWidth="2"/>
                  <line x1="15" y1="60" x2="32" y2="60" stroke="#0ea5e9" strokeWidth="2"/>
                  <circle cx="60" cy="4" r="4.5" fill="#00ff87"/>
                  <circle cx="105" cy="60" r="4.5" fill="#00ff87"/>
                  <circle cx="60" cy="116" r="4.5" fill="#0ea5e9"/>
                  <circle cx="15" cy="60" r="4.5" fill="#0ea5e9"/>
                  <line x1="32" y1="60" x2="60" y2="24" stroke="url(#lg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="88" y1="60" x2="60" y2="24" stroke="url(#lg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="32" y1="60" x2="60" y2="96" stroke="url(#lg1)" strokeWidth="0.8" opacity="0.35"/>
                  <line x1="88" y1="60" x2="60" y2="96" stroke="url(#lg1)" strokeWidth="0.8" opacity="0.35"/>
                  <text x="60" y="134" textAnchor="middle" fontSize="13" fontWeight="bold" fontFamily="Arial" fill="white" letterSpacing="2">MSB HELP</text>
                </svg>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-1">
              {isSignup ? 'Создать аккаунт' : 'Добро пожаловать'}
            </h1>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.7)' }}>
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
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,255,135,0.5)' }} />
                <input
                  type="text"
                  placeholder="Полное имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,135,0.15)', caretColor: '#00ff87' }}
                  onFocus={(e) => { e.target.style.border = '1px solid rgba(0,255,135,0.4)'; e.target.style.boxShadow = '0 0 15px rgba(0,255,135,0.08)'; }}
                  onBlur={(e) => { e.target.style.border = '1px solid rgba(0,255,135,0.15)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,255,135,0.5)' }} />
              <input
                type="email"
                placeholder="Email адрес"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,135,0.15)', caretColor: '#00ff87' }}
                onFocus={(e) => { e.target.style.border = '1px solid rgba(0,255,135,0.4)'; e.target.style.boxShadow = '0 0 15px rgba(0,255,135,0.08)'; }}
                onBlur={(e) => { e.target.style.border = '1px solid rgba(0,255,135,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(0,255,135,0.5)' }} />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,255,135,0.15)', caretColor: '#00ff87' }}
                onFocus={(e) => { e.target.style.border = '1px solid rgba(0,255,135,0.4)'; e.target.style.boxShadow = '0 0 15px rgba(0,255,135,0.08)'; }}
                onBlur={(e) => { e.target.style.border = '1px solid rgba(0,255,135,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(135deg, #00ff87, #0ea5e9)',
                color: '#020817',
                boxShadow: '0 0 25px rgba(0,255,135,0.25)',
              }}
            >
              {submitting ? 'Подождите...' : isSignup ? 'Создать аккаунт' : 'Войти'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>
            {isSignup ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button
              onClick={() => { setIsSignup(!isSignup); setError(''); }}
              className="font-semibold transition-all hover:opacity-80"
              style={{ color: '#00ff87' }}
            >
              {isSignup ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>

          <button
            onClick={() => navigate('/')}
            className="mt-3 flex items-center justify-center gap-1.5 w-full text-sm transition-all hover:opacity-80"
            style={{ color: 'rgba(148,163,184,0.4)' }}
          >
            <ArrowLeft size={13} />
            Продолжить без аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}