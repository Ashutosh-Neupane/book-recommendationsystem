// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "covers.openlibrary.org",
      "books.google.com",
      "images.amazon.com",
      "m.media-amazon.com",
      "ecx.images-amazon.com",
      "s.gr-assets.com",
      "i.gr-assets.com"
    ],
    unoptimized: true
  },
};

export default nextConfig;
