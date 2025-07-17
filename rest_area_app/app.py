from flask import Flask, render_template, request, jsonify
import sqlite3
import math

app = Flask(__name__)
DATABASE = 'rest_areas.db'

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  # 列名でアクセスできるようにする
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rest_areas', methods=['GET'])
def get_rest_areas():
    conn = get_db_connection()
    rest_areas = conn.execute('SELECT * FROM rest_areas').fetchall()
    conn.close()
    return jsonify([dict(row) for row in rest_areas])

@app.route('/nearby_rest_areas', methods=['POST'])
def get_nearby_rest_areas():
    data = request.get_json()
    user_lat = data['latitude']
    user_lon = data['longitude']
    radius = 5  # 検索半径 (km)

    conn = get_db_connection()
    rest_areas = conn.execute('SELECT * FROM rest_areas').fetchall()
    conn.close()

    nearby_areas = []
    for area in rest_areas:
        # 簡易的な距離計算 (ヒュベニの公式やGeopyライブラリなどを使うとより正確)
        # ここでは地球を平面と見なしたユークリッド距離で近似
        # より正確な距離計算が必要な場合は、Haversine公式などを実装してください。
        
        # 緯度・経度をラジアンに変換
        R = 6371  # 地球の半径 (km)
        lat1_rad = math.radians(user_lat)
        lon1_rad = math.radians(user_lon)
        lat2_rad = math.radians(area['latitude'])
        lon2_rad = math.radians(area['longitude'])

        dlon = lon2_rad - lon1_rad
        dlat = lat2_rad - lat1_rad

        a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c

        if distance <= radius:
            area_dict = dict(area)
            area_dict['distance'] = round(distance, 2)  # 距離を追加
            nearby_areas.append(area_dict)

    # 距離でソート
    nearby_areas.sort(key=lambda x: x['distance'])
    
    return jsonify(nearby_areas)

if __name__ == '__main__':
    # データベースの初期化とサンプルデータの追加をアプリ起動時に行う
    import database
    database.init_db()
    database.add_sample_data()
    app.run(debug=True)
