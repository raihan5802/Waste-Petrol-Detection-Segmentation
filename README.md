# Authority Portal & WasteApp

## Project Overview
This repository contains two interconnected projects:
1. **Authority Portal**: A web-based platform built using Flask for managing and visualizing complaint data related to garbage management.
2. **WasteApp**: A mobile application built with React Native for submitting complaints and viewing heatmaps of complaint locations.

## Features
### Authority Portal
- **Dashboard for Complaint Management**: Displays a list of complaints with their status, date, and location.
- **Heatmap Visualization**: Shows the density of unresolved complaints using Leaflet.js and heatmap plugins.
- **CSV Data Management**: Reads and writes complaint data to a CSV file.

### WasteApp
- **Submit Complaints**: Allows users to upload an image, specify a location, and describe the issue.
- **View Complaints**: Displays a list of complaints submitted by the user.
- **Heatmap Integration**: Embeds the heatmap from the Authority Portal for mobile users.

---

## File Structure

### Authority Portal
- `authority_website1/`
  - `app.py`: Flask application handling routes and business logic.
  - `templates/`
    - `index.html`: Dashboard for managing complaints.
    - `heatmap.html`: Displays a heatmap of complaints.
  - `static/`: Contains static assets like images and stylesheets.
- `server1/`
  - `app.py`: Backend Flask application for handling complaint submissions and resolution.
  - `requirements.txt`: Lists the Python dependencies for the backend.
  - `data/`
    - `complaints.csv`: Stores complaint data.
  - `utils/`
    - `imageutils.py`: YOLOv8-based image processing.

### WasteApp
- `wasteapp1/`
  - `App.js`: Main entry point for the React Native application.
  - `screens/`: Contains the screens for Home, Complaints Log, and Heatmap.
  - `assets/`: Images and icons used in the app.
  - `app.json`: Configuration for the Expo environment.

---

## Installation

### Authority Portal
1. Clone the repository.
   ```bash
   git clone <repository-url>
   cd authority_website1
   ```
2. Install dependencies.
   ```bash
   pip install -r server1/requirements.txt
   ```
3. Start the Flask server.
   ```bash
   python server1/app.py
   ```
4. Access the portal at `http://127.0.0.1:5000`.

### WasteApp
1. Navigate to the `wasteapp1` directory.
   ```bash
   cd wasteapp1
   ```
2. Install dependencies.
   ```bash
   npm install
   ```
3. Start the application using Expo.
   ```bash
   npm start
   ```
4. Scan the QR code with the Expo Go app or run it on an emulator.

---

## Technologies Used
- **Backend**: Flask, Pandas, YOLOv8
- **Frontend**: HTML, CSS, Leaflet.js
- **Mobile**: React Native, React Navigation, React Native Paper

---

## Acknowledgments
- [Ultralytics YOLOv8](https://github.com/ultralytics/yolov8) for object detection.
- [Expo](https://expo.dev/) for simplifying React Native development.
- [Leaflet.js](https://leafletjs.com/) for interactive maps.
