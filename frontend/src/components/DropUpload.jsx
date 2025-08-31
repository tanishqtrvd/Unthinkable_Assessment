import { useRef, useState } from "react";

export default function DropUpload({
  label = "Upload",
  accept = "",
  maxSizeMB = 15,
  onFileSelected, // (file) => Promise<void> or void
}) {
  const inputRef = useRef(null);
  const [isOver, setIsOver] = useState(false);
  const [error, setError] = useState("");

  const openPicker = () => inputRef.current?.click();

  const validate = (file) => {
    setError("");
    if (!file) return false;
    if (accept) {
      const allow = accept.split(",").map(s => s.trim().toLowerCase());
      const nameOk = allow.some(a => a.startsWith(".") && file.name.toLowerCase().endsWith(a));
      const mimeOk = allow.some(a => !a.startsWith(".") && file.type.toLowerCase().includes(a.replace("*","")));
      if (!(nameOk || mimeOk)) {
        setError(`Invalid file type. Allowed: ${accept}`);
        return false;
      }
    }
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File too large. Max ${maxSizeMB} MB.`);
      return false;
    }
    return true;
  };

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!validate(file)) return;
    await onFileSelected?.(file);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setIsOver(false);
    await handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="uploader">
      <div
        className={`dropzone ${isOver ? "over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={onDrop}
        onClick={openPicker}
        role="button"
        tabIndex={0}
      >
        <div className="dz-content">
          <div className="dz-title">{label}</div>
          <div className="dz-sub">Drag & drop here, or click to choose</div>
          {accept && <div className="dz-accept">Allowed: {accept}</div>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          hidden
        />
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
