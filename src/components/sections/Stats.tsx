export default function Stats() {
  return (
    <section
      className="sketch-border"
      style={{
        display: "flex",
        flexWrap: "wrap",
        padding: "2rem",
        gap: "2.5rem",
        backgroundColor: "var(--paper-bg)",
        alignItems: "center",
        justifyContent: "space-between",
        margin: "1rem 0",
      }}
    >
      {/* Left side: Stats metrics */}
      <div
        style={{
          flex: 1,
          minWidth: "280px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
        }}
      >
        {[
          { metric: "14k+", label: "Lines Written" },
          { metric: "840+", label: "Coffee Cups" },
          { metric: "12", label: "Apps Built" },
        ].map((stat, idx) => (
          <div key={idx} style={{ textAlign: "center" }}>
            <div className="font-sketch" style={{ fontSize: "2.4rem", fontWeight: "bold", lineHeight: "1" }}>
              {stat.metric}
            </div>
            <div className="font-cursive" style={{ fontSize: "1.1rem", marginTop: "4px" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Vertical divider */}
      <div
        style={{
          width: "2px",
          height: "80px",
          backgroundColor: "var(--sketch-color)",
          opacity: 0.3,
          display: "none",
        }}
        className="desktop-divider"
      />

      {/* Right side: Designer Quote */}
      <div
        style={{
          flex: 1.2,
          minWidth: "280px",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        {/* Handdrawn Avatar Emoji Container */}
        <div
          className="sketch-border hatch-yellow"
          style={{
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            flexShrink: 0,
          }}
        >
          🎨
        </div>
        <div>
          <p className="font-cursive" style={{ fontSize: "1.2rem", fontStyle: "italic", lineHeight: "1.3" }}>
            "Simplicity is the ultimate sophistication. I build digital sketchbooks to return creative control directly to developers and designers."
          </p>
          <span style={{ fontSize: "0.85rem", fontWeight: "bold", display: "block", marginTop: "5px" }}>
            — Lead Designer, WhatDev Studio
          </span>
        </div>
      </div>
    </section>
  );
}
