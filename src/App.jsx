import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";
import {
  pixelToCm,
  getDistance,
  estimateCircumference,
  estimateBiceps,
  estimateThigh,
  estimateCalf,
  calculateLandmarkConfidence,
  getConfidenceDisplay,
} from "./utils/measurement";

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
  const canvasRef = useRef(null);

  // User profile
  const [userHeight, setUserHeight] = useState("");
  const [userWeight, setUserWeight] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userAge, setUserAge] = useState("");

  // Photo sequence state
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState({});
  const [isSequenceComplete, setIsSequenceComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

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

  // Create MediaPipe Pose instance with better mobile support
  const createPoseInstance = async () => {
    try {
      console.log("Starting MediaPipe initialization...");

      // First, try to load MediaPipe dynamically
      let Pose;
      try {
        const mediaPipeModule = await import("@mediapipe/pose");
        Pose = mediaPipeModule.Pose;
        console.log("MediaPipe module loaded successfully");
      } catch (importError) {
        console.error("Failed to import MediaPipe module:", importError);
        throw new Error(
          `MediaPipe module import failed: ${importError.message}`
        );
      }

      if (!Pose) {
        throw new Error("MediaPipe Pose constructor not available");
      }

      // Try multiple CDN sources and initialization approaches
      const cdnSources = [
        "https://cdn.jsdelivr.net/npm/@mediapipe/pose",
        "https://unpkg.com/@mediapipe/pose@0.5.1675469404",
        "https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404",
      ];

      let pose = null;
      let lastError = null;

      for (const cdnBase of cdnSources) {
        try {
          console.log(`Trying CDN: ${cdnBase}`);

          pose = new Pose({
            locateFile: (file) => {
              console.log(`Loading file: ${file} from ${cdnBase}`);
              return `${cdnBase}/${file}`;
            },
          });

          // Wait a bit for initialization
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Test if pose can be configured
          pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          console.log("MediaPipe Pose configured successfully");

          // Test with a small canvas to verify it's working
          const testCanvas = document.createElement("canvas");
          testCanvas.width = 10;
          testCanvas.height = 10;
          const testCtx = testCanvas.getContext("2d");
          testCtx.fillStyle = "black";
          testCtx.fillRect(0, 0, 10, 10);

          console.log("MediaPipe Pose instance created successfully");
          break;
        } catch (error) {
          console.error(`CDN ${cdnBase} failed:`, error);
          lastError = error;
          pose = null;
          continue;
        }
      }

      if (!pose) {
        throw new Error(
          `Failed to initialize MediaPipe from all CDN sources. Last error: ${
            lastError?.message || "Unknown error"
          }`
        );
      }

      return pose;
    } catch (error) {
      console.error("MediaPipe initialization failed:", error);
      throw new Error(`MediaPipe initialization failed: ${error.message}`);
    }
  };

  // Process all captured photos
  const processAllPhotos = async () => {
    setProcessing(true);
    setResults(null);

    try {
      const processedResults = {};

      // Create pose instance once and reuse
      const pose = await createPoseInstance();

      // Process each photo with MediaPipe
      for (const [stepId, imageSrc] of Object.entries(capturedPhotos)) {
        try {
          const img = await loadImage(imageSrc);

          // Add timeout to prevent hanging
          const poseResults = await Promise.race([
            new Promise((resolve) => {
              pose.onResults(resolve);
              pose.send({ image: img });
            }),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error("MediaPipe processing timeout")),
                10000
              )
            ),
          ]);

          if (
            poseResults &&
            poseResults.poseLandmarks &&
            poseResults.poseLandmarks.length > 0
          ) {
            processedResults[stepId] = {
              landmarks: poseResults.poseLandmarks,
              image: img,
              imageSrc: imageSrc,
            };
          } else {
            console.warn(`No pose landmarks detected for ${stepId}`);
          }
        } catch (stepError) {
          console.error(`Error processing ${stepId}:`, stepError);
          // Continue with other photos even if one fails
        }
      }

      // Check if we have any successful results
      if (Object.keys(processedResults).length === 0) {
        throw new Error(
          "No pose landmarks detected in any photos. Please ensure you are clearly visible in the frame and try again."
        );
      }

      // Calculate measurements from multiple angles
      const measurements = calculateMultiAngleMeasurements(processedResults);
      setResults(measurements);

      // Draw landmarks on the current displayed image
      if (processedResults.front) {
        drawLandmarks(
          processedResults.front.landmarks,
          processedResults.front.imageSrc
        );
      }
    } catch (error) {
      console.error("Processing error:", error);
      setResults({
        error: "Processing failed. Please try again.",
        errorMessage: error.message,
        suggestions: [
          "Ensure you have a stable internet connection",
          "Make sure you are clearly visible in all photos",
          "Try refreshing the page and taking new photos",
          "Check that your device camera is working properly",
        ],
      });
    }

    setProcessing(false);
  };

  // Calculate measurements using multiple photo angles
  const calculateMultiAngleMeasurements = (processedResults) => {
    const userProfile = {
      height: Number(userHeight),
      weight: Number(userWeight),
      gender: userGender,
      age: Number(userAge),
      bmi:
        userWeight && userHeight
          ? (
              Number(userWeight) / Math.pow(Number(userHeight) / 100, 2)
            ).toFixed(1)
          : null,
    };

    const measurements = {};

    // Process front view (core measurements)
    if (processedResults.front) {
      const frontMeasurements = processFrontView(
        processedResults.front.landmarks,
        userProfile
      );
      Object.assign(measurements, frontMeasurements);
    }

    // Process side view (depth measurements)
    if (processedResults.side) {
      const sideMeasurements = processSideView(
        processedResults.side.landmarks,
        userProfile
      );
      Object.assign(measurements, sideMeasurements);
    }

    // Process back view (back measurements)
    if (processedResults.back) {
      const backMeasurements = processBackView(
        processedResults.back.landmarks,
        userProfile
      );
      Object.assign(measurements, backMeasurements);
    }

    // Process arms extended (better arm measurements)
    if (processedResults.arms_extended) {
      const armMeasurements = processArmsExtended(
        processedResults.arms_extended.landmarks,
        userProfile
      );
      Object.assign(measurements, armMeasurements);
    }

    // Process legs apart (better leg measurements)
    if (processedResults.legs_apart) {
      const legMeasurements = processLegsApart(
        processedResults.legs_apart.landmarks,
        userProfile
      );
      Object.assign(measurements, legMeasurements);
    }

    // Combine measurements for circumferences
    if (processedResults.front && processedResults.side) {
      const circumferences = calculateCircumferences(
        processedResults.front.landmarks,
        processedResults.side.landmarks,
        userProfile
      );
      Object.assign(measurements, circumferences);
    }

    return { ...measurements, userProfile };
  };

  // Process front view measurements
  const processFrontView = (landmarks, userProfile) => {
    const imageSize = { width: 320, height: 400 };

    // Key landmarks
    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    // const lElbow = landmarks[13];
    // const rElbow = landmarks[14];
    const lWrist = landmarks[15];
    const rWrist = landmarks[16];
    const lHip = landmarks[23];
    const rHip = landmarks[24];
    // const lKnee = landmarks[25];
    // const rKnee = landmarks[26];
    const lAnkle = landmarks[27];
    const rAnkle = landmarks[28];
    const top = landmarks[0]; // Nose/head

    // Calculate pose height for scaling
    const ankle =
      lAnkle && rAnkle
        ? lAnkle.y > rAnkle.y
          ? lAnkle
          : rAnkle
        : lAnkle || rAnkle;
    const poseHeight = Math.abs(top.y - ankle.y);

    // Calculate pixel distances
    const shoulderPx = getDistance(
      { x: lShoulder.x * imageSize.width, y: lShoulder.y * imageSize.height },
      { x: rShoulder.x * imageSize.width, y: rShoulder.y * imageSize.height }
    );

    const hipPx = getDistance(
      { x: lHip.x * imageSize.width, y: lHip.y * imageSize.height },
      { x: rHip.x * imageSize.width, y: rHip.y * imageSize.height }
    );

    // Estimate waist position (between chest and hips)
    // const waistY = (lShoulder.y + lHip.y) / 2;
    const waistPx = shoulderPx * 0.8; // Approximate waist as 80% of shoulder width

    // Arm length (shoulder to wrist)
    const leftArmPx = getDistance(
      { x: lShoulder.x * imageSize.width, y: lShoulder.y * imageSize.height },
      { x: lWrist.x * imageSize.width, y: lWrist.y * imageSize.height }
    );

    const rightArmPx = getDistance(
      { x: rShoulder.x * imageSize.width, y: rShoulder.y * imageSize.height },
      { x: rWrist.x * imageSize.width, y: rWrist.y * imageSize.height }
    );

    const armLengthPx = Math.max(leftArmPx, rightArmPx);

    // Leg length (hip to ankle)
    const leftLegPx = getDistance(
      { x: lHip.x * imageSize.width, y: lHip.y * imageSize.height },
      { x: lAnkle.x * imageSize.width, y: lAnkle.y * imageSize.height }
    );

    const rightLegPx = getDistance(
      { x: rHip.x * imageSize.width, y: rHip.y * imageSize.height },
      { x: rAnkle.x * imageSize.width, y: rAnkle.y * imageSize.height }
    );

    const legLengthPx = Math.max(leftLegPx, rightLegPx);

    // Convert to cm
    const shoulderWidth = pixelToCm(
      shoulderPx,
      imageSize.height,
      userProfile.height,
      poseHeight
    );
    const hipWidth = pixelToCm(
      hipPx,
      imageSize.height,
      userProfile.height,
      poseHeight
    );
    const waistWidth = pixelToCm(
      waistPx,
      imageSize.height,
      userProfile.height,
      poseHeight
    );
    const armLength = pixelToCm(
      armLengthPx,
      imageSize.height,
      userProfile.height,
      poseHeight
    );
    const legLength = pixelToCm(
      legLengthPx,
      imageSize.height,
      userProfile.height,
      poseHeight
    );

    // Calculate chest width (different from shoulder width - more focused on chest area)
    const chestPx = shoulderPx * 0.85; // Chest is typically ~85% of shoulder width
    const chestWidth = pixelToCm(
      chestPx,
      imageSize.height,
      userProfile.height,
      poseHeight
    );

    // Calculate confidence scores
    const shoulderConfidence = getConfidenceDisplay(
      calculateLandmarkConfidence(landmarks, [11, 12])
    );
    const hipConfidence = getConfidenceDisplay(
      calculateLandmarkConfidence(landmarks, [23, 24])
    );
    const armConfidence = getConfidenceDisplay(
      calculateLandmarkConfidence(landmarks, [11, 12, 15, 16])
    );
    const legConfidence = getConfidenceDisplay(
      calculateLandmarkConfidence(landmarks, [23, 24, 27, 28])
    );

    return {
      shoulderWidth: {
        value: shoulderWidth.toFixed(1),
        confidence: shoulderConfidence.score,
        confidencePercentage: shoulderConfidence.percentage,
        confidenceLabel: shoulderConfidence.label,
        source: "front_view",
        unit: "cm",
      },
      chestWidth: {
        value: chestWidth.toFixed(1),
        confidence: shoulderConfidence.score * 0.9, // Slightly lower confidence since it's estimated
        confidencePercentage: Math.round(shoulderConfidence.percentage * 0.9),
        confidenceLabel: shoulderConfidence.percentage > 70 ? "medium" : "low",
        source: "front_view_estimated",
        unit: "cm",
      },
      hipWidth: {
        value: hipWidth.toFixed(1),
        confidence: hipConfidence.score,
        confidencePercentage: hipConfidence.percentage,
        confidenceLabel: hipConfidence.label,
        source: "front_view",
        unit: "cm",
      },
      waistWidth: {
        value: waistWidth.toFixed(1),
        confidence: 0.6,
        confidencePercentage: 60,
        confidenceLabel: "medium",
        source: "front_view_estimated",
        unit: "cm",
      },
      armLength: {
        value: armLength.toFixed(1),
        confidence: armConfidence.score,
        confidencePercentage: armConfidence.percentage,
        confidenceLabel: armConfidence.label,
        source: "front_view",
        unit: "cm",
      },
      sleeveLength: {
        value: (armLength * 0.95).toFixed(1), // Sleeve length is typically ~95% of arm length
        confidence: armConfidence.score * 0.85,
        confidencePercentage: Math.round(armConfidence.percentage * 0.85),
        confidenceLabel: armConfidence.percentage > 70 ? "medium" : "low",
        source: "front_view_estimated",
        unit: "cm",
      },
      legLength: {
        value: legLength.toFixed(1),
        confidence: legConfidence.score,
        confidencePercentage: legConfidence.percentage,
        confidenceLabel: legConfidence.label,
        source: "front_view",
        unit: "cm",
      },
      pantsLength: {
        value: (legLength * 0.92).toFixed(1), // Pants length is typically ~92% of leg length
        confidence: legConfidence.score * 0.9,
        confidencePercentage: Math.round(legConfidence.percentage * 0.9),
        confidenceLabel: legConfidence.percentage > 70 ? "medium" : "low",
        source: "front_view_estimated",
        unit: "cm",
      },
    };
  };

  // Process back view measurements
  const processBackView = (landmarks, userProfile) => {
    const imageSize = { width: 320, height: 400 };

    // Key landmarks for back view
    const nose = landmarks[0]; // Head/neck reference point
    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    const lHip = landmarks[23];
    const rHip = landmarks[24];

    // Calculate back length (neck to waist)
    // Estimate neck position as slightly above shoulders
    const neckY = nose.y + (lShoulder.y - nose.y) * 0.8;
    const waistY = (lShoulder.y + (lHip.y + rHip.y) / 2) / 2; // Waist position using both hips

    const backLengthPx = Math.abs(waistY - neckY) * imageSize.height;

    // Calculate pose height for scaling
    const lAnkle = landmarks[27];
    const rAnkle = landmarks[28];
    const ankle =
      lAnkle && rAnkle
        ? lAnkle.y > rAnkle.y
          ? lAnkle
          : rAnkle
        : lAnkle || rAnkle;
    const poseHeight = Math.abs(nose.y - ankle.y);

    const backLength = pixelToCm(
      backLengthPx,
      imageSize.height,
      userProfile.height,
      poseHeight
    );

    // Calculate shoulder blade width (shoulder to shoulder from back)
    const shoulderBladePx = getDistance(
      { x: lShoulder.x * imageSize.width, y: lShoulder.y * imageSize.height },
      { x: rShoulder.x * imageSize.width, y: rShoulder.y * imageSize.height }
    );

    const shoulderBladeWidth = pixelToCm(
      shoulderBladePx,
      imageSize.height,
      userProfile.height,
      poseHeight
    );

    // Calculate confidence scores
    const backConfidence = getConfidenceDisplay(
      calculateLandmarkConfidence(landmarks, [0, 11, 12, 23, 24])
    );
    const shoulderBladeConfidence = getConfidenceDisplay(
      calculateLandmarkConfidence(landmarks, [11, 12])
    );

    return {
      backLength: {
        value: backLength.toFixed(1),
        confidence: backConfidence.score,
        confidencePercentage: backConfidence.percentage,
        confidenceLabel: backConfidence.label,
        source: "back_view",
        unit: "cm",
      },
      shoulderBladeWidth: {
        value: shoulderBladeWidth.toFixed(1),
        confidence: shoulderBladeConfidence.score,
        confidencePercentage: shoulderBladeConfidence.percentage,
        confidenceLabel: shoulderBladeConfidence.label,
        source: "back_view",
        unit: "cm",
      },
    };
  };

  // Process side view measurements
  const processSideView = (landmarks) => {
    const imageSize = { width: 320, height: 400 };

    // Get depth measurements from side view
    // const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    // Calculate depth (front to back) measurements
    // In side view, the x-axis represents depth
    const shoulderDepth =
      Math.abs(leftShoulder.x - rightShoulder.x) * imageSize.width;
    const hipDepth = Math.abs(leftHip.x - rightHip.x) * imageSize.width;

    // Estimate chest depth (slightly more than shoulder)
    const chestDepth = shoulderDepth * 1.1;

    // Estimate waist depth (between chest and hip)
    const waistDepth = (chestDepth + hipDepth) / 2;

    return {
      chestDepth: {
        value: chestDepth.toFixed(1),
        confidence: "medium",
        source: "side_view",
        unit: "pixels",
      },
      waistDepth: {
        value: waistDepth.toFixed(1),
        confidence: "medium",
        source: "side_view",
        unit: "pixels",
      },
      hipDepth: {
        value: hipDepth.toFixed(1),
        confidence: "medium",
        source: "side_view",
        unit: "pixels",
      },
    };
  };

  // Process arms extended measurements
  const processArmsExtended = (landmarks, userProfile) => {
    const imageSize = { width: 320, height: 400 };

    // Calculate biceps and arm span
    const bicepsResult = estimateBiceps(landmarks, userProfile);

    // Calculate arm span (wrist to wrist)
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];

    if (leftWrist && rightWrist) {
      const armSpanPx = getDistance(
        { x: leftWrist.x * imageSize.width, y: leftWrist.y * imageSize.height },
        {
          x: rightWrist.x * imageSize.width,
          y: rightWrist.y * imageSize.height,
        }
      );

      // Convert to cm (using approximate scaling)
      const armSpanCm =
        (armSpanPx / imageSize.width) * userProfile.height * 1.1; // Arm span ≈ height
      const armSpanConfidence = getConfidenceDisplay(
        calculateLandmarkConfidence(landmarks, [15, 16]) * 0.9
      );

      return {
        biceps: {
          value: bicepsResult.value.toFixed(1),
          confidence: bicepsResult.confidence,
          confidencePercentage: bicepsResult.confidencePercentage,
          confidenceLabel: bicepsResult.confidenceLabel,
          source: "arms_extended",
          unit: "cm",
        },
        armSpan: {
          value: armSpanCm.toFixed(1),
          confidence: armSpanConfidence.score,
          confidencePercentage: armSpanConfidence.percentage,
          confidenceLabel: armSpanConfidence.label,
          source: "arms_extended",
          unit: "cm",
        },
      };
    }

    return {
      biceps: {
        value: bicepsResult.value.toFixed(1),
        confidence: bicepsResult.confidence,
        confidencePercentage: bicepsResult.confidencePercentage,
        confidenceLabel: bicepsResult.confidenceLabel,
        source: "arms_extended",
        unit: "cm",
      },
    };
  };

  // Process legs apart measurements
  const processLegsApart = (landmarks, userProfile) => {
    const imageSize = { width: 320, height: 400 };

    // Calculate thigh and calf measurements
    const thighResult = estimateThigh(landmarks, userProfile, imageSize);
    const calfResult = estimateCalf(
      landmarks,
      userProfile,
      imageSize,
      thighResult
    );

    return {
      thigh: {
        value: thighResult.value.toFixed(1),
        confidence: thighResult.confidence,
        confidencePercentage: thighResult.confidencePercentage,
        confidenceLabel: thighResult.confidenceLabel,
        source: "legs_apart",
        unit: "cm",
      },
      calf: {
        value: calfResult.value.toFixed(1),
        confidence: calfResult.confidence,
        confidencePercentage: calfResult.confidencePercentage,
        confidenceLabel: calfResult.confidenceLabel,
        source: "legs_apart",
        unit: "cm",
      },
    };
  };

  // Calculate circumferences using front and side data
  const calculateCircumferences = (
    frontLandmarks,
    sideLandmarks,
    userProfile
  ) => {
    // const imageSize = { width: 320, height: 400 };

    // Get front width measurements (converted to cm)
    const frontMeasurements = processFrontView(frontLandmarks, userProfile);
    const sideMeasurements = processSideView(sideLandmarks);

    // Calculate circumferences using ellipse approximation
    const chestCirc = estimateCircumference(
      Number(frontMeasurements.shoulderWidth.value),
      Number(sideMeasurements.chestDepth.value) * 0.1, // Convert pixels to approximate cm
      "chest",
      userProfile
    );

    const waistCirc = estimateCircumference(
      Number(frontMeasurements.waistWidth.value),
      Number(sideMeasurements.waistDepth.value) * 0.1,
      "waist",
      userProfile
    );

    const hipCirc = estimateCircumference(
      Number(frontMeasurements.hipWidth.value),
      Number(sideMeasurements.hipDepth.value) * 0.1,
      "hips",
      userProfile
    );

    // Convert confidence scores to display format
    const chestConfidence = getConfidenceDisplay(chestCirc.confidence);
    const waistConfidence = getConfidenceDisplay(waistCirc.confidence);
    const hipConfidence = getConfidenceDisplay(hipCirc.confidence);

    return {
      chestCircumference: {
        value: chestCirc.value.toFixed(1),
        confidence: chestConfidence.score,
        confidencePercentage: chestConfidence.percentage,
        confidenceLabel: chestConfidence.label,
        source: "front_and_side_combined",
        unit: "cm",
        method: chestCirc.method,
      },
      waistCircumference: {
        value: waistCirc.value.toFixed(1),
        confidence: waistConfidence.score,
        confidencePercentage: waistConfidence.percentage,
        confidenceLabel: waistConfidence.label,
        source: "front_and_side_combined",
        unit: "cm",
        method: waistCirc.method,
      },
      hipCircumference: {
        value: hipCirc.value.toFixed(1),
        confidence: hipConfidence.score,
        confidencePercentage: hipConfidence.percentage,
        confidenceLabel: hipConfidence.label,
        source: "front_and_side_combined",
        unit: "cm",
        method: hipCirc.method,
      },
    };
  };

  // Draw landmarks on canvas
  const drawLandmarks = async (landmarks, imageSrc) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = await loadImage(imageSrc);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw landmarks
    for (const landmark of landmarks) {
      ctx.beginPath();
      ctx.arc(
        landmark.x * canvas.width,
        landmark.y * canvas.height,
        4,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "red";
      ctx.fill();
    }
  };

  // Reset sequence
  const resetSequence = () => {
    setCurrentStep(0);
    setCapturedPhotos({});
    setIsSequenceComplete(false);
    setResults(null);
  };

  // Check if user profile is complete
  const isProfileComplete = userHeight && userWeight && userGender;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h1>Body Measurement Demo - Multi Photo</h1>

      {/* User Profile Section */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <h3>Your Profile</h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <label>Height (cm): </label>
            <input
              type="number"
              value={userHeight}
              onChange={(e) => setUserHeight(e.target.value)}
              placeholder="175"
            />
          </div>
          <div>
            <label>Weight (kg): </label>
            <input
              type="number"
              value={userWeight}
              onChange={(e) => setUserWeight(e.target.value)}
              placeholder="70"
            />
          </div>
          <div>
            <label>Gender: </label>
            <select
              value={userGender}
              onChange={(e) => setUserGender(e.target.value)}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label>Age: </label>
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
          Please complete your profile above to continue.
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
                  width={320}
                  height={400}
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
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                {Object.entries(capturedPhotos).map(([stepId, imageSrc]) => (
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
                ))}
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <button
                  onClick={processAllPhotos}
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
          {results.error ? (
            <div
              style={{
                color: "red",
                padding: 16,
                backgroundColor: "#f8d7da",
                borderRadius: 8,
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                {results.error}
              </div>
              {results.errorMessage && (
                <div style={{ fontSize: 12, marginBottom: 12, opacity: 0.7 }}>
                  Technical details: {results.errorMessage}
                </div>
              )}
              {results.suggestions && (
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
                    {results.suggestions.map((suggestion, index) => (
                      <li key={index} style={{ marginBottom: 4, fontSize: 13 }}>
                        {suggestion}
                      </li>
                    ))}
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
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
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
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={400}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                  }}
                />
                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                  Red dots show detected body landmarks
                </div>
              </div>

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
    </div>
  );
};

export default App;
