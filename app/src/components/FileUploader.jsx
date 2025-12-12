import React, { useRef, useState } from "react";

export default function FileUploader() {
  const [files, setFiles] = useState([]);
  const inputRef = useRef();

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  const handleFiles = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) =>
      allowedTypes.includes(file.type)
    );
    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "550px",
        margin: "auto",
        padding: "20px",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.4)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      {/* Upload Area */}
      <div
        onClick={() => inputRef.current.click()}
        style={{
          border: "2px dashed rgba(0,0,0,0.25)",
          padding: "40px 20px",
          borderRadius: "16px",
          textAlign: "center",
          cursor: "pointer",
          transition: "0.25s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "#3b82f6")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "rgba(0,0,0,0.25)")
        }
      >
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
          Click or Drop Files Here
        </div>
        <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>
          Supports Images, PDF, Excel (Multiple Allowed)
        </div>
      </div>

      <input
        type="file"
        ref={inputRef}
        multiple
        accept=".png,.jpg,.jpeg,.pdf,.xls,.xlsx"
        style={{ display: "none" }}
        onChange={handleFiles}
      />

      {/* File List */}
      <div style={{ marginTop: "20px" }}>
        {files.map((file, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: "12px",
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.8)",
              boxShadow: "0 5px 14px rgba(0,0,0,0.06)",
              marginBottom: "12px",
              alignItems: "center",
            }}
          >
            {/* Preview */}
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt=""
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "10px",
                  background: "#e2e8f0",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: 700,
                  color: "#475569",
                  fontSize: "13px",
                }}
              >
                {file.type.includes("pdf")
                  ? "PDF"
                  : file.type.includes("spreadsheet")
                  ? "XLSX"
                  : "FILE"}
              </div>
            )}

            {/* File Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#0f172a",
                }}
              >
                {file.name}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                {(file.size / 1024).toFixed(1)} KB
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeFile(index)}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                transition: "0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#dc2626")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#ef4444")
              }
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
