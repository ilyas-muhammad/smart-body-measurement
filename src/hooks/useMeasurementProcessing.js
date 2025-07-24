import { useState, useCallback } from 'react';
import usePoseDetection from './usePoseDetection';
import { calculateMultiAngleMeasurements } from '../logic/measurementCalculations';

export default function useMeasurementProcessing() {
  const { initialize, detectPose, status: poseStatus, error: poseError } = usePoseDetection();
  const [results, setResults] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Process all captured photos
  const processAll = useCallback(
    async (capturedPhotos, userProfile, loadImage) => {
      setProcessing(true);
      setResults(null);
      setError(null);
      try {
        // Ensure pose detection is ready
        let poseReady = poseStatus === 'ready';
        let detectorObj = null;
        if (!poseReady) {
          detectorObj = await initialize();
          poseReady = detectorObj && detectorObj.detector;
        }
        if (!poseReady) throw new Error('Pose detector not initialized');
        const processedResults = {};
        for (const [stepId, imageSrc] of Object.entries(capturedPhotos)) {
          try {
            const img = await loadImage(imageSrc);
            const poseResults = await detectPose(img);
            if (poseResults && poseResults.landmarks && poseResults.landmarks.length > 0) {
              processedResults[stepId] = {
                landmarks: poseResults.landmarks,
                image: img,
                imageSrc: imageSrc,
                method: poseResults.method,
              };
            }
          } catch (stepError) {
            // Continue with other photos even if one fails
            console.error('Error processing step', stepId, stepError);
          }
        }
        if (Object.keys(processedResults).length === 0) {
          throw new Error('No pose landmarks detected in any photos.');
        }
        const measurements = calculateMultiAngleMeasurements(processedResults, userProfile);
        setResults(measurements);
      } catch (err) {
        setError(err.message || 'Processing failed.');
      }
      setProcessing(false);
    },
    [detectPose, initialize, poseStatus]
  );

  return {
    processAll,
    results,
    processing,
    error: error || poseError,
  };
} 