import { useEffect, useState } from 'react';
import { BillPrint } from './Billing';

const fullName = (patient) => `${patient?.title ? `${patient.title} ` : ''}${patient?.firstName || ''} ${patient?.lastName || ''}`.trim();

export default function OpRegistrationPrint() {
  const [record, setRecord] = useState(null);

  useEffect(() => {
    const receive = (event) => setRecord(event.detail);
    window.addEventListener('hms:op-registration-complete', receive);
    return () => window.removeEventListener('hms:op-registration-complete', receive);
  }, []);

  useEffect(() => {
    if (!record) return undefined;
    const timer = window.setTimeout(() => window.print(), 300);
    const finish = () => setRecord(null);
    window.addEventListener('afterprint', finish);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('afterprint', finish);
    };
  }, [record]);

  if (!record) return null;
  const { patient, visit, invoice, doctorName } = record;
  return <div className="print-documents op-registration-print">
    <section className="print-page">
      <header className="print-heading"><div><strong>CareDesk HMS</strong><span>Outpatient department</span></div><h1>OP REGISTRATION</h1></header>
      <div className="print-meta"><span><strong>Patient number</strong>{patient.patientNumber}</span><span><strong>Registration date</strong>{new Date(visit.createdAt).toLocaleDateString()}</span></div>
      <div className="print-patient">
        <strong>Patient information</strong><span>{fullName(patient)}</span><span>Mobile: {patient.mobile}</span><span>Gender: {patient.gender}{patient.age ? ` · Age: ${patient.age}` : ''}</span>
        {patient.address && <span>Address: {[patient.address, patient.locality, patient.city, patient.state, patient.pinCode].filter(Boolean).join(', ')}</span>}
      </div>
      <div className="print-patient op-visit-details">
        <strong>Visit details</strong><span>Visit type: {visit.visitType}</span><span>Doctor: {doctorName || 'Not assigned'}</span>
        {visit.appointmentDate && <span>Appointment: {new Date(visit.appointmentDate).toLocaleDateString()}{visit.appointmentTime ? ` at ${visit.appointmentTime}` : ''}</span>}
        {visit.symptoms && <span>Symptoms: {visit.symptoms}</span>}
      </div>
      <footer className="print-footer">Please bring this registration slip for your next visit.</footer>
    </section>
    <BillPrint invoice={invoice} />
  </div>;
}
