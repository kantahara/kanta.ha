document.addEventListener('DOMContentLoaded', () => {
    let map = null;
    let userMarker = null;
    let watchId = null; // watchPositionのIDを保持するための変数

    // 初期マップ設定（日本周辺のデフォルト座標）
    const defaultLat = 35.681236; // 東京駅付近の緯度
    const defaultLon = 139.767125; // 東京駅付近の経度
    const defaultZoom = 10;

    // マップの初期化
    function initializeMap() {
        if (!map) {
            map = L.map('map').setView([defaultLat, defaultLon], defaultZoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
    }

    // 現在地を更新し、地図と休憩所を再描画する関数
    function updateLocationAndRestAreas(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        document.getElementById('current-location').textContent = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;

        // マップを現在地に移動
        map.setView([lat, lon], 14); // ズームレベルを少し上げる

        // 既存のユーザーマーカーがあれば削除
        if (userMarker) {
            map.removeLayer(userMarker);
        }
        // ユーザーマーカーを追加
        userMarker = L.marker([lat, lon]).addTo(map)
            .bindPopup('あなたの現在地')
            .openPopup();

        // 近くの休憩所をAPIで取得
        fetch('/nearby_rest_areas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ latitude: lat, longitude: lon })
        })
        .then(response => response.json())
        .then(data => {
            const restAreaList = document.getElementById('rest-area-list');
            restAreaList.innerHTML = ''; // リストをクリア

            if (data.length === 0) {
                restAreaList.innerHTML = '<li>近くに休憩所は見つかりませんでした。</li>';
            } else {
                // 既存の休憩所マーカーをすべて削除
                map.eachLayer(function(layer){
                    if(layer instanceof L.Marker && layer !== userMarker){
                        map.removeLayer(layer);
                    }
                });

                data.forEach(area => {
                    const li = document.createElement('li');
                    li.innerHTML = `${area.name} <span class="distance">(${area.distance} km)</span>`;
                    restAreaList.appendChild(li);

                    // 休憩所のマーカーを追加
                    L.marker([area.latitude, area.longitude])
                        .addTo(map)
                        .bindPopup(`<b>${area.name}</b><br>${area.description || ''}<br>${area.distance} km`);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching nearby rest areas:', error);
            document.getElementById('rest-area-list').innerHTML = '<li>休憩所の取得に失敗しました。</li>';
        });
    }

    // 位置情報取得エラーハンドラ
    function handleLocationError(error) {
        console.error('現在地の取得に失敗しました:', error);
        document.getElementById('current-location').textContent = '取得失敗';
        document.getElementById('rest-area-list').innerHTML = '<li>現在地の取得に失敗しました。位置情報サービスを有効にしてください。</li>';
        // エラー時も初期マップを表示
        initializeMap();
    }

    // 現在地をリアルタイムで監視し続ける関数
    function startWatchingLocation() {
        if (navigator.geolocation) {
            // 既に監視中であれば一度クリア
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }

            watchId = navigator.geolocation.watchPosition(
                updateLocationAndRestAreas, // 成功時のコールバック
                handleLocationError,        // エラー時のコールバック
                {
                    enableHighAccuracy: true, // より高精度な位置情報を要求
                    maximumAge: 0,            // キャッシュされた位置情報を使わない
                    timeout: 27000            // 位置情報取得のタイムアウト（ミリ秒）
                }
            );
        } else {
            document.getElementById('current-location').textContent = '非対応';
            document.getElementById('rest-area-list').innerHTML = '<li>お使いのブラウザは位置情報サービスに対応していません。</li>';
            // 位置情報非対応時も初期マップを表示
            initializeMap();
        }
    }

    // 初期化と初回位置情報取得の開始
    initializeMap();
    startWatchingLocation(); // ページ読み込み時に監視を開始

    // 更新ボタンのイベントリスナー（watchPositionを使っているため、通常は不要だが、手動更新のトリガーとして残す）
    // このボタンを押すと、watchPositionが一度リセットされ、再度監視が開始されます。
    document.getElementById('refresh-button').addEventListener('click', startWatchingLocation);


    // 熱中症対策メッセージの表示ロジック
    const preventionMessages = [
        "こまめな水分補給を心がけましょう。",
        "喉が渇く前に水を飲みましょう。",
        "帽子や日傘を活用し、直射日光を避けましょう。",
        "涼しい場所で休憩を取りましょう。",
        "通気性の良い服装を選びましょう。",
        "無理のない範囲で行動しましょう。",
        "周りの人にも気を配りましょう。"
    ];
    let messageIndex = 0;
    const messageElement = document.getElementById('prevention-message');

    function showNextPreventionMessage() {
        // まず現在のメッセージをフェードアウト
        messageElement.classList.remove('fade-in');
        messageElement.classList.add('fade-out');

        setTimeout(() => {
            // メッセージを更新
            messageElement.textContent = preventionMessages[messageIndex];
            // 次のメッセージのインデックスを計算
            messageIndex = (messageIndex + 1) % preventionMessages.length;

            // 新しいメッセージをフェードイン
            messageElement.classList.remove('fade-out');
            messageElement.classList.add('fade-in');
        }, 1000); // フェードアウトの時間（CSSのtransitionと合わせる）
    }

    // ページ読み込み時に最初のメッセージを表示
    showNextPreventionMessage(); // 最初のメッセージを即座に表示

    // 5秒ごとにメッセージを切り替える (メッセージの表示時間 + フェードアウト時間)
    setInterval(showNextPreventionMessage, 5000); 
});