"use client";

import React from "react";
import { VideoText } from "@/components/ui/video-text";

export default function CursorImageTrail({
    animate = false,
    ...rest
}) {
    return (
        <div
            className={`relative w-full h-[18vw] sm:h-[18vw] max-h-[260px] flex items-center justify-center pointer-events-auto select-none px-4 ${animate ? 'animate-cinematic' : ''}`}
            {...rest}
        >
            <VideoText
                src="/loading-video.mp4"
                fontSize="15.5vw"
                fontWeight={900}
                fontFamily="'Rubik Variable', 'Rubik', sans-serif"
                letterSpacing="0.04em"
                className="w-full h-full cinematic-watermark-initial cinematic-watermark-animate flex items-center justify-center m-0 p-0 z-0"
            >
                KAVYA
            </VideoText>
        </div>
    );
}
