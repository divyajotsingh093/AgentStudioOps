import React from 'react';
import { Badge } from '@/components/ui/badge';

const PolicyDetails: React.FC = () => {
  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">POL-23456</span>
          <span className="text-xs text-gray-500 mr-2">Life - Whole</span>
          <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
        </div>
        <div>
          <span className="text-xs text-gray-500">04/30/2024</span>
        </div>
      </div>
    </div>
  );
};

export default PolicyDetails;