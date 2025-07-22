# Body Measurement App - Technical Specification & PRD

## 1. Product Overview

### 1.1 Product Name
**SmartFit** - AI-powered body measurement system for accurate clothing size recommendations

### 1.2 Product Description
A web-based application that uses computer vision and machine learning to measure body dimensions from photos and recommend clothing sizes. The system uses MediaPipe for pose detection and implements estimation algorithms for measurements that cannot be directly observed from 2D images.

### 1.3 Core Value Proposition
- Eliminate size uncertainty in online clothing shopping
- Reduce return rates due to poor fit
- Provide accurate measurements without physical contact or special equipment

### 1.4 Target Users
- Primary: Online shoppers buying clothing
- Secondary: E-commerce platforms needing size recommendation solutions
- Tertiary: Clothing brands wanting to reduce returns

## 2. Functional Requirements

### 2.1 User Registration & Profile
- **FR-001**: System shall allow users to create accounts with email/password
- **FR-002**: System shall store user demographic data (age, gender, height, weight)
- **FR-003**: System shall maintain measurement history per user
- **FR-004**: System shall allow guest mode with temporary session storage

### 2.2 Photo Capture & Upload
- **FR-005**: System shall support camera capture directly from browser
- **FR-006**: System shall support file upload (JPEG, PNG, max 10MB)
- **FR-007**: System shall provide visual guides for proper photo positioning
- **FR-008**: System shall validate image quality before processing
- **FR-009**: System shall support both single photo (front) and dual photo (front + side) modes

### 2.3 Measurement Processing
- **FR-010**: System shall detect human pose using MediaPipe
- **FR-011**: System shall extract key body landmarks (33 points)
- **FR-012**: System shall calculate direct measurements (height ratios, shoulder width, arm length)
- **FR-013**: System shall estimate circumference measurements using anthropometric models
- **FR-014**: System shall provide confidence scores for each measurement

### 2.4 Size Recommendation
- **FR-015**: System shall map measurements to brand-specific size charts
- **FR-016**: System shall consider user fit preferences (tight/regular/loose)
- **FR-017**: System shall provide size recommendations for different garment types
- **FR-018**: System shall show measurement comparison with size chart

### 2.5 Results & History
- **FR-019**: System shall display all measurements in metric (cm) and imperial (inches)
- **FR-020**: System shall allow users to save measurement sessions
- **FR-021**: System shall track measurement changes over time
- **FR-022**: System shall export measurements as PDF/JSON

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-001**: Photo processing shall complete within 5 seconds
- **NFR-002**: System shall handle 100 concurrent users
- **NFR-003**: API response time shall be < 200ms (excluding ML processing)
- **NFR-004**: Client-side pose detection shall run at 30+ FPS

### 3.2 Accuracy
- **NFR-005**: Direct measurements shall be within ±2cm accuracy
- **NFR-006**: Circumference estimates shall be within ±5cm accuracy
- **NFR-007**: Size recommendations shall be correct 85%+ of the time

### 3.3 Usability
- **NFR-008**: System shall work on mobile and desktop browsers
- **NFR-009**: System shall support Chrome, Safari, Firefox, Edge (latest 2 versions)
- **NFR-010**: System shall be accessible (WCAG 2.1 AA compliant)
- **NFR-011**: System shall provide clear error messages and guidance

### 3.4 Security & Privacy
- **NFR-012**: System shall encrypt all data in transit (HTTPS)
- **NFR-013**: System shall not store photos after processing (privacy mode)
- **NFR-014**: System shall hash and salt all passwords
- **NFR-015**: System shall comply with GDPR/data protection requirements

### 3.5 Scalability
- **NFR-016**: System architecture shall support horizontal scaling
- **NFR-017**: System shall use CDN for static assets
- **NFR-018**: System shall implement caching for size charts

## 4. Technical Architecture

### 4.1 System Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Frontend (SPA) │────▶│  API Gateway     │────▶│  Backend API    │
│  React/Vue      │     │  (nginx/Kong)    │     │  Node.js/Python │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                           │
                    ┌──────────────────────────────────────┼────────┐
                    │                                      │        │
                    ▼                ▼                     ▼        ▼
            ┌──────────────┐ ┌──────────────┐   ┌──────────────┐ ┌──────────────┐
            │              │ │              │   │              │ │              │
            │  PostgreSQL  │ │    Redis     │   │  MediaPipe   │ │   S3/CDN     │
            │  (User Data) │ │   (Cache)    │   │   Service    │ │  (Assets)    │
            │              │ │              │   │              │ │              │
            └──────────────┘ └──────────────┘   └──────────────┘ └──────────────┘
