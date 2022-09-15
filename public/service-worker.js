import { addPlugins, cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { responsesAreSame } from 'workbox-broadcast-update';
import { DEFAULT_HEADERS_TO_CHECK } from 'workbox-broadcast-update/utils/constants.js';

const $claimingClients = new Promise((resolve, reject) => {
  self.addEventListener('activate', event => {
    const claim = self.clients.claim();
    claim.then(resolve, reject);
    event.waitUntil(claim);
  });
  self.addEventListener('install', () => self.skipWaiting());
});

precacheAndRoute(self.__WB_MANIFEST);

const apiRouteRegexp = new RegExp('/api');
const filesRegexp = new RegExp('/(.*/)?([^/?]+)\\.([^/.?]+)(\\?.*)?$');
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    // API and files do not resolve into index.html
    denylist: [apiRouteRegexp, filesRegexp],
  }),
);

cleanupOutdatedCaches();

addPlugins([
  {
    cacheDidUpdate: async param => {
      const { cacheName, oldResponse, newResponse, request: url } = param;
      const isSame = oldResponse && responsesAreSame(oldResponse, newResponse, DEFAULT_HEADERS_TO_CHECK);

      const type = isSame ? 'CACHE_NOT_UPDATED' : 'CACHE_UPDATED';
      const message = {
        type,
        payload: { cacheName, url },
      };

      $claimingClients.then(() => {
        self.clients.matchAll({ type: 'window' }).then(matchedWindows => matchedWindows.forEach(w => w.postMessage(message)));
      })
    },
  },
]);
