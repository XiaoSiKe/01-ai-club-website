import { activityPhotos } from '../data/activity-photos.js';
import { imageSource } from './imageSource.js';

export function tunnelCardWidth(width, photo) {
  const preferredWidth = width < 768
    ? Math.max(130, Math.min(180, width * 0.38))
    : Math.max(180, Math.min(270, width * 0.18));
  return Math.min(preferredWidth, 320 * photo.width / photo.height);
}

export function startupImageSources(homepage, width, dpr) {
  const density = Math.min(dpr || 1, 1.5);
  const logo = imageSource('/lingyi-logo.jpg', 36.8, 36.8, density);
  if (!homepage) return [logo];
  return [logo, ...activityPhotos.map(photo => {
    const cardWidth = tunnelCardWidth(width, photo);
    return imageSource(photo.src, cardWidth, cardWidth * photo.height / photo.width, density);
  })];
}
