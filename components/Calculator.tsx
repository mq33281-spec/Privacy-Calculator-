
import React, { useState } from 'react';

interface CalculatorProps {
  onUnlock: (code: string) => void;
  passcode: string;
}

const Calculator: React.FC<CalculatorProps> = ({ onUnlock, passcode }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleButtonClick = (value: string) => {
    if (value === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }

    if (value === '=') {
      if (display === passcode) {
        onUnlock(display);
        return;
      }
      try {
        // Simple evaluator for the "fake" calculator logic
        // We use Function constructor for a basic calculator demo (safe for digits/ops)
        const result = eval(equation + display);
        setDisplay(String(result));
        setEquation('');
      } catch {
        setDisplay('Error');
        setEquation('');
      }
      return;
    }

    if (['+', '-', '*', '/'].includes(value)) {
      setEquation(display + ' ' + value + ' ');
      setDisplay('0');
      return;
    }

    setDisplay(prev => (prev === '0' ? value : prev + value));
  };

  const buttons = [
    'C', '(', ')', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  return (
    <div className="flex flex-col h-full bg-black max-w-md mx-auto shadow-2xl overflow-hidden border border-gray-800 rounded-3xl">
      <div className="flex-1 flex flex-col justify-end p-6 bg-zinc-900">
        <div className="text-gray-500 text-sm text-right h-6 mb-1">{equation}</div>
        <div className="text-white text-6xl font-light text-right overflow-hidden whitespace-nowrap">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-px bg-zinc-800 p-2">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleButtonClick(btn)}
            className={`
              ${btn === '0' ? 'col-span-2' : ''}
              ${['/', '*', '-', '+', '='].includes(btn) ? 'bg-orange-500 hover:bg-orange-400' : 'bg-zinc-700 hover:bg-zinc-600'}
              ${btn === 'C' ? 'text-orange-500' : 'text-white'}
              h-20 text-2xl font-medium rounded-full m-1 transition-colors active:scale-95
            `}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calculator;
