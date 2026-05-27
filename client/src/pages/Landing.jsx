import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Lightbulb, BarChart3, FileText, Shield, ChevronRight, Menu, X, Globe } from 'lucide-react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

const translations = {
  ru: {
    nav: { features: 'Возможности', howItWorks: 'Как работает', security: 'Безопасность', login: 'Войти', start: 'Начать' },
    hero: {
      badge: 'AI-ассистент для бизнеса',
      title1: 'Умный советник',
      title2: 'для вашего бизнеса',
      subtitle: 'Получайте мгновенные AI-советы по маркетингу, финансам и бизнес-идеям. Загружайте данные — получайте глубокий анализ.',
      cta: 'Попробовать бесплатно',
      ctaSub: 'Аккаунт не нужен',
    },
    features: {
      title: 'Всё что нужно бизнесу',
      subtitle: 'Три направления — один умный ассистент',
      items: [
        { icon: TrendingUp, title: 'Маркетинг', desc: 'Контент-планы, email-кампании, SEO-стратегии и определение целевой аудитории за секунды.' },
        { icon: DollarSign, title: 'Финансы', desc: 'Бюджетирование, анализ денежных потоков, инвестиционные стратегии и снижение расходов.' },
        { icon: Lightbulb, title: 'Бизнес-идеи', desc: 'Генерация идей, валидация концепций, бизнес-модели и анализ рыночных трендов.' },
      ]
    },
    analysis: {
      title: 'Анализ данных',
      subtitle: 'Загрузите Excel — получите полный отчёт',
      items: [
        { icon: BarChart3, title: 'Графики и метрики', desc: 'Автоматические визуализации ваших данных' },
        { icon: FileText, title: 'PDF отчёт', desc: 'Скачайте готовый отчёт одной кнопкой' },
        { icon: Shield, title: 'Данные защищены', desc: 'Файлы не хранятся, данные анонимизируются' },
      ]
    },
    how: {
      title: 'Как это работает',
      steps: [
        { num: '01', title: 'Выберите категорию', desc: 'Маркетинг, финансы или бизнес-идеи' },
        { num: '02', title: 'Задайте вопрос', desc: 'Или выберите готовый шаблон' },
        { num: '03', title: 'Получите ответ', desc: 'AI отвечает в реальном времени' },
      ]
    },
    cta: { title: 'Готовы начать?', subtitle: 'Попробуйте прямо сейчас — бесплатно и без регистрации', btn: 'Начать бесплатно', login: 'Уже есть аккаунт? Войти' },
    langNames: { ru: 'Русский', en: 'English', kk: 'Қазақша' },
  },
  en: {
    nav: { features: 'Features', howItWorks: 'How it works', security: 'Security', login: 'Sign in', start: 'Get started' },
    hero: {
      badge: 'AI Business Assistant',
      title1: 'Smart advisor',
      title2: 'for your business',
      subtitle: 'Get instant AI advice on marketing, finance and business ideas. Upload your data — get deep analysis.',
      cta: 'Try for free',
      ctaSub: 'No account needed',
    },
    features: {
      title: 'Everything your business needs',
      subtitle: 'Three directions — one smart assistant',
      items: [
        { icon: TrendingUp, title: 'Marketing', desc: 'Content plans, email campaigns, SEO strategies and audience targeting in seconds.' },
        { icon: DollarSign, title: 'Finance', desc: 'Budgeting, cash flow analysis, investment strategies and cost reduction.' },
        { icon: Lightbulb, title: 'Business Ideas', desc: 'Idea generation, concept validation, business models and market trend analysis.' },
      ]
    },
    analysis: {
      title: 'Data Analysis',
      subtitle: 'Upload Excel — get a full report',
      items: [
        { icon: BarChart3, title: 'Charts & Metrics', desc: 'Automatic visualizations of your data' },
        { icon: FileText, title: 'PDF Report', desc: 'Download a ready report in one click' },
        { icon: Shield, title: 'Data Protected', desc: 'Files are not stored, data is anonymized' },
      ]
    },
    how: {
      title: 'How it works',
      steps: [
        { num: '01', title: 'Choose a category', desc: 'Marketing, finance or business ideas' },
        { num: '02', title: 'Ask a question', desc: 'Or choose a ready template' },
        { num: '03', title: 'Get an answer', desc: 'AI responds in real time' },
      ]
    },
    cta: { title: 'Ready to start?', subtitle: 'Try right now — free and without registration', btn: 'Start for free', login: 'Already have an account? Sign in' },
    langNames: { ru: 'Русский', en: 'English', kk: 'Қазақша' },
  },
  kk: {
    nav: { features: 'Мүмкіндіктер', howItWorks: 'Қалай жұмыс істейді', security: 'Қауіпсіздік', login: 'Кіру', start: 'Бастау' },
    hero: {
      badge: 'Бизнес үшін AI-көмекші',
      title1: 'Ақылды кеңесші',
      title2: 'сіздің бизнесіңіз үшін',
      subtitle: 'Маркетинг, қаржы және бизнес-идеялар бойынша AI кеңестерін алыңыз. Деректерді жүктеңіз — терең талдау алыңыз.',
      cta: 'Тегін қолданып көру',
      ctaSub: 'Аккаунт қажет емес',
    },
    features: {
      title: 'Бизнеске қажет барлығы',
      subtitle: 'Үш бағыт — бір ақылды көмекші',
      items: [
        { icon: TrendingUp, title: 'Маркетинг', desc: 'Контент-жоспарлар, email-науқандар, SEO стратегиялары секундтарда.' },
        { icon: DollarSign, title: 'Қаржы', desc: 'Бюджеттеу, ақша ағынын талдау, инвестициялық стратегиялар.' },
        { icon: Lightbulb, title: 'Бизнес-идеялар', desc: 'Идея генерациясы, тұжырымдаманы тексеру, бизнес-модельдер.' },
      ]
    },
    analysis: {
      title: 'Деректерді талдау',
      subtitle: 'Excel жүктеңіз — толық есеп алыңыз',
      items: [
        { icon: BarChart3, title: 'Графиктер мен метрикалар', desc: 'Деректеріңіздің автоматты визуализациялары' },
        { icon: FileText, title: 'PDF есебі', desc: 'Бір батырмамен дайын есепті жүктеңіз' },
        { icon: Shield, title: 'Деректер қорғалған', desc: 'Файлдар сақталмайды, деректер анонимдендіріледі' },
      ]
    },
    how: {
      title: 'Қалай жұмыс істейді',
      steps: [
        { num: '01', title: 'Категорияны таңдаңыз', desc: 'Маркетинг, қаржы немесе бизнес-идеялар' },
        { num: '02', title: 'Сұрақ қойыңыз', desc: 'Немесе дайын шаблонды таңдаңыз' },
        { num: '03', title: 'Жауап алыңыз', desc: 'AI нақты уақытта жауап береді' },
      ]
    },
    cta: { title: 'Бастауға дайынсыз ба?', subtitle: 'Қазір тегін және тіркеусіз қолданып көріңіз', btn: 'Тегін бастау', login: 'Аккаунт бар ма? Кіру' },
    langNames: { ru: 'Русский', en: 'English', kk: 'Қазақша' },
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const { dark } = useTheme();
  const [lang, setLang] = useState('ru');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);
  const heroRef = useRef(null);
  const t = translations[lang];

  const accent = dark ? '#00ff87' : '#059669';
  const accentBlue = dark ? '#0ea5e9' : '#0284c7';
  const bgMain = dark ? '#020817' : '#f8fafc';
  const navBg = dark ? 'rgba(2,8,23,0.85)' : 'rgba(248,250,252,0.9)';
  const navBorder = dark ? 'rgba(0,255,135,0.08)' : 'rgba(5,150,105,0.12)';
  const blob1 = dark ? 'rgba(0,255,135,0.08)' : 'rgba(5,150,105,0.08)';
  const blob2 = dark ? 'rgba(14,165,233,0.1)' : 'rgba(2,132,199,0.1)';
  const gridColor = dark ? 'rgba(0,255,135,0.04)' : 'rgba(5,150,105,0.05)';
  const textMuted = dark ? 'rgba(148,163,184,0.7)' : '#475569';
  const textFaint = dark ? 'rgba(148,163,184,0.4)' : '#94a3b8';
  const cardBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.7)';
  const cardBorder = dark ? 'rgba(0,255,135,0.1)' : 'rgba(5,150,105,0.15)';
  const navLinkColor = dark ? 'rgba(148,163,184,0.7)' : '#475569';
  const loginBtnColor = dark ? '#e2e8f0' : '#0f172a';
  const loginBtnBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const loginBtnBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)';
  const heroChatBg = dark ? 'rgba(2,8,23,0.9)' : 'rgba(255,255,255,0.95)';
  const heroChatMsgBg = dark ? 'rgba(0,255,135,0.12)' : 'rgba(5,150,105,0.1)';
  const heroChatMsgBorder = dark ? 'rgba(0,255,135,0.2)' : 'rgba(5,150,105,0.2)';
  const heroChatReplyBg = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const heroChatReplyBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const heroChatTextColor = dark ? '#e2e8f0' : '#0f172a';
  const sectionCardBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.8)';
  const sectionCardBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(5,150,105,0.1)';
  const footerBorder = dark ? 'rgba(0,255,135,0.06)' : 'rgba(5,150,105,0.1)';
  const dropdownBg = dark ? '#020f1a' : '#ffffff';
  const dropdownBorder = dark ? 'rgba(0,255,135,0.15)' : 'rgba(5,150,105,0.2)';
  const mobileBg = dark ? 'rgba(2,8,23,0.97)' : 'rgba(248,250,252,0.97)';
  const securityCardBg = dark ? 'rgba(0,255,135,0.05)' : 'rgba(5,150,105,0.06)';
  const securityCardBorder = dark ? 'rgba(0,255,135,0.1)' : 'rgba(5,150,105,0.15)';
  const analysisSectionBg = dark ? 'rgba(0,255,135,0.03)' : 'rgba(5,150,105,0.04)';
  const ctaSectionBg = dark ? 'rgba(0,255,135,0.04)' : 'rgba(5,150,105,0.05)';
  const ctaSectionBorder = dark ? 'rgba(0,255,135,0.15)' : 'rgba(5,150,105,0.2)';

  useEffect(() => {
    if (heroRef.current) {
      const els = heroRef.current.children;
      try {
        gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power3.out' });
      } catch (e) {
        // Если gsap не сработал — показываем текст без анимации,
        // чтобы заголовок не остался невидимым (opacity: 0).
        Array.from(els).forEach((el) => {
          el.style.opacity = 1;
          el.style.transform = 'none';
        });
      }
    }
  }, []);

  useEffect(() => {
    const close = () => setLangDropdown(false);
    if (langDropdown) document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [langDropdown]);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: bgMain, color: dark ? '#f1f5f9' : '#0f172a', transition: 'background 0.3s ease, color 0.3s ease' }}>

      <style>{`
        @keyframes meshMove {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.05); }
          66% { transform: translate(-20px,30px) scale(0.97); }
        }
        @keyframes gridAnim {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(2); }
        }
        .mesh1 { animation: meshMove 14s ease-in-out infinite; }
        .mesh2 { animation: meshMove 18s ease-in-out infinite reverse; }
        .grid-anim { animation: gridAnim 6s ease-in-out infinite; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="mesh1 absolute" style={{ top: '-20%', left: '-10%', width: '700px', height: '700px', background: `radial-gradient(circle, ${blob1} 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        <div className="mesh2 absolute" style={{ bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: `radial-gradient(circle, ${blob2} 0%, transparent 60%)`, filter: 'blur(80px)' }} />
        <div className="absolute" style={{ top: '40%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: `radial-gradient(circle, ${blob1} 0%, transparent 60%)`, filter: 'blur(60px)' }} />
        <div className="grid-anim absolute inset-0" style={{ backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
        {dark && [...Array(50)].map((_, i) => (
          <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: i % 2 === 0 ? '#00ff87' : '#0ea5e9', opacity: Math.random() * 0.6 + 0.1, animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />
        ))}
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: navBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${navBorder}` }}>

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <svg width="24" height="28" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="lg-nav" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={accent}/><stop offset="100%" stopColor={accentBlue}/></linearGradient></defs>
            <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#lg-nav)" strokeWidth="3"/>
            <polygon points="60,24 88,60 60,96 32,60" fill="url(#lg-nav)" fillOpacity="0.12"/>
            <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#lg-nav)" strokeWidth="1.5"/>
            <circle cx="60" cy="4" r="4" fill={accent}/>
            <circle cx="105" cy="60" r="4" fill={accent}/>
            <circle cx="60" cy="116" r="4" fill={accentBlue}/>
            <circle cx="15" cy="60" r="4" fill={accentBlue}/>
          </svg>
          <span className="font-bold text-base" style={{ background: `linear-gradient(135deg,${accent},${accentBlue})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>MSB Help</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {['features', 'howItWorks', 'security'].map(key => (
            <a key={key} href={`#${key}`} className="text-sm transition-all hover:opacity-80" style={{ color: navLinkColor }}>{t.nav[key]}</a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLangDropdown(!langDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
              style={{ color: accent, border: `1px solid ${accent}26` }}>
              <Globe size={14} />
              <span>{lang.toUpperCase()}</span>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
            {langDropdown && (
              <div className="absolute right-0 mt-2 w-36 rounded-xl overflow-hidden z-50"
                style={{ background: dropdownBg, border: `1px solid ${dropdownBorder}`, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                {['ru', 'en', 'kk'].map(l => (
                  <button key={l} onClick={() => { setLang(l); setLangDropdown(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-white/5 flex items-center justify-between"
                    style={{ color: lang === l ? accent : textMuted, borderBottom: `1px solid ${cardBorder}`, fontWeight: lang === l ? '600' : '400' }}>
                    <span>{translations[l].langNames[l]}</span>
                    {lang === l && <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => navigate('/login')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ color: loginBtnColor, border: `1px solid ${loginBtnBorder}`, background: loginBtnBg }}>
            {t.nav.login}
          </button>
          <button onClick={() => navigate('/guest')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg,${accent},${accentBlue})`, color: dark ? '#020817' : '#ffffff', boxShadow: `0 0 20px ${accent}40` }}>
            {t.nav.start}
          </button>
        </div>

        <button className="md:hidden p-2" style={{ color: accent }} onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed top-16 left-0 right-0 z-40 px-4 py-4 md:hidden"
          style={{ background: mobileBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${navBorder}` }}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-3 py-1">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: `${accent}66` }}>Язык</p>
              <ThemeToggle />
            </div>
            <div className="flex gap-2 px-3 mb-2">
              {['ru', 'en', 'kk'].map(l => (
                <button key={l} onClick={() => { setLang(l); setMobileMenu(false); }}
                  className="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
                  style={lang === l ? { background: `${accent}26`, color: accent, border: `1px solid ${accent}4d` } : { color: textFaint, border: `1px solid ${cardBorder}` }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="h-px mx-3 mb-2" style={{ background: navBorder }} />
            <button onClick={() => { navigate('/login'); setMobileMenu(false); }}
              className="w-full py-2.5 rounded-xl text-sm font-medium"
              style={{ color: loginBtnColor, border: `1px solid ${loginBtnBorder}`, background: loginBtnBg }}>
              {t.nav.login}
            </button>
            <button onClick={() => { navigate('/guest'); setMobileMenu(false); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: `linear-gradient(135deg,${accent},${accentBlue})`, color: dark ? '#020817' : '#ffffff' }}>
              {t.nav.start}
            </button>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 pt-20">
        <div ref={heroRef} className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-10"
            style={{ background: `${accent}14`, border: `1px solid ${accent}33`, color: accent }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
            {t.hero.badge}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
            <span style={{
              display: 'inline-block',
              background: `linear-gradient(135deg,${accent},${accentBlue})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}>
              {t.hero.title1}
            </span>
            <br />
            <span style={{ color: dark ? 'white' : '#0f172a' }}>{t.hero.title2}</span>
          </h1>

          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: textMuted }}>
            {t.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button onClick={() => navigate('/guest')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg,${accent},${accentBlue})`, color: dark ? '#020817' : '#ffffff', boxShadow: `0 0 40px ${accent}4d` }}>
              {t.hero.cta}
              <ChevronRight size={18} />
            </button>
            <button onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:scale-105"
              style={{ color: loginBtnColor, border: `1px solid ${loginBtnBorder}`, background: loginBtnBg }}>
              {t.nav.login}
            </button>
          </div>
          <p className="text-sm" style={{ color: textFaint }}>{t.hero.ctaSub}</p>

          {/* Hero visual */}
          <div className="mt-16 mx-auto max-w-2xl">
            <div className="relative rounded-2xl p-px overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${accent}4d, ${accentBlue}4d, ${accent}1a)` }}>
              <div className="rounded-2xl p-6" style={{ background: heroChatBg }}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#ff5f57' }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#ffbd2e' }} />
                  <div className="w-3.5 h-3.5 rounded-full" style={{ background: '#28ca41' }} />
                  <div className="flex-1 mx-4 h-6 rounded-lg" style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="px-4 py-2.5 rounded-xl rounded-br-sm text-sm"
                      style={{ background: heroChatMsgBg, border: `1px solid ${heroChatMsgBorder}`, color: heroChatTextColor, maxWidth: '70%' }}>
                      {lang === 'kk' ? 'Маркетинг стратегиясын жасаңыз' : lang === 'en' ? 'Create a marketing strategy' : 'Создайте маркетинговую стратегию'}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-xl rounded-bl-sm text-sm"
                      style={{ background: heroChatReplyBg, border: `1px solid ${heroChatReplyBorder}`, color: heroChatTextColor, maxWidth: '85%' }}>
                      <span style={{ color: accent, fontWeight: 600 }}>{lang === 'kk' ? 'Негізгі кеңес:' : lang === 'en' ? 'Key advice:' : 'Главный совет:'}</span>{' '}
                      {lang === 'kk' ? 'Мақсатты аудиторияны анықтаңыз және Instagram арқылы жеткіңіз.' : lang === 'en' ? 'Define your target audience and reach them through Instagram.' : 'Определите целевую аудиторию и достигайте её через Instagram.'}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="px-4 py-2.5 rounded-xl rounded-br-sm text-sm"
                      style={{ background: heroChatMsgBg, border: `1px solid ${heroChatMsgBorder}`, color: heroChatTextColor, maxWidth: '60%' }}>
                      {lang === 'kk' ? 'Excel талдауы' : lang === 'en' ? 'Excel analysis' : 'Анализ Excel файла'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: accent, animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: accent, animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: accentBlue, animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-5" style={{ background: `linear-gradient(135deg,${accent},${accentBlue})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
              {t.features.title}
            </h2>
            <p className="text-lg" style={{ color: textMuted }}>{t.features.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.features.items.map((item, i) => (
              <div key={i} className="p-7 rounded-2xl transition-all hover:scale-[1.02] hover:-translate-y-1"
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(10px)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${accent}1a`, border: `1px solid ${accent}33` }}>
                  <item.icon size={22} style={{ color: accent }} />
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: dark ? 'white' : '#0f172a' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANALYSIS */}
      <section className="relative z-10 py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl p-8 md:p-14" style={{ background: analysisSectionBg, border: `1px solid ${cardBorder}` }}>
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold mb-4" style={{ color: dark ? 'white' : '#0f172a' }}>{t.analysis.title}</h2>
              <p className="text-lg" style={{ color: textMuted }}>{t.analysis.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {t.analysis.items.map((item, i) => (
                <div key={i} className="text-center p-7 rounded-2xl" style={{ background: sectionCardBg, border: `1px solid ${sectionCardBorder}` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: `linear-gradient(135deg, ${accent}26, ${accentBlue}26)`, border: `1px solid ${accent}33` }}>
                    <item.icon size={24} style={{ color: accent }} />
                  </div>
                  <h3 className="font-bold mb-3" style={{ color: dark ? 'white' : '#0f172a' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="howItWorks" className="relative z-10 py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: dark ? 'white' : '#0f172a' }}>{t.how.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.how.steps.map((step, i) => (
              <div key={i} className="text-center relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] h-px"
                    style={{ background: `linear-gradient(90deg, ${accent}66, transparent)` }} />
                )}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl font-bold"
                  style={{ background: `${accent}14`, border: `1px solid ${accent}33`, color: accent }}>
                  {step.num}
                </div>
                <h3 className="font-bold mb-3" style={{ color: dark ? 'white' : '#0f172a' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="relative z-10 py-28 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-7"
            style={{ background: `${accent}1a`, border: `1px solid ${accent}33` }}>
            <Shield size={28} style={{ color: accent }} />
          </div>
          <h2 className="text-4xl font-bold mb-5" style={{ color: dark ? 'white' : '#0f172a' }}>
            {lang === 'kk' ? 'Деректеріңіз қауіпсіз' : lang === 'en' ? 'Your data is safe' : 'Ваши данные в безопасности'}
          </h2>
          <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: textMuted }}>
            {lang === 'kk' ? 'Файлдар тек жадта өңделеді, дискіге сақталмайды. Жеке деректер жойылады. Anthropic API арқылы шифрланған байланыс.' : lang === 'en' ? 'Files are processed only in memory, not saved to disk. Personal data is removed. Encrypted connection via Anthropic API.' : 'Файлы обрабатываются только в памяти, не сохраняются на диск. Личные данные удаляются. Зашифрованное соединение через Anthropic API.'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              lang === 'kk' ? ['🔒', 'Файлдар сақталмайды'] : lang === 'en' ? ['🔒', 'Files not stored'] : ['🔒', 'Файлы не хранятся'],
              lang === 'kk' ? ['🛡️', 'Деректер анонимдендіріледі'] : lang === 'en' ? ['🛡️', 'Data anonymized'] : ['🛡️', 'Данные анонимизируются'],
              lang === 'kk' ? ['✅', 'Шифрланған байланыс'] : lang === 'en' ? ['✅', 'Encrypted connection'] : ['✅', 'Зашифрованное соединение'],
            ].map(([icon, text], i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: securityCardBg, border: `1px solid ${securityCardBorder}` }}>
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium" style={{ color: dark ? 'white' : '#0f172a' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-14 relative overflow-hidden"
            style={{ background: ctaSectionBg, border: `1px solid ${ctaSectionBorder}` }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(circle at 50% 0%, ${accent}14 0%, transparent 60%)` }} />
            <h2 className="text-4xl font-bold mb-5 relative z-10" style={{ color: dark ? 'white' : '#0f172a' }}>{t.cta.title}</h2>
            <p className="text-lg mb-10 relative z-10" style={{ color: textMuted }}>{t.cta.subtitle}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button onClick={() => navigate('/guest')}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg,${accent},${accentBlue})`, color: dark ? '#020817' : '#ffffff', boxShadow: `0 0 40px ${accent}4d` }}>
                {t.cta.btn}
                <ChevronRight size={18} />
              </button>
              <button onClick={() => navigate('/login')}
                className="text-sm font-semibold transition-all hover:opacity-80"
                style={{ color: accent }}>
                {t.cta.login}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 text-center" style={{ borderTop: `1px solid ${footerBorder}` }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <svg width="18" height="22" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="flg-footer" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={accent}/><stop offset="100%" stopColor={accentBlue}/></linearGradient></defs>
            <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#flg-footer)" strokeWidth="3"/>
            <polygon points="60,24 88,60 60,96 32,60" fill="url(#flg-footer)" fillOpacity="0.12"/>
            <circle cx="60" cy="4" r="4" fill={accent}/>
            <circle cx="105" cy="60" r="4" fill={accent}/>
            <circle cx="60" cy="116" r="4" fill={accentBlue}/>
            <circle cx="15" cy="60" r="4" fill={accentBlue}/>
          </svg>
          <span className="font-bold text-sm" style={{ background: `linear-gradient(135deg,${accent},${accentBlue})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>MSB Help</span>
        </div>
        <p className="text-xs" style={{ color: textFaint }}>© 2026 MSB Help. AI-ассистент для малого и среднего бизнеса.</p>
      </footer>
    </div>
  );
}