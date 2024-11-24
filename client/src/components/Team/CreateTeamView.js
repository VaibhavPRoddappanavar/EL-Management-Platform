import { ArrowLeft, BookOpen, Medal, Smartphone, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

const themes = {
  CS: [
    "Artificial Intelligence",
    "Internet of things",
    "AR, VR & MR",
    "Quantum security",
    "Edge Computing",
    "Ethical AI",
    "Cloud Security",
    "Programming Mechanics (coding for App development)",
    "AI for Social Good",
    "AI in Education",
    "Data Science and Analytics",
  ],
  EC: [
    "Semi-Conductors Engineering",
    "Cyber Physical systems",
    "Drone Technology",
    "Biomedical Instrumentation",
    "Bionics and Prosthetics",
    "Renewable Energy solutions",
    "Mechatronics & Industrial Internet of Things",
    "Power Systems Engineering",
    "Electric Vehicle technology",
    "Embedded systems and IoT",
    "AI in Electronics",
    "5G and Wireless Communications",
  ],
  ME: [
    "Smart Manufacturing",
    "Digital Metrology",
    "Ergonomics in Automation",
    "Advanced Materials",
    "Energy Systems",
    "Autonomous Vehicles",
    "Thermodynamic Simulations",
    "AI for Mechanical Systems",
    "Supply Chain Management",
  ],
  CV: [
    "Environmental Engineering and Sustainability",
    "Pollution control, Waste management, and Bioremediation",
    "Urban planning and development including digital twins",
    "Smart Materials and Structures",
    "Innovative solutions for water and waste water purification, reuse, and recycling",
    "Eco-friendly materials and waste reduction strategies",
    "Technologies to mitigate climate change impacts",
    "Bioinformatics",
    "Biomaterials and Computational Biology",
  ],
};

const clusterPrograms = {
  CS: ["AI", "CD", "CS", "CY", "IS"],
  EC: ["EC", "EE", "EI", "ET"],
  ME: ["AE", "IM", "ME"],
  CV: ["CV", "BT", "CH"],
};

const AlertComponent = ({ variant, title, description }) => {
  return (
    <div
      className={`${
        variant === "error"
          ? "bg-red-100 border border-red-400 text-red-700"
          : "bg-green-100 border border-green-400 text-green-700"
      } px-4 py-3 rounded-lg shadow-sm flex items-start space-x-2`}
      role="alert"
    >
      <strong className="font-medium">{title}</strong>
      <span className="text-sm">{description}</span>
    </div>
  );
};

const InputField = ({ label, icon: Icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      <Icon size={16} className="text-blue-600" />
      {label}
    </label>
    <input
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out shadow-sm"
    />
  </div>
);

const SelectField = ({ label, icon: Icon, options, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      <Icon size={16} className="text-blue-600" />
      {label}
    </label>
    <select
      {...props}
      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out shadow-sm bg-white"
    >
      <option value="">Select a theme</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

export const CreateTeamView = () => {
  const [formData, setFormData] = useState({
    email: "",
    usn: "",
    phoneNumber: "",
    theme: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [availableThemes, setAvailableThemes] = useState([]);
  const [studentBranch, setStudentBranch] = useState("");

  useEffect(() => {
    const fetchStudentDetails = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        setError("No email found in local storage. Please log in.");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:5000/student-details?email=${email}`
        );
        const data = await response.json();

        if (response.ok) {
          setFormData((prevData) => ({
            ...prevData,
            email: data.email,
            usn: data.usn || "",
          }));
          setStudentBranch(data.branch);

          // Find the cluster based on the branch
          let userCluster = null;
          for (const [cluster, programs] of Object.entries(clusterPrograms)) {
            if (programs.includes(data.branch)) {
              userCluster = cluster;
              break;
            }
          }

          // Set available themes based on the cluster
          if (userCluster && themes[userCluster]) {
            setAvailableThemes(themes[userCluster]);
          } else {
            setError("Unable to determine appropriate themes for your branch.");
          }
        } else {
          setError(data.message || "Failed to fetch student details.");
        }
      } catch (err) {
        setError("An error occurred while fetching student details.");
      }
    };

    fetchStudentDetails();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const fieldMapping = {
      TeamLeaderUSN: "usn",
      TeamleaderMobileNumber: "phoneNumber",
      Theme: "theme",
    };

    const backendFieldName = fieldMapping[name] || name;
    setFormData((prev) => ({ ...prev, [backendFieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to create a team.");
        return;
      }

      const response = await fetch("http://localhost:5000/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData((prev) => ({
          ...prev,
          usn: "",
          phoneNumber: "",
          theme: "",
        }));
      } else {
        setError(data.message);
      }
      window.location.reload();
    } catch (err) {
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-blue-200 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-t-xl shadow-md p-6">
          <button
            type="button"
            className="mb-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 hover:text-blue-800 focus:outline-none transition-colors duration-200"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <Users className="w-8 h-8 text-blue-700" />
            <h2 className="text-2xl font-semibold text-gray-800">
              Create a New Team
            </h2>
          </div>
          <p className="text-gray-600 ml-11">
            Fill in the details to start your journey
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-t-0 border-blue-200 rounded-b-xl shadow-md p-6 space-y-6">
          {error && (
            <AlertComponent
              variant="error"
              title="Error:"
              description={error}
            />
          )}
          {success && (
            <AlertComponent
              variant="success"
              title="Success!"
              description="Team creation started!"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Team Leader USN"
              icon={Medal}
              name="TeamLeaderUSN"
              value={formData.usn}
              onChange={handleInputChange}
              placeholder="Enter your USN"
            />

            <InputField
              label="Team Leader Mobile"
              icon={Smartphone}
              name="TeamleaderMobileNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your mobile number"
            />

            <SelectField
              label="Team Theme"
              icon={BookOpen}
              name="Theme"
              value={formData.theme}
              onChange={handleInputChange}
              options={availableThemes}
            />

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transform transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Create Team
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamView;
