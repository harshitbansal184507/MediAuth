import { useState, useEffect } from "react";
import { ocrAPI } from "../services/api";
import toast from "react-hot-toast";

const OCRResults = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await ocrAPI.getUploads();
      setUploads(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch uploads");
    } finally {
      setLoading(false);
    }
  };

  const handleReprocess = async (id) => {
    try {
      toast.loading("Reprocessing...");
      await ocrAPI.reprocessUpload(id);
      toast.dismiss();
      toast.success("Reprocessed successfully");
      fetchUploads();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to reprocess");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this upload?")) return;

    try {
      await ocrAPI.deleteUpload(id);
      toast.success("Deleted successfully");
      fetchUploads();
      if (selectedUpload?.id === id) {
        setSelectedUpload(null);
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Processed Prescriptions</h3>

      {uploads.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No uploads yet</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="bg-white p-4 rounded-lg shadow border"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        upload.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : upload.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {upload.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(upload.uploaded_at).toLocaleString()}
                    </span>
                  </div>

                  {upload.status === "completed" &&
                    upload.parsed_data?.medicines && (
                      <div className="mt-2 text-sm">
                        <p className="font-medium">
                          {upload.parsed_data.medicines.length} medicine(s)
                          found
                        </p>
                        {upload.parsed_data.patient_name && (
                          <p className="text-gray-600">
                            Patient: {upload.parsed_data.patient_name}
                          </p>
                        )}
                      </div>
                    )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedUpload(upload)}
                    className="text-indigo-600 hover:text-indigo-900 text-sm"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleReprocess(upload.id)}
                    className="text-blue-600 hover:text-blue-900 text-sm"
                  >
                    Reprocess
                  </button>
                  <button
                    onClick={() => handleDelete(upload.id)}
                    className="text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Extraction Details</h3>
                <button
                  onClick={() => setSelectedUpload(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {selectedUpload.parsed_data && (
                <div className="space-y-4">
                  {selectedUpload.parsed_data.patient_name && (
                    <div>
                      <p className="font-medium">Patient:</p>
                      <p>{selectedUpload.parsed_data.patient_name}</p>
                    </div>
                  )}

                  {selectedUpload.parsed_data.doctor_name && (
                    <div>
                      <p className="font-medium">Doctor:</p>
                      <p>{selectedUpload.parsed_data.doctor_name}</p>
                    </div>
                  )}

                  {selectedUpload.parsed_data.diagnosis && (
                    <div>
                      <p className="font-medium">Diagnosis:</p>
                      <p>{selectedUpload.parsed_data.diagnosis}</p>
                    </div>
                  )}

                  {selectedUpload.parsed_data.medicines?.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Medicines:</p>
                      <div className="space-y-3">
                        {selectedUpload.parsed_data.medicines.map(
                          (med, idx) => (
                            <div key={idx} className="bg-gray-50 p-3 rounded">
                              <p className="font-medium">{med.medicine_name}</p>
                              <p className="text-sm text-gray-600">
                                Dosage: {med.dosage}
                              </p>
                              <p className="text-sm text-gray-600">
                                Frequency: {med.frequency}
                              </p>
                              <p className="text-sm text-gray-600">
                                Duration: {med.duration}
                              </p>
                              {med.instructions && (
                                <p className="text-sm text-gray-600">
                                  Instructions: {med.instructions}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRResults;
