import { useState, useCallback } from 'react';
import { initializePoseDetection, detectPose } from '../utils/poseDetection';

export default function usePoseDetection() {
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [error, setError] = useState(null);
  const [detector, setDetector] = useState(null);
  const [method, setMethod] = useState(null);

  // Initialize pose detection (MediaPipe/TF.js)
  const initialize = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { detector: det, method: m } = await initializePoseDetection();
      setDetector(det);
      setMethod(m);
      setStatus('ready');
      return { detector: det, method: m };
    } catch (err) {
      setError(err.message || 'Failed to initialize pose detection');
      setStatus('error');
      return null;
    }
  }, []);

  // Run pose detection on an image
  const runDetectPose = useCallback(
    async (imageElement) => {
      if (!detector || !method) throw new Error('Pose detector not initialized');
      return await detectPose(detector, method, imageElement);
    },
    [detector, method]
  );

  return {
    status,
    error,
    detector,
    method,
    initialize,
    detectPose: runDetectPose,
  };
} 