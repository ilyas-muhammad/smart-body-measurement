// Convert pixel distance to real-world cm using user height and pose height
export function pixelToCm(pixelDistance, imageHeight, userHeightCm, poseHeight) {
  const pixelsPerCm = (imageHeight * poseHeight) / userHeightCm;
  return pixelDistance / pixelsPerCm;
}

// Calculate Euclidean distance between two points
export function getDistance(p1, p2) {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2)
  );
}

// Anthropometric ratios for circumference estimation
export const ANTHROPOMETRIC_RATIOS = {
  male: {
    chest: { frontToDepth: 0.88, bmiCoeff: 0.015, widthToCirc: 2.8 },
    waist: { frontToDepth: 0.85, bmiCoeff: 0.020, widthToCirc: 2.6 },
    hips: { frontToDepth: 0.90, bmiCoeff: 0.012, widthToCirc: 2.4 },
    neck: { shoulderRatio: 0.38, bmiCoeff: 0.008 },
    biceps: { armWidthRatio: 0.65, bmiCoeff: 0.020 },
    thigh: { hipRatio: 0.72, bmiCoeff: 0.025 },
    calf: { thighRatio: 0.68, bmiCoeff: 0.015 }
  },
  female: {
    chest: { frontToDepth: 0.85, bmiCoeff: 0.018, widthToCirc: 2.6 },
    waist: { frontToDepth: 0.82, bmiCoeff: 0.025, widthToCirc: 2.4 },
    hips: { frontToDepth: 0.95, bmiCoeff: 0.010, widthToCirc: 2.8 },
    neck: { shoulderRatio: 0.35, bmiCoeff: 0.006 },
    biceps: { armWidthRatio: 0.60, bmiCoeff: 0.018 },
    thigh: { hipRatio: 0.75, bmiCoeff: 0.028 },
    calf: { thighRatio: 0.65, bmiCoeff: 0.012 }
  }
};

