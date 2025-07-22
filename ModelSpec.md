[cite_start]The PDF "BlazePose GHUM 3D Model Card.pdf" describes the MediaPipe BlazePose GHUM 3D model, which is a Convolutional Neural Network designed for 3D full body pose estimation in videos. [cite: 1]

Here's a summary of the information extracted from the PDF:

**Model Details:**
* [cite_start]**Model Types:** Lite (3MB), Full (6MB), and Heavy (26MB) models are available. [cite: 1]
* [cite_start]**Purpose:** Estimates the full 3D body pose of an individual in videos captured by smartphones or web cameras. [cite: 1]
* [cite_start]**Optimization:** Optimized for on-device, real-time fitness applications. [cite: 1]
* **Performance:**
    * [cite_start]Lite model: ~44 FPS on CPU (XNNPack TFLite), ~49 FPS on GPU (TFLite GPU) on Pixel 3. [cite: 1]
    * [cite_start]Full model: ~18 FPS on CPU (XNNPack TFLite), ~40 FPS on GPU (TFLite GPU) on Pixel 3. [cite: 1]
    * [cite_start]Heavy model: ~4 FPS on CPU (XNNPack TFLite), ~19 FPS on GPU (TFLite GPU) on Pixel 3. [cite: 1]
* [cite_start]**Output:** Returns 33 keypoints describing the approximate location of body parts, including nose, eyes, ears, mouth, shoulders, elbows, wrists, knuckles, hips, knees, ankles, heels, and foot index. [cite: 1]
* **Keypoint Z-value:** The Z coordinate represents the distance relative to the plane of the subject's hips and is measured in "image pixels." [cite_start]It's obtained by fitting synthetic data (GHUM model) to 2D annotations and is not metric but up to scale. [cite: 1]

**Model Specifications:**
* [cite_start]**Model Type:** Convolutional Neural Network. [cite: 1]
* [cite_start]**Model Architecture:** MobileNetV2-like with customized blocks for real-time performance. [cite: 1]
* [cite_start]**Input(s):** 256x256x3 array representing regions in video frames where a person has been detected, with aligned human full body parts. [cite: 1]
* [cite_start]**Output(s):** 33x5 array corresponding to (x, y, z, visibility, presence). [cite: 1]

**Authors and Citation:**
* [cite_start]**Created by:** Valentin Bazarevsky, Ivan Grishchenko, and Eduard Gabriel Bazavan (all from Google). [cite: 1]
* [cite_start]**Date:** April 16, 2021. [cite: 1]
* [cite_start]**How to cite:** "BlazePose: On-device Real-time Body Pose tracking, CVPR Workshop on Computer Vision for Augmented and Virtual Reality, Seattle, WA, USA, 2020" and "GHUM & GHUML: Generative 3D Human Shape and Articulated Pose Models Proceedings of the IEEE/CVF Conference on Computer Vision and Pattern Recognition, pages 6184-6193, 2020". [cite: 1]

**Intended Uses:**
* [cite_start]**Application:** 3D full body pose estimation for single-person videos on mobile, desktop, and in-browser. [cite: 1]
* [cite_start]**Domain and Users:** Augmented reality, 3D pose and gesture recognition, fitness and repetition counting, and 3D pose measurements (angles/distances). [cite: 1]

**Out-of-Scope Applications:**
* [cite_start]Multiple people in an image. [cite: 1]
* [cite_start]People too far away from the camera (e.g., further than 14 feet/4 meters). [cite: 1]
* [cite_start]Head is not visible. [cite: 1]
* [cite_start]Applications requiring metric accurate depth. [cite: 1]
* [cite_start]Any form of surveillance or identity recognition. [cite: 1]

**Limitations:**
* [cite_start]Tracks only one person if multiple are present. [cite: 1]
* [cite_start]Sensitive to face position, scale, and orientation in the input image. [cite: 1]
* [cite_start]Quality can degrade in extreme environmental conditions (light, noise, motion, face overlapping). [cite: 1]

**Ethical Considerations:**
* [cite_start]**Human Life:** Not intended for human life-critical decisions; primary intended application is entertainment. [cite: 1]
* [cite_start]**Privacy:** Trained and evaluated on consented images (30K) and images capturing fitness poses (85K). [cite: 1]
* [cite_start]**Bias:** Qualitatively evaluated on users with missing limbs and prosthetics, degrading gracefully. [cite: 1]

**Evaluation Results:**
* [cite_start]**Geographical Evaluation:** Detailed evaluation across 14 geographical subregions, gender, and skin tones is presented in tables within the document. [cite: 1]
* [cite_start]**Fairness Criteria:** A model is considered unfair if the error range across representative groups spans more than ~3x the human annotation discrepancy (7.5% PDJ). [cite: 1]
* **Fairness Results:**
    * [cite_start]Heavy model: Average performance of 94.2% +/- 1.3% stdev with a range of [91.4%, 96.2%] across regions. [cite: 1]
    * [cite_start]Full model: Average performance of 91.8% +/- 1.4% stdev with a range of [89.2%, 94.0%] across regions. [cite: 1]
    * [cite_start]Lite model: Average performance of 87.0% +/- 2.0% stdev with a range of [83.2%, 89.7%] across regions. [cite: 1]

[cite_start]This information is extracted directly from the provided PDF. [cite: 1]