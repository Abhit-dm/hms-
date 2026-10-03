import { useEffect, useMemo, useState } from 'react';
import { Plus, Printer, Search, Save } from 'lucide-react';
import { api } from '../services/api';

const roomServices = ['Room rent', 'Nursing', 'Housekeeping', 'Duty medical officer', 'Doctor consultation'];
const paymentModes = ['CASH', 'CARD', 'UPI', 'INSURANCE', 'OTHER'];
const today = () => new Date().toLocaleDateString('en-CA');
const dateValue = (value) => value ? new Date(value).toLocaleDateString('en-CA') : '';
const money = (value) => `₹${Number(value || 0).toFixed(2)}`;
const patientName = (patient) => `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim();
const emptyItem = (mode) => ({ description: mode === 'roomRent' ? 'Room rent' : '', category: mode === 'roomRent' ? 'Room rent' : mode === 'opBilling' ? 'OP' : 'IP', quantity: '1', unitPrice: '' });

export default function Billing({ mode }) {
  const isRoomRent = mode === 'roomRent';
  const isAdvance = mode === 'advancePayment';
  const isSummary = mode === 'opBills' || mode === 'ipBills';
  const invoiceType = mode === 'opBilling' || mode === 'opBills' ? 'OP' : 'IP';
  const [searchText, setSearchText] = useState('');
  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [admissionId, setAdmissionId] = useState('');
  const [items, setItems] = useState([emptyItem(mode)]);
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [discount, setDiscount] = useState('0');
  const [paid, setPaid] = useState('0');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [reference, setReference] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [advancePayments, setAdvancePayments] = useState([]);
  const [printInvoice, setPrintInvoice] = useState(null);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0), [items]);
  const total = Math.max(0, subtotal - Number(discount || 0));
  const activeAdmissions = admissions.filter((item) => item.status === 'ADMITTED' && item.patientId === patient?.id);

  async function loadInvoices() {
    const data = await api(`/billing/invoices?type=${invoiceType}`);
    setInvoices(data);
  }

  async function loadAdvances() {
    setAdvancePayments(await api('/billing/advance-payments'));
  }

  useEffect(() => {
    setMessage('');
    setPatient(null);
    setSearchText('');
    setPatients([]);
    setAdmissionId('');
    setItems([emptyItem(mode)]);
    setInvoiceDate(today());
    setDiscount('0');
    setPaid('0');
    if (isSummary) loadInvoices().catch((error) => setMessage(error.message));
    if (isAdvance || isRoomRent || mode === 'ipBilling') {
      api('/admissions?active=true').then(setAdmissions).catch((error) => setMessage(error.message));
    }
    if (isAdvance || mode === 'ipBills') loadAdvances().catch((error) => setMessage(error.message));
  }, [mode]);

  useEffect(() => {
    if (!printInvoice) return undefined;
    const timer = window.setTimeout(() => window.print(), 250);
    const finish = () => setPrintInvoice(null);
    window.addEventListener('afterprint', finish);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', finish);
    };
  }, [printInvoice]);

  async function searchPatients(event) {
    event.preventDefault();
    setMessage('');
    try {
      const results = await api(`/patients?search=${encodeURIComponent(searchText)}`);
      setPatients(results);
      if (results.length === 1) choosePatient(results[0]);
      if (!results.length) setMessage('No patients found. Search by patient number, name, or mobile.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  function choosePatient(selected) {
    if (!selected) {
      setPatient(null);
      setPatients([]);
      setAdmissionId('');
      return;
    }
    setPatient(selected);
    setSearchText(`${selected.patientNumber} · ${patientName(selected)} · ${selected.mobile}`);
    setPatients([]);
    setAdmissionId('');
  }

  function setItemValue(index, key, value) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }

  function chooseAdmission(value) {
    setAdmissionId(value);
    if (isRoomRent && value) {
      const selected = admissions.find((item) => String(item.id) === value);
      if (selected) setItemValue(0, 'unitPrice', String(selected.bed.room.dailyRate));
    }
  }

  async function createInvoice(event) {
    event.preventDefault();
    if (!patient) return setMessage('Search for and select a patient first.');
    if (isRoomRent && !admissionId) return setMessage('Select an active inpatient admission for room-related charges.');
    setSaving(true);
    setMessage('');
    try {
      const bill = await api('/billing/invoices', {
        method: 'POST',
        body: JSON.stringify({
          patientId: patient.id,
          admissionId: admissionId ? Number(admissionId) : undefined,
          invoiceType,
          invoiceDate,
          discount: Number(discount || 0),
          initialPayment: Number(paid || 0),
          paymentMode,
          items: items.map((item) => ({ ...item, quantity: Number(item.quantity), unitPrice: Number(item.unitPrice) }))
        })
      });
      setMessage(`Bill ${bill.invoiceNumber} saved. Opening the A4 print dialog.`);
      setPrintInvoice(bill);
      setItems([emptyItem(mode)]);
      setDiscount('0');
      setPaid('0');
      if (isSummary) await loadInvoices();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function recordAdvance(event) {
    event.preventDefault();
    if (!patient) return setMessage('Search for and select a patient first.');
    setSaving(true);
    setMessage('');
    try {
      await api('/billing/advance-payments', {
        method: 'POST',
        body: JSON.stringify({ patientId: patient.id, admissionId: admissionId ? Number(admissionId) : undefined, amount: Number(advanceAmount), mode: paymentMode, reference: reference || undefined })
      });
      setMessage('Inpatient advance payment saved.');
      setAdvanceAmount('');
      setReference('');
      await loadAdvances();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function adjustDate(invoice, value) {
    try {
      const updated = await api(`/billing/invoices/${invoice.id}/date`, { method: 'PATCH', body: JSON.stringify({ invoiceDate: value }) });
      setInvoices((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
      setMessage(`Bill ${invoice.invoiceNumber} date updated.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const heading = {
    roomRent: 'Room rent and inpatient services',
    opBilling: 'OP billing',
    ipBilling: 'IP billing',
    advancePayment: 'Inpatient advance payment',
    opBills: 'OP BILLS',
    ipBills: 'IP BILLS'
  }[mode];

  return (
    <div className="billing-page">
      <div className="page-toolbar">
        <div><p className="eyebrow">BILLING</p><h2>{heading}</h2><p className="lede">{isSummary ? `View and print ${invoiceType} bills; adjust a bill date when needed.` : 'Create a patient bill and print a clean A4 copy.'}</p></div>
      </div>
      {message && <div className="alert">{message}</div>}

      {!isSummary && (
        <section className="panel billing-panel">
          <PatientPicker searchText={searchText} onSearchText={(value) => { setSearchText(value); setPatient(null); setAdmissionId(''); }} patients={patients} onSearch={searchPatients} onChoose={choosePatient} patient={patient} />
          {(isRoomRent || mode === 'ipBilling' || isAdvance) && (
            <AdmissionPicker admissions={activeAdmissions} admissionId={admissionId} onChange={chooseAdmission} required={isRoomRent} />
          )}

          {isRoomRent && <nav className="billing-service-menu" aria-label="Room rent billing sections">
            {roomServices.map((service) => <button type="button" key={service} className={items[0]?.category === service ? 'active' : ''} onClick={() => setItems((current) => current.map((item, index) => index === 0 ? { ...item, category: service, description: service } : item))}>{service}</button>)}
          </nav>}

          {isAdvance ? (
            <form className="billing-form" onSubmit={recordAdvance}>
              <label>Advance amount<input type="number" min="0.01" step="0.01" required value={advanceAmount} onChange={(event) => setAdvanceAmount(event.target.value)} /></label>
              <label>Payment mode<select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>{paymentModes.map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Reference / transaction number<input value={reference} onChange={(event) => setReference(event.target.value)} maxLength="200" /></label>
              <button className="primary" disabled={saving || !patient}><Save size={16} /> Record advance payment</button>
            </form>
          ) : (
            <form className="billing-form" onSubmit={createInvoice}>
              {items.map((item, index) => (
                <div className="billing-item" key={index}>
                  {isRoomRent ? (
                    <div className="billing-service-current"><span>Selected service</span><strong>{item.category}</strong></div>
                  ) : (
                    <label>Bill item<input required value={item.description} onChange={(event) => setItemValue(index, 'description', event.target.value)} placeholder={mode === 'opBilling' ? 'Consultation / procedure' : 'IP service or supply'} /></label>
                  )}
                  <label>Quantity<input type="number" min="1" step="1" required value={item.quantity} onChange={(event) => setItemValue(index, 'quantity', event.target.value)} /></label>
                  <label>Rate<input type="number" min="0" step="0.01" required value={item.unitPrice} onChange={(event) => setItemValue(index, 'unitPrice', event.target.value)} /></label>
                  <strong className="billing-line-total">{money(Number(item.quantity || 0) * Number(item.unitPrice || 0))}</strong>
                  {items.length > 1 && <button type="button" className="text-button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>}
                </div>
              ))}
              {!isRoomRent && <button type="button" className="secondary billing-add-item" onClick={() => setItems((current) => [...current, emptyItem(mode)])}><Plus size={15} /> Add bill item</button>}
              <div className="billing-form-fields">
                <label>Bill date<input type="date" required value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} /></label>
                <label>Discount<input type="number" min="0" step="0.01" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>
                <label>Paid now<input type="number" min="0" step="0.01" value={paid} onChange={(event) => setPaid(event.target.value)} /></label>
                <label>Payment mode<select value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}>{paymentModes.map((value) => <option key={value}>{value}</option>)}</select></label>
                <div className="billing-total">Total <strong>{money(total)}</strong></div>
              </div>
              <button className="primary" disabled={saving || !patient}><Save size={16} /> {saving ? 'Saving bill...' : 'Add bill and print'}</button>
            </form>
          )}
        </section>
      )}

      {isSummary && (
        <section className="panel table-panel billing-table-panel">
          <table><thead><tr><th>Bill / patient</th><th>Items</th><th>Total / paid / due</th><th>Bill date</th><th>Actions</th></tr></thead>
            <tbody>{invoices.map((invoice) => <tr key={invoice.id}>
              <td><strong>{invoice.invoiceNumber}</strong><small>{patientName(invoice.patient)} · {invoice.patient.patientNumber}</small></td>
              <td>{invoice.items.map((item) => `${item.description} × ${item.quantity}`).join(', ')}</td>
              <td>{money(invoice.total)}<small>Paid {money(invoice.paid)} · Due {money(invoice.total - invoice.paid)}</small></td>
              <td><input aria-label={`Bill date for ${invoice.invoiceNumber}`} type="date" value={dateValue(invoice.invoiceDate || invoice.createdAt)} onChange={(event) => adjustDate(invoice, event.target.value)} /></td>
              <td><button className="secondary" onClick={() => setPrintInvoice(invoice)}><Printer size={15} /> Print</button></td>
            </tr>)}{!invoices.length && <tr><td colSpan="5" className="empty">No {invoiceType} bills found.</td></tr>}</tbody>
          </table>
        </section>
      )}

      {(isAdvance || mode === 'ipBills') && <AdvancePaymentsTable payments={advancePayments} />}
      {printInvoice && <div className="print-documents"><BillPrint invoice={printInvoice} /></div>}
    </div>
  );
}

