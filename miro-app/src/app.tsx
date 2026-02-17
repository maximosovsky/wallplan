import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { generateCalendar } from './generator';

import 'mirotone/dist/styles.css';
import './assets/style.css';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const App: React.FC = () => {
  const [years, setYears] = React.useState(1);
  const [extraMonths, setExtraMonths] = React.useState(0);
  const [rows, setRows] = React.useState(10);
  const [weekStart, setWeekStart] = React.useState<'mon' | 'sun'>('mon');
  const [startYear, setStartYear] = React.useState(currentYear);
  const [startMonth, setStartMonth] = React.useState(currentMonth);
  const [hideDays, setHideDays] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState('');

  const totalMonths = years * 12 + extraMonths;

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setProgress('Preparing...');

    try {
      setProgress('Generating...');

      await generateCalendar({
        months: totalMonths,
        rows,
        weekStart,
        hideDays,
        startYear,
        startMonth,
        onProgress: (current, total) => {
          const steps = ['', 'Loading fonts...', 'Rendering SVG...', 'Encoding...', 'Placing on board...', 'Done!'];
          setProgress(steps[current] || `Step ${current}/${total}`);
        },
      });

      setProgress('Done! ✓');
      setTimeout(() => setProgress(''), 2000);
    } catch (err) {
      console.error('Generation failed:', err);
      setProgress('Error — see console');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid wrapper">
      {/* Duration */}
      <div className="cs1 ce12">
        <label className="label">Duration</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="input"
            type="number"
            min={0}
            max={20}
            value={years}
            onChange={(e) => setYears(Math.max(0, parseInt(e.target.value) || 0))}
            style={{ width: 100, textAlign: 'center' }}
          />
          <span style={{ fontSize: 12, color: '#8B7D6B' }}>yr</span>
          <input
            className="input"
            type="number"
            min={0}
            max={11}
            value={extraMonths}
            onChange={(e) => setExtraMonths(Math.max(0, Math.min(11, parseInt(e.target.value) || 0)))}
            style={{ width: 100, textAlign: 'center' }}
          />
          <span style={{ fontSize: 12, color: '#8B7D6B' }}>mo</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8B7D6B' }}>
            = {totalMonths} months
          </span>
        </div>
      </div>

      {/* Start + Week Start on one row */}
      <div className="cs1 ce12">
        <label className="label">Start</label>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <select
            className="select"
            value={startMonth}
            onChange={(e) => setStartMonth(parseInt(e.target.value))}
            style={{ width: 140 }}
          >
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <input
            className="input"
            type="number"
            min={2020}
            max={2040}
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value) || currentYear)}
            style={{ width: 100, textAlign: 'center' }}
          />
          <button
            className="button button-secondary"
            onClick={() => setWeekStart(weekStart === 'mon' ? 'sun' : 'mon')}
            style={{
              flex: 1,
              border: 'none',
              color: weekStart === 'sun' ? '#C41E3A' : undefined,
            }}
          >
            {weekStart === 'mon' ? 'Mon' : 'Sun'}
          </button>
        </div>
      </div>

      {/* Gantt Rows + Hide Days */}
      <div className="cs1 ce12">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <label className="label" style={{ margin: 0 }}>Gantt rows</label>
          <span className="label" style={{ margin: 0, marginLeft: 'auto', width: 70, textAlign: 'center' }}>Hide days</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[6, 8, 10, 12].map((r) => (
            <button
              key={r}
              className={`button button-small ${rows === r ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setRows(r)}
              style={{ width: 50 }}
            >
              {r}
            </button>
          ))}
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 1 }}>
            <input
              type="checkbox"
              className="checkbox"
              checked={hideDays}
              onChange={(e) => setHideDays(e.target.checked)}
              style={{ transform: 'scale(2)', transformOrigin: 'center' }}
            />
          </label>
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="cs1 ce12" style={{ textAlign: 'center', fontSize: 12, color: '#8B7D6B' }}>
          {progress}
        </div>
      )}

      {/* Generate */}
      <div className="cs1 ce12" style={{ textAlign: 'center' }}>
        <button
          className="button button-primary"
          onClick={handleGenerate}
          disabled={generating || totalMonths === 0}
          style={{ width: 140 }}
        >
          {generating ? 'Generating...' : 'Generate ▶'}
        </button>
      </div>
    </div>
  );
};

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);