```

### 4.2 Technology Stack

#### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: Zustand or Redux Toolkit
- **UI Library**: Material-UI or Tailwind CSS
- **Camera Integration**: react-webcam
- **ML Integration**: MediaPipe JavaScript SDK
- **HTTP Client**: Axios
- **Build Tool**: Vite

#### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+
- **File Storage**: AWS S3 or compatible
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi or Zod
- **ORM**: Prisma or TypeORM

#### ML/Computer Vision
- **Pose Detection**: MediaPipe Pose
- **Image Processing**: Sharp (Node.js) or OpenCV
- **Measurement Calculation**: Custom algorithms
- **3D Reconstruction** (Phase 2): SMPL model via Python service

#### DevOps
- **Container**: Docker
- **Orchestration**: Kubernetes or Docker Compose
- **CI/CD**: GitHub Actions or GitLab CI
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack or CloudWatch
- **API Gateway**: Kong or AWS API Gateway

## 5. Data Models

### 5.1 User Model
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique
  passwordHash: string;
  profile: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    gender: 'male' | 'female' | 'other';
    height: number;              // cm
    weight: number;              // kg
    fitPreference: 'tight' | 'regular' | 'loose';
    preferredUnits: 'metric' | 'imperial';
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2 Measurement Session Model
```typescript
interface MeasurementSession {
  id: string;                    // UUID
  userId?: string;               // Null for guest users
  sessionType: 'single' | 'dual' | '3d';
  photos: {
    front?: PhotoData;
    side?: PhotoData;
    additional?: PhotoData[];
  };
  measurements: Measurements;
  metadata: {
    deviceType: string;
    browserInfo: string;
    processingTime: number;      // milliseconds
    mlModelVersion: string;
  };
  createdAt: Date;
}

interface PhotoData {
  id: string;
  type: 'front' | 'side' | 'angle_45' | 'angle_90' | etc;
  dimensions: { width: number; height: number };
  landmarks?: MediaPipeLandmarks;
  processedAt: Date;
}
```

### 5.3 Measurements Model
```typescript
interface Measurements {
  // Direct measurements (from pose)
  height: MeasurementValue;
  shoulderWidth: MeasurementValue;
  armLength: MeasurementValue;
  torsoLength: MeasurementValue;
  inseam: MeasurementValue;
  
  // Estimated measurements
  neck: MeasurementValue;
  chest: MeasurementValue;
  waist: MeasurementValue;
  hips: MeasurementValue;
  bicep: MeasurementValue;
  thigh: MeasurementValue;
  
  // Calculated metrics
  bmi: number;
  bodyType: 'ectomorph' | 'mesomorph' | 'endomorph';
  posture: 'normal' | 'forward_lean' | 'backward_lean';
}

interface MeasurementValue {
  value: number;                 // cm
  confidence: number;            // 0-1
  method: 'direct' | 'estimated' | 'ml_predicted';
}
```

### 5.4 Size Recommendation Model
```typescript
interface SizeRecommendation {
  id: string;
  sessionId: string;
  brandId: string;
  garmentType: 'tshirt' | 'shirt' | 'pants' | 'dress' | 'jacket';
  recommendations: {
    size: string;                // 'M', 'L', '32', etc.
    confidence: number;          // 0-1
    fit: 'too_small' | 'perfect' | 'too_large';
    alternativeSizes?: string[];
    notes?: string[];
  };
  sizeChartComparison: {
    measurement: string;
    userValue: number;
    sizeChartRange: [number, number];
    status: 'below' | 'within' | 'above';
  }[];
}
```

### 5.5 Brand Size Chart Model
```typescript
interface BrandSizeChart {
  id: string;
  brandName: string;
  garmentType: string;
  gender: 'male' | 'female' | 'unisex';
  region: 'US' | 'EU' | 'UK' | 'ASIA';
  sizes: {
    [sizeName: string]: {
      chest?: [number, number];  // min, max in cm
      waist?: [number, number];
      hips?: [number, number];
      shoulder?: [number, number];
      length?: [number, number];
      // ... other measurements
    };
  };
  fitNotes?: string;
  lastUpdated: Date;
}
```

## 6. API Specifications

### 6.1 RESTful Endpoints

#### Authentication
```typescript
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
```

#### User Management
```typescript
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/users/account
GET    /api/users/measurements/history
```

#### Measurement Processing
```typescript
POST   /api/measurements/process
GET    /api/measurements/session/:sessionId
DELETE /api/measurements/session/:sessionId
```

#### Size Recommendations
```typescript
POST   /api/sizes/recommend
GET    /api/sizes/brands
GET    /api/sizes/chart/:brandId/:garmentType
```

### 6.2 Key API Examples

#### Process Measurement Request
```typescript
POST /api/measurements/process
Content-Type: multipart/form-data

