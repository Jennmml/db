import React from 'react';

const ReadComponent = ({data}) => {


  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md w-full">
      <h1 className="text-2xl font-bold mb-4">Read Component</h1>
      <ul className="space-y-4">
        {data.map((item) => (
          <li key={item.id} className="border-b border-gray-300 pb-2">
            <p className="text-gray-700"><strong>ID:</strong> {item.id}</p>
            <p className="text-gray-700"><strong>Name:</strong> {item.name}</p>
            <p className="text-gray-700"><strong>Age:</strong> {item.age}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReadComponent;