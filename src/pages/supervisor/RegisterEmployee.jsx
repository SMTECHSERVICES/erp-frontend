import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

const RegisterEmployee = () => {
  const role = useAuthStore((state) => state.role);
  const isUserLoading = useAuthStore((state) => state.isUserLoading);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    role: "",
    password: "",
  });
  const [photo, setPhoto] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("phone", formData.phone);
      fd.append("role", formData.role);
      // Send password only if admin entered one; backend defaults to vr@123 if blank
      if (formData.password.trim()) {
        fd.append("password", formData.password.trim());
      }
      if (photo) fd.append("photo", photo);

      const res = await axios.post(
        `${server}/supervisor-admin/employee-Registraion`,
        fd,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      const pwd = formData.password.trim() || "vr@123";
      toast.success(`✅ Employee registered!\nPassword: ${pwd}`, { duration: 7000 });
      setFormData({ name: "", phone: "", role: "", password: "" });
      setPhoto(null);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Registration failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, phone, role: empRole } = formData;
    if (!name || !phone || !empRole || !photo) {
      return toast.error("Please fill all fields and upload a photo");
    }
    registerMutation.mutate();
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Register New Employee</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter employee name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Role</option>
              <option value="WORKER">WORKER</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Leave blank to use default: vr@123"
                value={formData.password}
                onChange={handleChange}
                className="w-full border p-2 rounded pr-20 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-xs text-blue-600 hover:underline px-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-xs text-amber-600 mt-1 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              💡 Default password is <strong>vr@123</strong> if left blank. Share the password with the employee after registration.
            </p>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Photo *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
            {photo && (
              <p className="text-sm text-green-600 mt-1">
                ✅ Selected: <strong>{photo.name}</strong>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60 font-medium"
          >
            {registerMutation.isPending ? "Registering..." : "Register Employee"}
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default RegisterEmployee;
