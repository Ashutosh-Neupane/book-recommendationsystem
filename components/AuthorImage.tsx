"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface AuthorImageProps {
  authorName: string;
  size?: number;
}

export default function AuthorImage({
  authorName,
  size = 192,
}: AuthorImageProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
            authorName
          )}`
        );
        if (!res.ok) {
          setImgUrl(null);
          return;
        }
        const data = await res.json();
        setImgUrl(data.thumbnail?.source || null);
      } catch {
        setImgUrl(null);
      }
    }
    fetchImage();
  }, [authorName]);

  if (!imgUrl) {
    return (
      <div
        style={{
          width: "100%", // full",
          height: "100%",
          display: "flex", // Enable flexbox
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically

          backgroundColor: "#1e293b", // slate-800
          color: "#94a3b8", // slate-400 text color
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "center",

          userSelect: "none",
        }}
      >
        No Image
      </div>
    );
  }

  return (
    <img
      src={imgUrl}
      alt={`${authorName} photo`}
      width={size}
      height={size}
      style={{
        boxShadow: "0 0 10px rgb(59 130 246 / 0.7)",
        objectFit: "cover",
      }}
      loading="lazy"
    />
  );
}
