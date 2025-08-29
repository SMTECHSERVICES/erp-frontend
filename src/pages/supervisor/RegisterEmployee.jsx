import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { server } from '../../constants/api';
import { useAuthStore } from '../../store/useAuthStore';
import SupervisorLayout from '../../layout/SupervisorLayout';
import AdminLayout from '../../layout/AdminLayout';
import toast from 'react-hot-toast';

const RegisterEmployee = () => {
  const role = useAuthStore((state) => state.role);
  const isUserLoading = useAuthStore((state) => state.isUserLoading);
  const Layout = role === 'SUPERVISOR' ? SupervisorLayout : AdminLayout;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const registerMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post(`${server}/supervisor-admin/employee-Registraion`, formData, {
        withCredentials: true
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Employee registered successfully');
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        password: ''
      });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, phone, role, password } = formData;
    if (!name || !email || !phone || !role || !password) {
      return toast.error('Please fill all fields');
    }

    registerMutation.mutate(formData);
  };

  if (isUserLoading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  }

  return (
    <Layout>
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Register New Employee</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Role</option>
            <option value="WORKER">WORKER</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          <button
            type="submit"
            disabled={registerMutation.isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {registerMutation.isLoading ? 'Registering...' : 'Register Employee'}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default RegisterEmployee;