{
  "photos": {
    "front": File,
    "side": File    // optional
  },
  "userData": {
    "height": 175,
    "weight": 70,
    "gender": "male",
    "age": 30
  },
  "preferences": {
    "fitPreference": "regular",
    "units": "metric"
  },
  "options": {
    "saveToProfile": true,
    "includeConfidence": true
  }
}
```

#### Process Measurement Response
```typescript
{
  "success": true,
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "measurements": {
    "shoulderWidth": {
      "value": 45.2,
      "confidence": 0.92,
      "unit": "cm"
    },
    "chest": {
      "value": 96.5,
      "confidence": 0.78,
      "unit": "cm"
    },
    // ... other measurements
  },
  "processingTime": 3240,
  "warnings": [
    "Side photo not provided, using estimation for depth measurements"
  ]
}
```

## 7. Core Algorithms

### 7.1 Pixel to Real-World Conversion
```typescript
function pixelToRealWorld(
  pixelDistance: number,
  imageHeight: number,
  userHeightCm: number,
  poseHeight: number  // in normalized coordinates
): number {
  const pixelsPerCm = (imageHeight * poseHeight) / userHeightCm;
  return pixelDistance / pixelsPerCm;
}
```

### 7.2 Circumference Estimation
```typescript
function estimateCircumference(
  frontWidth: number,
  bodyPart: 'chest' | 'waist' | 'hips',
  gender: 'male' | 'female',
  bmi: number
): number {
  // Anthropometric ratios based on research
  const depthRatios = {
    male: {
      chest: { base: 0.88, bmiAdjust: 0.015 },
      waist: { base: 0.85, bmiAdjust: 0.020 },
      hips: { base: 0.90, bmiAdjust: 0.012 }
    },
    female: {
      chest: { base: 0.85, bmiAdjust: 0.018 },
      waist: { base: 0.82, bmiAdjust: 0.025 },
      hips: { base: 0.95, bmiAdjust: 0.010 }
    }
  };
  
  const ratio = depthRatios[gender][bodyPart];
  const depthWidth = frontWidth * (ratio.base + (bmi - 22) * ratio.bmiAdjust);
  
  // Ellipse circumference approximation
  const a = frontWidth / 2;
  const b = depthWidth / 2;
  const h = Math.pow(a - b, 2) / Math.pow(a + b, 2);
  const circumference = Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
  
  return circumference;
}
```

### 7.3 Size Mapping Algorithm
```typescript
function recommendSize(
  measurements: Measurements,
  sizeChart: BrandSizeChart,
  preferences: UserPreferences
): SizeRecommendation {
  const scores: { [size: string]: number } = {};
  
  // Calculate fit score for each size
  for (const [size, ranges] of Object.entries(sizeChart.sizes)) {
    let score = 0;
    let weightedSum = 0;
    
    // Primary measurements (highest weight)
    if (ranges.chest && measurements.chest) {
      const chestScore = calculateFitScore(
        measurements.chest.value,
        ranges.chest,
        preferences.fitPreference
      );
      score += chestScore * 0.4;
      weightedSum += 0.4;
    }
    
    // Secondary measurements
    if (ranges.shoulder && measurements.shoulderWidth) {
      const shoulderScore = calculateFitScore(
        measurements.shoulderWidth.value,
        ranges.shoulder,
        preferences.fitPreference
      );
      score += shoulderScore * 0.3;
      weightedSum += 0.3;
    }
    
    // Normalize score
    scores[size] = weightedSum > 0 ? score / weightedSum : 0;
  }
  
  // Find best matching size
  const sortedSizes = Object.entries(scores)
    .sort(([, a], [, b]) => b - a);
  
  return {
    primarySize: sortedSizes[0][0],
    confidence: sortedSizes[0][1],
    alternatives: sortedSizes.slice(1, 3).map(([size]) => size)
  };
}
```

## 8. Implementation Phases

### Phase 1: MVP (T-Shirt Sizing)
- Basic user registration
- Single photo capture (front view)
- MediaPipe integration
- Simple measurement extraction
- T-shirt size recommendation
- Basic results display

### Phase 2: Enhanced Measurements
- Dual photo mode (front + side)
- Improved circumference estimation
- Multiple garment types
- Measurement history
- Brand-specific sizing

### Phase 3: Advanced Features
- 3D reconstruction option
- Multi-angle capture
- Virtual try-on preview
- Size comparison across brands
- API for third-party integration
- Mobile apps (iOS/Android)

## 9. Testing Requirements

### 9.1 Unit Tests
- Measurement calculation algorithms
- Size mapping logic
- Data validation
- API endpoint handlers

### 9.2 Integration Tests
- MediaPipe integration
- Database operations
- File upload/processing
- Authentication flow

### 9.3 E2E Tests
- Complete user journey
- Photo capture to results
- Multi-browser testing
- Mobile responsiveness

### 9.4 Performance Tests
- Load testing (100+ concurrent users)
- Image processing benchmarks
- API response times
- Database query optimization

### 9.5 Accuracy Testing
- Manual measurement comparison
- Different body types
- Various clothing/poses
- Lighting conditions

## 10. Development Guidelines

### 10.1 Code Standards
- TypeScript strict mode
- ESLint + Prettier configuration
- 100% type coverage
- JSDoc for public APIs

### 10.2 Git Workflow
- Feature branches
- PR reviews required
- Semantic commit messages
- Automated testing on PR

### 10.3 Documentation
- API documentation (OpenAPI/Swagger)
- Component documentation (Storybook)
- Architecture diagrams
- Deployment guides

### 10.4 Security Practices
- Input validation on all endpoints
- Rate limiting
- CORS configuration
- Security headers (Helmet.js)
- Regular dependency updates

## 11. Monitoring & Analytics

### 11.1 Application Metrics
- API response times
- Processing success rate
- Error rates by endpoint
- User session duration

### 11.2 Business Metrics
- Daily active users
- Measurements per user
- Size recommendation accuracy
- Feature adoption rates

### 11.3 ML Model Metrics
- Pose detection confidence
- Measurement accuracy
- Processing time distribution
- Failure case analysis

## 12. Error Handling

### 12.1 Client-Side Errors
- Network failures → Retry with exponential backoff
- Camera access denied → Clear instructions
- Poor image quality → Guidance overlay
- Processing timeout → Cancel and retry option

### 12.2 Server-Side Errors
- Invalid image format → Clear error message
- ML processing failure → Fallback to basic mode
- Database errors → Graceful degradation
- Rate limiting → User-friendly message

### 12.3 Error Codes
```typescript
enum ErrorCode {
  // Client errors (4xx)
  INVALID_IMAGE = 'ERR_INVALID_IMAGE',
  NO_PERSON_DETECTED = 'ERR_NO_PERSON',
  POOR_LIGHTING = 'ERR_POOR_LIGHTING',
  MULTIPLE_PEOPLE = 'ERR_MULTIPLE_PEOPLE',
  
  // Server errors (5xx)
  ML_PROCESSING_FAILED = 'ERR_ML_FAILED',
  DATABASE_ERROR = 'ERR_DATABASE',
  EXTERNAL_SERVICE = 'ERR_EXTERNAL_SERVICE'
}
```

## 13. Future Enhancements

### 13.1 Advanced ML Features
- Body pose correction suggestions
- Automatic background removal
- Clothing detection and adjustment
- Body type classification

### 13.2 User Experience
- AR visualization
- Progressive capture (real-time feedback)
- Voice-guided instructions
- Gamification elements

### 13.3 Business Features
- White-label solution
- Analytics dashboard
- A/B testing framework
- Recommendation engine

### 13.4 Technical Improvements
- Edge computing (on-device processing)
- WebAssembly for performance
- Offline mode support
- Real-time collaboration