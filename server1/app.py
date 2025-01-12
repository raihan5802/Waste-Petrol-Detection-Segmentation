# server.py
from flask import Flask, request, jsonify
import os
import csv
import uuid
from geopy.distance import geodesic
from werkzeug.utils import secure_filename
import pandas as pd
from utils.imageutils import process_image_yolov8
from datetime import datetime

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'data/input_images'
app.config['OUTPUT_FOLDER'] = 'data/output_images'
app.config['CSV_FILE'] = 'data/complaints.csv'

# Ensure upload and output directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['OUTPUT_FOLDER'], exist_ok=True)

# Ensure CSV exists and has headers, including 'date'
if not os.path.exists(app.config['CSV_FILE']):
    with open(app.config['CSV_FILE'], 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['image_id','latitude','longitude','pixel_area','status','date'])

@app.route('/complaints', methods=['POST'])
def create_complaint():
    if 'image' not in request.files:
        return jsonify(message="No image uploaded"), 400
    latitude = float(request.form.get('latitude'))
    longitude = float(request.form.get('longitude'))
    
    # **Extract the 'date' from the form data**
    date_str = request.form.get('date')
    if not date_str:
        # If date is not provided, use the current server time
        date_str = datetime.utcnow().isoformat()

    df = pd.read_csv(app.config['CSV_FILE'])
    for idx, row in df.iterrows():
        dist = geodesic((latitude, longitude), (row['latitude'], row['longitude'])).meters
        if dist < 150:
            return jsonify(message="Complaint already exists for this location"), 409

    file = request.files['image']
    filename = secure_filename(file.filename)
    image_id = str(uuid.uuid4())
    input_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{image_id}.jpg")
    file.save(input_path)

    # Run YOLOv8 segmentation
    pixel_area = process_image_yolov8(input_path, app.config['OUTPUT_FOLDER'], image_id)

    with open(app.config['CSV_FILE'], 'a', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([image_id, latitude, longitude, pixel_area, 'processing', date_str])

    # **New Feature Implementation**
    if pixel_area == 0:
        response_message = "No garbage detected"
    else:
        response_message = "Complaint Registered!"

    return jsonify(message=response_message, image_id=image_id)

@app.route('/complaints', methods=['GET'])
def list_complaints():
    df = pd.read_csv(app.config['CSV_FILE'])
    return df.to_dict(orient='records')

@app.route('/complaints/locations', methods=['GET'])
def complaints_locations():
    df = pd.read_csv(app.config['CSV_FILE'])
    data = df[['image_id','latitude','longitude','pixel_area']].to_dict(orient='records')
    return data

@app.route('/complaints/resolve/<image_id>', methods=['PUT'])
def resolve_complaint(image_id):
    df = pd.read_csv(app.config['CSV_FILE'])
    if image_id not in df['image_id'].values:
        return jsonify(message="Not found"), 404
    df.loc[df['image_id'] == image_id, 'status'] = 'resolved'
    df.to_csv(app.config['CSV_FILE'], index=False)
    return jsonify(message="Complaint resolved")

@app.route('/map-embed', methods=['GET'])
def map_embed():
    html = """
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="initial-scale=1.0">
      <title>Heatmap</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
      <style>#map { width: 100%; height: 100vh; }</style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.heat/dist/leaflet-heat.js"></script>
      <script>
        var map = L.map('map').setView([0,0],2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18
        }).addTo(map);

        fetch('/complaints/locations').then(r=>r.json()).then(data=>{
          var points = data.map(d=>[d.latitude, d.longitude, d.pixel_area/10000]);
          L.heatLayer(points, {radius:25, blur:15}).addTo(map);
        });
      </script>
    </body>
    </html>
    """
    return html

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
