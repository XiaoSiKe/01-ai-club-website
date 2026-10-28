import { activityPhotos } from '../data/activity-photos';
import { imageSource } from './imageSource';

export function tunnelCardWidth(width) {
  return width < 768
    ? Math.max(130, Math.min(180, width * 0.38))
    : Math.max(180, Math.min(270, width * 0.18));
}

export function startupImageSources(homepage, width, dpr) {
  const density = Math.min(dpr || 1, 1.5);
  const logo = imageSource('/lingyi-logo.jpg', 36.8, 36.8, density);
  return [logo, ...(homepage ? activityPhotos.map(photo => imageSource(
    photo.src, tunnelCardWidth(width), tunnelCardWidth(width) * photo.height / photo.width, density,
  )) : [])];
}
