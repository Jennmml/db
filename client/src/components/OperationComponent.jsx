import React from 'react';

const Operation = ({ operationName, selectedButton, additionalAction }) => {
  const handleClick = () => {
    selectedButton();
    if (additionalAction) {
      additionalAction();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-10">
      <div className="flex flex-col items-center justify-center bg-white p-10 rounded shadow-lg">
        <button
          onClick={handleClick}
          className="bg-blue-500 text-white py-4 px-8 rounded text-2xl hover:bg-blue-700"
        >
          {operationName}
        </button>
      </div>
    </div>
  );
};

export default Operation;