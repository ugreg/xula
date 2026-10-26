const meta = document.querySelector('meta[name="build-version"]');

export const V = meta ? meta.content : '';

export const stamp = (url) =>
  V ? `${url}${url.includes('?') ? '&' : '?'}v=${V}` : url;
