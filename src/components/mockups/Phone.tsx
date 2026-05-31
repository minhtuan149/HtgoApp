"use client";

import { useState } from "react";

interface TaskItem {
  id: number;
  text: string;
  checked: boolean;
}

export default function Phone() {
  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: 1, text: "Sketch new app wireframe", checked: true },
    { id: 2, text: "Hook up Neon database", checked: true },
    { id: 3, text: "Color-pencil button icons", checked: false },
    { id: 4, text: "Drink warm coffee ☕", checked: false },
    { id: 5, text: "Upload landing page", checked: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t))
    );
  };

  return (
    <div
      className="wiggle-hover"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "220px",
        transition: "transform 0.3s ease",
      }}
    >
      <div
        className="sketch-border-lg"
        style={{
          width: "100%",
          height: "400px",
          backgroundColor: "var(--paper-bg)",
          position: "relative",
          padding: "24px 10px 24px 10px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "6px 8px 0px var(--sketch-color)",
          borderColor: "var(--sketch-color)",
          borderRadius: "32px 28px 32px 28px/28px 32px 28px 32px",
        }}
      >
        {/* Top Notch speaker and camera */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80px",
            height: "10px",
            border: "1.5px solid var(--sketch-color)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 10px",
            backgroundColor: "rgba(0,0,0,0.03)",
          }}
        >
          {/* Camera */}
          <div
            style={{
              width: "4px",
              height: "4px",
              borderRadius: "50%",
              backgroundColor: "var(--sketch-color)",
            }}
          />
          {/* Speaker */}
          <div
            style={{
              width: "35px",
              height: "2px",
              backgroundColor: "var(--sketch-color)",
              borderRadius: "2px",
            }}
          />
          {/* Sensor */}
          <div
            style={{
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: "var(--sketch-color)",
            }}
          />
        </div>

        {/* Screen Content - Interactive Checklist */}
        <div
          className="sketch-border-sm"
          style={{
            flex: 1,
            backgroundColor: "var(--paper-bg)",
            display: "flex",
            flexDirection: "column",
            padding: "0.6rem",
            gap: "0.5rem",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "1.5px dashed var(--sketch-color)",
              paddingBottom: "4px",
              marginBottom: "4px",
            }}
          >
            <h4 className="font-sketch" style={{ fontSize: "0.95rem", margin: 0 }}>
              📋 TODAY'S TASKS
            </h4>
            <span className="font-cursive" style={{ fontSize: "0.9rem", color: "var(--accent-ink)" }}>
              Click to cross off!
            </span>
          </div>

          {/* List */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              overflowY: "auto",
              flex: 1,
              paddingRight: "2px",
            }}
          >
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.4rem",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  backgroundColor: task.checked ? "var(--pastel-green-light)" : "transparent",
                  border: task.checked ? "1px dashed var(--pastel-green)" : "1px solid transparent",
                  transition: "all 0.2s ease",
                  fontSize: "0.8rem",
                  userSelect: "none",
                }}
              >
                {/* Sketch checkbox */}
                <div
                  className="sketch-border-sm"
                  style={{
                    width: "15px",
                    height: "15px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--paper-bg)",
                    flexShrink: 0,
                    marginTop: "1px",
                    position: "relative",
                    borderColor: task.checked ? "var(--pastel-green)" : "var(--sketch-color)",
                  }}
                >
                  {task.checked && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        color: "var(--pastel-green)",
                        position: "absolute",
                        top: "-3px",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                {/* Task text */}
                <span
                  className="font-handwritten"
                  style={{
                    textDecoration: task.checked ? "line-through" : "none",
                    color: task.checked ? "var(--pencil-lead)" : "var(--sketch-color)",
                    opacity: task.checked ? 0.6 : 1,
                    fontStyle: task.checked ? "italic" : "normal",
                    wordBreak: "break-word",
                    fontSize: "0.9rem",
                  }}
                >
                  {task.text}
                </span>
              </div>
            ))}
          </div>

          {/* Micro progress bar */}
          <div style={{ marginTop: "auto", paddingTop: "5px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.7rem",
                marginBottom: "2px",
              }}
            >
              <span>Progress</span>
              <span>
                {tasks.filter((t) => t.checked).length}/{tasks.length}
              </span>
            </div>
            <div
              className="sketch-border-sm"
              style={{
                height: "10px",
                width: "100%",
                backgroundColor: "rgba(0,0,0,0.02)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(tasks.filter((t) => t.checked).length / tasks.length) * 100}%`,
                  backgroundColor: "var(--pastel-green)",
                  transition: "width 0.3s ease",
                }}
                className="hatch-green"
              />
            </div>
          </div>
        </div>

        {/* Bottom Home Button */}
        <div
          className="sketch-border-sm"
          style={{
            position: "absolute",
            bottom: "4px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            cursor: "pointer",
            backgroundColor: "rgba(0,0,0,0.02)",
          }}
        />
      </div>
    </div>
  );
}
