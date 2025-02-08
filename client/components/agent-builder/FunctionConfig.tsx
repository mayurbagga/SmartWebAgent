import React, { useState } from 'react';
import { Trash2 } from "lucide-react";

interface FunctionConfigProps {
  func: {
    id: string;
    name: string;
    description: string;
  };
  onRemove: (id: string) => void;
}

const FunctionConfig: React.FC<FunctionConfigProps> = ({ func, onRemove }) => {
  const [customName, setCustomName] = useState('');

  return (
    <div className="border rounded-lg y-4 bg-[#1D1D1D]">
      <div className='border-b-2 border-[#232323] px-4 py-2 flex justify-between'>
      <h3 className="font-semibold ">{func.name}</h3>
      <Trash2 className="cursor-pointer h-5 w-5" onClick={() => onRemove(func.id)} />
      </div>
      
      <div className="p-4">
        <label className="block text-sm mb-2">Function Name</label>
        <input
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Custom name for this function"
          className="focus:outline-none rounded-md w-full p-2 bg-[#242424]"
        />
      </div>
      <div className="p-4">
        <label className="block text-sm mb-2">Parameters</label>
        <textarea
          placeholder="Configure function parameters..."
          className="focus:outline-none rounded-md bg-[#242424] w-full p-2 h-24"
        />
      </div>
      
    </div>
  );
};

export default FunctionConfig; 