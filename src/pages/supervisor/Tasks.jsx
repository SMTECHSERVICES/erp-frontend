import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { server } from '../../constants/api';
import { useAuthStore } from '../../store/useAuthStore';
import SupervisorLayout from '../../layout/SupervisorLayout';
import AdminLayout from '../../layout/AdminLayout';
import toast from 'react-hot-toast';

const Tasks = () => {
  const role = useAuthStore((state) => state.role);
  const isUserLoading = useAuthStore((state) => state.isUserLoading);

  const Layout = role === 'SUPERVISOR' ? SupervisorLayout : AdminLayout;

  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [batchIdFilter, setBatchIdFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append('page', page);
      if (filterStatus) query.append('status', filterStatus);
      if (batchIdFilter) query.append('batchId', batchIdFilter);

      const res = await axios.get(`${server}/supervisor-admin/getAllTask?${query.toString()}`, {
        withCredentials: true,
      });

      setTasks(res.data.tasks || []);
      setPages(res.data.pages || 1);
    } catch (err) {
      toast.error('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, filterStatus, batchIdFilter]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">All Tasks</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Status</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <input
            type="text"
            placeholder="Filter by Batch ID"
            value={batchIdFilter}
            onChange={(e) => setBatchIdFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        {/* Table */}
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-300 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">Title</th>
                  <th className="p-3 border-b">Description</th>
                  <th className="p-3 border-b">Assigned To</th>
                  <th className="p-3 border-b">Batch ID</th>
                  <th className="p-3 border-b">Due Date</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Completion Note</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{task.title}</td>
                    <td className="p-3">{task.description}</td>
                    <td className="p-3">{task.assignedTo?.name || '-'}</td>
                    <td className="p-3">{task.batchId}</td>
                    <td className="p-3">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="p-3">{task.completionNote || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium">
              Page {page} of {pages}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
              disabled={page === pages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

const StatusBadge = ({ status }) => {
  const classes = {
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${classes[status] || 'bg-gray-100 text-gray-700'}`}>
      {status?.replace('_', ' ') || 'N/A'}
    </span>
  );
};

export default Tasks;
