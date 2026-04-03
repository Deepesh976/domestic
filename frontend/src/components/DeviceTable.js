import React from 'react';

const DeviceTable = ({ data }) => {
  return (
    <div style={styles.responsiveTableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeaderCell}>S.NO</th>
            <th style={styles.tableHeaderCell}>Devices</th>
            <th style={styles.tableHeaderCell}>Plans</th>
            <th style={styles.tableHeaderCell}>Expiry</th>
          </tr>
        </thead>
        <tbody>
          {data.map((device, index) => (
            <tr key={device.id} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
              <td style={styles.tableCell}>{index + 1}</td>
              <td style={styles.tableCell}>{device._id.slice(-5)}</td>
              <td style={styles.tableCell}>{device.device_plan}</td>
              <td style={styles.tableCell}>{new Date(device.expiry).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  responsiveTableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'center',
    fontSize: '1rem',
    color: '#333',
  },
  tableHeaderCell: {
    padding: '0.75rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ddd',
    backgroundColor: '#007BFF',
    color: 'white',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: '0.75rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#ddd',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
};

export default DeviceTable;
