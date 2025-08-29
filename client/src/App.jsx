import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./styles.css";

const socket = io("http://localhost:4000");

// Dataset of sentences
const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "Sphinx of black quartz, judge my vow.",
  "How razorback-jumping frogs can level six piqued gymnasts!",
  "Bright vixens jump; dozy fowl quack.",
  "Jackdaws love my big sphinx of quartz.",
  "The five boxing wizards jump quickly.",
  "Crazy Fredrick bought many very exquisite opal jewels.",
];

function App() {
  const [sentence, setSentence] = useState(
    sentences[Math.floor(Math.random() * sentences.length)]
  );
  const [input, setInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(20); // Reduced time for challenge
  const [isFinished, setIsFinished] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isFinished) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsFinished(true);
    }
  }, [timeLeft, isFinished]);

  // Socket listener (for future multiplayer)
  useEffect(() => {
    socket.on("typing-progress", (data) => {
      setProgress(data.progress);
      setAccuracy(data.accuracy);
    });
  }, []);

  // Handle typing input
  const handleChange = (e) => {
    if (isFinished) return;
    const value = e.target.value;
    setInput(value);

    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === sentence[i]) correctChars++;
    }

    const newProgress = Math.min((correctChars / sentence.length) * 100, 100);
    const newAccuracy = value.length ? (correctChars / value.length) * 100 : 100;

    setProgress(newProgress);
    setAccuracy(newAccuracy);

    socket.emit("typing-progress", { progress: newProgress, accuracy: newAccuracy });

    // Stop game if sentence completed
    if (value === sentence) setIsFinished(true);
  };

  const handleFinishGame = () => setIsFinished(true);

  const handleNewSentence = () => {
    const newSent = sentences[Math.floor(Math.random() * sentences.length)];
    setSentence(newSent);
    setInput("");
    setProgress(0);
    setAccuracy(100);
    setTimeLeft(20);
    setIsFinished(false);
  };

  return (
    <div className="app">
      <h1>Typing Speed Race</h1>

      <p className="sentence">
        {sentence.split("").map((char, i) => {
          let className = "";
          if (i < input.length) {
            className = char === input[i] ? "correct" : "wrong";
          }
          return (
            <span key={i} className={className}>
              {char}
            </span>
          );
        })}
      </p>

      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Start typing..."
        disabled={isFinished}
      />

      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>

      <p>Progress: {progress.toFixed(2)}%</p>
      <p>Accuracy: {accuracy.toFixed(2)}%</p>
      <p>Time Left: {timeLeft}s</p>

      {!isFinished && (
        <button onClick={handleFinishGame} className="finish-btn">
          Finish Game
        </button>
      )}

      {isFinished && (
        <>
          <h2>✅ Game Finished!</h2>
          <p>Final Progress: {progress.toFixed(2)}%</p>
          <p>Final Accuracy: {accuracy.toFixed(2)}%</p>
          <button onClick={handleNewSentence}>Next Sentence</button>
        </>
      )}
    </div>
  );
}

export default App;


