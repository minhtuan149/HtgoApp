import Laptop from "@/components/mockups/Laptop";
import Phone from "@/components/mockups/Phone";
import { Star } from "lucide-react";

export default function Hero() {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "2.5rem",
        alignItems: "center",
        padding: "1rem 0",
      }}
    >
      {/* Hero Left: Pitch details */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        
        {/* Badge */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            className="sketch-border-sm font-cursive hatch-yellow"
            style={{
              padding: "2px 10px",
              fontSize: "1.1rem",
              fontWeight: "bold",
              transform: "rotate(-2deg)",
            }}
          >
            ⭐ New Release: Portfolio v2
          </span>
        </div>

        {/* Main Headline */}
        <h1
          className="font-sketch"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
            lineHeight: "1.1",
            fontWeight: "700",
            margin: 0,
          }}
        >
          Showcase Your <br />
          <span className="marker-underline marker-underline-yellow">Apps & Products</span>
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "1.15rem",
            lineHeight: "1.5",
            color: "var(--pencil-lead)",
            maxWidth: "480px",
          }}
        >
          A friendly and highly interactive collection of simple, fast, and utility-focused applications built specifically for modern creators. Drawn in a sketchbook, coded in production.
        </p>

        {/* Hero CTAs */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          <a href="#apps-catalog" className="btn-sketch btn-sketch-blue" style={{ padding: "0.8rem 1.6rem" }}>
            <span>Explore Apps</span>
            <Star size={16} />
          </a>
          <a href="#features" className="btn-sketch" style={{ padding: "0.8rem 1.6rem" }}>
            <span>Learn More</span>
          </a>
        </div>
      </div>

      {/* Hero Right: Laptop and mobile mockups */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "1.5rem",
          width: "100%",
        }}
      >
        <Laptop />
        <Phone />
      </div>
    </header>
  );
}
