import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PrescriptionList from "./PrescriptionList";
import PrescriptionForm from "./PrescriptionForm";
import PrescriptionDetail from "./PrescriptionDetail";
import OCRUpload from "./OCRUpload";
import OCRResults from "./OCRResult";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-100 to-gray-200">
      {/* Top Nav */}
      <nav className="bg-gradient-to-r from-blue-800 to-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-extrabold text-white tracking-wide">
                MediAuth
              </h1>

              <div className="flex space-x-2">
                <button
                  onClick={() => setView("list")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition 
                    ${
                      view === "list" || view === "create" || view === "detail"
                        ? "bg-blue-600 text-white shadow"
                        : "text-gray-200 hover:bg-blue-700 hover:text-white"
                    }`}
                >
                  Prescriptions
                </button>

                {user?.user_type === "patient" && (
                  <button
                    onClick={() => setView("ocr")}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition 
                      ${
                        view === "ocr"
                          ? "bg-blue-600 text-white shadow"
                          : "text-gray-200 hover:bg-blue-700 hover:text-white"
                      }`}
                  >
                    Upload & Scan
                  </button>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-100">
                Welcome,&nbsp;
                <span className="font-semibold">
                  {user?.first_name || user?.username}
                </span>
              </span>
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium">
                {user?.user_type}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm shadow-sm transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 bg-white/70 backdrop-blur rounded-xl shadow-lg">
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
