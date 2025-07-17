import sqlite3

DATABASE = 'rest_areas.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rest_areas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            description TEXT
        )
    ''')
    conn.commit()
    conn.close()

def add_sample_data():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # 既存のデータを削除してから追加 (開発用)
    cursor.execute("DELETE FROM rest_areas") 
    
    # サンプルデータ（千葉県船橋市周辺を想定）
    sample_data = [
        ("船橋港親水公園", 35.6881, 139.9926, "東京湾を望む公園。トイレあり。"),
        ("船橋総合運動公園", 35.7042, 140.0157, "広大な運動公園。トイレ、ベンチあり。"),
        ("ららぽーとTOKYO-BAY (休憩スペース)", 35.6798, 140.0101, "ショッピングモール内の休憩スペース。"),
        ("海浜幕張公園 (Bブロック)", 35.6493, 140.0385, "芝生広場とトイレがある公園。"),
        ("稲毛海浜公園 (Dブロック)", 35.6329, 140.0763, "広い公園で、ベンチやトイレが豊富。"),
        
        # 東葉高速鉄道線沿線の休憩所（追加分）
        ("船橋アンデルセン公園", 35.7505, 140.0385, "広大な自然公園。休憩スペース、トイレ多数。"), # 最寄りは三咲駅だが、東葉高速線沿線からもアクセス可能
        ("萱田地区公園", 35.7275, 140.1005, "八千代中央駅近くの公園。"),
        ("スポーツの杜公園", 35.7340, 140.0700, "八千代緑が丘駅近くの運動公園。"),
        ("西部近隣公園", 35.7380, 140.0650, "八千代緑が丘駅近くの広々とした公園。アスレチックあり。"),
        ("村上神明公園", 35.7480, 140.1300, "村上駅近くの公園。")
    ]
    
    cursor.executemany("INSERT INTO rest_areas (name, latitude, longitude, description) VALUES (?, ?, ?, ?)", sample_data)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    add_sample_data()
    print("データベースが初期化され、サンプルデータが追加されました。")