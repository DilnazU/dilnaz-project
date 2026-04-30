import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Lightbulb, ChevronRight, X, Check } from 'lucide-react';

const STORAGE_KEY = 'msb_onboarding_done';

export default function OnboardingWizard({ language, onComplete }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);

  const t = {
    ru: {
      skip: 'Пропустить',
      next: 'Далее',
      start: 'Начать работу',
      step1: { title: 'Добро пожаловать в MSB Help', subtitle: 'Выберите с чего хотите начать', label: 'Выберите направление' },
      step2: { title: 'Вот как это работает', subtitle: 'Просто напишите вопрос — получите конкретный совет', example_q: 'Как увеличить продажи в Instagram?', example_a: '**Главный совет:** Переходите на Reels — охват в 3 раза выше обычных постов.\n\n**Действия:**\n1. Снимайте 3 Reels в неделю по 15-30 сек\n2. Добавляйте субтитры — 85% смотрят без звука\n3. В первые 3 часа отвечайте на все комментарии\n\n**Результат:** +40% охват за месяц' },
      step3: { title: 'Вы готовы!', subtitle: 'MSB Help поможет вам развить бизнес', features: ['Советы по маркетингу и продажам', 'Анализ финансовых данных', 'Генерация бизнес-идей', 'Загрузка Excel и PDF отчёты'] },
      categories: [
        { id: 'marketing', label: 'Маркетинг', desc: 'Продажи, реклама, соцсети', icon: TrendingUp, color: '#00ff87' },
        { id: 'finance', label: 'Финансы', desc: 'Бюджет, расходы, прибыль', icon: DollarSign, color: '#0ea5e9' },
        { id: 'businessIdeas', label: 'Бизнес-идеи', desc: 'Стратегия, рост, масштаб', icon: Lightbulb, color: '#a855f7' },
      ]
    },
    en: {
      skip: 'Skip',
      next: 'Next',
      start: 'Get started',
      step1: { title: 'Welcome to MSB Help', subtitle: 'Choose where you want to start', label: 'Select a direction' },
      step2: { title: 'Here\'s how it works', subtitle: 'Just ask a question — get specific advice', example_q: 'How to increase sales on Instagram?', example_a: '**Key advice:** Switch to Reels — 3x more reach than regular posts.\n\n**Actions:**\n1. Post 3 Reels per week, 15-30 sec each\n2. Add subtitles — 85% watch without sound\n3. Reply to all comments in first 3 hours\n\n**Result:** +40% reach in one month' },
      step3: { title: 'You\'re ready!', subtitle: 'MSB Help will help you grow your business', features: ['Marketing and sales advice', 'Financial data analysis', 'Business idea generation', 'Excel upload and PDF reports'] },
      categories: [
        { id: 'marketing', label: 'Marketing', desc: 'Sales, ads, social media', icon: TrendingUp, color: '#00ff87' },
        { id: 'finance', label: 'Finance', desc: 'Budget, expenses, profit', icon: DollarSign, color: '#0ea5e9' },
        { id: 'businessIdeas', label: 'Business Ideas', desc: 'Strategy, growth, scale', icon: Lightbulb, color: '#a855f7' },
      ]
    },
    kk: {
      skip: 'Өткізу',
      next: 'Келесі',
      start: 'Бастау',
      step1: { title: 'MSB Help-ке қош келдіңіз', subtitle: 'Қайдан бастағыңыз келетінін таңдаңыз', label: 'Бағытты таңдаңыз' },
      step2: { title: 'Қалай жұмыс істейді', subtitle: 'Сұрақ жазыңыз — нақты кеңес алыңыз', example_q: 'Instagram-да сатылымды қалай арттыруға болады?', example_a: '**Негізгі кеңес:** Reels-ке көшіңіз — қамту қарапайым постарға қарағанда 3 есе жоғары.\n\n**Іс-әрекеттер:**\n1. Аптасына 3 Reels түсіріңіз, 15-30 сек\n2. Субтитр қосыңыз — 85% дыбыссыз қарайды\n3. Алғашқы 3 сағатта барлық пікірлерге жауап беріңіз\n\n**Нәтиже:** Бір айда +40% қамту' },
      step3: { title: 'Дайынсыз!', subtitle: 'MSB Help сіздің бизнесіңізді дамытуға көмектеседі', features: ['Маркетинг және сату кеңестері', 'Қаржылық деректерді талдау', 'Бизнес-идеялар генерациясы', 'Excel жүктеу және PDF есептер'] },
      categories: [
        { id: 'marketing', label: 'Маркетинг', desc: 'Сату, жарнама, әлеуметтік желі', icon: TrendingUp, color: '#00ff87' },
        { id: 'finance', label: 'Қаржы', desc: 'Бюджет, шығындар, табыс', icon: DollarSign, color: '#0ea5e9' },
        { id: 'businessIdeas', label: 'Бизнес-идеялар', desc: 'Стратегия, өсу, масштаб', icon: Lightbulb, color: '#a855f7' },
      ]
    }
  };

  const tr = t[language] || t.ru;

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete(selected);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(2,8,23,0.95)', backdropFilter: 'blur(10px)' }}>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease-out forwards; }
      `}</style>

      <div className="relative w-full max-w-lg fade-up" style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(0,255,135,0.15)',
        borderRadius: '24px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 0 60px rgba(0,255,135,0.08)',
      }}>

        {/* Top line glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,135,0.5), transparent)' }} />

        {/* Skip */}
        <button onClick={handleSkip} className="absolute top-4 right-4 p-2 rounded-lg transition-all hover:bg-white/5"
          style={{ color: 'rgba(148,163,184,0.4)' }}>
          <X size={16} />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="transition-all duration-300 rounded-full"
              style={{
                width: step === i ? '24px' : '8px',
                height: '8px',
                background: step >= i ? '#00ff87' : 'rgba(255,255,255,0.1)',
              }} />
          ))}
        </div>

        <div className="px-8 py-6">

          {/* STEP 1 */}
          {step === 1 && (
            <div key="step1" className="fade-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center"
                  style={{ filter: 'drop-shadow(0 0 15px rgba(0,255,135,0.3))' }}>
                  <svg width="64" height="74" viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
                    <defs><linearGradient id="og1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff87"/><stop offset="100%" stopColor="#0ea5e9"/></linearGradient></defs>
                    <polygon points="60,4 105,60 60,116 15,60" fill="none" stroke="url(#og1)" strokeWidth="2.5"/>
                    <polygon points="60,24 88,60 60,96 32,60" fill="url(#og1)" fillOpacity="0.1"/>
                    <polygon points="60,24 88,60 60,96 32,60" fill="none" stroke="url(#og1)" strokeWidth="1.2"/>
                    <circle cx="60" cy="4" r="4" fill="#00ff87"/><circle cx="105" cy="60" r="4" fill="#00ff87"/>
                    <circle cx="60" cy="116" r="4" fill="#0ea5e9"/><circle cx="15" cy="60" r="4" fill="#0ea5e9"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{tr.step1.title}</h2>
                <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>{tr.step1.subtitle}</p>
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(0,255,135,0.5)' }}>
                {tr.step1.label}
              </p>

              <div className="space-y-3">
                {tr.categories.map(cat => (
                  <div key={cat.id}
                    onClick={() => setSelected(cat.id)}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                    style={selected === cat.id ? {
                      background: `rgba(${cat.color === '#00ff87' ? '0,255,135' : cat.color === '#0ea5e9' ? '14,165,233' : '168,85,247'},0.1)`,
                      border: `1px solid ${cat.color}40`,
                      boxShadow: `0 0 20px ${cat.color}15`,
                    } : {
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}>
                      <cat.icon size={18} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white">{cat.label}</div>
                      <div className="text-xs" style={{ color: 'rgba(148,163,184,0.5)' }}>{cat.desc}</div>
                    </div>
                    {selected === cat.id && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: cat.color }}>
                        <Check size={11} color="#020817" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div key="step2" className="fade-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{tr.step2.title}</h2>
                <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>{tr.step2.subtitle}</p>
              </div>

              <div className="space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm max-w-[85%]"
                    style={{ background: 'linear-gradient(135deg, rgba(0,255,135,0.15), rgba(14,165,233,0.1))', border: '1px solid rgba(0,255,135,0.2)', color: '#f1f5f9' }}>
                    {tr.step2.example_q}
                  </div>
                </div>

                {/* AI response */}
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}>
                  {tr.step2.example_a.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('**') ? 'font-semibold mb-1' : 'mb-0.5'}
                      style={{ color: line.startsWith('**') ? '#00ff87' : '#e2e8f0' }}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div key="step3" className="fade-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', boxShadow: '0 0 30px rgba(0,255,135,0.15)' }}>
                  <Check size={28} style={{ color: '#00ff87' }} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{tr.step3.title}</h2>
                <p className="text-sm" style={{ color: 'rgba(148,163,184,0.6)' }}>{tr.step3.subtitle}</p>
              </div>

              <div className="space-y-2.5 mb-2">
                {tr.step3.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.08)' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: 'rgba(0,255,135,0.15)' }}>
                      <Check size={11} style={{ color: '#00ff87' }} />
                    </div>
                    <span className="text-sm" style={{ color: 'rgba(226,232,240,0.8)' }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button onClick={handleSkip} className="text-sm transition-all hover:opacity-80"
              style={{ color: 'rgba(148,163,184,0.4)' }}>
              {tr.skip}
            </button>

            <button
              onClick={() => step < 3 ? setStep(step + 1) : handleComplete()}
              disabled={step === 1 && !selected}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                background: 'linear-gradient(135deg, #00ff87, #0ea5e9)',
                color: '#020817',
                boxShadow: '0 0 20px rgba(0,255,135,0.2)',
              }}
            >
              {step === 3 ? tr.start : tr.next}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

