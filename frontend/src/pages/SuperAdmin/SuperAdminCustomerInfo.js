import { useEffect, useState } from 'react';
import SuperAdminNavbar from '../../components/Navbar/SuperAdminNavbar';
import { getCustomers } from '../../services/superAdminService';

export default function SuperAdminCustomerInfo() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    getCustomers().then(res => setCustomers(res.data));
  }, []);

  return (
    <>
      <SuperAdminNavbar />
      <h2>Customers</h2>

      <ul>
        {customers.map(c => (
          <li key={c._id}>{c.email}</li>
        ))}
      </ul>
    </>
  );
}
