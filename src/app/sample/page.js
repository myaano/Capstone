"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
export default function Sample() {
  const divRef = useRef(null);
  const countRef = useRef({ value: 0 }); // Holds the raw number for GSAP to animate
  const tlRef = useRef(null); // Holds the GSAP timeline reference

  useEffect(() => {
    // 1. Create the GSAP timeline and pause it initially
    const tl = gsap.timeline({ paused: true });

    tl.to(divRef.current, {
      opacity: 1,
      duration: 0.3,
    }).to(
      countRef.current,
      {
        value: 100, // The number you want to count up to
        duration: 1,
        ease: "power2.out",
        onUpdate: () => {
          // Update the div's text content directly for performance
          if (divRef.current) {
            divRef.current.innerText = Math.floor(countRef.current.value);
          }
        },
      },
      "<",
    ); // "<" makes opacity and counting start at the same time

    // 2. Store the timeline in a ref so hover functions can see it
    tlRef.current = tl;

    // Cleanup on unmount
    return () => tl.kill();
  }, []);

  // 3. Simple hover handlers that just control the timeline ref
  const handleMouseEnter = () => {
    if (tlRef.current) tlRef.current.play();
  };

  const handleMouseLeave = () => {
    if (tlRef.current) {
      tlRef.current.pause();

      // Fade away and reset
      gsap.to(divRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          // Reset the timeline and the raw value back to 0
          tlRef.current.progress(0).pause();
          countRef.current.value = 0;
          if (divRef.current) divRef.current.innerText = "0";
        },
      });
    }
  };

  return (
    <div
      ref={divRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: 0,
        cursor: "pointer",
        padding: "20px",
        text: "white",
      }}
    >
      0
    </div>
  );
}
