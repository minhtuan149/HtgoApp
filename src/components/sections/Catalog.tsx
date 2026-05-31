"use client";

import { useState } from "react";
import { Heart, ArrowRight, Layers, Code, Coffee, PenTool } from "lucide-react";

interface AppProduct {
  id: string;
  name: string;
  description: string;
  likes: number;
  category: string;
  tech: string[];
  theme: "blue" | "yellow" | "green" | "orange";
}

export default function Catalog() {
  const [apps, setApps] = useState<AppProduct[]>([
    {
      id: "note-sketcher",
      name: "Note Sketcher",
      description: "A digital notebook that converts your chicken-scratch handwriting into clean documents.",
      likes: 342,
      category: "Utility",
      tech: ["React", "HTML5 Canvas", "AI OCR"],
      theme: "blue",
    },
    {
      id: "terminal-tasks",
      name: "Terminal Tasks",
      description: "A super-fast, keyboard-driven productivity app designed directly inside your terminal emulator.",
      likes: 189,
      category: "Productivity",
      tech: ["NextJS", "xterm.js", "PostgreSQL"],
      theme: "yellow",
    },
    {
      id: "recipe-canvas",
      name: "Recipe Canvas",
      description: "Map out your culinary ideas visually on a flexible, interactive ingredients corkboard.",
      likes: 276,
      category: "Lifestyle",
      tech: ["Tailwind", "Dnd-kit", "LocalDB"],
      theme: "green",
    },
    {
      id: "ai-comic",
      name: "AI Comic Builder",
      description: "Generate rough hand-drawn storyboard frames from simple text prompts in seconds.",
      likes: 512,
      category: "Creative",
      tech: ["Next.js", "StableDiffusion", "S3"],
      theme: "orange",
    },
  ]);

  const handleLike = (id: string) => {
    setApps((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, likes: app.likes + 1 } : app
      )
    );
  };

  const getThemeHatchClass = (theme: AppProduct["theme"]) => {
    if (theme === "blue") return "hatch-blue";
    if (theme === "yellow") return "hatch-yellow";
    if (theme === "green") return "hatch-green";
    return "hatch-orange";
  };

  const getThemeShadowClass = (theme: AppProduct["theme"]) => {
    if (theme === "blue") return "sketch-shadow-blue";
    if (theme === "yellow") return "sketch-shadow-yellow";
    if (theme === "green") return "sketch-shadow-green";
    return "sketch-shadow-orange";
  };

  const getThemeColorToken = (theme: AppProduct["theme"]) => {
    if (theme === "blue") return "var(--pastel-blue)";
    if (theme === "yellow") return "var(--pastel-yellow)";
    if (theme === "green") return "var(--pastel-green)";
    return "var(--pastel-orange)";
  };

  return (
    <section id="apps-catalog">
      <div className="sketch-divider">
        <h2 className="font-sketch" style={{ fontSize: "2rem", textTransform: "uppercase" }}>
          My Apps & Products
        </h2>
      </div>

      <p style={{ textAlign: "center", maxWidth: "600px", margin: "-1rem auto 2.5rem auto", fontSize: "1.1rem" }}>
        Below are the hand-crafted digital products currently live. Click the upvotes to show some love, or launch them to check out how they work.
      </p>

      {/* 2x2 Grid of Color-Coded App Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          padding: "0.5rem",
        }}
      >
        {apps.map((app) => (
          <div
            key={app.id}
            className={`sketch-border-lg ${getThemeShadowClass(app.theme)} wiggle-hover`}
            style={{
              backgroundColor: "var(--paper-bg)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              position: "relative",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {/* Category label */}
            <span
              className="font-cursive"
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                fontSize: "1.1rem",
                color: "var(--accent-ink)",
                fontWeight: "bold",
              }}
            >
              {app.category}
            </span>

            {/* Card Header with Hatched Icon Border */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                className={`sketch-border-sm ${getThemeHatchClass(app.theme)}`}
                style={{
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {app.theme === "blue" && <Layers size={24} color="var(--sketch-color)" />}
                {app.theme === "yellow" && <Code size={24} color="var(--sketch-color)" />}
                {app.theme === "green" && <Coffee size={24} color="var(--sketch-color)" />}
                {app.theme === "orange" && <PenTool size={24} color="var(--sketch-color)" />}
              </div>
              <div>
                <h3 className="font-sketch" style={{ fontSize: "1.4rem", margin: 0 }}>
                  {app.name}
                </h3>
                {/* Tech stack tags */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                  {app.tech.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "0.7rem",
                        border: "1px dashed var(--sketch-color)",
                        borderRadius: "4px",
                        padding: "1px 5px",
                        opacity: 0.8,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: "0.95rem", flex: 1, lineHeight: "1.4" }}>
              {app.description}
            </p>

            {/* Card Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "0.5rem",
                borderTop: "1.5px dashed var(--sketch-color)",
                paddingTop: "0.8rem",
              }}
            >
              {/* Dynamic Upvote Button */}
              <button
                onClick={() => handleLike(app.id)}
                className="sketch-border-sm"
                style={{
                  background: "none",
                  cursor: "pointer",
                  padding: "4px 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "inherit",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  transition: "transform 0.1s ease",
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.95)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Heart
                  size={16}
                  fill={app.likes > 0 ? getThemeColorToken(app.theme) : "none"}
                  color={app.likes > 0 ? getThemeColorToken(app.theme) : "var(--sketch-color)"}
                  style={{ transition: "all 0.2s ease" }}
                />
                <span>{app.likes} likes</span>
              </button>

              {/* Launch Button */}
              <a
                href={`#view-${app.id}`}
                className={`btn-sketch ${
                  app.theme === "blue"
                    ? "btn-sketch-blue"
                    : app.theme === "orange"
                    ? "btn-sketch-orange"
                    : ""
                }`}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.9rem",
                  gap: "4px",
                }}
              >
                <span>Launch</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
