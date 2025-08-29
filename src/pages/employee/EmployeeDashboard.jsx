import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { server } from '../../constants/api';
import EmployeeLayout from '../../layout/EmployeeLayout';

const EmployeeDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${server}/employee/get-detail`, {
        withCredentials: true,
      });
      setData(res.data);
    } catch (err) {
      setError('Failed to fetch details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  if (loading) return <EmployeeLayout><p className="p-6">Loading...</p></EmployeeLayout>;
  if (error) return <EmployeeLayout><p className="p-6 text-red-600">{error}</p></EmployeeLayout>;

  const { myDetails, myAttendanceStatus } = data;

  return (
    <EmployeeLayout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Welcome, {myDetails.name}</h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Profile Details</h2>
          <ul className="text-gray-700 space-y-1">
            <li><strong>Email:</strong> {myDetails.email}</li>
            <li><strong>Phone:</strong> {myDetails.phone}</li>
            <li><strong>Role:</strong> {myDetails.role}</li>
            <li><strong>Status:</strong> {myDetails.isActive ? 'Active' : 'Inactive'}</li>
            <li><strong>Joined:</strong> {new Date(myDetails.createdAt).toLocaleDateString()}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Attendance Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 bg-green-100 rounded">
              <p className="text-3xl font-bold">{myAttendanceStatus.presentDays}</p>
              <p className="text-sm font-medium">Present Days</p>
            </div>
            <div className="p-4 bg-red-100 rounded">
              <p className="text-3xl font-bold">{myAttendanceStatus.absentDays}</p>
              <p className="text-sm font-medium">Absent Days</p>
            </div>
            <div className="p-4 bg-yellow-100 rounded">
              <p className="text-3xl font-bold">{myAttendanceStatus.leaveDays}</p>
              <p className="text-sm font-medium">Leave Days</p>
            </div>
            <div className="p-4 bg-blue-100 rounded">
              <p className="text-3xl font-bold">{myAttendanceStatus.halfDays}</p>
              <p className="text-sm font-medium">Half Days</p>
            </div>
            <div className="p-4 bg-gray-200 rounded">
              <p className="text-3xl font-bold">{myAttendanceStatus.totalDays}</p>
              <p className="text-sm font-medium">Total Days</p>
            </div>
          </div>
        </section>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;