function PatientPicker({ searchText, onSearchText, patients, onSearch, onChoose, patient }) {
  return (
    <div className="patient-picker">
      <form className="patient-search" onSubmit={onSearch}>
        <label>Find patient by name, patient number, or mobile
          <span className="patient-search-input"><input required value={searchText} onChange={(event) => onSearchText(event.target.value)} placeholder="Search patient records" /><button className="secondary" aria-label="Search patients"><Search size={16} /> Search</button></span>
        </label>
      </form>
      {patients.length > 0 && <div className="patient-results">{patients.map((item) => <button type="button" key={item.id} onClick={() => onChoose(item)}><strong>{patientName(item)}</strong><span>{item.patientNumber} · {item.mobile}</span></button>)}</div>}
      {patient && <div className="selected-patient"><strong>Selected: {patientName(patient)}</strong><span>{patient.patientNumber} · {patient.mobile}</span><button className="text-button" type="button" onClick={() => { onChoose(null); onSearchText(''); }}>Change patient</button></div>}
    </div>
  );
}

function AdmissionPicker({ admissions, admissionId, onChange, required }) {
  return <label className="admission-picker">Active inpatient admission{required ? ' *' : ''}
    <select required={required} value={admissionId} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select admission{required ? '' : ' (optional)'}</option>
      {admissions.map((item) => <option key={item.id} value={item.id}>IP-{item.id} · {item.bed.room.ward.name}, room {item.bed.room.number}, bed {item.bed.number}</option>)}
    </select>
    {required && admissions.length === 0 && <small>No active admissions are available for this patient.</small>}
  </label>;
}

