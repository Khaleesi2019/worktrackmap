
import React, { useState } from 'react';

interface NumericKeypadProps {
  onPinEnter: (pin: string) => void;
}

export default function NumericKeypad({ onPinEnter }: NumericKeypadProps) {
  const [pin, setPin] = useState('');

  const handleButtonClick = (value: string) => {
    setPin((prev) => (prev.length < 4 ? prev + value : prev));
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      onPinEnter(pin);
      setPin('');
    }
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="numeric-keypad">
      <div className="keypad-display">{pin}</div>
      <div className="keypad-buttons">
        {[...Array(10).keys()].map((num) => (
          <button key={num} onClick={() => handleButtonClick(num.toString())}>
            {num}
          </button>
        ))}
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleSubmit}>Enter</button>
      </div>
      <style jsx>{`
        .numeric-keypad {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .keypad-display {
          margin-bottom: 1rem;
          font-size: 1.5rem;
          letter-spacing: 0.3rem;
        }
        .keypad-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
