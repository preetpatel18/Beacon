import React from 'react';
import { FaPhone } from 'react-icons/fa';

function EmergencyButton({ status }) {
  const handleCall = () => {
    if (status === 'MILD' || status === 'RISK') {
      window.location.href = 'tel:7325008196';
    }
  };

  return (
    <button className="emergency-button" onClick={handleCall} disabled={status === 'SAFE'}>
      <FaPhone /> Call Emergency Services
    </button>
  );
}

export default EmergencyButton;