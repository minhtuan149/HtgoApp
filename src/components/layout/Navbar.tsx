"use client";

import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav
      className="sketch-border-sm"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.8rem 1.5rem",
        backgroundColor: "var(--paper-bg)",
        boxShadow: "2px 2px 0px var(--sketch-color)",
      }}
    >
      {/* Hand-drawn Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          className="sketch-border-sm hatch-blue"
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.4rem",
          }}
        >
          W
        </div>
        <span className="font-sketch" style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
          WhatDev
        </span>
      </div>

      {/* Menu Links */}
      <div
        className="nav-links"
        style={{
          display: "flex",
          gap: "1.5rem",
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      >
        {[
          { label: "Home", href: "#" },
          { label: "Apps", href: "#apps-catalog" },
          { label: "Features", href: "#features" },
          { label: "About", href: "#" },
          { label: "Blog", href: "#" },
          { label: "Contact", href: "#guestbook" },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="wiggle-hover"
            style={{
              textDecoration: "none",
              color: "var(--sketch-color)",
              position: "relative",
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* Sketch Action Button */}
      <div>
        <a
          href="#apps-catalog"
          className="btn-sketch btn-sketch-blue"
          style={{ padding: "5px 12px", fontSize: "0.95rem" }}
        >
          <span>Get the Apps</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </nav>
  );
}
