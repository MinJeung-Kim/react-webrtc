import React from "react";

interface ModalProps {
  text: string;
  setText: (text: string) => void;
}

const Modal: React.FC<ModalProps> = ({ text, setText }) => {
  const handleClose = () => {
    setText("");
  };

  return (
    <div style={{ display: text ? "block" : "none" }}>
      <div>{text}</div>
      <button onClick={handleClose}>Close</button>
    </div>
  );
};

export default Modal;
