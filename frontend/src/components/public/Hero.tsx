"use client";
import { TextGenerateEffect } from "../ui/text-generate-effect";

const words = `Streaming latest documentation to developers.`;

export function Hero() {
  return (
    <div>
      <TextGenerateEffect duration={0.6} filter={true} words={words} />
    </div>
  );
}
