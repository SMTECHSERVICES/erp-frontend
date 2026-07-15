import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function DispatchPlanning() {
  const role = useAuthStore((state) => state.role);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [plans, setPlans] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState("");
  const [plannedDate, setPlannedDate] = useState("");
  const [transporterName, setTransporterName] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchPlans();
    fetchSalesOrders();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/dispatch-planning`, { withCredentials: true });
      if (res.data?.success) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dispatch plans");
    }
  };

  const fetchSalesOrders = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/sales-order`, { withCredentials: true });
      if (res.data?.success) {
        setSalesOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSalesOrderId || !plannedDate) {
      toast.error("Sales Order and planned date are required");
      return;
    }

    try {
      setLoading(true);
      const order = salesOrders.find((o) => o._id === selectedSalesOrderId);
      const orderNo = order ? order.orderNo : "SO-UNKNOWN";

      const payload = {
        salesOrder: selectedSalesOrderId,
        orderNo,
        plannedDate,
        transporterName,
        vehicleNo,
        items: order?.items || [],
        remarks,
      };

      const res = await axios.post(`${server}/supervisor-admin/dispatch-planning`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Dispatch Plan recorded!");
        setSelectedSalesOrderId("");
        setPlannedDate("");
        setTransporterName("");
        setVehicleNo("");
        setRemarks("");
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save dispatch plan");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `${server}/supervisor-admin/dispatch-planning/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Plan updated to ${status}`);
        fetchPlans();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update plan");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dispatch Planning</h1>
            <p className="text-sm text-gray-500">Plan shipments, assign transporters and allocate delivery vehicles</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Active Plans: {plans.filter((p) => p.status === "Planned").length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Schedule Shipment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Sales Order *</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedSalesOrderId}
                  onChange={(e) => setSelectedSalesOrderId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Sales Order --</option>
                  {salesOrders.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.orderNo} - {o.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Planned Dispatch Date *</label>
                <input
                  type="date"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  value={plannedDate}
                  onChange={(e) => setPlannedDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Transporter Name</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. VRL Logistics, SafeExpress"
                  value={transporterName}
                  onChange={(e) => setTransporterName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Vehicle No</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. DL-1AA-1234"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                />
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
                {loading ? "Planning..." : "Create Dispatch Plan"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Planned Dispatches History</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Planned Date</th>
                      <th className="py-3 px-4">Sales Order</th>
                      <th className="py-3 px-4">Transporter</th>
                      <th className="py-3 px-4">Vehicle No</th>
                      <th className="py-3 px-4">Remarks</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {plans.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
                          No dispatch plans registered.
                        </td>
                      </tr>
                    ) : (
                      plans.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4">{new Date(p.plannedDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900">{p.orderNo}</td>
                          <td className="py-3 px-4 font-bold text-gray-800">{p.transporterName || "-"}</td>
                          <td className="py-3 px-4 font-bold text-gray-800">{p.vehicleNo || "-"}</td>
                          <td className="py-3 px-4 text-gray-500">{p.remarks || "-"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                p.status === "Planned"
                                  ? "bg-amber-100 text-amber-700 font-bold"
                                  : p.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {p.status === "Planned" && (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleUpdateStatus(p._id, "Ready")}
                                  className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-700"
                                >
                                  Ready
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(p._id, "Cancelled")}
                                  className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-red-650"
                                >
                                  Cancel
                                </button>
                              </div>
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
