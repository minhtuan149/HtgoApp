"use client";

import { Send } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="sketch-border"
      style={{
        backgroundColor: "var(--paper-bg)",
        padding: "2.5rem 1.5rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "2.5rem",
        marginTop: "1.5rem",
        position: "relative",
      }}
    >
      {/* Footer Left Column: Logo & Newsletter signup */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", gridColumn: "span 2" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            className="sketch-border-sm hatch-orange"
            style={{
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            W
          </div>
          <span className="font-sketch" style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            WhatDev Studio
          </span>
        </div>
        <p style={{ fontSize: "0.88rem", maxWidth: "340px", lineHeight: "1.4" }}>
          Subscribe to our sketchbook logs to receive weekly design concepts and project dev insights right in your mailbox.
        </p>

        {/* Email Newsletter input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Pinned to subscriber list! Thank you ✉️");
            (e.target as HTMLFormElement).reset();
          }}
          style={{
            display: "flex",
            maxWidth: "340px",
            width: "100%",
            marginTop: "0.5rem",
          }}
        >
          <input
            type="email"
            placeholder="sketchy-inbox@mail.com"
            required
            className="sketch-border-sm"
            style={{
              flex: 1,
              padding: "0.5rem",
              fontFamily: "inherit",
              fontSize: "0.85rem",
              backgroundColor: "transparent",
              borderRight: "none",
              borderRadius: "120px 0 0 120px/8px 0 0 8px",
              outline: "none",
              color: "var(--sketch-color)",
            }}
          />
          <button
            type="submit"
            className="btn-sketch btn-sketch-blue"
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              borderRadius: "0 15px 15px 0/0 225px 225px 0",
              boxShadow: "none",
            }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* Footer Column 2: Products */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <h4 className="font-sketch" style={{ fontSize: "1.1rem" }}>
          Products
        </h4>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.9rem" }}>
          {["Note Sketcher", "Terminal Tasks", "Recipe Canvas", "Comic Builder"].map((item) => (
            <li key={item}>
              <a href="#apps-catalog" style={{ textDecoration: "none", color: "var(--sketch-color)", opacity: 0.8 }}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Column 3: Company */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
        <h4 className="font-sketch" style={{ fontSize: "1.1rem" }}>
          Company
        </h4>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.9rem" }}>
          {["About Us", "Our Journal", "Pencil Store", "Contact Us"].map((item) => (
            <li key={item}>
              <a href="#guestbook" style={{ textDecoration: "none", color: "var(--sketch-color)", opacity: 0.8 }}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer Bottom copyright */}
      <div
        style={{
          gridColumn: "1 / -1",
          textAlign: "center",
          fontSize: "0.8rem",
          borderTop: "1.5px dashed var(--sketch-color)",
          paddingTop: "1rem",
          marginTop: "1rem",
          opacity: 0.7,
        }}
      >
        © 2026 WhatDev Studio. Designed in a notebook, coded with love on charcoal lines.
      </div>
    </footer>
  );
}
