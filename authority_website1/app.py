from flask import Flask, render_template, request, jsonify
import csv

app = Flask(__name__)

CSV_FILE = 'C:/Users/raiha/OneDrive/Desktop/SERVERS/server1/data/complaints.csv'

def read_csv():
    entries = []
    with open(CSV_FILE, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            entries.append(row)
    return entries

def write_csv(entries):
    if not entries:
        return
    fieldnames = entries[0].keys()
    with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(entries)

@app.route('/', methods=['GET'])
def index():
    data = read_csv()
    filtered_data = [d for d in data if d['status'] == 'processing']
    return render_template('index.html', reports=filtered_data)

@app.route('/resolve', methods=['POST'])
def resolve():
    image_id = request.form.get('image_id')
    data = read_csv()
    updated = False
    for row in data:
        if row['image_id'] == image_id:
            row['status'] = 'resolved'
            updated = True
            break
    if updated:
        write_csv(data)
        return jsonify({"status": "success"})
    else:
        return jsonify({"status": "failed", "message": "No matching record found"}), 404

@app.route('/heatmap', methods=['GET'])
def heatmap():
    return render_template('heatmap.html')

@app.route('/heatmap_data', methods=['GET'])
def heatmap_data():
    data = read_csv()
    processing_data = [
        {
            "latitude": float(d['latitude']),
            "longitude": float(d['longitude']),
            "pixel_area": float(d['pixel_area'])
        }
        for d in data if d['status'] == 'processing'
    ]
    return jsonify(processing_data)

if __name__ == '__main__':
    app.run(debug=True)
