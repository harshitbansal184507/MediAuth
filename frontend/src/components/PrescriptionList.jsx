import { useState, useEffect } from "react";
import { prescriptionAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const PrescriptionList = ({ onSelectPrescription, onCreateNew }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await prescriptionAPI.getPrescriptions();
      setPrescriptions(response.data.results || response.data);
    } catch {
      toast.error("Failed to fetch prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleIssue = async (id) => {
    try {
      await prescriptionAPI.issuePrescription(id);
      toast.success("Prescription issued successfully");
      fetchPrescriptions();
    } catch {
      toast.error("Failed to issue prescription");
    }
  };

  const handleFill = async (id) => {
    try {
      await prescriptionAPI.fillPrescription(id);
      toast.success("Prescription filled successfully");
      fetchPrescriptions();
    } catch {
      toast.error("Failed to fill prescription");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-blue-900">Prescriptions</h2>
        {user?.user_type === "doctor" && (
          <button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition"
          >
            Create New
          </button>
        )}
      </div>

      {/* List */}
      {prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 via-gray-50 to-gray-100 rounded-xl shadow">
          <p className="text-gray-500 text-lg">No prescriptions found</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {prescriptions.map((p) => (
              <li key={p.id}>
                <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
                  {/* Left Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-blue-700 truncate">
                        {p.prescription_id}
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-700">
                      Patient: {p.patient?.first_name} {p.patient?.last_name}
                    </p>
                    {user?.user_type !== "patient" && (
                      <p className="text-sm text-gray-500">
                        Doctor: {p.doctor?.first_name} {p.doctor?.last_name}
                      </p>
                    )}
                    <p className="text-sm text-gray-400">
                      Created: {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right Section (Actions) */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectPrescription(p)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>

                    {user?.user_type === "doctor" && p.status === "draft" && (
                      <button
                        onClick={() => handleIssue(p.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm shadow-sm"
                      >
                        Issue
                      </button>
                    )}

                    {user?.user_type === "pharmacist" &&
                      p.status === "issued" && (
                        <button
                          onClick={() => handleFill(p.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm shadow-sm"
                        >
                          Fill
                        </button>
                      )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;
