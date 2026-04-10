import { useState } from 'react';
import axios from 'axios';
import './BusinessAnalysis.css';

export default function BusinessAnalysis({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [formData, setFormData] = useState({
    business: '',
    audience: '',
    problem: '',
    goal: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Загрузите файл!');
      return;
    }

    if (!formData.business || !formData.audience || !formData.problem || !formData.goal) {
      alert('Заполните все поля!');
      return;
    }

    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('business', formData.business);
    formDataToSend.append('audience', formData.audience);
    formDataToSend.append('problem', formData.problem);
    formDataToSend.append('goal', formData.goal);
    formDataToSend.append('file', file);

    try {
      const response = await axios.post('/api/analysis', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResults(response.data);
      setStep(2);
    } catch (error) {
      console.error('Ошибка анализа:', error);
      alert('Ошибка при анализе данных');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {step === 1 ? (
          <div className="analysis-form">
            <h2>📈 Анализ бизнеса</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>1. Опишите ваш бизнес *</label>
                <textarea
                  name="business"
                  value={formData.business}
                  onChange={handleInputChange}
                  placeholder="Например: продаю одежду онлайн через Instagram"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>2. Кто ваша целевая аудитория? *</label>
                <textarea
                  name="audience"
                  value={formData.audience}
                  onChange={handleInputChange}
                  placeholder="Например: женщины 25-40 лет, средний класс"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>3. Какая у вас проблема? *</label>
                <textarea
                  name="problem"
                  value={formData.problem}
                  onChange={handleInputChange}
                  placeholder="Например: низкая конверсия, мало повторных покупок"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>4. Цель на 3-6 месяцев? *</label>
                <textarea
                  name="goal"
                  value={formData.goal}
                  onChange={handleInputChange}
                  placeholder="Например: увеличить продажи на 50%"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>5. Загрузите файл (Excel/CSV) *</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                />
                {file && <p className="file-name">📁 {file.name}</p>}
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Анализируем...' : 'Анализировать'}
              </button>
            </form>
          </div>
        ) : (
          <div className="analysis-results">
            <h2>📊 Результаты анализа</h2>

            {results && (
              <>
                <div className="result-section">
                  <h3>📈 Краткий вывод</h3>
                  <p>{results.summary}</p>
                </div>

                <div className="result-section">
                  <h3>💹 Анализ цифр</h3>
                  <p>{results.analytics}</p>
                </div>

                <div className="result-section">
                  <h3>⚠️ Проблемы</h3>
                  <p>{results.problems}</p>
                </div>

                <div className="result-section">
                  <h3>✅ Рекомендации</h3>
                  <p>{results.recommendations}</p>
                </div>

                <div className="result-section">
                  <h3>🔮 Прогноз</h3>
                  <p>{results.forecast}</p>
                </div>
              </>
            )}

            <button onClick={() => setStep(1)} className="back-btn">
              ← Назад к форме
            </button>
          </div>
        )}
      </div>
    </div>
  );
}