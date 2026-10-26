"use client";

export default function HeroBg() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <img
        src="/hero-bg.jpg"
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  );
}
