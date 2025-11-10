import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PrescriptionList from "./PrescriptionList";
import PrescriptionForm from "./PrescriptionForm";
import PrescriptionDetail from "./PrescriptionDetail";
import OCRUpload from "./OCRUpload";
import OCRResults from "./OCRResult";
import { FileText, Upload, Plus, Grid, User, LogOut } from "lucide-react";
import logo from "../assets/logo.png";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [view, setView] = useState("list");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateNew = () => setView("create");
  const handleSelectPrescription = (p) => {
    setSelectedPrescription(p);
    setView("detail");
  };
  const handleSuccess = () => {
    setView("list");
    setRefreshKey((prev) => prev + 1);
  };
  const handleCancel = () => setView("list");
  const handleUploadSuccess = () => setRefreshKey((prev) => prev + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Top Nav */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Brand with Icon */}
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MediAuth
              </h1>
            </div>

            {/* User Info Card */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border border-blue-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.first_name || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.user_type}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Interactive Navigation Cards */}
        {view === "list" && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Prescriptions Card */}

            {/* Upload & Scan Card - Only for Patients */}
            {user?.user_type === "patient" && (
              <div
                onClick={() => setView("ocr")}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-900 to-pink-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                      OCR
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Upload & Scan</h3>
                  <p className="text-purple-100 text-sm mb-4">
                    Upload prescription images for OCR processing
                  </p>
                  <div className="flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span>Start Scanning</span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Create New Card - Only show if not patient or fill space */}
            {user?.user_type !== "patient" &&
              user?.user_type !== "pharmacist" && (
                <div
                  onClick={handleCreateNew}
                  className="group relative overflow-hidden bg-gradient-to-br from-blue-900 to-pink-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative p-6 text-white">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium bg-white/20 backdrop-blur px-3 py-1 rounded-full">
                        New
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      Create Prescription
                    </h3>
                    <p className="text-emerald-100 text-sm mb-4">
                      Add a new prescription for patients
                    </p>
                    <div className="flex items-center text-sm font-medium group-hover:translate-x-2 transition-transform duration-300">
                      <span>Create New</span>
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur border border-gray-100">
          {(view === "list" || view === "create" || view === "detail") && (
            <>
              {view === "list" && (
                <PrescriptionList
                  key={refreshKey}
                  onSelectPrescription={handleSelectPrescription}
                  onCreateNew={handleCreateNew}
                />
              )}
              {view === "create" && (
                <PrescriptionForm
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                />
              )}
              {view === "detail" && selectedPrescription && (
                <PrescriptionDetail
                  prescription={selectedPrescription}
                  onBack={handleCancel}
                />
              )}
            </>
          )}

          {view === "ocr" && user?.user_type === "patient" && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Upload & Scan
                  </h2>
                  <p className="text-sm text-gray-500">
                    Process prescription images with OCR
                  </p>
                </div>
              </div>
              <OCRUpload onUploadSuccess={handleUploadSuccess} />
              <OCRResults key={refreshKey} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
