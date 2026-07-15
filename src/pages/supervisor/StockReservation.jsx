import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function StockReservation() {
  const role = useAuthStore((state) => state.role);
  const reservedById = useAuthStore((state) => state.user?.id);
  const reservedByName = useAuthStore((state) => state.user?.name);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [reservations, setReservations] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState("");
  const [reservedQty, setReservedQty] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchReservations();
    fetchSalesOrders();
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/stock-reservation`, { withCredentials: true });
      if (res.data?.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load stock reservations");
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
    if (!selectedSalesOrderId || !reservedQty) {
      toast.error("Sales Order and reserved quantity are required");
      return;
    }

    try {
      setLoading(true);
      const order = salesOrders.find((o) => o._id === selectedSalesOrderId);
      const orderNo = order ? order.orderNo : "SO-UNKNOWN";

      // Pick first item's details if available
      const partNo = order?.items?.[0]?.partNo || null;
      const partNoName = order?.items?.[0]?.partNoName || "Multiple Items";

      const payload = {
        salesOrder: selectedSalesOrderId,
        orderNo,
        partNo,
        partNoName,
        reservedQty: parseFloat(reservedQty),
        reservedBy: reservedById,
        reservedByName: reservedByName || "Supervisor",
        remarks,
      };

      const res = await axios.post(`${server}/supervisor-admin/stock-reservation`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Stock Reservation recorded!");
        setSelectedSalesOrderId("");
        setReservedQty("");
        setRemarks("");
        fetchReservations();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create stock reservation");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `${server}/supervisor-admin/stock-reservation/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Reservation status updated to ${status}`);
        fetchReservations();
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
            <h1 className="text-2xl font-bold text-gray-800">Stock Reservations</h1>
            <p className="text-sm text-gray-500">Hold finished goods inventory for confirmed Sales Orders</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Active Holds: {reservations.filter((r) => r.status === "Reserved").length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reservation Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Reserve Stock</h2>
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">Qty to Reserve (pcs) *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter Quantities to hold"
                  value={reservedQty}
                  onChange={(e) => setReservedQty(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Remarks..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 rounded-lg shadow text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Reserving..." : "Create Reservation"}
              </button>
            </form>
          </div>

          {/* List of holds */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Stock Reservation Logs</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Reserved Date</th>
                      <th className="py-3 px-4">Sales Order</th>
                      <th className="py-3 px-4">Reserved Qty</th>
                      <th className="py-3 px-4">Reserved By</th>
                      <th className="py-3 px-4">Remarks</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Fulfill Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reservations.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
                          No stock reservations logged.
                        </td>
                      </tr>
                    ) : (
                      reservations.map((res) => (
                        <tr key={res._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4">{new Date(res.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900">{res.orderNo}</td>
                          <td className="py-3 px-4 font-bold text-blue-600">{res.reservedQty} pcs</td>
                          <td className="py-3 px-4">{res.reservedByName || "Supervisor"}</td>
                          <td className="py-3 px-4 text-gray-500">{res.remarks || "-"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                res.status === "Reserved"
                                  ? "bg-amber-100 text-amber-700 font-bold"
                                  : res.status === "Released"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-green-150 text-green-700"
                              }`}
                            >
                              {res.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {res.status === "Reserved" && (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleUpdateStatus(res._id, "Released")}
                                  className="bg-gray-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-gray-600"
                                >
                                  Release
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(res._id, "Dispatched")}
                                  className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-700"
                                >
                                  Dispatch
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
