"use client";

import { useState } from "react";
import { MessageSquare, User } from "lucide-react";

interface FeedbackComment {
  id: string;
  name: string;
  content: string;
  date: string;
}

export default function Guestbook() {
  const [comments, setComments] = useState<FeedbackComment[]>([
    {
      id: "c-1",
      name: "Jane Doe",
      content: "This sketchbook design is absolutely outstanding! The paper texture looks so real.",
      date: "May 31, 2026",
    },
    {
      id: "c-2",
      name: "Mark K.",
      content: "Wait, the interactive checklist on the phone mockup is so satisfying to click. Great UI!",
      date: "May 30, 2026",
    },
    {
      id: "c-3",
      name: "Sarah Lin",
      content: "Love the colored pencil shading effects. Extremely creative and well polished.",
      date: "May 29, 2026",
    },
  ]);

  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) return;

    const newComment: FeedbackComment = {
      id: `c-${Date.now()}`,
      name: newName,
      content: newContent,
      date: "Just now",
    };

    setComments([newComment, ...comments]);
    setNewName("");
    setNewContent("");
  };

  return (
    <section id="guestbook">
      <div className="sketch-divider">
        <h2 className="font-sketch" style={{ fontSize: "2rem", textTransform: "uppercase" }}>
          Guestbook Bulletin Board
        </h2>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        {/* Left Column: Form to Write Sticky Notes */}
        <div
          className="sketch-border"
          style={{
            flex: 1,
            minWidth: "280px",
            padding: "1.5rem",
            backgroundColor: "var(--paper-bg)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h3 className="font-sketch" style={{ fontSize: "1.3rem" }}>
            📌 Pinned Feedback
          </h3>
          <p style={{ fontSize: "0.9rem" }}>
            Leave a sticky note on our wall! Your signature and comment will be instantly pinned onto the whiteboard on the right.
          </p>

          <form onSubmit={handleAddComment} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label className="font-sketch" style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                Your Name:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Sketcher McGee"
                className="sketch-border-sm"
                style={{
                  padding: "0.5rem",
                  fontFamily: "inherit",
                  backgroundColor: "transparent",
                  color: "var(--sketch-color)",
                  outline: "none",
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label className="font-sketch" style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                Your Message:
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Type your hand-drawn note here..."
                className="sketch-border-sm"
                style={{
                  padding: "0.5rem",
                  minHeight: "80px",
                  fontFamily: "inherit",
                  backgroundColor: "transparent",
                  color: "var(--sketch-color)",
                  resize: "vertical",
                  outline: "none",
                }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-sketch btn-sketch-orange"
              style={{
                alignSelf: "flex-start",
                marginTop: "0.4rem",
                padding: "6px 15px",
              }}
            >
              <span>Pin Comment</span>
              <MessageSquare size={16} />
            </button>
          </form>
        </div>

        {/* Right Column: Corkboard with Sticky Notes */}
        <div
          className="corkboard"
          style={{
            flex: 1.8,
            minWidth: "300px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1.2rem",
            alignContent: "start",
          }}
        >
          {comments.map((comment) => (
            <div key={comment.id} className="sticky-note">
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <User size={14} color="var(--sketch-color)" />
                <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{comment.name}</span>
              </div>
              <p style={{ fontSize: "0.85rem", fontStyle: "italic", wordBreak: "break-word" }}>
                "{comment.content}"
              </p>
              <span
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.6,
                  display: "block",
                  marginTop: "8px",
                  textAlign: "right",
                }}
              >
                {comment.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
