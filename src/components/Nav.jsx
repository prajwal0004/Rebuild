import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, addMonths, fmtDate, monthLabel } from '../utils/dates';

export function DateNav({ date, today, onChange, max }) {
  return (
    <div className="datenav">
      <button className="icon-btn" aria-label="Previous day" onClick={() => onChange(addDays(date, -1))}><ChevronLeft size={18} /></button>
      <strong>{fmtDate(date)}</strong>
      <button className="icon-btn" aria-label="Next day" disabled={date >= (max || today)} onClick={() => onChange(addDays(date, 1))}><ChevronRight size={18} /></button>
      {date !== today && <button className="link" onClick={() => onChange(today)}>Today</button>}
    </div>
  );
}
export function MonthNav({ month, maxMonth, onChange }) {
  return (
    <div className="datenav">
      <button className="icon-btn" aria-label="Previous month" onClick={() => onChange(addMonths(month, -1))}><ChevronLeft size={18} /></button>
      <strong>{monthLabel(month)}</strong>
      <button className="icon-btn" aria-label="Next month" disabled={month >= maxMonth} onClick={() => onChange(addMonths(month, 1))}><ChevronRight size={18} /></button>
    </div>
  );
}
export const Err = ({ q }) => q.error ? <div className="alert err">Could not load data: {q.error} <button className="link" onClick={q.reload}>Retry</button></div> : null;