// Calculate ellipse circumference approximation
export function calculateEllipseCircumference(semiMajor, semiMinor) {
  const h = Math.pow(semiMajor - semiMinor, 2) / Math.pow(semiMajor + semiMinor, 2);
  return Math.PI * (semiMajor + semiMinor) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

// Estimate circumference from front width and depth
export function estimateCircumference(frontWidth, sideDepth, bodyPart, userProfile) {
  const ratios = ANTHROPOMETRIC_RATIOS[userProfile.gender];
  
  if (!ratios || !ratios[bodyPart]) {
    return { value: 0, confidence: 0, error: 'Invalid body part or gender' };
  }
  
  const partRatios = ratios[bodyPart];
  
  // Adjust depth based on anthropometric ratios and BMI
  const bmiAdjustment = (userProfile.bmi - 22) * partRatios.bmiCoeff;
  const adjustedDepth = sideDepth || (frontWidth * partRatios.frontToDepth);
  const finalDepth = adjustedDepth * (1 + bmiAdjustment);
  
  // Calculate ellipse circumference
  const circumference = calculateEllipseCircumference(frontWidth / 2, finalDepth / 2);
  
  return {
    value: circumference,
    confidence: sideDepth ? 0.8 : 0.6, // Higher confidence with actual side measurement
    method: sideDepth ? 'dual_view' : 'estimated_depth'
  };
}

// Convert confidence score (0-1) to percentage and label
export function getConfidenceDisplay(confidenceScore) {
  const percentage = Math.round(confidenceScore * 100);
  let label;
  
  if (percentage >= 80) {
    label = 'high';
  } else if (percentage >= 60) {
    label = 'medium';
  } else {
    label = 'low';
  }
  
  return {
    percentage,
    label,
    score: confidenceScore
  };
}

// Calculate biceps circumference from arm measurements
export function estimateBiceps(landmarks, userProfile, imageSize) {
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftElbow = landmarks[13];
  const rightElbow = landmarks[14];
  
  // Calculate upper arm width (use larger arm for measurement)
  const leftArmWidth = Math.abs((leftShoulder.x - leftElbow.x) * imageSize.width);
  const rightArmWidth = Math.abs((rightShoulder.x - rightElbow.x) * imageSize.width);
  const armWidth = Math.max(leftArmWidth, rightArmWidth);
  
  const ratios = ANTHROPOMETRIC_RATIOS[userProfile.gender];
  if (!ratios) return { value: 0, confidence: 0, error: 'Invalid gender' };
  
  // Convert to real-world measurement (this needs proper scaling)
  const shoulderWidth = getDistance(
    { x: leftShoulder.x * imageSize.width, y: leftShoulder.y * imageSize.height },
    { x: rightShoulder.x * imageSize.width, y: rightShoulder.y * imageSize.height }
  );
  
  // Scale arm width relative to shoulder width
  const armWidthCm = (armWidth / shoulderWidth) * (userProfile.height * 0.25); // Approximate shoulder width as 25% of height
  
  // Apply anthropometric ratio for biceps
  const bmiAdjustment = (userProfile.bmi - 22) * ratios.biceps.bmiCoeff;
  const bicepsCircumference = armWidthCm * ratios.biceps.armWidthRatio * (1 + bmiAdjustment);
  
  // Calculate confidence based on landmark visibility and arm pose
  const armConfidence = calculateLandmarkConfidence(landmarks, [11, 12, 13, 14]);
  const confidenceDisplay = getConfidenceDisplay(armConfidence * 0.7); // Reduce confidence for estimation
  
  return {
    value: bicepsCircumference,
    confidence: confidenceDisplay.score,
    confidencePercentage: confidenceDisplay.percentage,
    confidenceLabel: confidenceDisplay.label,
    method: 'arm_width_estimation'
  };
}

// Calculate thigh circumference from hip and leg measurements
export function estimateThigh(landmarks, userProfile, imageSize) {
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  
  // Calculate hip width
  const hipWidth = getDistance(
    { x: leftHip.x * imageSize.width, y: leftHip.y * imageSize.height },
    { x: rightHip.x * imageSize.width, y: rightHip.y * imageSize.height }
  );
  
  // Calculate thigh width (distance from hip to opposite knee, approximating thigh width)
  const leftThighWidth = Math.abs((leftHip.x - leftKnee.x) * imageSize.width);
  const rightThighWidth = Math.abs((rightHip.x - rightKnee.x) * imageSize.width);
  const thighWidth = Math.max(leftThighWidth, rightThighWidth);
  
  const ratios = ANTHROPOMETRIC_RATIOS[userProfile.gender];
  if (!ratios) return { value: 0, confidence: 0, error: 'Invalid gender' };
  
  // Scale thigh width relative to hip width  
  const hipWidthCm = (hipWidth / imageSize.width) * userProfile.height * 0.20; // Approximate
  const thighWidthCm = (thighWidth / hipWidth) * hipWidthCm;
  
  // Apply anthropometric ratio
  const bmiAdjustment = (userProfile.bmi - 22) * ratios.thigh.bmiCoeff;
  const thighCircumference = thighWidthCm * ratios.thigh.hipRatio * (1 + bmiAdjustment);
  
  // Calculate confidence based on landmark visibility
  const legConfidence = calculateLandmarkConfidence(landmarks, [23, 24, 25, 26]);
  const confidenceDisplay = getConfidenceDisplay(legConfidence * 0.6); // Reduce confidence for estimation
  
  return {
    value: thighCircumference,
    confidence: confidenceDisplay.score,
    confidencePercentage: confidenceDisplay.percentage,
    confidenceLabel: confidenceDisplay.label,
    method: 'hip_to_thigh_estimation'
  };
}

// Calculate calf circumference from knee and ankle measurements
export function estimateCalf(landmarks, userProfile, imageSize, thighMeasurement) {
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];
  const leftAnkle = landmarks[27];
  const rightAnkle = landmarks[28];
  
  // Calculate leg width at calf level (approximate as 1/3 down from knee)
  const leftCalfWidth = Math.abs((leftKnee.x - leftAnkle.x) * imageSize.width) * 0.7; // Calf is narrower
  const rightCalfWidth = Math.abs((rightKnee.x - rightAnkle.x) * imageSize.width) * 0.7;
  const calfWidth = Math.max(leftCalfWidth, rightCalfWidth);
  
  const ratios = ANTHROPOMETRIC_RATIOS[userProfile.gender];
  if (!ratios) return { value: 0, confidence: 0, error: 'Invalid gender' };
  
  // Use thigh measurement as reference if available
  let calfCircumference;
  let baseConfidence = 0.5;
  
  if (thighMeasurement && thighMeasurement.value) {
    calfCircumference = thighMeasurement.value * ratios.calf.thighRatio;
    baseConfidence = Math.min(thighMeasurement.confidence * 0.9, 0.8); // Slightly lower than thigh
  } else {
    // Fallback to direct calculation
    const kneeWidth = getDistance(
      { x: leftKnee.x * imageSize.width, y: leftKnee.y * imageSize.height },
      { x: rightKnee.x * imageSize.width, y: rightKnee.y * imageSize.height }
    );
    const calfWidthCm = (calfWidth / kneeWidth) * userProfile.height * 0.15; // Approximate
    calfCircumference = calfWidthCm * 2.2; // Basic ratio
    baseConfidence = 0.4;
  }
  
  // Apply BMI adjustment
  const bmiAdjustment = (userProfile.bmi - 22) * ratios.calf.bmiCoeff;
  calfCircumference *= (1 + bmiAdjustment);
  
  const confidenceDisplay = getConfidenceDisplay(baseConfidence);
  
  return {
    value: calfCircumference,
    confidence: confidenceDisplay.score,
    confidencePercentage: confidenceDisplay.percentage,
    confidenceLabel: confidenceDisplay.label,
    method: thighMeasurement ? 'thigh_ratio' : 'direct_estimation'
  };
}

// Get landmark positions scaled to image size
export function getScaledLandmarkPosition(landmark, imageSize) {
  return {
    x: landmark.x * imageSize.width,
    y: landmark.y * imageSize.height
  };
}

// Calculate confidence score based on landmark visibility
export function calculateLandmarkConfidence(landmarks, requiredLandmarks) {
  let totalConfidence = 0;
  let count = 0;
  
  for (const landmarkIndex of requiredLandmarks) {
    if (landmarks[landmarkIndex]) {
      const landmark = landmarks[landmarkIndex];
      const visibility = landmark.visibility || 0.5; // Default if visibility not available
      totalConfidence += visibility;
      count++;
    }
  }
  
  return count > 0 ? totalConfidence / count : 0;
} 