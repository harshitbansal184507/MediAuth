import { useState } from "react";
import { prescriptionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PrescriptionDetail = ({ prescription, onBack }) => {
  const [currentPrescription, setCurrentPrescription] = useState(prescription);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleIssue = async () => {
    setLoading(true);
    try {
      const response = await prescriptionAPI.issuePrescription(
        currentPrescription.id
      );
      setCurrentPrescription(response.data);
      toast.success("Prescription issued successfully");
    } catch (error) {
      toast.error("Failed to issue prescription");
    } finally {
      setLoading(false);
    }
  };

  const handleFill = async () => {
    setLoading(true);
    try {
      const response = await prescriptionAPI.fillPrescription(
        currentPrescription.id
      );
      setCurrentPrescription(response.data);
      toast.success("Prescription filled successfully");
    } catch (error) {
      toast.error("Failed to fill prescription");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      issued: "bg-blue-100 text-blue-800",
      filled: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Prescription Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentPrescription.prescription_id}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                currentPrescription.status
              )}`}
            >
              {currentPrescription.status}
            </span>
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to List
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Patient Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {currentPrescription.patient?.first_name}{" "}
                  {currentPrescription.patient?.last_name}
                </p>
                <p>
                  <span className="font-medium">Username:</span>{" "}
                  {currentPrescription.patient?.username}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Doctor Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {currentPrescription.doctor?.first_name}{" "}
                  {currentPrescription.doctor?.last_name}
                </p>
                <p>
                  <span className="font-medium">Username:</span>{" "}
                  {currentPrescription.doctor?.username}
                </p>
              </div>
            </div>
          </div>

          {/* Prescription Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Prescription Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(currentPrescription.created_at).toLocaleString()}
                </p>
                {currentPrescription.issued_date && (
                  <p>
                    <span className="font-medium">Issued:</span>{" "}
                    {new Date(currentPrescription.issued_date).toLocaleString()}
                  </p>
                )}
                {currentPrescription.filled_date && (
                  <p>
                    <span className="font-medium">Filled:</span>{" "}
                    {new Date(currentPrescription.filled_date).toLocaleString()}
                  </p>
                )}
                {currentPrescription.filled_by && (
                  <p>
                    <span className="font-medium">Filled by:</span>{" "}
                    {currentPrescription.filled_by.first_name}{" "}
                    {currentPrescription.filled_by.last_name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis and Notes */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Diagnosis
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800">{currentPrescription.diagnosis}</p>
            </div>
          </div>

          {currentPrescription.notes && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Notes</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-800">{currentPrescription.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Medicines */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Prescribed Medicines
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instructions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPrescription.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.medicine_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.dosage}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.instructions || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          {user?.user_type === "doctor" &&
            currentPrescription.status === "draft" && (
              <button
                onClick={handleIssue}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Issuing..." : "Issue Prescription"}
              </button>
            )}

          {user?.user_type === "pharmacist" &&
            currentPrescription.status === "issued" && (
              <button
                onClick={handleFill}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? "Filling..." : "Fill Prescription"}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetail;
