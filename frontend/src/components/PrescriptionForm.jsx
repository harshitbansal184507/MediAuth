import { useState, useEffect } from "react";
import { prescriptionAPI } from "../services/api";
import toast from "react-hot-toast";

const PrescriptionForm = ({ onSuccess, onCancel }) => {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    diagnosis: "",
    notes: "",
    items: [
      {
        medicine_name: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: "",
        instructions: "",
      },
    ],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await prescriptionAPI.getPatients();
      setPatients(response.data);
    } catch (error) {
      toast.error("Failed to fetch patients");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data before sending
      if (!formData.patient_id) {
        toast.error("Please select a patient");
        setLoading(false);
        return;
      }

      if (!formData.diagnosis.trim()) {
        toast.error("Please enter a diagnosis");
        setLoading(false);
        return;
      }

      // Validate items
      const validItems = formData.items.filter(
        (item) =>
          item.medicine_name.trim() &&
          item.dosage.trim() &&
          item.frequency.trim() &&
          item.duration.trim() &&
          item.quantity
      );

      if (validItems.length === 0) {
        toast.error("Please add at least one complete medicine item");
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        items: validItems,
        patient_id: parseInt(formData.patient_id),
      };

      console.log("Submitting data:", submitData);

      await prescriptionAPI.createPrescription(submitData);
      toast.success("Prescription created successfully");
      onSuccess();
    } catch (error) {
      console.error("Error creating prescription:", error);

      if (error.response?.data) {
        // Show specific validation errors
        const errorData = error.response.data;
        if (typeof errorData === "object") {
          Object.entries(errorData).forEach(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            toast.error(`${field}: ${message}`);
          });
        } else {
          toast.error("Failed to create prescription: " + errorData);
        }
      } else {
        toast.error("Failed to create prescription");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          medicine_name: "",
          dosage: "",
          frequency: "",
          duration: "",
          quantity: "",
          instructions: "",
        },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Prescription</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Patient
          </label>
          <select
            name="patient_id"
            value={formData.patient_id}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Patient</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name} ({patient.username})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Diagnosis
          </label>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            required
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={2}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Medicines
            </label>
            <button
              type="button"
              onClick={addItem}
              className="text-indigo-600 hover:text-indigo-900 text-sm"
            >
              + Add Medicine
            </button>
          </div>

          {formData.items.map((item, index) => (
            <div key={index} className="border p-4 rounded-md mb-2">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={item.medicine_name}
                  onChange={(e) =>
                    handleItemChange(index, "medicine_name", e.target.value)
                  }
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g., 500mg)"
                  value={item.dosage}
                  onChange={(e) =>
                    handleItemChange(index, "dosage", e.target.value)
                  }
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g., 3 times daily)"
                  value={item.frequency}
                  onChange={(e) =>
                    handleItemChange(index, "frequency", e.target.value)
                  }
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 7 days)"
                  value={item.duration}
                  onChange={(e) =>
                    handleItemChange(index, "duration", e.target.value)
                  }
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Instructions"
                    value={item.instructions}
                    onChange={(e) =>
                      handleItemChange(index, "instructions", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Prescription"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;
