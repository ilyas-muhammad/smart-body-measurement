
// curl -X 'POST' \
//   'https://sbsm-api.onrender.com/measurement-sync' \
//   -H 'accept: application/json' \
//   -H 'Content-Type: application/json' \
//   -d '{
//   "user_profile": {
//       "timestamp": "2025-08-07T06:40:40.906Z",
//       "user_id": "165-52",
//       "user_height": 165,
//       "user_weight": 52
//   },
//   "measurement": {
//       "type": "shoulderWidth",
//       "value": 32.6,
//       "confidence_score": 0.9936666489,
//       "confidence_percentage": 99,
//       "confidence_label": "high",
//       "source": "front_view",
//       "method": "front_view",
//       "unit": "cm"
//     }
// }'
async function storeMeasurements(measurement, userProfile) {
  const body = {
    user_profile: {
        timestamp: new Date().toISOString(),
        user_id: `${userProfile.height}-${userProfile.weight}`,
        user_height: userProfile.height,
        user_weight: userProfile.weight,
    },
    measurement: {
        type: measurement.type,
        value: measurement.value,
        confidence_score: measurement.confidenceScore,
        confidence_percentage: measurement.confidencePercentage,
        confidence_label: measurement.confidenceLabel,
        source: measurement.source || "front_view",
        method: measurement.method || "front_view",
        unit: measurement.unit || "cm",
    },
  }

  const response = await fetch("https://sbsm-api.onrender.com/measurement-sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to store measurements");
  }

  return true;
}

export { storeMeasurements };