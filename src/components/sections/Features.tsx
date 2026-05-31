import { Zap, ShieldAlert, PenTool, Cloud } from "lucide-react";

export default function Features() {
  return (
    <section id="features">
      <div className="sketch-divider">
        <h2 className="font-sketch" style={{ fontSize: "2rem", textTransform: "uppercase" }}>
          Built For Creators
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.8rem",
          marginTop: "1rem",
        }}
      >
        {[
          {
            icon: <Zap size={22} />,
            title: "Lightning Speed",
            desc: "Static builds and lightweight rendering engines keep your apps loading instantly.",
            theme: "yellow",
          },
          {
            icon: <ShieldAlert size={22} />,
            title: "Privacy First",
            desc: "Secure clients, local storage cache models, and zero telemetry collection trackers.",
            theme: "blue",
          },
          {
            icon: <PenTool size={22} />,
            title: "Beautiful UI/UX",
            desc: "Polished interfaces designed to look friendly, creative, and extremely premium.",
            theme: "orange",
          },
          {
            icon: <Cloud size={22} />,
            title: "Cloud Syncing",
            desc: "Seamless synchronization of your workspace documents with distributed filesystems.",
            theme: "green",
          },
        ].map((feat, idx) => (
          <div
            key={idx}
            className="sketch-border wiggle-hover"
            style={{
              padding: "1.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.8rem",
              backgroundColor: "var(--paper-bg)",
              transition: "transform 0.2s ease",
            }}
          >
            {/* Circular Hatch Border */}
            <div
              className={`sketch-border-sm ${
                feat.theme === "blue"
                  ? "hatch-blue"
                  : feat.theme === "yellow"
                  ? "hatch-yellow"
                  : feat.theme === "green"
                  ? "hatch-green"
                  : "hatch-orange"
              }`}
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--sketch-color)",
              }}
            >
              {feat.icon}
            </div>
            <h3 className="font-sketch" style={{ fontSize: "1.2rem", margin: 0 }}>
              {feat.title}
            </h3>
            <p style={{ fontSize: "0.88rem", lineHeight: "1.4" }}>{feat.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
