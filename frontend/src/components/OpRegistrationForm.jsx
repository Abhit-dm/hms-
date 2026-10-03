import { useEffect, useMemo, useState } from 'react';
import { Search, Save } from 'lucide-react';
import { api } from '../services/api';
import './OpRegistrationForm.css';

const blank = { mobile: '', countryCode: '+91', title: '', firstName: '', lastName: '', gender: 'Male', age: '', dateOfBirth: '', maritalStatus: '', bloodGroup: '', aadhaarNumber: '', alternatePhone: '', occupation: '', email: '', state: '', city: '', locality: '', address: '', pinCode: '', guardianName: '', guardianRelationship: '', guardianMobile: '', motherName: '', departmentId: '', doctorId: '', symptoms: '', visitType: 'General OPD', referralType: 'Walk in', referenceAgentId: '', appointmentDate: '', appointmentTime: '', paymentMode: 'CASH', registrationFee: 100, discount: 0, discountAmount: 0, paidAmount: 0 };
export default function OpRegistrationForm() {
  const [form, setForm] = useState(blank); const [patientId, setPatientId] = useState(null); const [matches, setMatches] = useState([]); const [doctors, setDoctors] = useState([]); const [departments, setDepartments] = useState([]); const [agents, setAgents] = useState([]); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false);
  useEffect(() => { Promise.all([api('/doctors'), api('/departments'), api('/reference-agents')]).then(([doctorData, departmentData, agentData]) => { setDoctors(doctorData); setDepartments(departmentData); setAgents(agentData); }).catch((error) => setMessage(error.message)); }, []);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value })); const doctor = doctors.find((item) => String(item.id) === String(form.doctorId)); const finalAmount = useMemo(() => Math.max(0, Number(form.registrationFee || 0) + Number(form.consultationFee || 0) - Number(form.discountAmount || 0)), [form.registrationFee, form.consultationFee, form.discountAmount]);
  function chooseDoctor(value) { const selected = doctors.find((item) => String(item.id) === String(value)); setForm((current) => ({ ...current, doctorId: value, consultationFee: selected?.consultationFee || 0 })); }
  function fill(patient) { setPatientId(patient.id); setMatches([]); setForm((current) => ({ ...current, mobile: patient.mobile || '', firstName: patient.firstName || '', lastName: patient.lastName || '', gender: patient.gender || 'Male', age: patient.age || '', dateOfBirth: patient.dateOfBirth?.slice(0, 10) || '', email: patient.email || '', aadhaarNumber: patient.aadhaarNumber || '', alternatePhone: patient.alternatePhone || '', maritalStatus: patient.maritalStatus || '', bloodGroup: patient.bloodGroup || '', occupation: patient.occupation || '', address: patient.address || '', state: patient.state || '', city: patient.city || '', locality: patient.locality || '', pinCode: patient.pinCode || '', guardianName: patient.guardianName || '', guardianRelationship: patient.guardianRelationship || '', guardianMobile: patient.guardianMobile || '', motherName: patient.motherName || '' })); setMessage(`Loaded ${patient.patientNumber}.`); }
  async function search() { if (!form.mobile) return setMessage('Enter a mobile number first.'); try { const results = await api(`/patients?search=${encodeURIComponent(form.mobile)}`); setMatches(results); if (results.length === 1) fill(results[0]); if (!results.length) setMessage('No existing patient found. Continue with a new OP Form.'); } catch (error) { setMessage(error.message); } }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      let id = patientId;
      if (!id) {
        const patient = await api('/patients', { method: 'POST', body: JSON.stringify({ ...form, registrationType: 'OP', age: form.age ? Number(form.age) : undefined, departmentId: form.departmentId ? Number(form.departmentId) : undefined, referenceAgentId: form.referenceAgentId ? Number(form.referenceAgentId) : undefined }) });
        id = patient.id;
      }
      const visit = await api('/outpatient-visits', { method: 'POST', body: JSON.stringify({ patientId: id, ...form, doctorId: form.doctorId ? Number(form.doctorId) : undefined, departmentId: form.departmentId ? Number(form.departmentId) : undefined, consultationFee: Number(form.consultationFee || 0), registrationFee: Number(form.registrationFee || 0), discount: Number(form.discount || 0), discountAmount: Number(form.discountAmount || 0), finalAmount }) });
      await api(`/outpatient-visits/${visit.id}/payment`, { method: 'PATCH', body: JSON.stringify({ paidAmount: Number(form.paidAmount || 0) }) });
      const invoice = await api('/billing/invoices', {
        method: 'POST',
        body: JSON.stringify({
          patientId: id,
          invoiceType: 'OP',
          invoiceDate: new Date().toLocaleDateString('en-CA'),
          discount: Number(form.discountAmount || 0),
          initialPayment: Number(form.paidAmount || 0),
          paymentMode: form.paymentMode,
          items: [
            { description: 'Registration fee', category: 'OP', quantity: 1, unitPrice: Number(form.registrationFee || 0) },
            { description: `Doctor consultation${doctor?.name ? ` - ${doctor.name}` : ''}`, category: 'OP', quantity: 1, unitPrice: Number(form.consultationFee || 0) }
          ]
        })
      });
      const patientRecord = await api(`/patients/${id}`);
      window.dispatchEvent(new CustomEvent('hms:op-registration-complete', { detail: { patient: patientRecord, visit, invoice, doctorName: doctor?.name || '' } }));
      setMessage('OP registration and bill saved. Printing the registration slip and bill on A4 paper.');
      setForm(blank);
      setPatientId(null);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }
  const input = (key, label, type = 'text', required = false, readOnly = false) => <label key={key}>{label}<input required={required} readOnly={readOnly} type={type} value={form[key] ?? ''} onChange={(event) => set(key, event.target.value)} /></label>;
  const select = (key, label, values) => <label key={key}>{label}<select value={form[key]} onChange={(event) => set(key, event.target.value)}>{values.map((value) => <option key={String(value)} value={value}>{value || 'Select'}</option>)}</select></label>;
  return <form className="registration-page" onSubmit={submit}><div className="registration-heading"><div><p className="eyebrow">OP FORM</p><h2>OP Registration Form</h2><p className="muted">Create the OP record first. It can later be converted to Inpatient.</p></div><button className="primary" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save OP Form'}</button></div>{message && <div className="alert">{message}</div>}<section className="panel registration-panel"><Section title="Patient Search and Information"><div className="mobile-search"><input value={form.mobile} onChange={(event) => { set('mobile', event.target.value); setPatientId(null); }} placeholder="Mobile number" /><button type="button" className="secondary" onClick={search}><Search size={16} /> Search and prefill</button></div>{matches.map((patient) => <button className="patient-match" type="button" key={patient.id} onClick={() => fill(patient)}>{patient.patientNumber} · {patient.firstName} {patient.lastName || ''} · {patient.mobile}</button>)}<div className="registration-grid">{input('mobile', 'Mobile number *', 'tel', true)}{select('title', 'Title', ['', 'Mr', 'Mrs', 'Ms', 'Master', 'Dr'])}{input('firstName', 'First name *', 'text', true)}{input('lastName', 'Last name')}{select('gender', 'Gender', ['Male', 'Female', 'Other'])}{input('age', 'Age', 'number')}{input('dateOfBirth', 'Date of birth', 'date')}{select('maritalStatus', 'Marital status', ['', 'Single', 'Married', 'Other'])}{select('bloodGroup', 'Blood group', ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}{input('aadhaarNumber', 'Aadhaar number')}{input('alternatePhone', 'Alternate phone', 'tel')}{input('occupation', 'Occupation')}{input('email', 'Email', 'email')}</div></Section><Section title="Address and Guardian"><div className="registration-grid">{input('state', 'State')}{input('city', 'City')}{input('locality', 'Locality')}{input('address', 'Street address')}{input('pinCode', 'Pin code')}{input('guardianName', 'Parent / guardian name')}{select('guardianRelationship', 'Guardian relationship', ['', 'Parent', 'Spouse', 'Sibling', 'Other'])}{input('guardianMobile', 'Guardian mobile', 'tel')}{input('motherName', 'Mother name')}</div></Section><Section title="Doctor, Referral, OP Visit and Appointment"><div className="registration-grid"><label>Department<select value={form.departmentId} onChange={(event) => set('departmentId', event.target.value)}><option value="">Select department</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Consultant doctor<select required value={form.doctorId} onChange={(event) => chooseDoctor(event.target.value)}><option value="">Select doctor</option>{doctors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{input('consultationFee', 'Consultation fee set by Admin', 'number', false, true)}{select('visitType', 'Visit type', ['General OPD', 'Follow-up', 'Emergency', 'Specialist'])}{select('referralType', 'Referral type', ['Walk in', 'REFERENCE'])}{form.referralType === 'REFERENCE' && <label>Reference member<select value={form.referenceAgentId} onChange={(event) => set('referenceAgentId', event.target.value)}><option value="">Select member</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></label>}{input('appointmentDate', 'Appointment date', 'date')}{input('appointmentTime', 'Appointment time', 'time')}{input('symptoms', 'Symptoms')}</div></Section><Section title="Payment and Registration"><div className="registration-grid">{select('paymentMode', 'Payment mode', ['CASH', 'CARD', 'UPI', 'INSURANCE', 'OTHER'])}{input('registrationFee', 'Registration fee', 'number')}{input('discount', 'Discount %', 'number')}{input('discountAmount', 'Discount amount', 'number')}{input('paidAmount', 'Paid amount', 'number')}<div className="fee-preview">Final amount <strong>₹{finalAmount.toFixed(2)}</strong></div></div></Section></section></form>;
}
function Section({ title, children }) { return <section className="registration-section"><div className="registration-section-title"><span className="section-line" /><h3>{title}</h3></div>{children}</section>; }
