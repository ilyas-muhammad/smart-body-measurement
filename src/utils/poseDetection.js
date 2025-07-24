// poseDetection.js
// MediaPipe Tasks API (PoseLandmarker) + TensorFlow.js fallback

import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

let detector = null;
let method = null;

// MediaPipe Tasks API initialization
async function createMediaPipePoseLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU",
    },
    runningMode: "IMAGE", // or "VIDEO" for webcam
    numPoses: 1,
  });
  return poseLandmarker;
}

// TensorFlow.js MoveNet initialization
async function createMoveNetDetector() {
  const tf = await import("@tensorflow/tfjs");
  const poseDetection = await import("@tensorflow-models/pose-detection");
  await tf.ready();
  const model = poseDetection.SupportedModels.MoveNet;
  const detector = await poseDetection.createDetector(model, {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  });
  return detector;
}

// Unified initialization: tries MediaPipe Tasks API, then TensorFlow.js
export async function initializePoseDetection() {
  if (detector && method) return { detector, method };
  // Try MediaPipe Tasks API first
  try {
    const poseLandmarker = await createMediaPipePoseLandmarker();
    detector = poseLandmarker;
    method = "mediapipe-tasks";
    return { detector, method };
  } catch (err) {
    console.warn("MediaPipe Tasks API failed:", err.message);
  }
  // Try TensorFlow.js MoveNet
  try {
    const tfDetector = await createMoveNetDetector();
    detector = tfDetector;
    method = "tensorflow";
    return { detector, method };
  } catch (err) {
    console.warn("TensorFlow.js MoveNet failed:", err.message);
  }
  throw new Error(
    "Failed to initialize pose detection: Both MediaPipe Tasks API and TensorFlow.js failed."
  );
}

// Unified pose detection function
export async function detectPose(detector, method, imageElement) {
  if (method === "mediapipe-tasks") {
    // MediaPipe Tasks API processing
    const result = await detector.detect(imageElement);
    // result.landmarks is an array of poses (usually 1)
    return {
      landmarks: result.landmarks[0] || [],
      method: "mediapipe-tasks",
    };
  } else if (method === "tensorflow") {
    // TensorFlow.js processing
    const poses = await detector.estimatePoses(imageElement);
    if (poses && poses.length > 0 && poses[0].keypoints) {
      const landmarks = convertTensorFlowToMediaPipe(poses[0].keypoints);
      return {
        landmarks,
        method: "tensorflow",
      };
    } else {
      throw new Error("No pose detected by TensorFlow.js");
    }
  } else {
    throw new Error("Unknown pose detection method");
  }
}

// Convert TensorFlow.js keypoints to MediaPipe landmark format
function convertTensorFlowToMediaPipe(keypoints) {
  const landmarks = new Array(33).fill(null).map(() => ({ x: 0, y: 0, z: 0, visibility: 0 }));
  const keypointMapping = {
    nose: 0,
    left_eye: 2,
    right_eye: 5,
    left_ear: 7,
    right_ear: 8,
    left_shoulder: 11,
    right_shoulder: 12,
    left_elbow: 13,
    right_elbow: 14,
    left_wrist: 15,
    right_wrist: 16,
    left_hip: 23,
    right_hip: 24,
    left_knee: 25,
    right_knee: 26,
    left_ankle: 27,
    right_ankle: 28,
  };
  keypoints.forEach((keypoint) => {
    const mediapipeIndex = keypointMapping[keypoint.name];
    if (mediapipeIndex !== undefined) {
      landmarks[mediapipeIndex] = {
        x: keypoint.x,
        y: keypoint.y,
        z: 0,
        visibility: keypoint.score || 0.5,
      };
    }
  });
  return landmarks;
} 