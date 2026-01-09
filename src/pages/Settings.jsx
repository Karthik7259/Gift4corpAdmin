import React, { useState } from 'react';
import ManageCategories from './ManageCategories';
import ManageMerchandise from './ManageMerchandise';

const Settings = ({ token }) => {
  const [tab, setTab] = useState('categories');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-white">Settings</h1>
      <div className="tab-bar">
        <button
          className={`tab ${tab === 'categories' ? 'active' : ''}`}
          onClick={() => setTab('categories')}
        >
          Manage Categories
        </button>
        <button
          className={`tab ${tab === 'merchandise' ? 'active' : ''}`}
          onClick={() => setTab('merchandise')}
        >
          Manage Merchandise
        </button>
      </div>
      <div>
        {tab === 'categories' && <ManageCategories token={token} />}
        {tab === 'merchandise' && <ManageMerchandise token={token} />}
      </div>
    </div>
  );
};

export default Settings;
