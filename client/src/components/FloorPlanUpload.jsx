import React, { useState, useRef } from 'react';
import { Upload, Image, X, Loader2, CheckCircle2 } from 'lucide-react';

export default function FloorPlanUpload({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const fileRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/') && selected.type !== 'application/pdf') {
      alert('Please upload an image (JPG, PNG) or PDF of your floor plan.');
      return;
    }

    setFile(selected);
    setAnalysis(null);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);

    try {
      let imageDataUrl = preview;

      if (!imageDataUrl && file.type.startsWith('image/')) {
        imageDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        });
      }

      const prompt = `You are an expert interior design space analyst at Decorpot. Analyze this floor plan image carefully.

Extract and return the following information in STRICT JSON format wrapped in <FLOOR_PLAN_DATA> tags:

<FLOOR_PLAN_DATA>
{
  "estimatedCarpetArea": number (in sq ft, estimate from the plan),
  "propertyType": "1BHK" | "2BHK" | "3BHK" | "4BHK" | "Villa" | "Studio",
  "roomsIdentified": ["Room Name 1", "Room Name 2", ...],
  "roomDimensions": { "Room Name": "approx LxW ft" },
  "observations": "Brief 2-3 line observation about the layout",
  "suggestions": "1-2 design optimization suggestions based on the layout"
}
</FLOOR_PLAN_DATA>

Use these standard room names: Living Room, Dining Area, Kitchen, Master Bedroom, Bedroom, Kids Room, Bathroom, Balcony, Foyer, Pooja Room, Study Room, Utility Room.
If you cannot determine exact dimensions, make reasonable estimates based on typical Indian apartment layouts.`;

      const response = await window.puter.ai.chat(prompt, imageDataUrl, {
        model: 'gpt-4o',
        max_tokens: 800,
      });

      const text = typeof response === 'string'
        ? response
        : response?.message?.content || response?.text || String(response);

      let parsedData = null;
      const dataMatch = text.match(/<FLOOR_PLAN_DATA>([\s\S]*?)<\/FLOOR_PLAN_DATA>/);
      if (dataMatch) {
        try {
          parsedData = JSON.parse(dataMatch[1].trim());
        } catch {
          parsedData = null;
        }
      }

      if (!parsedData) {
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) parsedData = JSON.parse(jsonMatch[0]);
        } catch {
          parsedData = null;
        }
      }

      if (parsedData) {
        setAnalysis(parsedData);
        if (onAnalysisComplete) onAnalysisComplete(parsedData);
      } else {
        setAnalysis({ error: true, raw: text });
      }
    } catch (err) {
      console.error('Floor plan analysis failed:', err);
      setAnalysis({ error: true, message: err.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setAnalysis(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        <Image size={20} />
        Upload Floor Plan
      </h3>
      <p style={styles.subtitle}>
        Upload your floor plan and our AI will analyze rooms, dimensions, and provide an accurate estimate.
      </p>

      {!file ? (
        <label style={styles.dropzone}>
          <Upload size={32} color="#a0aec0" />
          <span style={styles.dropText}>Drop your floor plan here or click to browse</span>
          <span style={styles.dropHint}>Supports JPG, PNG images</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </label>
      ) : (
        <div style={styles.fileCard}>
          {preview && (
            <img src={preview} alt="Floor plan" style={styles.preview} />
          )}
          <div style={styles.fileInfo}>
            <span style={styles.fileName}>{file.name}</span>
            <span style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</span>
          </div>
          <div style={styles.fileActions}>
            {!analysis && !isAnalyzing && (
              <button style={styles.analyzeBtn} onClick={handleAnalyze}>
                Analyze Floor Plan
              </button>
            )}
            {isAnalyzing && (
              <div style={styles.analyzing}>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing layout...
              </div>
            )}
            <button style={styles.removeBtn} onClick={handleRemove}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {analysis && !analysis.error && (
        <div style={styles.analysisCard} className="fade-in">
          <div style={styles.analysisHeader}>
            <CheckCircle2 size={18} color="#38a169" />
            <span style={styles.analysisTitle}>Floor Plan Analysis Complete</span>
          </div>

          <div style={styles.analysisGrid}>
            <div style={styles.analysisStat}>
              <span style={styles.statLabel}>Property Type</span>
              <span style={styles.statValue}>{analysis.propertyType}</span>
            </div>
            <div style={styles.analysisStat}>
              <span style={styles.statLabel}>Est. Carpet Area</span>
              <span style={styles.statValue}>{analysis.estimatedCarpetArea} sqft</span>
            </div>
          </div>

          <div style={styles.roomsList}>
            <span style={styles.roomsLabel}>Rooms Identified:</span>
            <div style={styles.roomTags}>
              {(analysis.roomsIdentified || []).map((room, i) => (
                <span key={i} style={styles.roomTag}>{room}</span>
              ))}
            </div>
          </div>

          {analysis.observations && (
            <p style={styles.observations}>{analysis.observations}</p>
          )}
          {analysis.suggestions && (
            <p style={styles.suggestions}><strong>Tip:</strong> {analysis.suggestions}</p>
          )}
        </div>
      )}

      {analysis && analysis.error && (
        <div style={styles.errorCard}>
          Could not parse the floor plan fully. Please try a clearer image or continue with manual entry.
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 700,
    color: '#1a365d',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#718096',
    marginBottom: '18px',
    lineHeight: 1.5,
  },
  dropzone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '36px 20px',
    border: '2px dashed #cbd5e0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#f7fafc',
  },
  dropText: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#4a5568',
  },
  dropHint: {
    fontSize: '12px',
    color: '#a0aec0',
  },
  fileCard: {
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    maxHeight: '250px',
    objectFit: 'contain',
    background: '#f7fafc',
    display: 'block',
  },
  fileInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderTop: '1px solid #e2e8f0',
  },
  fileName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1a202c',
  },
  fileSize: {
    fontSize: '12px',
    color: '#a0aec0',
  },
  fileActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 16px 12px',
  },
  analyzeBtn: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #e53e3e, #c53030)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    cursor: 'pointer',
  },
  analyzing: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    fontSize: '13px',
    color: '#718096',
  },
  removeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#e53e3e',
  },
  analysisCard: {
    marginTop: '16px',
    padding: '18px',
    borderRadius: '12px',
    background: '#f0fff4',
    border: '1px solid #c6f6d5',
  },
  analysisHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  analysisTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#276749',
  },
  analysisGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '12px',
  },
  analysisStat: {
    padding: '10px',
    borderRadius: '8px',
    background: '#fff',
  },
  statLabel: {
    fontSize: '11px',
    color: '#a0aec0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#1a202c',
    marginTop: '2px',
    display: 'block',
  },
  roomsList: {
    marginBottom: '10px',
  },
  roomsLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#4a5568',
    display: 'block',
    marginBottom: '6px',
  },
  roomTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  roomTag: {
    padding: '3px 10px',
    borderRadius: '6px',
    background: '#ebf8ff',
    color: '#2b6cb0',
    fontSize: '12px',
    fontWeight: 500,
  },
  observations: {
    fontSize: '13px',
    color: '#4a5568',
    lineHeight: 1.5,
    marginBottom: '6px',
  },
  suggestions: {
    fontSize: '13px',
    color: '#276749',
    lineHeight: 1.5,
    padding: '8px 12px',
    background: '#fff',
    borderRadius: '8px',
  },
  errorCard: {
    marginTop: '16px',
    padding: '14px',
    borderRadius: '10px',
    background: '#fff5f5',
    border: '1px solid #fed7d7',
    fontSize: '13px',
    color: '#c53030',
  },
};
