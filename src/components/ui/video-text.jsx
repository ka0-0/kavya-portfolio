"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function VideoText({
  src,
  children,
  className = "",
  autoPlay = true,
  muted = true,
  loop = true,
  // "metadata" instead of "auto": this component sits at the very bottom of a ~10,000px page,
  // but `preload="auto"` made the browser race to buffer the entire 30MB / 2560x1440 source at
  // page load, concurrently with two other instances of the same file on the landing screen —
  // three simultaneous range requests competing with the GLB models, HDRI, geojson and fonts.
  preload = "metadata",
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
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const content = React.Children.toArray(children).join("");

  // Decoding a 2560x1440 stream costs real GPU/CPU work every frame, and this element is
  // off-screen for the overwhelming majority of the session. Pause it whenever it isn't near
  // the viewport and resume on approach. The generous rootMargin means playback has already
  // resumed before it becomes visible, so what the user sees is unchanged.
  useEffect(() => {
    const video = videoRef.current;
    const wrapper = wrapperRef.current;
    if (!video || !wrapper || typeof IntersectionObserver === "undefined") return;

    const MARGIN = 600;

    // Synchronous initial check. IntersectionObserver's first callback is delivered
    // asynchronously (and is suspended entirely while the tab is backgrounded), which leaves a
    // window where `autoPlay` has already begun decoding an off-screen video. One layout read
    // at mount closes that gap deterministically.
    const rect = wrapper.getBoundingClientRect();
    const startsVisible =
      rect.bottom > -MARGIN && rect.top < window.innerHeight + MARGIN;
    if (!startsVisible) video.pause();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.paused) video.play().catch(() => { });
        } else if (!video.paused) {
          video.pause();
        }
      },
      { rootMargin: `${MARGIN}px` }
    );
    observer.observe(wrapper);

    return () => observer.disconnect();
  }, []);

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
    <Component ref={wrapperRef} className={cn(`relative size-full`, className)} {...props}>
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
          ref={videoRef}
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
