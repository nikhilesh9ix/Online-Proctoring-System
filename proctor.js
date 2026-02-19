// Proctoring System using face-api.js
class ProctorSystem {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('overlay');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        
        this.isProctoring = false;
        this.modelsLoaded = false;
        this.detectionInterval = null;
        this.sessionStartTime = null;
        this.durationInterval = null;
        
        // Violation tracking
        this.violations = [];
        this.violationCounts = {
            noFace: 0,
            multipleFaces: 0,
            lookingAway: 0
        };
        
        // Thresholds
        this.NO_FACE_THRESHOLD = 2000; // ms without face before violation
        this.LOOKING_AWAY_THRESHOLD = 30; // degrees for head pose
        this.lastFaceDetectedTime = Date.now();
        this.noFaceWarningShown = false;
        
        this.init();
    }
    
    async init() {
        this.updateStatus('Loading models...', 'warning');
        await this.loadModels();
        this.setupEventListeners();
        this.updateStatus('Ready to start', 'success');
    }
    
    async loadModels() {
        try {
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
            
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            
            this.modelsLoaded = true;
            console.log('Face-API models loaded successfully');
        } catch (error) {
            console.error('Error loading models:', error);
            this.updateStatus('Error loading models', 'danger');
        }
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startProctoring());
        this.stopBtn.addEventListener('click', () => this.stopProctoring());
    }
    
    async startProctoring() {
        if (!this.modelsLoaded) {
            alert('Models are still loading. Please wait...');
            return;
        }
        
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            
            this.video.srcObject = stream;
            
            this.video.addEventListener('loadedmetadata', () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
            });
            
            await this.video.play();
            
            this.isProctoring = true;
            this.sessionStartTime = Date.now();
            this.lastFaceDetectedTime = Date.now();
            
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            
            this.updateStatus('Proctoring Active', 'success');
            
            // Start detection loop
            this.detectFaces();
            
            // Start duration timer
            this.startDurationTimer();
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please grant camera permissions.');
            this.updateStatus('Camera access denied', 'danger');
        }
    }
    
    stopProctoring() {
        this.isProctoring = false;
        
        // Stop video stream
        if (this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // Clear intervals
        if (this.detectionInterval) {
            clearTimeout(this.detectionInterval);
        }
        if (this.durationInterval) {
            clearInterval(this.durationInterval);
        }
        
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        this.updateStatus('Proctoring Stopped', 'warning');
        
        // Clear canvas
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Generate session report
        this.generateReport();
    }
    
    async detectFaces() {
        if (!this.isProctoring) return;
        
        try {
            const detections = await faceapi.detectAllFaces(
                this.video,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions();
            
            // Clear previous drawings
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Process detections
            this.processDetections(detections);
            
            // Draw detections
            if (detections.length > 0) {
                const resizedDetections = faceapi.resizeResults(detections, {
                    width: this.canvas.width,
                    height: this.canvas.height
                });
                
                faceapi.draw.drawDetections(this.canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(this.canvas, resizedDetections);
            }
            
        } catch (error) {
            console.error('Detection error:', error);
        }
        
        // Continue detection loop
        this.detectionInterval = setTimeout(() => this.detectFaces(), 1000);
    }
    
    processDetections(detections) {
        const numFaces = detections.length;
        const currentTime = Date.now();
        
        // Update UI
        document.getElementById('faceCount').textContent = numFaces;
        
        // No face detected
        if (numFaces === 0) {
            document.getElementById('faceDetected').textContent = 'No';
            document.getElementById('attentionStatus').textContent = 'No Face Detected';
            
            const timeSinceLastFace = currentTime - this.lastFaceDetectedTime;
            
            if (timeSinceLastFace > this.NO_FACE_THRESHOLD && !this.noFaceWarningShown) {
                this.addViolation('No face detected', 'warning');
                this.violationCounts.noFace++;
                this.noFaceWarningShown = true;
                this.updateViolationStats();
            }
        }
        // One face detected (normal)
        else if (numFaces === 1) {
            document.getElementById('faceDetected').textContent = 'Yes';
            this.lastFaceDetectedTime = currentTime;
            this.noFaceWarningShown = false;
            
            const detection = detections[0];
            const landmarks = detection.landmarks;
            
            // Check head pose/orientation
            const isLookingAway = this.checkHeadPose(landmarks);
            
            if (isLookingAway) {
                document.getElementById('attentionStatus').textContent = 'Looking Away';
                this.addViolation('Looking away from screen', 'warning');
                this.violationCounts.lookingAway++;
                this.updateViolationStats();
            } else {
                document.getElementById('attentionStatus').textContent = 'Focused';
            }
        }
        // Multiple faces detected
        else {
            document.getElementById('faceDetected').textContent = 'Yes (Multiple)';
            document.getElementById('attentionStatus').textContent = 'Multiple Faces';
            this.lastFaceDetectedTime = currentTime;
            this.noFaceWarningShown = false;
            
            this.addViolation(`Multiple faces detected (${numFaces})`, 'danger');
            this.violationCounts.multipleFaces++;
            this.updateViolationStats();
        }
    }
    
    checkHeadPose(landmarks) {
        // Simple head pose estimation using facial landmarks
        // Compare nose position relative to face center
        
        const nose = landmarks.getNose();
        const jawline = landmarks.getJawOutline();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        
        // Calculate face center
        const faceCenter = {
            x: (jawline[0].x + jawline[16].x) / 2,
            y: (jawline[8].y + leftEye[0].y) / 2
        };
        
        // Calculate nose position
        const noseCenter = nose[3];
        
        // Calculate horizontal offset
        const horizontalOffset = Math.abs(noseCenter.x - faceCenter.x);
        const faceWidth = Math.abs(jawline[16].x - jawline[0].x);
        const horizontalRatio = horizontalOffset / faceWidth;
        
        // Calculate eye positions to detect vertical head turn
        const eyeDistance = Math.abs(rightEye[0].x - leftEye[3].x);
        const avgEyeDistance = 100; // approximate baseline
        
        // If horizontal ratio is high, person is looking sideways
        // This is a simplified check
        return horizontalRatio > 0.15;
    }
    
    addViolation(message, severity = 'warning') {
        const timestamp = new Date().toLocaleTimeString();
        const violation = {
            message,
            severity,
            timestamp,
            time: Date.now()
        };
        
        this.violations.push(violation);
        
        // Update violations list UI
        const violationsList = document.getElementById('violationsList');
        
        // Remove "no violations" message
        const noViolationsMsg = violationsList.querySelector('.no-violations');
        if (noViolationsMsg) {
            noViolationsMsg.remove();
        }
        
        const violationItem = document.createElement('div');
        violationItem.className = `violation-item violation-${severity}`;
        violationItem.innerHTML = `
            <span class="violation-time">${timestamp}</span>
            <span class="violation-message">${message}</span>
        `;
        
        violationsList.insertBefore(violationItem, violationsList.firstChild);
        
        // Keep only last 10 violations visible
        while (violationsList.children.length > 10) {
            violationsList.removeChild(violationsList.lastChild);
        }
    }
    
    updateViolationStats() {
        const total = this.violationCounts.noFace + 
                     this.violationCounts.multipleFaces + 
                     this.violationCounts.lookingAway;
        
        document.getElementById('totalViolations').textContent = total;
        document.getElementById('noFaceCount').textContent = this.violationCounts.noFace;
        document.getElementById('multipleFacesCount').textContent = this.violationCounts.multipleFaces;
        document.getElementById('lookingAwayCount').textContent = this.violationCounts.lookingAway;
    }
    
    startDurationTimer() {
        this.durationInterval = setInterval(() => {
            const elapsed = Date.now() - this.sessionStartTime;
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            document.getElementById('duration').textContent = timeString;
        }, 1000);
    }
    
    updateStatus(message, type = 'info') {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        const statusIndicator = document.getElementById('statusIndicator');
        
        statusText.textContent = message;
        statusIndicator.className = 'status-indicator status-' + type;
    }
    
    generateReport() {
        console.log('=== PROCTORING SESSION REPORT ===');
        console.log('Total Violations:', this.violations.length);
        console.log('No Face Violations:', this.violationCounts.noFace);
        console.log('Multiple Faces Violations:', this.violationCounts.multipleFaces);
        console.log('Looking Away Violations:', this.violationCounts.lookingAway);
        console.log('Detailed Log:', this.violations);
        
        // You can implement saving to a database or file here
        alert(`Session ended.\nTotal Violations: ${this.violations.length}\n\nCheck console for detailed report.`);
    }
}

// Initialize proctoring system when page loads
document.addEventListener('DOMContentLoaded', () => {
    const proctor = new ProctorSystem();
});
