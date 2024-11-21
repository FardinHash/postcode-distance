from flask import Flask, request, jsonify
from math import radians, sin, cos, sqrt, atan2
import pandas as pd

app = Flask(__name__)

file_path = 'postcode-lat-long.xlsx'  
data = pd.read_excel(file_path)
data['lat'] = pd.to_numeric(data['lat'], errors='coerce')
data['long'] = pd.to_numeric(data['long'], errors='coerce')
data = data.dropna(subset=['lat', 'long'])

def calculate_dist(lat1, lon1, lat2, lon2):
    R = 6371  
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def postcodes_within_radius(postcode, radius, data):
    start = data[data['pcd'] == postcode]
    if start.empty:
        return {"error": f"Postcode {postcode} not found in the dataset."}
    
    lat1, lon1 = start.iloc[0]['lat'], start.iloc[0]['long']
    data['distance'] = data.apply(lambda row: calculate_dist(lat1, lon1, row['lat'], row['long']), axis=1)
    within_radius = data[data['distance'] <= radius]
    
    return within_radius[['pcd', 'distance']].to_dict(orient='records')

@app.route('/find-postcodes', methods=['GET'])
def find_postcodes():
    postcode = request.args.get('postcode')
    radius = request.args.get('radius')

    if not postcode or not radius:
        return jsonify({"error": "Please provide both 'postcode' and 'radius' parameters."}), 400
    
    try:
        radius = float(radius)
    except ValueError:
        return jsonify({"error": "'radius' must be a numeric value."}), 400

    result = postcodes_within_radius(postcode, radius, data)
    return jsonify(result)

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5000))  
    app.run(debug=True, host='0.0.0.0', port=port)