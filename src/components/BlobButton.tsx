"use client";
import React from "react";

interface BlobButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  blobColor?: string;
  textColor?: string;
  hoverTextColor?: string;
  backgroundColor?: string;
}

export const BlobButton = ({
  children,
  className = "",
  blobColor = "#FF9494",
  textColor = "#FF9494",
  hoverTextColor = "#FFFFFF",
  backgroundColor = "transparent",
  ...props
}: BlobButtonProps) => {
  return (
    <>
      <button
        className={`relative z-[1] px-[36px] py-[16px] text-center font-bold text-[15px] bg-transparent outline-none border-none transition-colors duration-500 cursor-pointer rounded-[30px] group ${className}`}
        style={
          {
            "--text-color": textColor,
            "--hover-text-color": hoverTextColor,
            color: "var(--text-color)",
          } as React.CSSProperties
        }
        {...props}
      >
        {/* Text */}
        <span
          className="relative z-10 transition-colors duration-300 text-[var(--text-color)] group-hover:text-[var(--hover-text-color)] flex items-center justify-center gap-2"
        >
          {children}
        </span>

        {/* The Outer Border */}
        <div
          className="absolute inset-0 z-[1] border-2 border-solid rounded-[30px]"
          style={{ borderColor: blobColor }}
        ></div>

        {/* The Drop Shadow Block */}
        <div
          className="absolute w-full h-full left-[3px] top-[3px] rounded-[30px] -z-[2] transition-all duration-[0.3s] delay-[0.2s] group-hover:left-0 group-hover:top-0 group-hover:delay-0"
        ></div>

        {/* The Inner Masked Area */}
        <div
          className="absolute inset-0 -z-[1] overflow-hidden rounded-[30px]"
          style={{ backgroundColor }}
        >
          {/* Blobs Container with Gooey Filter */}
          <div
            className="relative block h-full w-full"
            style={{ filter: "url(#goo)" }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute top-[2px] h-full rounded-full transition-transform duration-[0.45s] translate-y-[150%] scale-[1.7] group-hover:translate-y-0 group-hover:scale-[1.4]"
                style={{
                  width: "25%",
                  backgroundColor: blobColor,
                  left: `${(i - 1) * 30}%`,
                  transitionDelay: `${(i - 1) * 0.08}s`,
                }}
              ></div>
            ))}
          </div>
        </div>
      </button>

      {/* SVG Filter for Gooey Effect */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feBlend in2="goo" in="SourceGraphic" result="mix" />
          </filter>
        </defs>
      </svg>
    </>
  );
};
