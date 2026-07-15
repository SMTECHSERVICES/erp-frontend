import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function Packing() {
  const role = useAuthStore((state) => state.role);
  const packedById = useAuthStore((state) => state.user?.id);
  const packedByName = useAuthStore((state) => state.user?.name);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [packings, setPackings] = useState([]);
  const [dispatchPlans, setDispatchPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [totalBoxes, setTotalBoxes] = useState("");
  const [totalWeight, setTotalWeight] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchPackings();
    fetchDispatchPlans();
  }, []);

  const fetchPackings = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/packing`, { withCredentials: true });
      if (res.data?.success) {
        setPackings(res.data.packings);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load packing logs");
    }
  };

  const fetchDispatchPlans = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/dispatch-planning`, { withCredentials: true });
      if (res.data?.success) {
        setDispatchPlans(res.data.plans);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) {
      toast.error("Dispatch plan selection is required");
      return;
    }

    try {
      setLoading(true);
      const plan = dispatchPlans.find((p) => p._id === selectedPlanId);
      const salesOrder = plan?.salesOrder || null;
      const orderNo = plan?.orderNo || "SO-UNKNOWN";

      const payload = {
        dispatchPlan: selectedPlanId,
        salesOrder,
        orderNo,
        items: plan?.items || [],
        packedBy: packedById,
        packedByName: packedByName || "Packing Desk",
        totalBoxes: parseFloat(totalBoxes) || 1,
        totalWeight: parseFloat(totalWeight) || 0,
        remarks,
      };

      const res = await axios.post(`${server}/supervisor-admin/packing`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Packing Slip recorded successfully");
        setSelectedPlanId("");
        setTotalBoxes("");
        setTotalWeight("");
        setRemarks("");
        fetchPackings();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save packing slip");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `${server}/supervisor-admin/packing/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Packing updated to ${status}`);
        fetchPackings();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Packing</h1>
            <p className="text-sm text-gray-500">Record packed box quantities, gross weight and print labels before dispatch</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Packed Orders: {packings.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">New Packing Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Dispatch Plan *</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Plan --</option>
                  {dispatchPlans.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.orderNo} - {p.transporterName || "Self"} ({new Date(p.plannedDate).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Total Boxes *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. 5"
                    value={totalBoxes}
                    onChange={(e) => setTotalBoxes(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Gross Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. 45.5"
                    value={totalWeight}
                    onChange={(e) => setTotalWeight(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  rows="2"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 rounded-lg shadow text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Create Packing Slip"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Completed Packing Slips</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Packed Date</th>
                      <th className="py-3 px-4">Sales Order</th>
                      <th className="py-3 px-4">Boxes</th>
                      <th className="py-3 px-4">Gross Weight</th>
                      <th className="py-3 px-4">Packed By</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {packings.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
                          No packing logs available.
                        </td>
                      </tr>
                    ) : (
                      packings.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4">{new Date(p.packedDate || p.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900">{p.orderNo}</td>
                          <td className="py-3 px-4 font-bold text-gray-800">{p.totalBoxes} boxes</td>
                          <td className="py-3 px-4 font-bold text-gray-850">{p.totalWeight || 0} kg</td>
                          <td className="py-3 px-4 text-gray-500">{p.packedByName || "Packing Desk"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                p.status === "Packed"
                                  ? "bg-amber-100 text-amber-700 font-bold"
                                  : p.status === "Shipped"
                                  ? "bg-blue-100 text-blue-700 font-bold"
                                  : "bg-green-105 text-green-700"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {p.status === "Packed" && (
                              <button
                                onClick={() => handleUpdateStatus(p._id, "Shipped")}
                                className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] hover:bg-blue-700"
                              >
                                Mark Shipped
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
