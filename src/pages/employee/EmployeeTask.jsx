import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EmployeeLayout from '../../layout/EmployeeLayout';
import { server } from '../../constants/api';

const EmployeeTask = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${server}/employee/my-task`, {
        withCredentials: true,
      });
      setTasks(res.data.myTask || []);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <EmployeeLayout>
      <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6">My Tasks</h1>

        {loading && <p>Loading tasks...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <>
            {tasks.length === 0 ? (
              <p>No tasks assigned yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 border-b">Title</th>
                      <th className="p-3 border-b">Description</th>
                      <th className="p-3 border-b">Assigned By</th>
                      <th className="p-3 border-b">Batch ID</th>
                      <th className="p-3 border-b">Due Date</th>
                      <th className="p-3 border-b">Status</th>
                      <th className="p-3 border-b">Completion Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task._id} className="border-t hover:bg-gray-50">
                        <td className="p-3 border align-top">{task.title}</td>
                        <td className="p-3 border align-top">{task.description}</td>
                        <td className="p-3 border align-top">{task.assignedBy?.name || '-'}</td>
                        <td className="p-3 border align-top">{task.batchId}</td>
                        <td className="p-3 border align-top">{new Date(task.dueDate).toLocaleDateString()}</td>
                        <td className="p-3 border align-top font-semibold">
                          <StatusBadge status={task.status} />
                        </td>
                        <td className="p-3 align-top">{task.completionNote || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </EmployeeLayout>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    PENDING: 'bg-gray-100 text-gray-700',
    OVERDUE: 'bg-red-100 text-red-700',
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        colors[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
};

export default EmployeeTask;
