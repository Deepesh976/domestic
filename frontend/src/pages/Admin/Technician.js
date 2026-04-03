import React from "react";

const technicians = [
  {
    id: 1,
    name: "Ramesh Kumar",
    phone: "9876543210",
    skill: "RO Installation",
    status: "Active",
  },
  {
    id: 2,
    name: "Suresh Patel",
    phone: "9123456789",
    skill: "Maintenance",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Amit Verma",
    phone: "9000012345",
    skill: "Repair",
    status: "Active",
  },
];

const TechnicianTable = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Technicians</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>S.No</th>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Phone</th>
            <th style={thStyle}>Skill</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>

        <tbody>
          {technicians.map((tech, index) => (
            <tr key={tech.id}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={tdStyle}>{tech.name}</td>
              <td style={tdStyle}>{tech.phone}</td>
              <td style={tdStyle}>{tech.skill}</td>
              <td
                style={{
                  ...tdStyle,
                  color: tech.status === "Active" ? "green" : "red",
                }}
              >
                {tech.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  background: "#f4f4f4",
  textAlign: "left",
};

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
};

export default TechnicianTable;
