/* Service worker guide from https://codelabs.developers.google.com/codelabs/offline/#0
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/
const version = "0.0.1";
const cacheName = `neighbourhood-map-${version}`;
self.addEventListener('install', e => {
  const timeStamp = Date.now();
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        `/`,
        `/index.html?timestamp=${timeStamp}`,
        `/manifest.json?timestamp=${timeStamp}`,
        `/places.json?timestamp=${timeStamp}`,
        `/coffee_shop.png?timestamp=${timeStamp}`,
        `/fav.png?timestamp=${timeStamp}`,
        `/likes.png?timestamp=${timeStamp}`,
        `/market.png?timestamp=${timeStamp}`,
        `/restaurant.png?timestamp=${timeStamp}`,
        `/school.png?timestamp=${timeStamp}`,
        `/store.png?timestamp=${timeStamp}`,
        `/favicon.ico?timestamp=${timeStamp}`,

        `/src/index.css?timestamp=${timeStamp}`,
        `/src/index.js?timestamp=${timeStamp}`,
        `/src/App.css?timestamp=${timeStamp}`,
        `/src/App.js?timestamp=${timeStamp}`,
        `/src/Map.js?timestamp=${timeStamp}`,
        `/src/PlacesList.js?timestamp=${timeStamp}`,
        `/src/GoogleMapAPI.js?timestamp=${timeStamp}`,
        `/src/logo.svg?timestamp=${timeStamp}`
      ])
      .then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
    .then(cache => cache.match(event.request, {ignoreSearch: true}))
    .then(response => {
      return response || fetch(event.request);
    })
  );
});
