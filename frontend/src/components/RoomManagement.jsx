import { useState } from 'react';
import { BedDouble, Plus } from 'lucide-react';
import { api } from '../services/api';

export default function RoomManagement() {
  const [form, setForm] = useState({ wardName: '', number: '', roomType: 'General', dailyRate: 0, bedCount: 1 }); const [message, setMessage] = useState('');
  async function submit(event) { event.preventDefault(); try { const room = await api('/rooms', { method: 'POST', body: JSON.stringify(form) }); setMessage(`Room ${room.number} created with ${room.beds.length} beds.`); setForm({ wardName: '', number: '', roomType: 'General', dailyRate: 0, bedCount: 1 }); } catch (error) { setMessage(error.message); } }
  return <div className="page-toolbar"><div><p className="eyebrow">ADMINISTRATION</p><h2>Rooms and Bed Rates</h2><p className="lede">Admin defines room prices; Reception assigns available beds.</p></div><form className="panel compact-room-form" onSubmit={submit}><div className="form-grid">{[['wardName','Ward'],['number','Room number'],['roomType','Room type'],['dailyRate','Daily room price'],['bedCount','Number of beds']].map(([key, label]) => <label key={key}>{label}<input required min={key === 'dailyRate' ? 0 : undefined} type={['dailyRate','bedCount'].includes(key) ? 'number' : 'text'} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}</div><button className="primary"><Plus size={16} /> Add room and beds</button>{message && <div className="alert">{message}</div>}</form></div>;
}
