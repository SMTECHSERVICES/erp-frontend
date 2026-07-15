import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function Dispatch() {
  const role = useAuthStore((state) => state.role);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [dispatches, setDispatches] = useState([]);
  const [packings, setPackings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedPackingId, setSelectedPackingId] = useState("");
  const [lrNo, setLrNo] = useState("");
  const [eWayBillNo, setEWayBillNo] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchDispatches();
    fetchPackings();
  }, []);

  const fetchDispatches = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/dispatch`, { withCredentials: true });
      if (res.data?.success) {
        setDispatches(res.data.dispatches);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dispatches");
    }
  };

  const fetchPackings = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/packing`, { withCredentials: true });
      if (res.data?.success) {
        setPackings(res.data.packings);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPackingId) {
      toast.error("Packing selection is required");
      return;
    }

    try {
      setLoading(true);
      const pack = packings.find((p) => p._id === selectedPackingId);
      const salesOrder = pack?.salesOrder || null;
      const orderNo = pack?.orderNo || "SO-UNKNOWN";
      const dispatchPlan = pack?.dispatchPlan || null;

      const payload = {
        salesOrder,
        orderNo,
        dispatchPlan,
        packing: selectedPackingId,
        lrNo,
        eWayBillNo,
        items: pack?.items || [],
        remarks,
      };

      const res = await axios.post(`${server}/supervisor-admin/dispatch`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Dispatch Shipment recorded!");
        setSelectedPackingId("");
        setLrNo("");
        setEWayBillNo("");
        setRemarks("");
        fetchDispatches();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save dispatch shipment");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `${server}/supervisor-admin/dispatch/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Shipment updated to ${status}`);
        fetchDispatches();
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
            <h1 className="text-2xl font-bold text-gray-800">Dispatch Shipments</h1>
            <p className="text-sm text-gray-500">Record vehicle departures, LR Transporter receipts, and e-Way bills</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Shipped: {dispatches.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Record Shipment Departure</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Packed Order *</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedPackingId}
                  onChange={(e) => setSelectedPackingId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Packed Slip --</option>
                  {packings.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.orderNo} ({p.totalBoxes} boxes / {p.totalWeight} kg)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">LR Receipt Number (Lorry Rec.)</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. LR-998811"
                  value={lrNo}
                  onChange={(e) => setLrNo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">GST e-Way Bill Number</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="12-digit eway bill"
                  value={eWayBillNo}
                  onChange={(e) => setEWayBillNo(e.target.value)}
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
                {loading ? "Saving..." : "Record Dispatch"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Departed Shipments</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Dispatch Date</th>
                      <th className="py-3 px-4">Sales Order</th>
                      <th className="py-3 px-4">LR No</th>
                      <th className="py-3 px-4">eWay Bill</th>
                      <th className="py-3 px-4">Delivery Status</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {dispatches.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">
                          No shipments dispatched yet.
                        </td>
                      </tr>
                    ) : (
                      dispatches.map((d) => (
                        <tr key={d._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4">{new Date(d.dispatchDate || d.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-gray-900">{d.orderNo}</td>
                          <td className="py-3 px-4 font-bold text-gray-800">{d.lrNo || "-"}</td>
                          <td className="py-3 px-4 font-bold text-gray-850">{d.eWayBillNo || "-"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                d.status === "Delivered"
                                  ? "bg-green-105 text-green-700 font-bold"
                                  : "bg-blue-100 text-blue-700 font-bold"
                              }`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {d.status !== "Delivered" && (
                              <button
                                onClick={() => handleUpdateStatus(d._id, "Delivered")}
                                className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-750 font-semibold"
                              >
                                Mark Delivered
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
