import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { casesAPI, documentsAPI, notesAPI, speechesAPI } from "../lib/api.js";
import { useAuth } from "../hooks/useAuth.jsx";
import Navbar from "../components/Navbar";

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [speeches, setSpeeches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("evidence");

  // Evidence upload
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedEvidenceType, setSelectedEvidenceType] = useState("image");
  const [analyzingId, setAnalyzingId] = useState(null);

  // Note form
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [editingNote, setEditingNote] = useState(null);

  // Speech form
  const [speechForm, setSpeechForm] = useState({
    title: "",
    content: "",
    speech_type: "",
  });
  const [editingSpeech, setEditingSpeech] = useState(null);

  useEffect(() => {
    loadCaseData();
  }, [id]);

  const loadCaseData = async () => {
    try {
      setLoading(true);

      // Load case details
      const caseResponse = await casesAPI.getCase(id);
      if (caseResponse.success) setCaseData(caseResponse.data);

      // Load documents
      const docsResponse = await documentsAPI.getDocuments(id);
      if (docsResponse.success) setDocuments(docsResponse.data);

      // Load notes
      const notesResponse = await notesAPI.getNotes(id);
      if (notesResponse.success) setNotes(notesResponse.data);

      // Load speeches
      const speechesResponse = await speechesAPI.getSpeeches(id);
      if (speechesResponse.success) setSpeeches(speechesResponse.data);
    } catch (error) {
      console.error("Error loading case data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Evidence Upload Handler
  const handleFileUpload = async (e, evidenceType) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const response = await documentsAPI.uploadDocument(
          id,
          file,
          evidenceType
        );
        if (response.success) {
          setDocuments([response.data, ...documents]);
        }
      }
      alert(
        `${
          evidenceType.charAt(0).toUpperCase() + evidenceType.slice(1)
        } evidence uploaded successfully!`
      );
    } catch (error) {
      console.error("Error uploading evidence:", error);
      alert(error.response?.data?.message || "Error uploading file");
    } finally {
      setUploading(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm("Are you sure you want to delete this evidence?")) return;

    try {
      await documentsAPI.deleteDocument(docId);
      setDocuments(documents.filter((d) => d._id !== docId));
    } catch (error) {
      console.error("Error deleting evidence:", error);
      alert("Error deleting evidence");
    }
  };

  const handleAnalyzeEvidence = async (docId) => {
    try {
      setAnalyzingId(docId);
      const response = await documentsAPI.analyzeEvidence(docId);
      if (response.success) {
        // Update the document in state
        setDocuments(
          documents.map((d) => (d._id === docId ? response.data : d))
        );
        alert("Evidence analysis initiated!");
      }
    } catch (error) {
      console.error("Error analyzing evidence:", error);
      alert(error.response?.data?.message || "Error analyzing evidence");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleViewDocument = (fileUrl) => {
    const fullUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") + fileUrl ||
      "http://localhost:5000" + fileUrl;
    window.open(fullUrl, "_blank");
  };

  // Note Handlers
  const handleSaveNote = async () => {
    if (!noteForm.content.trim()) return;

    try {
      if (editingNote) {
        const response = await notesAPI.updateNote(editingNote._id, noteForm);
        if (response.success) {
          setNotes(
            notes.map((n) => (n._id === response.data._id ? response.data : n))
          );
          setEditingNote(null);
        }
      } else {
        const response = await notesAPI.createNote({
          case_id: id,
          ...noteForm,
        });
        if (response.success) {
          setNotes([response.data, ...notes]);
        }
      }
      setNoteForm({ title: "", content: "" });
    } catch (error) {
      console.error("Error saving note:", error);
      alert(error.response?.data?.message || "Error saving note");
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteForm({ title: note.title || "", content: note.content });
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await notesAPI.deleteNote(noteId);
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note");
    }
  };

  // Speech Handlers
  const handleSaveSpeech = async () => {
    if (!speechForm.content.trim() || !speechForm.title.trim()) return;

    try {
      if (editingSpeech) {
        const response = await speechesAPI.updateSpeech(
          editingSpeech._id,
          speechForm
        );
        if (response.success) {
          setSpeeches(
            speeches.map((s) =>
              s._id === response.data._id ? response.data : s
            )
          );
          setEditingSpeech(null);
        }
      } else {
        const response = await speechesAPI.createSpeech({
          case_id: id,
          ...speechForm,
        });
        if (response.success) {
          setSpeeches([response.data, ...speeches]);
        }
      }
      setSpeechForm({ title: "", content: "", speech_type: "" });
    } catch (error) {
      console.error("Error saving speech:", error);
      alert(error.response?.data?.message || "Error saving speech");
    }
  };

  const handleEditSpeech = (speech) => {
    setEditingSpeech(speech);
    setSpeechForm({
      title: speech.title,
      content: speech.content,
      speech_type: speech.speech_type || "",
    });
  };

  const handleDeleteSpeech = async (speechId) => {
    if (!confirm("Are you sure you want to delete this speech?")) return;

    await db.deleteSpeech(speechId);
    setSpeeches(speeches.filter((s) => s.id !== speechId));
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
        <Navbar />
        <div
          className="flex items-center justify-center"
          style={{ padding: "4rem" }}
        >
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
        <Navbar />
        <div className="container" style={{ paddingTop: "2rem" }}>
          <div className="card text-center" style={{ padding: "4rem" }}>
            <h2>Case not found</h2>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn btn-primary mt-4"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
      <Navbar />

      <div
        className="container"
        style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
      >
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary btn-sm mb-4"
          >
            <i className="bi bi-arrow-left"></i> Back to Dashboard
          </button>

          <div className="card">
            <div className="flex items-start justify-between gap-lg">
              <div style={{ flex: 1 }}>
                <div className="flex items-center gap-md mb-3">
                  <span className="badge badge-primary">
                    {caseData.case_number}
                  </span>
                  <span
                    className={`badge ${
                      caseData.status === "active"
                        ? "badge-success"
                        : caseData.status === "pending"
                        ? "badge-warning"
                        : "badge-danger"
                    }`}
                  >
                    {caseData.status}
                  </span>
                  {caseData.case_type && (
                    <span
                      className="badge"
                      style={{
                        background: "var(--accent-100)",
                        color: "var(--accent-700)",
                      }}
                    >
                      {caseData.case_type}
                    </span>
                  )}
                </div>

                <h1 style={{ marginBottom: "1rem" }}>{caseData.title}</h1>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Client Name
                    </p>
                    <p style={{ fontWeight: 600, margin: 0 }}>
                      <i className="bi bi-person"></i> {caseData.client_name}
                    </p>
                  </div>

                  {caseData.client_contact && (
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Client Contact
                      </p>
                      <p style={{ fontWeight: 600, margin: 0 }}>
                        <i className="bi bi-telephone"></i>{" "}
                        {caseData.client_contact}
                      </p>
                    </div>
                  )}

                  {caseData.court_name && (
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Court
                      </p>
                      <p style={{ fontWeight: 600, margin: 0 }}>
                        <i className="bi bi-building"></i> {caseData.court_name}
                      </p>
                    </div>
                  )}

                  {caseData.next_hearing_date && (
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Next Hearing
                      </p>
                      <p style={{ fontWeight: 600, margin: 0 }}>
                        <i className="bi bi-calendar-event"></i>{" "}
                        {new Date(caseData.next_hearing_date).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {caseData.description && (
                  <div
                    className="mt-4"
                    style={{
                      padding: "1rem",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Description
                    </p>
                    <p style={{ margin: 0 }}>{caseData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card mb-4" style={{ padding: "0" }}>
          <div
            style={{
              display: "flex",
              borderBottom: "2px solid var(--border-light)",
              overflowX: "auto",
            }}
          >
            {[
              { id: "evidence", label: "Evidence", icon: "bi-folder-check" },
              { id: "notes", label: "Notes", icon: "bi-journal-text" },
              { id: "speeches", label: "Speeches", icon: "bi-megaphone" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: "1 1 auto",
                  padding: "1rem 1.5rem",
                  border: "none",
                  background:
                    activeTab === tab.id ? "var(--primary-50)" : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--primary-700)"
                      : "var(--text-secondary)",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  borderBottom:
                    activeTab === tab.id
                      ? "2px solid var(--primary-600)"
                      : "none",
                  marginBottom: "-2px",
                  cursor: "pointer",
                  transition: "all var(--transition-base)",
                  fontFamily: "inherit",
                  fontSize: "1rem",
                }}
              >
                <i className={`bi ${tab.icon}`}></i> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "evidence" && (
          <div>
            <div className="card mb-4">
              <h3 className="mb-4">
                <i className="bi bi-cloud-upload"></i> Upload Evidence
              </h3>

              {/* Evidence Type Selector */}
              <div className="mb-4">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Select Evidence Type
                </label>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  {[
                    {
                      id: "image",
                      label: "Image",
                      icon: "bi-camera",
                      color: "#3b82f6",
                    },
                    {
                      id: "voice",
                      label: "Voice/Audio",
                      icon: "bi-mic",
                      color: "#8b5cf6",
                    },
                    {
                      id: "video",
                      label: "Video",
                      icon: "bi-camera-video",
                      color: "#ef4444",
                    },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedEvidenceType(type.id)}
                      style={{
                        flex: "1 1 150px",
                        padding: "1rem",
                        border:
                          selectedEvidenceType === type.id
                            ? `2px solid ${type.color}`
                            : "2px solid var(--border-light)",
                        borderRadius: "var(--radius-md)",
                        background:
                          selectedEvidenceType === type.id
                            ? `${type.color}15`
                            : "transparent",
                        cursor: "pointer",
                        transition: "all var(--transition-base)",
                        fontFamily: "inherit",
                      }}
                    >
                      <i
                        className={`bi ${type.icon}`}
                        style={{
                          fontSize: "2rem",
                          color: type.color,
                          display: "block",
                          marginBottom: "0.5rem",
                        }}
                      ></i>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Area */}
              <div
                style={{
                  border: "2px dashed var(--border-medium)",
                  borderRadius: "var(--radius-lg)",
                  padding: "2rem",
                  textAlign: "center",
                  background: "var(--bg-secondary)",
                }}
              >
                <i
                  className={`bi ${
                    selectedEvidenceType === "image"
                      ? "bi-image"
                      : selectedEvidenceType === "voice"
                      ? "bi-mic-fill"
                      : "bi-camera-video-fill"
                  }`}
                  style={{
                    fontSize: "3rem",
                    color: "var(--primary-600)",
                    marginBottom: "1rem",
                  }}
                ></i>
                <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
                  Upload{" "}
                  {selectedEvidenceType === "image"
                    ? "Image"
                    : selectedEvidenceType === "voice"
                    ? "Voice/Audio"
                    : "Video"}{" "}
                  Evidence
                </p>
                <p
                  style={{
                    marginBottom: "1rem",
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {selectedEvidenceType === "image" &&
                    "Accepted: JPG, PNG, GIF, WEBP, HEIC (Max 10MB)"}
                  {selectedEvidenceType === "voice" &&
                    "Accepted: MP3, WAV, M4A, OGG, AAC, FLAC (Max 50MB)"}
                  {selectedEvidenceType === "video" &&
                    "Accepted: MP4, MOV, AVI, MKV, WEBM (Max 200MB)"}
                </p>
                <input
                  type="file"
                  id={`file-upload-${selectedEvidenceType}`}
                  multiple
                  accept={
                    selectedEvidenceType === "image"
                      ? "image/*"
                      : selectedEvidenceType === "voice"
                      ? "audio/*"
                      : "video/*"
                  }
                  onChange={(e) => handleFileUpload(e, selectedEvidenceType)}
                  style={{ display: "none" }}
                  disabled={uploading}
                />
                <label
                  htmlFor={`file-upload-${selectedEvidenceType}`}
                  className="btn btn-primary"
                >
                  {uploading ? (
                    <>
                      <div
                        className="spinner"
                        style={{
                          width: "20px",
                          height: "20px",
                          borderWidth: "2px",
                        }}
                      ></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-upload"></i>
                      Choose{" "}
                      {selectedEvidenceType === "image"
                        ? "Images"
                        : selectedEvidenceType === "voice"
                        ? "Audio Files"
                        : "Videos"}
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Evidence List */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "1rem",
              }}
            >
              {documents.map((doc) => (
                <div key={doc._id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "var(--radius-md)",
                        background:
                          doc.evidence_type === "image"
                            ? "#dbeafe"
                            : doc.evidence_type === "voice"
                            ? "#ede9fe"
                            : "#fee2e2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className={`bi ${
                          doc.evidence_type === "image"
                            ? "bi-image-fill"
                            : doc.evidence_type === "video"
                            ? "bi-camera-video-fill"
                            : "bi-mic-fill"
                        }`}
                        style={{
                          fontSize: "1.5rem",
                          color:
                            doc.evidence_type === "image"
                              ? "#3b82f6"
                              : doc.evidence_type === "voice"
                              ? "#8b5cf6"
                              : "#ef4444",
                        }}
                      ></i>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc._id)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: "0.25rem 0.5rem" }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  <div
                    className="mb-2"
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    <span
                      className="badge"
                      style={{
                        background:
                          doc.evidence_type === "image"
                            ? "#3b82f6"
                            : doc.evidence_type === "voice"
                            ? "#8b5cf6"
                            : "#ef4444",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      {doc.evidence_type.toUpperCase()}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background:
                          doc.analysis_status === "uploaded"
                            ? "#fbbf24"
                            : doc.analysis_status === "metadata_extracted"
                            ? "#10b981"
                            : "#3b82f6",
                        color: "white",
                        fontSize: "0.7rem",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      {doc.analysis_status === "uploaded" && "📤 Uploaded"}
                      {doc.analysis_status === "metadata_extracted" &&
                        "✓ Metadata Extracted"}
                      {doc.analysis_status === "analyzed" && "🤖 AI Analyzed"}
                    </span>
                  </div>

                  <p
                    style={{
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      wordBreak: "break-word",
                    }}
                  >
                    {doc.file_name}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.75rem",
                    }}
                  >
                    {(doc.file_size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>

                  {/* Hash Display */}
                  {doc.file_hash && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.25rem",
                          fontWeight: 600,
                        }}
                      >
                        SHA-256 Hash:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.25rem",
                          alignItems: "center",
                        }}
                      >
                        <code
                          style={{
                            fontSize: "0.65rem",
                            background: "var(--bg-secondary)",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "var(--radius-sm)",
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {doc.file_hash.substring(0, 16)}...
                        </code>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(doc.file_hash)
                          }
                          className="btn btn-secondary btn-sm"
                          style={{
                            padding: "0.15rem 0.35rem",
                            fontSize: "0.7rem",
                          }}
                          title="Copy full hash"
                        >
                          <i className="bi bi-clipboard"></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Metadata Summary */}
                  {doc.metadataSummary &&
                    Object.keys(doc.metadataSummary).length > 0 && (
                      <div
                        style={{
                          background: "var(--bg-secondary)",
                          padding: "0.75rem",
                          borderRadius: "var(--radius-md)",
                          marginBottom: "0.75rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          <i className="bi bi-info-circle"></i> Metadata
                        </div>
                        {doc.metadataSummary.camera && (
                          <div style={{ marginBottom: "0.25rem" }}>
                            <strong>Camera:</strong>{" "}
                            {doc.metadataSummary.camera}
                          </div>
                        )}
                        {doc.metadataSummary.dateTaken && (
                          <div style={{ marginBottom: "0.25rem" }}>
                            <strong>Date Taken:</strong>{" "}
                            {new Date(
                              doc.metadataSummary.dateTaken
                            ).toLocaleString()}
                          </div>
                        )}
                        {doc.metadataSummary.software && (
                          <div style={{ marginBottom: "0.25rem" }}>
                            <strong>Software:</strong>{" "}
                            {doc.metadataSummary.software}
                          </div>
                        )}
                        {doc.metadataSummary.location && (
                          <div>
                            <strong>GPS:</strong>{" "}
                            {doc.metadataSummary.location.latitude.toFixed(6)},{" "}
                            {doc.metadataSummary.location.longitude.toFixed(6)}
                          </div>
                        )}
                      </div>
                    )}

                  {/* Flags */}
                  {doc.flags && doc.flags.length > 0 && (
                    <div style={{ marginBottom: "0.75rem" }}>
                      {doc.flags.map((flag, idx) => (
                        <div
                          key={idx}
                          style={{
                            background:
                              flag.type === "warning" ? "#fef3c7" : "#dbeafe",
                            color:
                              flag.type === "warning" ? "#92400e" : "#1e40af",
                            padding: "0.5rem",
                            borderRadius: "var(--radius-sm)",
                            fontSize: "0.7rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          <i className="bi bi-exclamation-triangle"></i>{" "}
                          {flag.message}
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      flexDirection: "column",
                    }}
                  >
                    <button
                      onClick={() => handleViewDocument(doc.file_url)}
                      className="btn btn-secondary btn-sm"
                      style={{ width: "100%" }}
                    >
                      <i className="bi bi-eye"></i> View
                    </button>
                    {doc.analysis_status !== "analyzed" && (
                      <button
                        onClick={() => handleAnalyzeEvidence(doc._id)}
                        className="btn btn-primary btn-sm"
                        style={{ width: "100%" }}
                        disabled={analyzingId === doc._id}
                      >
                        {analyzingId === doc._id ? (
                          <>
                            <div
                              className="spinner"
                              style={{
                                width: "12px",
                                height: "12px",
                                borderWidth: "2px",
                              }}
                            ></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-stars"></i> Analyse Evidence
                            with AI
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {documents.length === 0 && (
              <div className="card text-center" style={{ padding: "3rem" }}>
                <i
                  className="bi bi-folder-x"
                  style={{
                    fontSize: "3rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "1rem",
                  }}
                ></i>
                <p style={{ color: "var(--text-secondary)" }}>
                  No evidence uploaded yet
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            {/* Note Editor */}
            <div className="card mb-4">
              <h3 className="mb-4">
                <i className="bi bi-pencil-square"></i>{" "}
                {editingNote ? "Edit Note" : "Create New Note"}
              </h3>

              <div className="form-group">
                <label className="form-label">Title (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Note title..."
                  value={noteForm.title}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, title: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write your notes here..."
                  value={noteForm.content}
                  onChange={(e) =>
                    setNoteForm({ ...noteForm, content: e.target.value })
                  }
                  style={{ minHeight: "200px" }}
                />
              </div>

              <div className="flex gap-md">
                <button onClick={handleSaveNote} className="btn btn-primary">
                  <i className="bi bi-check-circle"></i>
                  {editingNote ? "Update Note" : "Save Note"}
                </button>
                {editingNote && (
                  <button
                    onClick={() => {
                      setEditingNote(null);
                      setNoteForm({ title: "", content: "" });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Notes List */}
            <div style={{ display: "grid", gap: "1rem" }}>
              {notes.map((note) => (
                <div key={note.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div style={{ flex: 1 }}>
                      {note.title && (
                        <h4 style={{ marginBottom: "0.5rem" }}>{note.title}</h4>
                      )}
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {new Date(note.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-sm">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {note.content}
                  </p>
                </div>
              ))}
            </div>

            {notes.length === 0 && (
              <div className="card text-center" style={{ padding: "3rem" }}>
                <i
                  className="bi bi-journal"
                  style={{
                    fontSize: "3rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "1rem",
                  }}
                ></i>
                <p style={{ color: "var(--text-secondary)" }}>
                  No notes created yet
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "speeches" && (
          <div>
            {/* Speech Editor */}
            <div className="card mb-4">
              <h3 className="mb-4">
                <i className="bi bi-megaphone"></i>{" "}
                {editingSpeech ? "Edit Speech" : "Create New Speech"}
              </h3>

              <div className="flex gap-md" style={{ marginBottom: "1rem" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Speech title..."
                    value={speechForm.title}
                    onChange={(e) =>
                      setSpeechForm({ ...speechForm, title: e.target.value })
                    }
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={speechForm.speech_type}
                    onChange={(e) =>
                      setSpeechForm({
                        ...speechForm,
                        speech_type: e.target.value,
                      })
                    }
                  >
                    <option value="">Select type</option>
                    <option value="opening">Opening Statement</option>
                    <option value="closing">Closing Argument</option>
                    <option value="examination">Examination</option>
                    <option value="argument">Legal Argument</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Write your speech here..."
                  value={speechForm.content}
                  onChange={(e) =>
                    setSpeechForm({ ...speechForm, content: e.target.value })
                  }
                  style={{ minHeight: "300px" }}
                />
              </div>

              <div className="flex gap-md">
                <button onClick={handleSaveSpeech} className="btn btn-primary">
                  <i className="bi bi-check-circle"></i>
                  {editingSpeech ? "Update Speech" : "Save Speech"}
                </button>
                {editingSpeech && (
                  <button
                    onClick={() => {
                      setEditingSpeech(null);
                      setSpeechForm({
                        title: "",
                        content: "",
                        speech_type: "",
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Speeches List */}
            <div style={{ display: "grid", gap: "1rem" }}>
              {speeches.map((speech) => (
                <div key={speech.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div style={{ flex: 1 }}>
                      <div className="flex items-center gap-md mb-2">
                        <h4 style={{ margin: 0 }}>{speech.title}</h4>
                        {speech.speech_type && (
                          <span className="badge badge-primary">
                            {speech.speech_type}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {new Date(speech.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-sm">
                      <button
                        onClick={() => handleEditSpeech(speech)}
                        className="btn btn-secondary btn-sm"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteSpeech(speech.id)}
                        className="btn btn-danger btn-sm"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>
                    {speech.content}
                  </p>
                </div>
              ))}
            </div>

            {speeches.length === 0 && (
              <div className="card text-center" style={{ padding: "3rem" }}>
                <i
                  className="bi bi-megaphone"
                  style={{
                    fontSize: "3rem",
                    color: "var(--text-tertiary)",
                    marginBottom: "1rem",
                  }}
                ></i>
                <p style={{ color: "var(--text-secondary)" }}>
                  No speeches created yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
