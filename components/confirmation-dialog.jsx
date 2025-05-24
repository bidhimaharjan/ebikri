const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50 p-4">
      <div className="bg-white p-6 md:p-8 lg:p-12 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-base md:text-lg font-semibold text-gray-700 mt-2 md:mt-4">
          {message}
        </h2>
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            className="px-4 py-2 bg-gray-200 border border-gray-300 text-sm text-gray-700 rounded-md hover:bg-gray-300 w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-500 text-sm text-white rounded-md hover:bg-purple-400 w-full sm:w-auto"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;