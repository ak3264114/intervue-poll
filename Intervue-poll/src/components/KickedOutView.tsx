// components/KickedOutView.tsx
import React from 'react';
import { Button } from '@/components/ui/button';

const KickedOutView = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      <div className="space-y-6">
        <Button onClick={handleReload} className="mx-auto rounded-full px-6 py-2 bg-primary text-white">
          Re-Enter Poll
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">You’ve been Kicked out!</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Looks like the teacher had removed you from the poll system. Please try again sometime.
        </p>
      </div>
    </div>
  );
};

export default KickedOutView;
