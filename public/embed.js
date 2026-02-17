(function() {
  var s = document.currentScript;
  if (!s || !s.src) return;
  try {
    var url = new URL(s.src);
    var token = url.searchParams.get('token');
    if (!token) return;
    var api = url.origin + '/api/analytics/events';
    var payload = {
      token: token,
      type: 'page_view',
      path: window.location.pathname || '/',
      referrer: document.referrer || null
    };
    fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(function() {});
  } catch (e) {}
})();
