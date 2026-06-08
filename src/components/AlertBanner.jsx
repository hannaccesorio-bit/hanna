import React from 'react';
import './AlertBanner.css';

export default function AlertBanner({ message }) {
  return (
    <div className="alert-banner">
      <span>{message}</span>
    </div>
  );
}
