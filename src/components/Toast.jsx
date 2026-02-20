import React, { useState, useEffect } from 'react';
import './toast.css';

let toastTimeout;
let setToastGlobal;

export const showToast = (message, type = 'success') => {
  if (setToastGlobal) {
    setToastGlobal({ message, type, visible: true });
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      setToastGlobal(prev => ({ ...prev, visible: false }));
    }, 4000);
  }
};

const Toast = () => {
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  useEffect(() => {
    setToastGlobal = setToast;
    return () => {
      setToastGlobal = null;
    };
  }, []);

  if (!toast.visible) return null;

  return (
    <div className={`custom-toast ${toast.type} ${toast.visible ? 'show' : ''}`}>
      <div className="toast-icon">
        {toast.type === 'success' ? '✓' : '⚠'}
      </div>
      <div className="toast-content">
        {toast.message}
      </div>
      <button className="toast-close" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>
        ×
      </button>
      <div className="toast-progress"></div>
    </div>
  );
};

export default Toast;
