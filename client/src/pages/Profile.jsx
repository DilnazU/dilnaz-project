import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, User, Mail, Lock, Trash2, Check } from 'lucide-react';

export default function Profile() {
  const { user, changePassword, deleteAccount } = useAuth();
  const { dark } = useTheme();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [delLoading, setDelLoading] = useState(false);

  const accent = dark ? '#00ff87' : '#059669';
  const accentBlue = dark ? '#0ea5e9' : '#0284c7';
  const bgMain = dark ? '#020817' : '#f8fafc';
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.9)';
  const cardBorder = dark ? 'rgba(0,255,135,0.15)' : 'rgba(5,150,105,0.2)';
  const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
  const inputBorder = dark ? 'rgba(0,255,135,0.15)' : 'rgba(5,150,105,0.2)';
  const textColor = dark ? 'white' : '#0f172a';
  const textMuted = dark ? 'rgba(148,163,184,0.7)' : '#475569';
  const btnTextColor = dark ? '#020817' : '#ffffff';
  const dangerColor = '#ef4444';

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess('');
    if (!currentPassword || !newPassword) {
      setPwError('Заполните оба поля');
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwSuccess('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPwError(err.response?.data?.message || 'Не удалось изменить пароль');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await deleteAccount();
    } catch (err) {
      setDelLoading(false);
      alert(err.response?.data?.message || 'Не удалось удалить аккаунт');
    }
  };

  const cardStyle = {
    background: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  };
  const labelStyle = { color: accent, fontSize: '13px', fontWeight: 600, marginBottom: '6px', display: 'block' };
  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: '10px',
    background: inputBg, border: `1px solid ${inputBorder}`,
    color: textColor, outline: 'none', fontSize: '15px', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: bgMain, padding: '24px', color: textColor }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/chat')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px',
            background: 'none', border: 'none', color: accent, cursor: 'pointer', fontSize: '15px', fontWeight: 600,
          }}
        >
          <ArrowLeft size={18} /> Назад
        </button>

        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px' }}>Мой профиль</h1>

        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '18px' }}>Мои данные</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <User size={18} style={{ color: accent }} />
            <div>
              <div style={{ fontSize: '12px', color: textMuted }}>Имя</div>
              <div style={{ fontSize: '15px' }}>{user?.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Mail size={18} style={{ color: accent }} />
            <div>
              <div style={{ fontSize: '12px', color: textMuted }}>Email</div>
              <div style={{ fontSize: '15px' }}>{user?.email}</div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: accent }} /> Сменить пароль
          </h2>
          <p style={{ fontSize: '13px', color: textMuted, marginBottom: '16px' }}>
            Новый пароль: минимум 6 символов, буква и цифра
          </p>

          <label style={labelStyle}>Текущий пароль</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ ...inputStyle, marginBottom: '14px' }}
            placeholder="Введите текущий пароль"
          />

          <label style={labelStyle}>Новый пароль</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ ...inputStyle, marginBottom: '16px' }}
            placeholder="Введите новый пароль"
          />

          {pwError && <p style={{ color: dangerColor, fontSize: '14px', marginBottom: '12px' }}>{pwError}</p>}
          {pwSuccess && (
            <p style={{ color: accent, fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> {pwSuccess}
            </p>
          )}

          <button
            onClick={handleChangePassword}
            disabled={pwLoading}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
              background: `linear-gradient(135deg, ${accent}, ${accentBlue})`,
              color: btnTextColor, fontWeight: 600, fontSize: '15px',
              cursor: pwLoading ? 'default' : 'pointer', opacity: pwLoading ? 0.6 : 1,
            }}
          >
            {pwLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
          </button>
        </div>

        <div style={{ ...cardStyle, border: `1px solid ${dangerColor}33` }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px', color: dangerColor }}>
            <Trash2 size={18} /> Удалить аккаунт
          </h2>
          <p style={{ fontSize: '13px', color: textMuted, marginBottom: '16px' }}>
            Это действие необратимо. Все ваши чаты и данные будут удалены навсегда.
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: `1px solid ${dangerColor}`, background: 'transparent',
                color: dangerColor, fontWeight: 600, fontSize: '15px', cursor: 'pointer',
              }}
            >
              Удалить мой аккаунт
            </button>
          ) : (
            <div>
              <p style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>
                Вы точно уверены? Отменить это будет невозможно.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px',
                    border: `1px solid ${inputBorder}`, background: 'transparent',
                    color: textColor, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  disabled={delLoading}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                    background: dangerColor, color: '#fff', fontWeight: 600,
                    cursor: delLoading ? 'default' : 'pointer', opacity: delLoading ? 0.6 : 1,
                  }}
                >
                  {delLoading ? 'Удаление...' : 'Да, удалить'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}