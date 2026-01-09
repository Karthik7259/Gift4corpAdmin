import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendURL } from '../App';

const ManageCategories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendURL}/api/category/list`);
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/category/add`,
        { name: newCategory },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Category added successfully');
        setNewCategory('');
        setShowAddCategory(false);
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.message || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/category/delete`,
        { id: categoryId },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Category deleted successfully');
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleAddSubcategory = async () => {
    if (!selectedCategoryId) {
      toast.error('Please select a category');
      return;
    }

    if (!newSubcategory.trim()) {
      toast.error('Subcategory name cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/category/add-subcategory`,
        { id: selectedCategoryId, subcategory: newSubcategory },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Subcategory added successfully');
        setNewSubcategory('');
        setShowAddSubcategory(false);
        setSelectedCategoryId('');
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error(error.response?.data?.message || 'Failed to add subcategory');
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategory) => {
    if (!confirm(`Are you sure you want to delete "${subcategory}" from this category?`)) {
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/api/category/remove-subcategory`,
        { id: categoryId, subcategory },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Subcategory deleted successfully');
        await fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error(error.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <h1 className="text-3xl font-bold text-white">Manage Categories & Subcategories</h1>

      <div className="section-card glass-card space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Categories</h2>
          <button
            onClick={() => setShowAddCategory(!showAddCategory)}
            className="btn btn-primary px-4 py-2"
          >
            {showAddCategory ? 'Cancel' : '+ Add Category'}
          </button>
        </div>

        {showAddCategory && (
          <div className="p-4 glass-interactive rounded-lg">
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="flex-1 glass-input"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                className="btn btn-primary px-6 py-2"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-gray-300 text-center py-4">No categories found. Add one to get started!</p>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="glass-interactive p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="btn btn-ghost text-red-300 border border-red-400/40"
                  >
                    Delete Category
                  </button>
                </div>

                <div className="ml-1">
                  <p className="text-sm font-medium text-gray-200 mb-2">Subcategories:</p>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub, index) => (
                        <div
                          key={index}
                          className="chip"
                        >
                          <span className="text-sm text-gray-100">{sub}</span>
                          <button
                            onClick={() => handleDeleteSubcategory(category._id, sub)}
                            className="text-red-300 hover:text-red-400 text-lg leading-none"
                            title="Delete subcategory"
                          >
                            A-
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No subcategories</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="section-card glass-card space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Add Subcategory</h2>
          <button
            onClick={() => setShowAddSubcategory(!showAddSubcategory)}
            className="btn btn-secondary px-4 py-2"
          >
            {showAddSubcategory ? 'Cancel' : '+ Add Subcategory'}
          </button>
        </div>

        {showAddSubcategory && (
          <div className="p-4 glass-interactive rounded-lg space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Select Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full glass-input"
              >
                <option value="">-- Choose a category --</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Subcategory Name
              </label>
              <input
                type="text"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                placeholder="Enter subcategory name"
                className="w-full glass-input"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory()}
              />
            </div>

            <button
              onClick={handleAddSubcategory}
              className="btn btn-primary w-full justify-center"
            >
              Add Subcategory
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;
