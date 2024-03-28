// Modal.js
const Modal = ({ onConfirm, onCancel }) => {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Potvrdiť nahratie súborov</h3>
            <div className="mt-2 px-7 py-3">
              <p className="text-sm text-gray-500">Chcete pokračovať v nahrávaní vybraných súborov?</p>
            </div>
            <div className="items-center px-4 py-3">
              <button
                id="ok-btn"
                className="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300"
                onClick={onConfirm}>Áno</button>
              <button
                id="cancel-btn"
                className="px-4 py-2 ml-3 bg-red-500 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                onClick={onCancel}>Zrušiť</button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default Modal;
  