import React from "react";

const Alert = ({ variant = "success", title, children }) => {
  const styles = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
  };

  return (
    <div className={`border-l-4 p-4 ${styles[variant]}`}>
      {title && <p className="font-bold mb-1">{title}</p>}
      <p>{children}</p>
    </div>
  );
};

export default Alert;
