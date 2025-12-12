import React from 'react';
import DashboardLayout from '../../components/admin/DashboardLayout';
import ShoppingListsComponent from '../../components/admin/ShoppingLists';

const ShoppingLists: React.FC = () => {
  return (
    <DashboardLayout>
      <ShoppingListsComponent />
    </DashboardLayout>
  );
};

export default ShoppingLists;
