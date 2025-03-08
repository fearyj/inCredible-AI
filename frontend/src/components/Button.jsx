import React from "react";

const Button = ({ name, isBeam = false, containerClass, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn ${containerClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isBeam && (
        <span className="relative flex h-3 w-3">
          <span className="btn-ping"></span>
          <span className="btn-ping_dot"></span>
        </span>
      )}
      {name}
    </button>
  );
};

export default Button;