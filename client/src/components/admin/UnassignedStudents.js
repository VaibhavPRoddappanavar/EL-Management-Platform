import axios from "axios";
import React, { useEffect, useState } from "react";
import "./UnassignedStudents.css";

const UnassignedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);

  const clusterDepartments = ["AI", "CS", "CD", "CY", "IS"];

  useEffect(() => {
    const fetchUnassignedStudents = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5000/admin/unassigned"
        );
        const unassigned = response.data.filter((student) =>
          clusterDepartments.includes(student.departmentCode)
        );
        setStudents(unassigned);
        setFilteredStudents(unassigned); // Initially set all students as filtered
      } catch (error) {
        console.error("Error fetching unassigned students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUnassignedStudents();
  }, []);

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
    filterStudents(e.target.value, searchQuery);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    filterStudents(selectedDepartment, e.target.value);
  };

  const filterStudents = (department, search) => {
    let filtered = students;
    if (department) {
      filtered = filtered.filter(
        (student) => student.departmentCode === department
      );
    }
    if (search) {
      filtered = filtered.filter((student) =>
        student.Name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredStudents(filtered);
  };

  const handlePopupOpen = () => {
    setPopupOpen(true);
  };

  const handlePopupClose = () => {
    setPopupOpen(false);
  };

  // Calculate the count of unassigned students per department
  const departmentCounts = clusterDepartments.reduce((acc, dept) => {
    const count = students.filter(
      (student) => student.departmentCode === dept
    ).length;
    acc[dept] = count;
    return acc;
  }, {});

  return (
    <div className="unassigned-container">
      <div className="unassigned-container-students">
        <h2 className="unassigned-container-title">Unassigned Students</h2>

        {loading ? (
          <p className="unassigned-container-loading">
            Loading unassigned students...
          </p>
        ) : (
          <div className="unassigned-container-list">
            {/* Main Button */}
            <button
              onClick={handlePopupOpen}
              className="unassigned-container-department-button"
            >
              {students.length} not in a team
            </button>
          </div>
        )}
      </div>

      {/* Popup for showing unassigned students */}
      {popupOpen && (
        <div className="unassigned-container-popup">
          <div className="unassigned-container-popup-content">
            <button
              onClick={handlePopupClose}
              className="unassigned-container-close-button"
            >
              Close
            </button>
            <h3>Unassigned Students</h3>
            <div className="unassigned-container-filters">
              {/* Department Filter */}
              <select
                onChange={handleDepartmentChange}
                className="unassigned-container-filter"
              >
                <option value="">All Departments</option>
                {clusterDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="unassigned-container-search"
              />
            </div>

            {/* List of Unassigned Students */}
            <div className="unassigned-container-student-list">
              {filteredStudents.length === 0 ? (
                <p>No unassigned students found.</p>
              ) : (
                filteredStudents.map((student, index) => (
                  <div
                    key={student.email}
                    className="unassigned-container-student-card"
                  >
                    {/* Serial Number */}
                    <h4>
                      {" "}
                      <span className="unassigned-container-student-serial">
                        {index + 1}.
                      </span>
                      {student.Name}
                    </h4>
                    <p>
                      {student.USN} | {student.email}
                    </p>
                    <p>{student.departmentCode}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnassignedStudents;
