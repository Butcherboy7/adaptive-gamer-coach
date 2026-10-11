import { ChevronDown } from 'lucide-react';

function LossCurve({ values, label }) {
  if (!values?.length) return null;
  const w = 260, h = 72, pad = 4;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const x = (i) => pad + (i / (values.length - 1)) * (w - pad * 2);
  const y = (v) => pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <figure className="loss">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`${label} training loss falls from ${max.toFixed(3)} to ${values.at(-1).toFixed(3)} over ${values.length} epochs`}>
        <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <figcaption>
        <span>{label}</span>
        <span className="num">{values.length} epochs · loss {values[0].toFixed(2)} → {values.at(-1).toFixed(3)}</span>
      </figcaption>
    </figure>
  );
}

export default function ModelCard({ meta }) {
  if (!meta) return null;
  const r = meta.rage_metrics || {};
  const a = meta.addiction_metrics || {};
  return (
    <details className="plate model-card">
      <summary>
        <span className="model-title">How the analysis works <ChevronDown size={18} className="model-chev" aria-hidden /></span>
        <span className="model-sum num">
          Tilt model AUC {r.roc_auc ?? '—'} · Addiction model accuracy {a.accuracy ? `${Math.round(a.accuracy * 100)}%` : '—'}
        </span>
      </summary>
      <div className="model-body">
        <div className="model-text">
          <p>
            Two neural networks (multi-layer perceptrons, {meta.architecture?.split('(')[1]?.replace(')', '') || '128 → 64 units'})
            are trained with scikit-learn on {meta.training_samples?.toLocaleString()} synthetic player profiles and tested on{' '}
            {meta.test_samples?.toLocaleString()} held-out ones.
          </p>
          <ul>
            <li><b>Tilt model:</b> 9 inputs → probability of rage-quitting. Accuracy {Math.round((r.accuracy || 0) * 100)}%, ROC-AUC {r.roc_auc}. Labels are noisy by design, so the best any model could score is {Math.round((r.best_possible_accuracy || 0) * 100)}%.</li>
            <li><b>Addiction model:</b> 10 inputs → Low / Medium / High. Accuracy {Math.round((a.accuracy || 0) * 100)}%, macro-F1 {a.macro_f1}.</li>
            <li><b>Factor impacts:</b> Shapley values. Each factor's points are its average effect on the model's output when it moves from the healthy baseline to your value, across random orderings of the factors.</li>
            <li><b>Data:</b> {meta.data_source}.</li>
          </ul>
        </div>
        <div className="model-curves">
          <LossCurve values={meta.rage_loss_history} label="Tilt model" />
          <LossCurve values={meta.addiction_loss_history} label="Addiction model" />
        </div>
      </div>
    </details>
  );
}
