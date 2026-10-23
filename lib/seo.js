import { siteOrigin } from './site-config';
export function pageMetadata(title, description, path, image) {
 const url = new URL(path, siteOrigin).href;
 const images = [{ url: image || new URL('/social-card.png', siteOrigin).href, alt: title }];
 return { title, description, alternates: { canonical: url }, openGraph: { type: 'website', siteName: 'Presbyterian High School', title, description, url, images }, twitter: { card: 'summary_large_image', title, description, images: images.map(i => i.url) } };
}
