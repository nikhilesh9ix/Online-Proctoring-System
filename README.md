# Online Proctoring System

An intelligent web-based proctoring system that uses AI-powered face detection and monitoring to ensure exam integrity. The system tracks student behavior in real-time and logs any suspicious activities or violations.

## 🌐 Live Demo

**[View Live Demo](https://online-proctoring-system.vercel.app/)**

## ✨ Features

- **Real-time Face Detection** - Continuously monitors the presence of faces using Face-API.js
- **Violation Detection & Logging** - Automatically detects and records:
  - No face detected (student left the frame)
  - Multiple faces detected (unauthorized person present)
  - Looking away from screen (attention monitoring)
- **Session Management** - Track exam duration and session statistics
- **Visual Feedback** - Live video feed with face detection overlay
- **Comprehensive Statistics** - Real-time violation counts and detailed logs
- **Modern UI** - Clean, responsive interface with status indicators

## 🛠️ Technologies Used

- **HTML5** - Structure and markup
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Application logic and proctoring system
- **Face-API.js** - AI-powered face detection and facial landmark recognition
- **WebRTC** - Camera access and video streaming

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam/Camera access
- HTTPS connection (required for camera permissions)

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/nikhilesh9ix/Online-Proctoring-System.git
   cd Online-Proctoring-System
   ```

2. **Open the application**
   
   Simply open `index.html` in a modern web browser, or use a local server:
   
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   ```

3. **Access the application**
   
   Navigate to `http://localhost:8000` in your browser

## 📖 How to Use

1. **Allow Camera Access** - When prompted, grant camera permissions to the browser
2. **Wait for Initialization** - The system will load AI models (takes a few seconds)
3. **Start Proctoring** - Click the "Start Proctoring" button
4. **Begin Exam** - The system will now monitor throughout the session
5. **View Violations** - Check the violations log and statistics in real-time
6. **Stop Session** - Click "Stop Proctoring" when finished

## 🎯 Detection Parameters

- **No Face Threshold**: 2 seconds without face detection = violation
- **Multiple Faces**: More than one face in frame = violation
- **Looking Away**: Head pose detection monitors attention
- **Detection Frequency**: Face detection runs every 500ms

## 📊 Features Overview

### Session Information
- Real-time session duration tracker
- Face detection status
- Number of faces detected
- Current attention status

### Violation Types
1. **No Face Detected** - Student moved out of camera view
2. **Multiple Faces** - Additional person(s) detected in frame
3. **Looking Away** - Student not paying attention to screen

### Statistics Dashboard
- Total violations count
- Individual violation type counters
- Timestamped violation log

## 🔒 Privacy & Security

- All processing happens locally in the browser
- No data is sent to external servers
- Camera feed is not recorded or stored
- Violation logs exist only during the session

## 🌟 Project Structure

```
Online-Proctoring-System/
│
├── index.html          # Main HTML structure
├── proctor.js          # Proctoring logic and AI integration
├── styles.css          # Styling and responsive design
└── README.md           # Project documentation
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/nikhilesh9ix/Online-Proctoring-System/issues).

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Nikhilesh**
- GitHub: [@nikhilesh9ix](https://github.com/nikhilesh9ix)

## 🙏 Acknowledgments

- [Face-API.js](https://github.com/justadudewhohacks/face-api.js) - Face detection library
- [Vladimir Mandic's Face-API](https://github.com/vladmandic/face-api) - Model hosting

## 📸 Screenshots

### Main Interface
The proctoring system features a clean interface with live video feed, real-time statistics, and violation logging.

### Key Components
- **Video Monitor**: Live camera feed with face detection overlay
- **Session Panel**: Duration and detection status
- **Violations Log**: Chronological list of detected violations
- **Statistics**: Breakdown of violation types

---

⭐ If you find this project useful, please consider giving it a star on GitHub!
