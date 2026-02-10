import { useEffect, useRef } from "react";
import "./App.css";
import porscheUrl from "./assets/porsche.png";

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 220;
export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const img = new Image();
    img.src = porscheUrl;

    let animationId = 0;

    function removeBackground(image) {
      const off = document.createElement("canvas");
      off.width = image.width;
      off.height = image.height;
      const offCtx = off.getContext("2d");
      if (!offCtx) return null;

      offCtx.drawImage(image, 0, 0);
      const imageData = offCtx.getImageData(0, 0, off.width, off.height);
      const data = imageData.data;
      const key = [data[0], data[1], data[2]];
      const threshold = 50;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (
          Math.abs(r - key[0]) < threshold &&
          Math.abs(g - key[1]) < threshold &&
          Math.abs(b - key[2]) < threshold
        ) {
          data[i + 3] = 0;
        }
      }

      offCtx.putImageData(imageData, 0, 0);
      return off;
    }

    img.onload = () => {
      const cleaned = removeBackground(img);
      if (!cleaned) return;

      const scale = Math.min(
        (CANVAS_WIDTH - 24) / cleaned.width,
        (CANVAS_HEIGHT - 40) / cleaned.height
      );
      const spriteWidth = cleaned.width * scale;
      const spriteHeight = cleaned.height * scale;
      const minX = 8;
      const maxX = CANVAS_WIDTH - spriteWidth - 8;
      let x = minX;
      let vx = 0.6;
      let lastTime = 0;

      function frame(time) {
        const delta = time - lastTime;
        lastTime = time;

        x += vx * delta * 0.08;
        if (x <= minX) {
          x = minX;
          vx = Math.abs(vx);
        } else if (x >= maxX) {
          x = maxX;
          vx = -Math.abs(vx);
        }

        const bob = Math.sin(time / 320) * 2;

        const yBase = (CANVAS_HEIGHT - spriteHeight) / 2 + 10;

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.beginPath();
        ctx.ellipse(
          x + spriteWidth / 2,
          yBase + spriteHeight * 0.8,
          spriteWidth * 0.45,
          6,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.save();
        if (vx < 0) {
          ctx.translate(x + spriteWidth, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(
            cleaned,
            0,
            yBase + bob,
            spriteWidth,
            spriteHeight
          );
        } else {
          ctx.drawImage(
            cleaned,
            x,
            yBase + bob,
            spriteWidth,
            spriteHeight
          );
        }
        ctx.restore();

        animationId = requestAnimationFrame(frame);
      }

      animationId = requestAnimationFrame(frame);
    };

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="scene">
      <canvas ref={canvasRef} aria-label="Pixel Porsche" />
    </div>
  );
}
