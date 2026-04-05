/**
 * feed.js — サイドパネルのライブフィード
 *
 * WebSocket から受信したエンティティの更新を時系列で表示するフィード。
 * 各アイテムをクリックすると地図上の該当エンティティにフライ＆ポップアップ表示する。
 */

import { getEntityName, findGeoProperty, formatTime } from './entity.js';

var feedList = null;

/** feedList 要素を取得（初回呼び出し時にキャッシュ） */
function getFeedList() {
  if (!feedList) feedList = document.getElementById('feed-list');
  return feedList;
}

/**
 * WebSocket から受信したエンティティをフィードに追加（最新が上、最大50件）。
 * @param {object} entity - NGSI-LD エンティティ
 * @param {boolean} isNew - 新規作成の場合 true
 * @param {object} deps - { map, selectEntity, getFlyZoom, openPopupForEntity }
 */
export function addFeedItem(entity, isNew, deps) {
  var list = getFeedList();
  var name = getEntityName(entity);
  var time = formatTime(new Date().toISOString());
  var item = document.createElement('div');
  item.className = 'feed-item' + (isNew ? ' new' : '');
  item.setAttribute('data-id', entity.id);
  item.innerHTML =
    '<div class="feed-marker"></div>' +
    '<div class="feed-info">' +
      '<div class="feed-name">' + name + '</div>' +
      '<div class="feed-meta">' + time + '</div>' +
      (entity['@context'] ? '<div class="feed-context">' + (Array.isArray(entity['@context']) ? entity['@context'].join(', ') : entity['@context']) + '</div>' : '') +
    '</div>';
  item.onclick = function() {
    var geo = findGeoProperty(entity);
    if (geo && geo.value) {
      deps.selectEntity(entity.id);
      deps.map.flyTo({ center: geo.value.coordinates, zoom: deps.getFlyZoom(16), duration: 1200 });
      setTimeout(function() { deps.openPopupForEntity(entity.id); }, 1300);
    }
  };
  list.insertBefore(item, list.firstChild);
  while (list.children.length > 50) {
    list.removeChild(list.lastChild);
  }
  setTimeout(function() { item.classList.remove('new'); }, 2000);
}

/**
 * 初期データ（REST API から取得）でフィードを初期化（直近20件を表示）。
 * @param {Array} entities - エンティティの配列
 * @param {object} deps - { map, selectEntity, getFlyZoom, openPopupForEntity }
 */
export function initFeed(entities, deps) {
  var list = getFeedList();
  list.innerHTML = '';
  entities.slice(-20).reverse().forEach(function(e) {
    var name = getEntityName(e);
    var item = document.createElement('div');
    item.className = 'feed-item';
    item.setAttribute('data-id', e.id);
    item.innerHTML =
      '<div class="feed-marker"></div>' +
      '<div class="feed-info">' +
        '<div class="feed-name">' + name + '</div>' +
        '<div class="feed-meta">' + e.id + '</div>' +
        (e['@context'] ? '<div class="feed-context">' + (Array.isArray(e['@context']) ? e['@context'].join(', ') : e['@context']) + '</div>' : '') +
      '</div>';
    item.onclick = (function(ent) {
      return function() {
        var geo = findGeoProperty(ent);
        if (geo && geo.value) {
          deps.selectEntity(ent.id);
          deps.map.flyTo({ center: geo.value.coordinates, zoom: deps.getFlyZoom(16), duration: 1200 });
          setTimeout(function() { deps.openPopupForEntity(ent.id); }, 1300);
        }
      };
    })(e);
    list.appendChild(item);
  });
}