function AdvancePaymentsTable({ payments }) {
  return <section className="panel table-panel billing-table-panel advance-list"><div className="section-heading"><div><p className="eyebrow">IP COLLECTIONS</p><h2>Advance payments</h2></div></div>
    <table><thead><tr><th>Patient</th><th>Admission</th><th>Amount</th><th>Mode / reference</th><th>Received</th></tr></thead><tbody>
      {payments.map((item) => <tr key={item.id}><td><strong>{patientName(item.patient)}</strong><small>{item.patient.patientNumber}</small></td><td>{item.admissionId ? `IP-${item.admissionId}` : 'Not linked'}</td><td>{money(item.amount)}</td><td>{item.mode}<small>{item.reference || '—'}</small></td><td>{new Date(item.createdAt).toLocaleString()}</td></tr>)}
      {!payments.length && <tr><td colSpan="5" className="empty">No inpatient advance payments found.</td></tr>}
    </tbody></table>
  </section>;
}

export function BillPrint({ invoice }) {
  return <section className="print-page">
    <header className="print-heading"><div><strong>CareDesk HMS</strong><span>Hospital billing</span></div><h1>{invoice.invoiceType} BILL</h1></header>
    <div className="print-meta"><span><strong>Bill number</strong>{invoice.invoiceNumber}</span><span><strong>Bill date</strong>{new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString()}</span></div>
    <div className="print-patient"><strong>Patient</strong><span>{patientName(invoice.patient)}</span><span>{invoice.patient.patientNumber}</span><span>{invoice.patient.mobile}</span></div>
    <table className="print-items"><thead><tr><th>Description</th><th>Quantity</th><th>Rate</th><th>Amount</th></tr></thead><tbody>
      {invoice.items.map((item) => <tr key={item.id || item.description}><td>{item.description}</td><td>{item.quantity}</td><td>{money(item.unitPrice)}</td><td>{money(item.quantity * item.unitPrice)}</td></tr>)}
    </tbody></table>
    <div className="print-totals"><span>Subtotal <strong>{money(invoice.subtotal)}</strong></span>{Number(invoice.discount) > 0 && <span>Discount <strong>-{money(invoice.discount)}</strong></span>}<span className="print-grand-total">Total <strong>{money(invoice.total)}</strong></span><span>Paid <strong>{money(invoice.paid)}</strong></span><span>Balance due <strong>{money(invoice.total - invoice.paid)}</strong></span></div>
    <footer className="print-footer">Thank you. Please retain this bill for your records.</footer>
  </section>;
}
