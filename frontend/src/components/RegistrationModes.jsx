import { useState } from 'react';
import AdmissionConversion from './AdmissionConversion';
import OpRegistrationForm from './OpRegistrationForm';
import PatientRegistration from './PatientRegistration';
import OpRegistrationPrint from './OpRegistrationPrint';
import './RegistrationModes.css';

export default function RegistrationModes() {
  const [mode, setMode] = useState('OP');
  return <><OpRegistrationPrint /><div className="registration-workflow"><div className="registration-mode-switch"><strong>Registration type</strong><label><input type="radio" checked={mode === 'OP'} onChange={() => setMode('OP')} /> OP Form</label><label><input type="radio" checked={mode === 'OUTPATIENT'} onChange={() => setMode('OUTPATIENT')} /> Outpatient Form</label><label><input type="radio" checked={mode === 'INPATIENT'} onChange={() => setMode('INPATIENT')} /> Inpatient Form</label></div>{mode === 'OP' && <OpRegistrationForm />}{mode === 'OUTPATIENT' && <PatientRegistration />}{mode === 'INPATIENT' && <AdmissionConversion onBack={() => setMode('OP')} />}</div></>;
}
