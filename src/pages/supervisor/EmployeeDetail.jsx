// import React, { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import axios from 'axios';
// import { server } from '../../constants/api';
// import { useAuthStore } from '../../store/useAuthStore';
// import SupervisorLayout from '../../layout/SupervisorLayout';
// import AdminLayout from '../../layout/AdminLayout';
// import { useNavigate, useParams } from 'react-router-dom';

// const EmployeeDetail = () => {
//   const { workerId } = useParams();
//   const role = useAuthStore((state) => state.role);
//   const isUserLoading = useAuthStore((state) => state.isUserLoading);
//   const navigate = useNavigate()
//   const Layout = role === 'SUPERVISOR' ? SupervisorLayout : AdminLayout;

//   const { data, isLoading, isError } = useQuery({
//     queryKey: ['employeeDetail', workerId],
//     queryFn: async () => {
//       const res = await axios.get(`${server}/supervisor-admin/employe-detail/${workerId}`, {
//         withCredentials: true
//       });
//       return res.data;
//     },
//     enabled: !!workerId // only run if workerId exists
//   });

//   if (isUserLoading || isLoading) {
//     return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
//   }

//   if (isError) {
//     return <div className="text-center text-red-500 mt-10">Failed to load employee details.</div>;
//   }

//   const worker = data.worker;
//   const assignedTasks = data.assignedTask;

//   return (
//     <Layout>
//       <div className="p-6 max-w-5xl mx-auto">
//         <h1 className="text-2xl font-bold mb-6">Employee Detail</h1>
//         <div className="mb-4">
//   <button
//     onClick={() => navigate(`/superVisor-admin/assign-task/${workerId}`)}
//     className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//   >
//     Assign Task to Worker
//   </button>
// </div>

//         {/* Worker Info */}
//         <div className="bg-white p-6 rounded shadow mb-8">
//           <p><strong>Name:</strong> {worker.name}</p>
//           <p><strong>Email:</strong> {worker.email}</p>
//           <p><strong>Phone:</strong> {worker.phone}</p>
//           <p><strong>Role:</strong> {worker.role}</p>
//           <p><strong>Status:</strong> {worker.isActive ? 'Active' : 'Inactive'}</p>
//           <p><strong>Created At:</strong> {new Date(worker.createdAt).toLocaleString('en-IN')}</p>
//         </div>

//         {/* Assigned Tasks */}
//         <div className="bg-white p-6 rounded shadow">
//           <h2 className="text-xl font-semibold mb-4">Assigned Tasks</h2>

//           {assignedTasks.length === 0 ? (
//             <p className="text-gray-500">No tasks assigned.</p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="table-auto w-full text-sm border">
//                 <thead className="bg-gray-100">
//                   <tr>
//                     <th className="border px-4 py-2">Title</th>
//                     <th className="border px-4 py-2">Description</th>
//                     <th className="border px-4 py-2">Batch ID</th>
//                     <th className="border px-4 py-2">Due Date</th>
//                     <th className="border px-4 py-2">Status</th>
//                     <th className="border px-4 py-2">Completion Note</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {assignedTasks.map(task => (
//                     <tr key={task._id}>
//                       <td className="border px-4 py-2">{task.title}</td>
//                       <td className="border px-4 py-2">{task.description}</td>
//                       <td className="border px-4 py-2">{task.batchId}</td>
//                       <td className="border px-4 py-2">{new Date(task.dueDate).toLocaleDateString('en-IN')}</td>
//                       <td className="border px-4 py-2">{task.status}</td>
//                       <td className="border px-4 py-2">{task.completionNote || '-'}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default EmployeeDetail;



import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { server } from '../../constants/api';
import { useAuthStore } from '../../store/useAuthStore';
import SupervisorLayout from '../../layout/SupervisorLayout';
import AdminLayout from '../../layout/AdminLayout';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const EmployeeDetail = () => {
  const { workerId } = useParams();
  const role = useAuthStore((state) => state.role);
  const isUserLoading = useAuthStore((state) => state.isUserLoading);
  const navigate = useNavigate();
  const Layout = role === 'SUPERVISOR' ? SupervisorLayout : AdminLayout;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employeeDetail', workerId],
    queryFn: async () => {
      const res = await axios.get(`${server}/supervisor-admin/employe-detail/${workerId}`, {
        withCredentials: true,
      });
      return res.data;
    },
    enabled: !!workerId, // only run if workerId exists
  });

  if (isUserLoading || isLoading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 mt-10">Failed to load employee details.</div>;
  }

  const worker = data.worker;
  const assignedTasks = data.assignedTask;

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Employee Detail</h1>

        <div className="mb-4">
          <button
            onClick={() => navigate(`/superVisor-admin/assign-task/${workerId}`)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Assign Task to Worker
          </button>
        </div>

        {/* Worker Info */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <p><strong>Name:</strong> {worker.name}</p>
          <p><strong>Email:</strong> {worker.email}</p>
          <p><strong>Phone:</strong> {worker.phone}</p>
          <p><strong>Role:</strong> {worker.role}</p>
          <p><strong>Status:</strong> {worker.isActive ? 'Active' : 'Inactive'}</p>
          <p><strong>Created At:</strong> {new Date(worker.createdAt).toLocaleString('en-IN')}</p>
        </div>

        {/* Assigned Tasks */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Assigned Tasks</h2>

          {assignedTasks.length === 0 ? (
            <p className="text-gray-500">No tasks assigned.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2">Title</th>
                    <th className="border px-4 py-2">Description</th>
                    <th className="border px-4 py-2">Batch ID</th>
                    <th className="border px-4 py-2">Due Date</th>
                    <th className="border px-4 py-2">Status</th>
                    <th className="border px-4 py-2">Completion Note</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTasks.map((task) => (
                    <tr key={task._id}>
                      <td className="border px-4 py-2">{task.title}</td>
                      <td className="border px-4 py-2">{task.description}</td>
                      <td className="border px-4 py-2">{task.batchId}</td>
                      <td className="border px-4 py-2">{new Date(task.dueDate).toLocaleDateString('en-IN')}</td>
                      <td className="border px-4 py-2">
                        {task.status === 'COMPLETED' ? (
                          <span className="text-green-600 font-semibold">Completed</span>
                        ) : (
                          <MarkCompleteForm taskId={task._id} />
                        )}
                      </td>
                      <td className="border px-4 py-2">{task.completionNote || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDetail;

// 🔽 Component to mark task as complete
const MarkCompleteForm = ({ taskId }) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) {
      toast.error("Completion note is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.patch(
        `${server}/supervisor-admin/mark-task-complete/${taskId}`,
        { completionNote: note },
        { withCredentials: true }
      );
      toast.success('Task marked as completed');
      queryClient.invalidateQueries(['employeeDetail']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark task complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Completion note"
        className="border px-2 py-1 rounded text-sm"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-500 text-white text-xs px-3 py-1 rounded hover:bg-blue-600"
      >
        {isSubmitting ? 'Saving...' : 'Complete'}
      </button>
    </form>
  );
};
