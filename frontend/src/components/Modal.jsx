import "./Modal.css";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-sheet__handle" />
        {children}
      </div>
    </div>
  );
}
