/**
 * main.js — エントリポイント
 *
 * 認証フロー:
 *   1. localStorage に保存済みの認証情報があれば復元
 *   2. GeonicDB SDK を動的にロード（サーバーから /sdk/v1/geonicdb.js を取得）
 *   3. initApp() でアプリを起動
 *   未認証の場合はログインフォームを表示する
 */

import './style.css';
import { getStoredAuth, clearAuth, handleLogin, handleLogout, loadGeonicDBSDK } from './auth.js';
import { initApp } from './app.js';

window.handleLogout = handleLogout;

(function() {
  var auth = getStoredAuth();

  if (auth && auth.accessToken) {
    document.getElementById('login-overlay').classList.add('hidden');
    // GeonicDB SDK はサーバーから動的にロードする（CDN ではなくサーバー固有のバージョンを使用）
    loadGeonicDBSDK(auth.url).then(function() {
      initApp(auth);
    }).catch(function(err) {
      console.error(err);
      clearAuth();
      document.getElementById('login-overlay').classList.remove('hidden');
      document.getElementById('login-error').textContent = 'セッションが無効です。再度ログインしてください。';
    });
  } else {
    document.getElementById('login-overlay').classList.remove('hidden');
  }

  document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;
    var tenant = document.getElementById('login-tenant').value.trim();
    if (email && password) {
      handleLogin(email, password, tenant).then(function(auth) {
        return loadGeonicDBSDK(auth.url).then(function() {
          document.getElementById('login-overlay').classList.add('hidden');
          initApp(auth);
        });
      }).catch(function() {
        // エラーは handleLogin 内で UI に表示済み
      });
    }
  };
})();
