"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function VideoText({
  src,
  children,
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  preload = "auto",
  fontSize = 20,
  fontWeight = "bold",
  textAnchor = "middle",
  dominantBaseline = "middle",
  fontFamily = "sans-serif",
  letterSpacing = "normal",
  objectPosition = "center center",
  videoTranslateY = "55px", // Shifting video position down to +55px
  videoScale = 1.2, // Provides canvas headroom for vertical translation without clipping
  as: Component = "div",
  ...props
}) {
  const [svgMask, setSvgMask] = useState("");
  const content = React.Children.toArray(children).join("");

  useEffect(() => {
    const updateSvgMask = () => {
      const responsiveFontSize =
        typeof fontSize === "number" ? `${fontSize}vw` : fontSize;
      const safeFontFamily = fontFamily.replace(/'/g, "");
      const newSvgMask = `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><text x='50%' y='50%' font-size='${responsiveFontSize}' font-weight='${fontWeight}' text-anchor='${textAnchor}' dominant-baseline='${dominantBaseline}' font-family='${safeFontFamily}' letter-spacing='${letterSpacing}'>${content}</text></svg>`;
      setSvgMask(newSvgMask);
    };

    updateSvgMask();
    window.addEventListener("resize", updateSvgMask);
    return () => window.removeEventListener("resize", updateSvgMask);
  }, [content, fontSize, fontWeight, textAnchor, dominantBaseline, fontFamily, letterSpacing]);

  const dataUrlMask = `url("data:image/svg+xml,${encodeURIComponent(svgMask)}")`;

  return (
    <Component className={cn(`relative size-full`, className)} {...props}>
      {/* 
        Parent Container: Holds the stationary SVG text mask via maskImage.
        The text mask stays 100% fixed in place.
      */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{
          maskImage: dataUrlMask,
          WebkitMaskImage: dataUrlMask,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      >
        {/* 
          Video Element: Controlled by transform: translateY(-25px) scale(1.2).
          Moves the video UP by 25px behind the stationary SVG text mask.
        */}
        <video
          className="h-full w-full object-cover will-change-transform"
          style={{
            objectPosition,
            transform: `translateY(${videoTranslateY}) scale(${videoScale})`,
          }}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          preload={preload}
          playsInline
        >
          <source src={src} />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Add a backup text element for SEO/accessibility */}
      <span className="sr-only">{content}</span>
    </Component>
  );
}
