import { useState } from 'react';

const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-12 rounded-md shadow-lg w-100">
        <h2 className="text-lg font-semibold text-gray-700 mt-4">{message}</h2>
        <div className="mt-4 flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-400 mt-6"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>

          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-400 mt-6"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
