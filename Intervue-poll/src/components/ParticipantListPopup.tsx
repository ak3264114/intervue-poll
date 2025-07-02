// components/ParticipantListPopup.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ParticipantListPopupProps {
  open: boolean;
  onClose: () => void;
  participants: string[];
}

const ParticipantListPopup: React.FC<ParticipantListPopupProps> = ({ open, onClose, participants }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Participants</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {participants.length > 0 ? (
            participants.map((name, idx) => (
              <div
                key={idx}
                className="p-2 rounded-md border border-gray-200 bg-gray-50 text-sm"
              >
                {name}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No participants connected.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantListPopup;
