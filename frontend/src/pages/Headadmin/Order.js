import React from 'react';
import HeadAdminNavbar from '../../components/Navbar/HeadAdminNavbar';

const HeadAdminOrders = () => {
  return (
    <HeadAdminNavbar>
      <div className="page-container">
        <h2>Orders</h2>
        <p>View and manage all customer orders here.</p>

        {/* Future:
          - Orders table
          - Order status
          - Order details modal
        */}
      </div>
    </HeadAdminNavbar>
  );
};

export default HeadAdminOrders;
