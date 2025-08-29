import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { server } from '../constants/api';
import toast from 'react-hot-toast';

const CreateProduct = ({ onClose }) => {
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    category: '',
    quantity: '',
    unit: '',
    type: 'IN',
    reason: '',
  });

  const addProduct = async (data) => {
    const res = await axios.post(`${server}/supervisor-admin/addProductTo-inventory`, data, {
      withCredentials: true,
    });
    return res.data;
  };

  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success('✅ Product added successfully!');
      setFormData({
        productId: '',
        name: '',
        category: '',
        quantity: '',
        unit: '',
        type: 'IN',
        reason: '',
      });
      if (onClose) onClose();
    },
    onError: (err) => {
      console.error(err);
      toast.error(err?.response?.data?.message || '❌ Failed to add product');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="productId"
          placeholder="Product ID"
          value={formData.productId}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="Raw">Raw Material</option>
          <option value="Finished">Finished Product</option>
          <option value="Packaging">Packaging</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          min="0"
          required
        />
        <input
          type="text"
          name="unit"
          placeholder="Unit (e.g. kg, pcs)"
          value={formData.unit}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        {/* <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select> */}
        <textarea
          name="reason"
          placeholder="Reason"
          value={formData.reason}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="3"
          required
        />
        <div className="flex justify-end gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
