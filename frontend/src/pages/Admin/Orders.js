import React from "react";

const orders = [
  {
    id: 101,
    customer: "Rahul Sharma",
    technician: "Ramesh Kumar",
    orderType: "Installation",
    date: "2025-01-15",
    status: "Completed",
  },
  {
    id: 102,
    customer: "Anjali Singh",
    technician: "Amit Verma",
    orderType: "Repair",
    date: "2025-01-16",
    status: "Pending",
  },
  {
    id: 103,
    customer: "Vikas Jain",
    technician: "Suresh Patel",
    orderType: "Maintenance",
    date: "2025-01-17",
    status: "In Progress",
  },
];

const OrdersTable = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Orders</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>Order ID</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Technician</th>
            <th style={thStyle}>Order Type</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td style={tdStyle}>{order.id}</td>
              <td style={tdStyle}>{order.customer}</td>
              <td style={tdStyle}>{order.technician}</td>
              <td style={tdStyle}>{order.orderType}</td>
              <td style={tdStyle}>{order.date}</td>
              <td style={tdStyle}>{order.status}</td>
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

export default OrdersTable;
