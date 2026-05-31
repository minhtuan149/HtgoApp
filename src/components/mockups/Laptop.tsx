export default function Laptop() {
  return (
    <div
      className="wiggle-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: "480px",
        width: "100%",
        minWidth: "300px",
        transition: "transform 0.3s ease",
      }}
    >
      {/* Screen */}
      <div
        className="sketch-border-lg"
        style={{
          width: "100%",
          aspectRatio: "1.6",
          backgroundColor: "var(--paper-bg)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.02)",
          borderColor: "var(--sketch-color)",
        }}
      >
        {/* Top bezel bar with camera */}
        <div
          style={{
            height: "14px",
            borderBottom: "2px solid var(--sketch-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
            backgroundColor: "rgba(0,0,0,0.03)",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "var(--sketch-color)",
            }}
          />
        </div>

        {/* Screen Content - Dashboard Concept */}
        <div
          style={{
            flex: 1,
            padding: "0.8rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          {/* Window header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1.5px dashed var(--sketch-color)",
              paddingBottom: "4px",
            }}
          >
            <span className="font-sketch" style={{ fontWeight: "bold" }}>
              💻 WORKSPACE_v1.0.exe
            </span>
            <div style={{ display: "flex", gap: "3px" }}>
              {["-", "□", "x"].map((btn) => (
                <span
                  key={btn}
                  className="sketch-border-sm"
                  style={{
                    padding: "0 4px",
                    fontSize: "0.6rem",
                    cursor: "pointer",
                  }}
                >
                  {btn}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard grid */}
          <div style={{ display: "flex", gap: "0.6rem", flex: 1 }}>
            {/* Left Column: Progress Circle */}
            <div
              className="sketch-border-sm hatch-blue"
              style={{
                flex: 1.1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.5rem",
                textAlign: "center",
              }}
            >
              <span className="font-sketch" style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
                BUILD STATE
              </span>

              {/* SVG Handdrawn circle loader */}
              <svg
                width="65"
                height="65"
                viewBox="0 0 100 100"
                style={{ transform: "rotate(-90deg)", margin: "5px 0" }}
              >
                {/* Background sketchy path */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--sketch-color)"
                  strokeWidth="4"
                  strokeDasharray="4 6"
                  opacity="0.3"
                />
                {/* Foreground active path */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="var(--pastel-blue)"
                  strokeWidth="6"
                  strokeDasharray="251"
                  strokeDashoffset="50" /* 80% filled */
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(1px 1px 0px var(--sketch-color))" }}
                />
              </svg>
              <span style={{ fontSize: "1.05rem", fontWeight: "bold" }}>80% done</span>
            </div>

            {/* Right Column: Deadlines / Stats */}
            <div
              style={{
                flex: 1.4,
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <div
                className="sketch-border-sm hatch-yellow"
                style={{
                  padding: "4px 8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Likes</span>
                <span style={{ fontWeight: "bold" }}>❤️ 1.4k</span>
              </div>
              <div
                className="sketch-border-sm hatch-green"
                style={{
                  padding: "4px 8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Views</span>
                <span style={{ fontWeight: "bold" }}>👁️ 2.8k</span>
              </div>

              {/* mini project list */}
              <div
                className="sketch-border-sm"
                style={{
                  flex: 1,
                  padding: "4px 8px",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                  fontSize: "0.75rem",
                }}
              >
                <span style={{ fontWeight: "bold", borderBottom: "1px dashed var(--sketch-color)" }}>
                  Active Apps
                </span>
                <div>• Note Sketcher</div>
                <div>• Terminal CLI</div>
                <div>• Recipe Board</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Laptop Keyboard base */}
      <div
        style={{
          width: "105%",
          height: "18px",
          border: "3px solid var(--sketch-color)",
          backgroundColor: "var(--paper-bg)",
          borderRadius: "0 0 16px 16px/0 0 10px 10px",
          position: "relative",
          boxShadow: "0 6px 0 var(--sketch-color)",
        }}
      >
        {/* Stylized keyboard lines */}
        <div
          style={{
            position: "absolute",
            left: "10%",
            right: "10%",
            top: "2px",
            height: "4px",
            borderBottom: "1.5px dashed var(--sketch-color)",
          }}
        />
        {/* Laptop Opening lip notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "45px",
            height: "4px",
            border: "1.5px solid var(--sketch-color)",
            borderTop: "none",
            borderRadius: "0 0 4px 4px",
            backgroundColor: "var(--desk-bg)",
          }}
        />
        {/* Trackpad */}
        <div
          style={{
            position: "absolute",
            bottom: "2px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "55px",
            height: "6px",
            border: "1.5px solid var(--sketch-color)",
            borderRadius: "2px 2px 0 0",
          }}
        />
      </div>
    </div>
  );
}
