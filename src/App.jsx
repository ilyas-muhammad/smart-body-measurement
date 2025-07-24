import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";
import MeasurementInstructions from "./components/MeasurementInstructions";
import useMeasurementProcessing from "./hooks/useMeasurementProcessing";

const PHOTO_STEPS = [
  {
    id: "front",
    title: "Front View",
    instruction: "Stand facing the camera, arms at your sides",
    icon: "🧍‍♂️",
    tips: ["Stand up straight", "Arms relaxed at sides", "Look at camera"],
  },
  {
    id: "side",
    title: "Side View",
    instruction: "Turn 90° to your right, maintain same position",
    icon: "🏃‍♂️",
    tips: ["Turn right 90°", "Keep same posture", "Arms at sides"],
  },
  {
    id: "back",
    title: "Back View",
    instruction: "Turn around, face away from camera, arms at sides",
    icon: "🚶‍♂️",
    tips: ["Face away from camera", "Stand up straight", "Arms relaxed"],
  },
  {
    id: "arms_extended",
    title: "Arms Extended",
    instruction: "Face camera, extend arms sideways (T-pose)",
    icon: "🤸‍♂️",
    tips: ["Face the camera", "Arms straight out", "Like letter T"],
  },
  {
    id: "legs_apart",
    title: "Legs Apart",
    instruction: "Stand with feet shoulder-width apart",
    icon: "🤾‍♂️",
    tips: ["Feet apart", "Straight posture", "Arms at sides"],
  },
];

// Helper functions for method display and explanations
const getMethodName = (method) => {
  const methodNames = {
    front_view: "Direct Detection",
    side_view: "Side View Analysis",
    back_view: "Back View Detection",
    arms_extended: "Extended Pose",
    legs_apart: "Wide Stance",
    front_view_estimated: "Front + Estimation",
    front_and_side_combined: "Multi-View Combined",
    anthropometric_with_pose_adjustment: "Body Ratio + Pose",
    anthropometric_estimate: "Body Proportions",
    bmi_estimate: "BMI-Based",
    dual_view: "Dual Camera",
    estimated_depth: "Depth Estimation",
    arm_width_estimation: "Arm Analysis",
    hip_to_thigh_estimation: "Hip-to-Thigh Ratio",
    thigh_ratio: "Thigh Proportion",
    direct_estimation: "Direct Calculation",
  };
  return methodNames[method] || method;
};

const getConfidenceExplanation = (data) => {
  const source = data.source || data.method;
  const confidence = data.confidenceLabel;

  const explanations = {
    high: {
      front_view:
        "Clear body landmarks detected from front camera with good visibility.",
      back_view: "Back landmarks clearly visible and accurately positioned.",
      side_view: "Side profile well-captured with reliable depth information.",
      default:
        "Measurement method worked optimally with clear landmark detection.",
    },
    medium: {
      front_view_estimated:
        "Based on detected landmarks plus anatomical estimation for accuracy.",
      anthropometric_with_pose_adjustment:
        "Uses proven body ratios with minor pose-based adjustments.",
      front_and_side_combined:
        "Combines multiple camera angles but relies partly on estimation.",
      default: "Good measurement quality with some estimation involved.",
    },
    low: {
      anthropometric_estimate:
        "Based purely on height/weight ratios without pose detection.",
      bmi_estimate:
        "Calculated from BMI and body proportions - no visual measurement.",
      estimated_depth:
        "Limited depth information available from single camera angle.",
      default:
        "Measurement relies heavily on statistical body ratios rather than direct detection.",
    },
  };

  return (
    explanations[confidence]?.[source] ||
    explanations[confidence]?.["default"] ||
    "Measurement confidence based on detection quality and method reliability."
  );
};

