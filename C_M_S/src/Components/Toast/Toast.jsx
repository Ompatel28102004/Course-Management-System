// Toast.js
import React, { useState, useEffect } from 'react';
import './Toast.css'; 

const Toast = ({ message, duration = 5000 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message) {
      setShow(true); // Show the toast when there's a new message
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  return (
    show && (
      <div className="toast-notification">
        {message}
      </div>
    )
  );
};

export default Toast;
