// All measurement calculation functions extracted from App.jsx
// Exports: processFrontView, processBackView, processSideView, processArmsExtended, processLegsApart, calculateCircumferences, calculateMultiAngleMeasurements

import {
  pixelToCm,
  getDistance,
  estimateCircumference,
  estimateBiceps,
  estimateThigh,
  estimateCalf,
  calculateLandmarkConfidence,
  getConfidenceDisplay,
} from '../utils/measurement';

const calculateMultiAngleMeasurements = (processedResults, userProfile) => {
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

const processFrontView = (landmarks, userProfile) => {
  const imageSize = { width: 320, height: 400 };
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  const lWrist = landmarks[15];
  const rWrist = landmarks[16];
  const lHip = landmarks[23];
  const rHip = landmarks[24];
  const lAnkle = landmarks[27];
  const rAnkle = landmarks[28];
  const top = landmarks[0]; // Nose/head
  const ankle = lAnkle && rAnkle ? (lAnkle.y > rAnkle.y ? lAnkle : rAnkle) : lAnkle || rAnkle;
  const poseHeight = Math.abs(top.y - ankle.y);
  const shoulderPx = getDistance(
    { x: lShoulder.x * imageSize.width, y: lShoulder.y * imageSize.height },
    { x: rShoulder.x * imageSize.width, y: rShoulder.y * imageSize.height }
  );
  const hipPx = getDistance(
    { x: lHip.x * imageSize.width, y: lHip.y * imageSize.height },
    { x: rHip.x * imageSize.width, y: rHip.y * imageSize.height }
  );
  const waistPx = shoulderPx * 0.8;
  const leftArmPx = getDistance(
    { x: lShoulder.x * imageSize.width, y: lShoulder.y * imageSize.height },
    { x: lWrist.x * imageSize.width, y: lWrist.y * imageSize.height }
  );
  const rightArmPx = getDistance(
    { x: rShoulder.x * imageSize.width, y: rShoulder.y * imageSize.height },
    { x: rWrist.x * imageSize.width, y: rWrist.y * imageSize.height }
  );
  const armLengthPx = Math.max(leftArmPx, rightArmPx);
  const leftLegPx = getDistance(
    { x: lHip.x * imageSize.width, y: lHip.y * imageSize.height },
    { x: lAnkle.x * imageSize.width, y: lAnkle.y * imageSize.height }
  );
  const rightLegPx = getDistance(
    { x: rHip.x * imageSize.width, y: rHip.y * imageSize.height },
    { x: rAnkle.x * imageSize.width, y: rAnkle.y * imageSize.height }
  );
  const legLengthPx = Math.max(leftLegPx, rightLegPx);
  const shoulderWidth = pixelToCm(shoulderPx, imageSize.height, userProfile.height, poseHeight);
  const hipWidth = pixelToCm(hipPx, imageSize.height, userProfile.height, poseHeight);
  const waistWidth = pixelToCm(waistPx, imageSize.height, userProfile.height, poseHeight);
  const armLength = pixelToCm(armLengthPx, imageSize.height, userProfile.height, poseHeight);
  const legLength = pixelToCm(legLengthPx, imageSize.height, userProfile.height, poseHeight);
  const chestPx = shoulderPx * 0.85;
  const chestWidth = pixelToCm(chestPx, imageSize.height, userProfile.height, poseHeight);
  const shoulderConfidence = getConfidenceDisplay(calculateLandmarkConfidence(landmarks, [11, 12]));
  const hipConfidence = getConfidenceDisplay(calculateLandmarkConfidence(landmarks, [23, 24]));
  const armConfidence = getConfidenceDisplay(calculateLandmarkConfidence(landmarks, [11, 12, 15, 16]));
  const legConfidence = getConfidenceDisplay(calculateLandmarkConfidence(landmarks, [23, 24, 27, 28]));
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
      confidence: shoulderConfidence.score * 0.9,
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
      value: (armLength * 0.95).toFixed(1),
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
      value: (legLength * 0.92).toFixed(1),
      confidence: legConfidence.score * 0.9,
      confidencePercentage: Math.round(legConfidence.percentage * 0.9),
      confidenceLabel: legConfidence.percentage > 70 ? "medium" : "low",
      source: "front_view_estimated",
      unit: "cm",
    },
  };
};

const processBackView = (landmarks, userProfile) => {
  const imageSize = { width: 320, height: 400 };
  const nose = landmarks[0];
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  const lHip = landmarks[23];
  const rHip = landmarks[24];
  const neckY = nose.y + (lShoulder.y - nose.y) * 0.8;
  const waistY = (lShoulder.y + (lHip.y + rHip.y) / 2) / 2;
  const backLengthPx = Math.abs(waistY - neckY) * imageSize.height;
  const lAnkle = landmarks[27];
  const rAnkle = landmarks[28];
  const ankle = lAnkle && rAnkle ? (lAnkle.y > rAnkle.y ? lAnkle : rAnkle) : lAnkle || rAnkle;
  const poseHeight = Math.abs(nose.y - ankle.y);
  const backLength = pixelToCm(backLengthPx, imageSize.height, userProfile.height, poseHeight);
  const shoulderBladePx = getDistance(
    { x: lShoulder.x * imageSize.width, y: lShoulder.y * imageSize.height },
    { x: rShoulder.x * imageSize.width, y: rShoulder.y * imageSize.height }
  );
  const shoulderBladeWidth = pixelToCm(shoulderBladePx, imageSize.height, userProfile.height, poseHeight);
  const backConfidence = getConfidenceDisplay(calculateLandmarkConfidence(landmarks, [0, 11, 12, 23, 24]));
  const shoulderBladeConfidence = getConfidenceDisplay(calculateLandmarkConfidence(landmarks, [11, 12]));
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

const processSideView = (landmarks) => {
  const imageSize = { width: 320, height: 400 };
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const shoulderDepth = Math.abs(leftShoulder.x - rightShoulder.x) * imageSize.width;
  const hipDepth = Math.abs(leftHip.x - rightHip.x) * imageSize.width;
  const chestDepth = shoulderDepth * 1.1;
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

const processArmsExtended = (landmarks, userProfile) => {
  const imageSize = { width: 320, height: 400 };
  const bicepsResult = estimateBiceps(landmarks, userProfile);
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
    const armSpanCm = (armSpanPx / imageSize.width) * userProfile.height * 1.1;
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

const processLegsApart = (landmarks, userProfile) => {
  const imageSize = { width: 320, height: 400 };
  const thighResult = estimateThigh(landmarks, userProfile, imageSize);
  const calfResult = estimateCalf(landmarks, userProfile, imageSize, thighResult);
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

const calculateCircumferences = (frontLandmarks, sideLandmarks, userProfile) => {
  const frontMeasurements = processFrontView(frontLandmarks, userProfile);
  const sideMeasurements = processSideView(sideLandmarks);
  const chestCirc = estimateCircumference(
    Number(frontMeasurements.shoulderWidth.value),
    Number(sideMeasurements.chestDepth.value) * 0.1,
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

export {
  processFrontView,
  processBackView,
  processSideView,
  processArmsExtended,
  processLegsApart,
  calculateCircumferences,
  calculateMultiAngleMeasurements,
}; 