// Helper function to render measurement groups (outside component)
const renderMeasurementGroup = (measurements) => {
  return measurements
    .map((item, index) => {
      if (!item.data) return null;

      const confidenceColor =
        {
          high: "#10b981",
          medium: "#f59e0b",
          low: "#ef4444",
        }[item.data.confidenceLabel] || "#6b7280";

      const confidenceIcon =
        {
          high: "✅",
          medium: "⚠️",
          low: "❌",
        }[item.data.confidenceLabel] || "❓";

      return (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 12,
            backgroundColor: "#0E0E0E",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ fontWeight: "500", color: "#FFFFFF" }}>
            <div>{item.labelIdn}</div>
            <div
              style={{
                fontSize: 11,
                fontStyle: "italic",
                opacity: 0.7,
                fontWeight: "normal",
              }}
            >
              {item.labelEng}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}
          >
            <span
              style={{ fontSize: 18, fontWeight: "bold", color: "#FFFFFF" }}
            >
              {item.data.value} {item.data.unit || "cm"}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  fontSize: 12,
                  color: confidenceColor,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {confidenceIcon} {item.data.confidenceLabel} (
                {item.data.confidencePercentage || "N/A"}%)
              </span>
            </div>
            {item.data.method && (
              <details
                style={{ fontSize: 10, color: "#9ca3af", textAlign: "right" }}
              >
                <summary style={{ cursor: "pointer", listStyle: "none" }}>
                  📊 Method & Info
                </summary>
                <div
                  style={{
                    marginTop: 4,
                    padding: 8,
                    backgroundColor: "#1f2937",
                    borderRadius: 4,
                    maxWidth: "200px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                    Method:{" "}
                    {getMethodName(item.data.method || item.data.source)}
                  </div>
                  <div style={{ fontSize: 9, lineHeight: 1.3 }}>
                    {getConfidenceExplanation(item.data)}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    })
    .filter(Boolean);
};

const App = () => {
  const webcamRef = useRef(null);
  // const canvasRef = useRef(null);

  // Add tab state
  const [activeTab, setActiveTab] = useState("measure");

  // User profile
  const [userHeight, setUserHeight] = useState("");
  const [userWeight, setUserWeight] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userAge, setUserAge] = useState("");

  // Photo sequence state
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState({});
  const [isSequenceComplete, setIsSequenceComplete] = useState(false);

  // Use the new measurement processing hook
  const {
    processAll,
    results,
    processing,
    error: processingError,
  } = useMeasurementProcessing();

  // Helper to load image as HTMLImageElement
  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.src = src;
    });
  };

  // Capture photo for current step
  const captureCurrentStep = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    const stepId = PHOTO_STEPS[currentStep].id;

    setCapturedPhotos((prev) => ({
      ...prev,
      [stepId]: imageSrc,
    }));

    // Move to next step or complete sequence
    if (currentStep < PHOTO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSequenceComplete(true);
    }
  };

  // Reset sequence
  const resetSequence = () => {
    setCurrentStep(0);
    setCapturedPhotos({});
    setIsSequenceComplete(false);
    // setResults(null); // This is now managed by the hook
  };

  // Check if user profile is complete
  const isProfileComplete = userHeight && userWeight && userGender;

  // User profile object
  const userProfile = {
    height: Number(userHeight),
    weight: Number(userWeight),
    gender: userGender,
    age: Number(userAge),
    bmi:
      userWeight && userHeight
        ? (Number(userWeight) / Math.pow(Number(userHeight) / 100, 2)).toFixed(
            1
          )
        : null,
  };

  // Handler for processing all photos
  const handleProcessAllPhotos = () => {
    processAll(capturedPhotos, userProfile, loadImage);
  };

  // Tab navigation component
  const TabNavigation = () => (
    <div
      style={{
        display: "flex",
        marginBottom: "24px",
        borderBottom: "2px solid #e9ecef",
      }}
    >
      <button
        onClick={() => setActiveTab("measure")}
        style={{
          padding: "12px 24px",
          backgroundColor: activeTab === "measure" ? "#007bff" : "transparent",
          color: activeTab === "measure" ? "white" : "#007bff",
          border: "none",
          borderBottom:
            activeTab === "measure"
              ? "2px solid #007bff"
              : "2px solid transparent",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: activeTab === "measure" ? "bold" : "normal",
        }}
      >
        📏 Ambil Pengukuran
      </button>
      <button
        onClick={() => setActiveTab("instructions")}
        style={{
          padding: "12px 24px",
          backgroundColor:
            activeTab === "instructions" ? "#28a745" : "transparent",
          color: activeTab === "instructions" ? "white" : "#28a745",
          border: "none",
          borderBottom:
            activeTab === "instructions"
              ? "2px solid #28a745"
              : "2px solid transparent",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: activeTab === "instructions" ? "bold" : "normal",
        }}
      >
        📋 Panduan Pengukuran
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h1>Demo Pengukuran Tubuh - Multi Foto</h1>

      {/* Tab Navigation */}
      <TabNavigation />

      {/* Instructions Tab */}
      {activeTab === "instructions" && <MeasurementInstructions />}

      {/* Measurement Tab */}
      {activeTab === "measure" && (
        <>
          {/* User Profile Section */}
          <div
            style={{
              marginBottom: 24,
              padding: 16,
              border: "1px solid #ddd",
              borderRadius: 8,
            }}
          >
            <h3>Profil Anda</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label>Tinggi (cm): </label>
                <input
                  type="number"
                  value={userHeight}
                  onChange={(e) => setUserHeight(e.target.value)}
                  placeholder="175"
                />
              </div>
              <div>
                <label>Berat (kg): </label>
                <input
                  type="number"
                  value={userWeight}
                  onChange={(e) => setUserWeight(e.target.value)}
                  placeholder="70"
                />
              </div>
              <div>
                <label>Jenis Kelamin: </label>
                <select
                  value={userGender}
                  onChange={(e) => setUserGender(e.target.value)}
                >
                  <option value="">Pilih</option>
                  <option value="male">Pria</option>
                  <option value="female">Wanita</option>
                </select>
              </div>
              <div>
                <label>Umur: </label>
                <input
                  type="number"
                  value={userAge}
                  onChange={(e) => setUserAge(e.target.value)}
                  placeholder="30"
                />
              </div>
            </div>
            {userWeight && userHeight && (
              <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>
                BMI:{" "}
                {(
                  Number(userWeight) / Math.pow(Number(userHeight) / 100, 2)
                ).toFixed(1)}
              </div>
            )}
          </div>

          {/* Quick Clothing Reminder */}
          {!isProfileComplete && (
            <div
              style={{
                padding: 16,
                backgroundColor: "#E0E0E0",
                borderRadius: 8,
                marginBottom: 16,
                color: "#0E0E0E",
              }}
            >
              Silakan lengkapi profil Anda di atas untuk melanjutkan.
            </div>
          )}

          {isProfileComplete && (
            <div
              style={{
                padding: 12,
                backgroundColor: "#fff3cd",
                border: "1px solid #ffeaa7",
                color: "#0E0E0E",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              <strong>⚡ Pengingat Cepat:</strong> Kenakan pakaian ketat untuk
              hasil terbaik!
              <button
                onClick={() => setActiveTab("instructions")}
                style={{
                  marginLeft: 8,
                  padding: "4px 8px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Lihat Panduan Lengkap
              </button>
            </div>
          )}

          {/* Photo Sequence Section */}
          {isProfileComplete && (
            <>
              {!isSequenceComplete ? (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h3>
                      Step {currentStep + 1} of {PHOTO_STEPS.length}:{" "}
                      {PHOTO_STEPS[currentStep].title}
                    </h3>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>
                      {PHOTO_STEPS[currentStep].icon}
                    </div>
                    <div style={{ fontSize: 18, marginBottom: 8 }}>
                      {PHOTO_STEPS[currentStep].instruction}
                    </div>
                    <div style={{ fontSize: 14, color: "#666" }}>
                      Tips: {PHOTO_STEPS[currentStep].tips.join(" • ")}
                    </div>
                  </div>

                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={600}
                      height={600}
                      videoConstraints={{
                        facingMode: "environment", // Forces back camera on mobile devices
                      }}
                    />
                  </div>

                  <button
                    onClick={captureCurrentStep}
                    style={{
                      padding: "12px 24px",
                      fontSize: 16,
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    Capture {PHOTO_STEPS[currentStep].title}
                  </button>

                  {/* Progress indicator */}
                  <div style={{ marginTop: 16 }}>
                    <div>
                      Progress: {Object.keys(capturedPhotos).length} /{" "}
                      {PHOTO_STEPS.length} photos
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {PHOTO_STEPS.map((step, index) => (
                        <div
                          key={step.id}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            backgroundColor: capturedPhotos[step.id]
                              ? "#28a745"
                              : index === currentStep
                              ? "#007bff"
                              : "#ddd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 12,
                          }}
                        >
                          {capturedPhotos[step.id] ? "✓" : index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: 24 }}>
                  <h3>Photo Sequence Complete! ✅</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 16,
                      marginBottom: 16,
                    }}
                  >
                    {Object.entries(capturedPhotos).map(
                      ([stepId, imageSrc]) => (
                        <div key={stepId} style={{ textAlign: "center" }}>
                          <img
                            src={imageSrc}
                            alt={stepId}
                            style={{
                              width: "100%",
                              height: 120,
                              objectFit: "cover",
                              borderRadius: 8,
                            }}
                          />
                          <div style={{ fontSize: 12, marginTop: 4 }}>
                            {PHOTO_STEPS.find((s) => s.id === stepId)?.title}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 16 }}>
                    <button
                      onClick={handleProcessAllPhotos}
                      disabled={processing}
                      style={{
                        padding: "12px 24px",
                        fontSize: 16,
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      {processing ? "Processing..." : "Calculate Measurements"}
                    </button>

                    <button
                      onClick={resetSequence}
                      style={{
                        padding: "12px 24px",
                        fontSize: 16,
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      Retake Photos
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Results Section */}
          {results && (
            <div style={{ marginTop: 24 }}>
              <h2>Your Body Measurements</h2>
              {processingError ? (
                <div
                  style={{
                    color: "red",
                    padding: 16,
                    backgroundColor: "#f8d7da",
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                    {processingError.error}
                  </div>
                  {processingError.errorMessage && (
                    <div
                      style={{ fontSize: 12, marginBottom: 12, opacity: 0.7 }}
                    >
                      Technical details: {processingError.errorMessage}
                    </div>
                  )}
                  {processingError.suggestions && (
                    <div>
                      <div
                        style={{
                          fontWeight: "bold",
                          marginBottom: 8,
                          fontSize: 14,
                        }}
                      >
                        💡 Try these solutions:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {processingError.suggestions.map(
                          (suggestion, index) => (
                            <li
                              key={index}
                              style={{ marginBottom: 4, fontSize: 13 }}
                            >
                              {suggestion}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* User Profile Summary */}
                  {results.userProfile && (
                    <div
                      style={{
                        padding: 16,
                        backgroundColor: "#0E0E0E",
                        borderRadius: 8,
                        marginBottom: 20,
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(120px, 1fr))",
                        gap: 12,
                      }}
                    >
                      <div>
                        <strong>Height:</strong> {results.userProfile.height} cm
                      </div>
                      <div>
                        <strong>Weight:</strong> {results.userProfile.weight} kg
                      </div>
                      <div>
                        <strong>Gender:</strong> {results.userProfile.gender}
                      </div>
                      <div>
                        <strong>BMI:</strong> {results.userProfile.bmi}
                      </div>
                    </div>
                  )}

                  {/* Canvas with landmarks */}
                  <div style={{ position: "relative", marginBottom: 20 }}>
                    {/* <canvas
                      ref={canvasRef}
                      width={320}
                      height={400}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        backgroundColor: "#FFFFFF",
                      }}
                    /> */}
                    {/* <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                      Red dots show detected body landmarks
                    </div> */}
                  </div>

                  {/* Results sections (existing code for measurements display) */}
                  {/* Top Measurements */}
                  <div style={{ marginBottom: 24 }}>
                    <h3
                      style={{
                        color: "#2563eb",
                        borderBottom: "2px solid #2563eb",
                        paddingBottom: 8,
                      }}
                    >
                      👔 Top Measurements
                    </h3>
                    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                      {renderMeasurementGroup([
                        {
                          labelIdn: "Lebar Bahu",
                          labelEng: "Shoulder Width",
                          data: results.shoulderWidth,
                        },
                        {
                          labelIdn: "Lebar Pundak",
                          labelEng: "Shoulder Blade Width",
                          data: results.shoulderBladeWidth,
                        },
                        {
                          labelIdn: "Lebar Dada",
                          labelEng: "Chest Width",
                          data: results.chestWidth,
                        },
                        {
                          labelIdn: "Lebar Pinggang",
                          labelEng: "Waist Width",
                          data: results.waistWidth,
                        },
                        {
                          labelIdn: "Punggung",
                          labelEng: "Back Length",
                          data: results.backLength,
                        },
                        {
                          labelIdn: "Panjang Lengan",
                          labelEng: "Arm Length",
                          data: results.armLength,
                        },
                        {
                          labelIdn: "Panjang Tangan",
                          labelEng: "Sleeve Length",
                          data: results.sleeveLength,
                        },
                        {
                          labelIdn: "Rentang Lengan",
                          labelEng: "Arm Span",
                          data: results.armSpan,
                        },
                      ])}
                    </div>
                  </div>

                  {/* Bottom Measurements */}
                  <div style={{ marginBottom: 24 }}>
                    <h3
                      style={{
                        color: "#16a34a",
                        borderBottom: "2px solid #16a34a",
                        paddingBottom: 8,
                      }}
                    >
                      👖 Bottom Measurements
                    </h3>
                    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                      {renderMeasurementGroup([
                        {
                          labelIdn: "Lebar Pinggul",
                          labelEng: "Hip Width",
                          data: results.hipWidth,
                        },
                        {
                          labelIdn: "Panjang Kaki",
                          labelEng: "Leg Length",
                          data: results.legLength,
                        },
                        {
                          labelIdn: "Panjang Celana",
                          labelEng: "Pants Length",
                          data: results.pantsLength,
                        },
                      ])}
                    </div>
                  </div>

                  {/* Top Circumferences */}
                  <div style={{ marginBottom: 24 }}>
                    <h3
                      style={{
                        color: "#7c3aed",
                        borderBottom: "2px solid #7c3aed",
                        paddingBottom: 8,
                      }}
                    >
                      ⭕ Top Circumferences
                    </h3>
                    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                      {renderMeasurementGroup([
                        {
                          labelIdn: "Lingkar Dada",
                          labelEng: "Chest Circumference",
                          data: results.chestCircumference,
                        },
                        {
                          labelIdn: "Lingkar Perut",
                          labelEng: "Waist Circumference",
                          data: results.waistCircumference,
                        },
                        {
                          labelIdn: "Bisep",
                          labelEng: "Arm Circumference",
                          data: results.biceps,
                        },
                      ])}
                    </div>
                  </div>

                  {/* Bottom Circumferences */}
                  <div style={{ marginBottom: 24 }}>
                    <h3
                      style={{
                        color: "#dc2626",
                        borderBottom: "2px solid #dc2626",
                        paddingBottom: 8,
                      }}
                    >
                      ⭕ Bottom Circumferences
                    </h3>
                    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                      {renderMeasurementGroup([
                        {
                          labelIdn: "Lingkar Pinggang",
                          labelEng: "Waist Circumference",
                          data: results.waistCircumference,
                        },
                        {
                          labelIdn: "Lingkar Pinggul",
                          labelEng: "Hip Circumference",
                          data: results.hipCircumference,
                        },
                        {
                          labelIdn: "Lingkar Paha",
                          labelEng: "Thigh Circumference",
                          data: results.thigh,
                        },
                        {
                          labelIdn: "Lingkar Betis",
                          labelEng: "Calf Circumference",
                          data: results.calf,
                        },
                      ])}
                    </div>
                  </div>

                  {/* Raw Data (Collapsible) */}
                  <details style={{ marginTop: 24 }}>
                    <summary
                      style={{
                        cursor: "pointer",
                        padding: 8,
                        backgroundColor: "#f3f4f6",
                        borderRadius: 4,
                        fontSize: 14,
                        color: "#6b7280",
                      }}
                    >
                      🔍 View Raw Data (Developer)
                    </summary>
                    <pre
                      style={{
                        backgroundColor: "#0E0E0E",
                        padding: 16,
                        borderRadius: 8,
                        overflow: "auto",
                        fontSize: 12,
                        marginTop: 8,
                      }}
                    >
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
