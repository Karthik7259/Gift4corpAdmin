import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { backendURL } from '../App';
import { toast } from 'react-toastify';

const ManageMerchandise = ({ token }) => {
  const [merchandiseList, setMerchandiseList] = useState([]);
  const [newMerchandise, setNewMerchandise] = useState('');

  useEffect(() => {
    fetchMerchandiseList();
  }, []);

  const fetchMerchandiseList = async () => {
    try {
      const response = await axios.get(backendURL + '/api/college-merchandise/list');
      if (response.data.success) {
        setMerchandiseList(response.data.merchandises);
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to fetch merchandise list');
    }
  };

  const handleAddMerchandise = async (e) => {
    e.preventDefault();
    if (!newMerchandise.trim()) {
      toast.error('Please enter a merchandise name');
      return;
    }

    try {
      const response = await axios.post(
        backendURL + '/api/college-merchandise/add',
        { name: newMerchandise },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setNewMerchandise('');
        fetchMerchandiseList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error(err.response?.data?.message || 'Failed to add merchandise');
    }
  };

  const handleDeleteMerchandise = async (id) => {
    if (!window.confirm('Are you sure you want to delete this merchandise?')) {
      return;
    }

    try {
      const response = await axios.post(
        backendURL + '/api/college-merchandise/delete',
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchMerchandiseList();
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(err);
      toast.error('Failed to delete merchandise');
    }
  };

  return (
    <div className='space-y-5'>
      <h1 className='text-2xl font-bold text-white'>Manage College Merchandise</h1>

      <form onSubmit={handleAddMerchandise} className='section-card glass-card space-y-4'>
        <h2 className='text-xl font-semibold text-white'>Add New Merchandise</h2>
        <div className='flex flex-col sm:flex-row gap-4'>
          <input
            type='text'
            value={newMerchandise}
            onChange={(e) => setNewMerchandise(e.target.value)}
            placeholder='Enter college merchandise name'
            className='flex-1 glass-input'
          />
          <button
            type='submit'
            className='btn btn-primary px-6 py-2'
          >
            Add Merchandise
          </button>
        </div>
      </form>

      <div className='section-card glass-card'>
        <h2 className='text-xl font-semibold text-white mb-4'>Current Merchandise List</h2>
        
        {merchandiseList.length === 0 ? (
          <p className='text-gray-300'>No merchandise added yet.</p>
        ) : (
          <div className='grid gap-3'>
            {merchandiseList.map((item) => (
              <div
                key={item._id}
                className='glass-interactive p-4 rounded-lg flex items-center justify-between'
              >
                <div>
                  <p className='font-medium text-lg text-white'>{item.name}</p>
                  <p className='text-sm text-gray-300'>
                    Added on: {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMerchandise(item._id)}
                  className='btn btn-ghost text-red-300 border border-red-400/40'
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMerchandise;
