import { useState, useRef, useCallback, useEffect } from "react";

const STEPS = ["upload", "pair", "generate"];
const STEP_LABELS = ["Upload", "Parear", "Gerar"];

function ImageCard({ src, label, selected, onClick, small, dimmed }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: small ? 100 : 140,
        height: small ? 100 : 140,
        borderRadius: 14,
        overflow: "hidden",
        border: selected ? "3px solid #E8A87C" : "3px solid transparent",
        boxShadow: selected
          ? "0 0 0 2px #E8A87C44, 0 8px 24px rgba(0,0,0,0.15)"
          : "0 4px 12px rgba(0,0,0,0.08)",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        transition: "all 0.2s ease",
        flexShrink: 0,
        background: "#1a1a2e",
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <img
        src={src}
        alt={label || ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {label && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 6px 5px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
            color: "#fff",
            fontSize: 10,
            fontFamily: "'DM Sans', sans-serif",
            textAlign: "center",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

function UploadZone({ title, subtitle, files, onAdd, onRemove, accent }) {
  const inputRef = useRef(null);

  return (
    <div style={{ flex: 1, minWidth: 280 }}>
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18,
          fontWeight: 600,
          color: accent,
          marginBottom: 8,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 12,
          color: "#8888a0",
          marginBottom: 16,
        }}
      >
        {subtitle}
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${accent}44`,
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          background: `${accent}08`,
          marginBottom: 16,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${accent}88`;
          e.currentTarget.style.background = `${accent}14`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${accent}44`;
          e.currentTarget.style.background = `${accent}08`;
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8, color: accent }}>+</div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: accent,
            fontWeight: 500,
          }}
        >
          Clique para adicionar
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            onAdd(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {files.map((f, i) => (
            <div key={i} style={{ position: "relative" }}>
              <ImageCard src={f.url} small />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(i);
                }}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PairCard({ pair, index, onRemove }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 16,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 11,
          color: "#666",
          width: 24,
          textAlign: "center",
        }}
      >
        #{index + 1}
      </div>
      <ImageCard src={pair.photo.url} small />
      <div style={{ fontSize: 20, color: "#E8A87C" }}>→</div>
      <ImageCard src={pair.inspo.url} small />
      <button
        onClick={onRemove}
        style={{
          marginLeft: "auto",
          background: "rgba(255,80,80,0.1)",
          border: "1px solid rgba(255,80,80,0.2)",
          color: "#ff5050",
          borderRadius: 10,
          padding: "6px 12px",
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
        }}
      >
        Remover
      </button>
    </div>
  );
}

function ResultCard({ pair, index, result }) {
  const status = result?.status || "waiting";
  const statusLabel = {
    waiting: "⏳ Na fila...",
    analyzing: "🔍 Analisando inspiração...",
    generating: "🎨 Gerando arte final...",
    done: "✓ Gerado",
    error: "✗ Erro",
  };
  const statusColor = {
    waiting: "#888",
    analyzing: "#E8A87C",
    generating: "#D4789C",
    done: "#6fcf97",
    error: "#ff5050",
  };

  return (
    <div
      style={{
        borderRadius: 20,
        overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#E8A87C",
            fontWeight: 600,
          }}
        >
          Par #{index + 1}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: statusColor[status],
            marginLeft: "auto",
            fontWeight: 500,
          }}
        >
          {statusLabel[status]}
        </span>
      </div>

      <div style={{ display: "flex", minHeight: 240 }}>
        {/* Source images */}
        <div
          style={{
            flex: "0 0 180px",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            alignItems: "center",
            borderRight: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ fontSize: 10, color: "#666", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
            FOTO
          </div>
          <img
            src={pair.photo.url}
            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10 }}
          />
          <div style={{ fontSize: 10, color: "#666", fontFamily: "'DM Sans', sans-serif", marginTop: 8, marginBottom: 4 }}>
            INSPIRAÇÃO
          </div>
          <img
            src={pair.inspo.url}
            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10 }}
          />
        </div>

        {/* Result area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            gap: 12,
          }}
        >
          {(status === "waiting" || status === "analyzing" || status === "generating") && (
            <>
              <div
                style={{
                  width: 36,
                  height: 36,
                  border: "3px solid #E8A87C22",
                  borderTopColor: "#E8A87C",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span style={{ fontSize: 12, color: "#666", fontFamily: "'DM Sans', sans-serif" }}>
                {status === "analyzing" && "Analisando estilo do cenário..."}
                {status === "generating" && "Gerando arte final com IA..."}
                {status === "waiting" && "Aguardando na fila..."}
              </span>
              {result?.analysis && (
                <div
                  style={{
                    marginTop: 8,
                    padding: "10px 14px",
                    background: "rgba(232,168,124,0.06)",
                    borderRadius: 10,
                    fontSize: 11,
                    color: "#aaa",
                    lineHeight: 1.5,
                    maxWidth: 400,
                    maxHeight: 120,
                    overflow: "auto",
                    fontFamily: "'DM Sans', sans-serif",
                    border: "1px solid rgba(232,168,124,0.1)",
                  }}
                >
                  {result.analysis}
                </div>
              )}
            </>
          )}

          {status === "done" && result?.imageUrl && (
            <div style={{ position: "relative" }}>
              <img
                src={result.imageUrl}
                style={{
                  maxWidth: 320,
                  maxHeight: 320,
                  borderRadius: 16,
                  boxShadow: "0 12px 40px rgba(232,168,124,0.2)",
                }}
              />
              <a
                href={result.imageUrl}
                download={`style-agent-${index + 1}.png`}
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  background: "rgba(0,0,0,0.7)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 10,
                  padding: "6px 14px",
                  fontSize: 11,
                  color: "#E8A87C",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                ↓ Download
              </a>
            </div>
          )}

          {status === "done" && !result?.imageUrl && result?.textResponse && (
            <div
              style={{
                padding: 16,
                background: "rgba(255,200,50,0.06)",
                borderRadius: 12,
                fontSize: 12,
                color: "#ccc",
                lineHeight: 1.6,
                maxWidth: 400,
                fontFamily: "'DM Sans', sans-serif",
                border: "1px solid rgba(255,200,50,0.1)",
              }}
            >
              <div style={{ color: "#E8A87C", fontWeight: 600, marginBottom: 6 }}>
                Resposta do GPT (sem imagem gerada):
              </div>
              {result.textResponse.substring(0, 500)}
            </div>
          )}

          {status === "error" && (
            <div
              style={{
                padding: 12,
                background: "rgba(255,80,80,0.08)",
                borderRadius: 10,
                fontSize: 12,
                color: "#ff8080",
                fontFamily: "'DM Sans', sans-serif",
                maxWidth: 400,
                border: "1px solid rgba(255,80,80,0.15)",
              }}
            >
              Erro: {result?.error || "Falha na geração"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Convert file to base64 data URL
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert data URL to blob for FormData
function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new Blob([array], { type: mime });
}

export default function App() {
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [inspos, setInspos] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedInspo, setSelectedInspo] = useState(null);
  const [results, setResults] = useState({});
  const [generating, setGenerating] = useState(false);
  const [backendOk, setBackendOk] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setBackendOk(d.hasKey))
      .catch(() => setBackendOk(false));
  }, []);

  const addFiles = useCallback(async (files, setter) => {
    for (const f of files) {
      const url = await fileToDataUrl(f);
      setter((prev) => [...prev, { file: f, url, name: f.name }]);
    }
  }, []);

  const removeFile = useCallback((index, setter) => {
    setter((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
  }, []);

  const handlePhotoSelect = (i) => {
    if (selectedPhoto === i) { setSelectedPhoto(null); return; }
    setSelectedPhoto(i);
    if (selectedInspo !== null) {
      setPairs((prev) => [...prev, { photo: photos[i], inspo: inspos[selectedInspo] }]);
      setSelectedPhoto(null);
      setSelectedInspo(null);
    }
  };

  const handleInspoSelect = (i) => {
    if (selectedInspo === i) { setSelectedInspo(null); return; }
    setSelectedInspo(i);
    if (selectedPhoto !== null) {
      setPairs((prev) => [...prev, { photo: photos[selectedPhoto], inspo: inspos[i] }]);
      setSelectedPhoto(null);
      setSelectedInspo(null);
    }
  };

  // Process all pairs sequentially
  const generateAll = async () => {
    setGenerating(true);
    const newResults = {};

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i];

      // Update status: analyzing
      newResults[i] = { status: "analyzing" };
      setResults({ ...newResults });

      try {
        const formData = new FormData();
        formData.append("photo", dataUrlToBlob(pair.photo.url), pair.photo.name || "photo.jpg");
        formData.append("inspo", dataUrlToBlob(pair.inspo.url), pair.inspo.name || "inspo.jpg");

        // Update status: generating
        newResults[i] = { status: "generating" };
        setResults({ ...newResults });

        const response = await fetch("/api/generate", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          newResults[i] = {
            status: "done",
            analysis: data.analysis,
            textResponse: data.textResponse,
            imageUrl: data.imageUrl,
          };
        } else {
          newResults[i] = { status: "error", error: data.error };
        }
      } catch (err) {
        newResults[i] = { status: "error", error: err.message };
      }

      setResults({ ...newResults });
    }

    setGenerating(false);
  };

  const canAdvance =
    step === 0 ? photos.length > 0 && inspos.length > 0
    : step === 1 ? pairs.length > 0
    : false;

  const doneCount = Object.values(results).filter((r) => r.status === "done").length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d1a",
        color: "#e8e8f0",
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: 100,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px) }
          to { opacity: 1; transform: translateY(0) }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E8A87C44; border-radius: 4px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "32px 40px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #E8A87C, #D4789C)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}
          >
            ✦
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700,
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #E8A87C, #D4789C)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}
            >
              Style Agent
            </h1>
            <p style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              Transforme suas fotos no estilo das suas inspirações
            </p>
          </div>

          {/* Backend status */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: backendOk === true ? "#6fcf97" : backendOk === false ? "#ff5050" : "#888",
              }}
            />
            <span style={{ fontSize: 11, color: "#666" }}>
              {backendOk === true ? "API conectada" : backendOk === false ? "Backend offline" : "Verificando..."}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", gap: 4 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  height: 3, width: "100%", borderRadius: 2,
                  background: i <= step ? "linear-gradient(90deg, #E8A87C, #D4789C)" : "rgba(255,255,255,0.06)",
                  transition: "all 0.4s ease",
                }}
              />
              <span
                style={{
                  fontSize: 11, fontWeight: i === step ? 600 : 400,
                  color: i <= step ? "#E8A87C" : "#555", transition: "all 0.3s",
                }}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "32px 40px", animation: "fadeUp 0.4s ease" }}>

        {/* STEP 0: Upload */}
        {step === 0 && (
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            <UploadZone
              title="Suas Fotos"
              subtitle="Fotos da clínica, procedimentos, equipe..."
              files={photos}
              onAdd={(f) => addFiles(f, setPhotos)}
              onRemove={(i) => removeFile(i, setPhotos)}
              accent="#E8A87C"
            />
            <UploadZone
              title="Inspirações"
              subtitle="Referências visuais, posts, layouts..."
              files={inspos}
              onAdd={(f) => addFiles(f, setInspos)}
              onRemove={(i) => removeFile(i, setInspos)}
              accent="#D4789C"
            />
          </div>
        )}

        {/* STEP 1: Pairing */}
        {step === 1 && (
          <div>
            <div style={{ display: "flex", gap: 32, marginBottom: 32, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#E8A87C", marginBottom: 12 }}>
                  1. Selecione uma foto
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {photos.map((p, i) => (
                    <ImageCard
                      key={i} src={p.url}
                      selected={selectedPhoto === i}
                      onClick={() => handlePhotoSelect(i)}
                    />
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#D4789C", marginBottom: 12 }}>
                  2. Selecione uma inspiração
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {inspos.map((ins, i) => (
                    <ImageCard
                      key={i} src={ins.url}
                      selected={selectedInspo === i}
                      onClick={() => handleInspoSelect(i)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {selectedPhoto !== null && selectedInspo === null && (
              <div style={{ padding: "10px 16px", background: "rgba(232,168,124,0.08)", borderRadius: 12, fontSize: 13, color: "#E8A87C", marginBottom: 20, border: "1px solid rgba(232,168,124,0.15)" }}>
                ✓ Foto selecionada — agora selecione uma inspiração
              </div>
            )}
            {selectedInspo !== null && selectedPhoto === null && (
              <div style={{ padding: "10px 16px", background: "rgba(212,120,156,0.08)", borderRadius: 12, fontSize: 13, color: "#D4789C", marginBottom: 20, border: "1px solid rgba(212,120,156,0.15)" }}>
                ✓ Inspiração selecionada — agora selecione uma foto
              </div>
            )}

            {pairs.length > 0 && (
              <div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#e8e8f0", marginBottom: 12 }}>
                  Pares criados ({pairs.length})
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pairs.map((pair, i) => (
                    <PairCard
                      key={i} pair={pair} index={i}
                      onRemove={() => setPairs((prev) => prev.filter((_, j) => j !== i))}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Generate */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                padding: "16px 20px", borderRadius: 16,
                background: "linear-gradient(135deg, rgba(232,168,124,0.08), rgba(212,120,156,0.08))",
                border: "1px solid rgba(232,168,124,0.12)",
                fontSize: 13, color: "#ccc", lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "#E8A87C" }}>
                {pairs.length} {pairs.length === 1 ? "arte" : "artes"}
              </strong>{" "}
              {generating
                ? `em processamento... (${doneCount}/${pairs.length} concluídas)`
                : doneCount > 0
                  ? `— ${doneCount}/${pairs.length} concluídas`
                  : "prontas para gerar. Clique em 'Gerar Artes' abaixo."}
            </div>

            {(generating || doneCount > 0) &&
              pairs.map((pair, i) => (
                <ResultCard key={i} pair={pair} index={i} result={results[i]} />
              ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: "16px 40px",
          background: "linear-gradient(transparent, #0d0d1a 30%)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        {step > 0 && !generating ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            style={{
              padding: "10px 24px", borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent", color: "#999", fontSize: 13,
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: 500,
            }}
          >
            ← Voltar
          </button>
        ) : (
          <div />
        )}

        {step < 2 && (
          <button
            onClick={() => canAdvance && setStep((s) => s + 1)}
            disabled={!canAdvance}
            style={{
              padding: "12px 32px", borderRadius: 14, border: "none",
              background: canAdvance ? "linear-gradient(135deg, #E8A87C, #D4789C)" : "rgba(255,255,255,0.06)",
              color: canAdvance ? "#0d0d1a" : "#555", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
              cursor: canAdvance ? "pointer" : "default", letterSpacing: "0.01em", transition: "all 0.3s",
            }}
          >
            {step === 0
              ? `Próximo — Parear (${photos.length}F / ${inspos.length}I)`
              : `Próximo — Gerar (${pairs.length} pares)`}
          </button>
        )}

        {step === 2 && !generating && doneCount < pairs.length && (
          <button
            onClick={generateAll}
            disabled={backendOk !== true}
            style={{
              padding: "14px 40px", borderRadius: 14, border: "none",
              background: backendOk ? "linear-gradient(135deg, #E8A87C, #D4789C)" : "rgba(255,255,255,0.1)",
              color: backendOk ? "#0d0d1a" : "#555", fontSize: 15,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, cursor: backendOk ? "pointer" : "default",
              letterSpacing: "0.01em", boxShadow: backendOk ? "0 8px 32px rgba(232,168,124,0.3)" : "none",
            }}
          >
            {backendOk ? "✦ Gerar Artes" : "Backend offline — verifique o servidor"}
          </button>
        )}
      </div>
    </div>
  );
}
