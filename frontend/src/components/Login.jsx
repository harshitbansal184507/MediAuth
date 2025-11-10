import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, FileText, Cpu, Activity } from "lucide-react";
import logo from "../assets/logo.png";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(formData);
    if (result.success) {
      navigate("/dashboard");
    }

    setIsLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 flex flex-col lg:flex-row items-center justify-center py-12 px-6 sm:px-8 lg:px-12">
      {/* Left Panel: Info Section */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 space-y-6 pr-12 animate-fadeIn">
        <h2 className="text-4xl font-extrabold text-gray-800 leading-snug">
          Smart Prescription <span className="text-blue-600">Digitization</span>{" "}
          &<span className="text-blue-600"> Validation</span> System
        </h2>
        <p className="text-gray-700 text-lg leading-relaxed">
          Empowering healthcare with AI-driven prescription validation, digital
          records. Seamlessly manage prescriptions and prevent human errors with
          OCR and intelligent validation.
        </p>

        <div className="grid grid-cols-2 gap-4 text-gray-800 mt-4">
          <div className="flex items-center space-x-2 bg-white/70 p-3 rounded-xl shadow-md hover:shadow-blue-100 transition-all duration-300">
            <ShieldCheck className="text-blue-600 w-6 h-6" />
            <span className="font-semibold text-sm">Secure Auth</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/70 p-3 rounded-xl shadow-md hover:shadow-blue-100 transition-all duration-300">
            <FileText className="text-blue-600 w-6 h-6" />
            <span className="font-semibold text-sm">OCR Validation</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/70 p-3 rounded-xl shadow-md hover:shadow-blue-100 transition-all duration-300">
            <Cpu className="text-blue-600 w-6 h-6" />
            <span className="font-semibold text-sm">AI Integration</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/70 p-3 rounded-xl shadow-md hover:shadow-blue-100 transition-all duration-300">
            <Activity className="text-blue-600 w-6 h-6" />
            <span className="font-semibold text-sm">Validation</span>
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-8 transition-all duration-300 hover:shadow-blue-200">
        <div className="text-center">
          <img src={logo} alt="MediAuth Logo" className="mx-auto h-40 w-40 " />
          <h2 className="mt-4 text-3xl font-extrabold text-gray-800 tracking-tight">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <input
              name="username"
              type="text"
              required
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 rounded-md text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 disabled:opacity-50 transition-all duration-300"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center">
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
