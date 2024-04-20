const Modal = ({ onConfirm, extractionOptions, setExtractionOptions, onCancel }) => {
  const handleChange = (event) => {
      setExtractionOptions({
          ...extractionOptions,
          [event.target.name]: event.target.checked
      });
  };

  return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Confirm File Upload</h3>
              <div className="text-left space-y-4">
                  <div>
                      <label className="inline-flex items-center">
                          <input type="checkbox" name="bold" checked={extractionOptions.bold} onChange={handleChange} />
                          <span className="ml-2">Bold</span>
                      </label>
                  </div>
                  <div>
                      <label className="inline-flex items-center">
                          <input type="checkbox" name="italic" checked={extractionOptions.italic} onChange={handleChange} />
                          <span className="ml-2">Italic</span>
                      </label>
                  </div>
                  <div>
                      <label className="inline-flex items-center">
                          <input type="checkbox" name="colored" checked={extractionOptions.colored} onChange={handleChange} />
                          <span className="ml-2">Colored</span>
                      </label>
                  </div>
                  <div>
                      <label className="inline-flex items-center">
                          <input type="checkbox" name="sized" checked={extractionOptions.sized} onChange={handleChange} />
                          <span className="ml-2">Sized</span>
                      </label>
                  </div>
                  <div>
                      <label className="inline-flex items-center">
                          <input type="checkbox" name="sized" checked={extractionOptions.ssized} onChange={handleChange} />
                          <span className="ml-2">Ssized</span>
                      </label>
                  </div>
              </div>
              <div className="flex justify-end mt-6">
                  <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                      onClick={() => onConfirm(extractionOptions)}
                  >
                      Confirm
                  </button>
                  <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2"
                      onClick={onCancel}
                  >
                      Cancel
                  </button>
              </div>
          </div>
      </div>
  );
};

export default Modal;
