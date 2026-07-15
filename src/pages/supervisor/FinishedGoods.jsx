import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function FinishedGoods() {
  const role = useAuthStore((state) => state.role);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [finishedGoodsList, setFinishedGoodsList] = useState([]);
  const [partNos, setPartNos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedPartId, setSelectedPartId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    fetchFinishedGoods();
    fetchPartNos();
  }, []);

  const fetchFinishedGoods = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/finished-goods`, { withCredentials: true });
      if (res.data?.success) {
        setFinishedGoodsList(res.data.goods);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Finished Goods stock");
    }
  };

  const fetchPartNos = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/allPartNo?limit=1000`, { withCredentials: true });
      if (res.data?.partNos) {
        setPartNos(res.data.partNos);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartId || !quantity) {
      toast.error("Part and quantity are required");
      return;
    }

    try {
      setLoading(true);
      const partObj = partNos.find((p) => p._id === selectedPartId);
      const partNoName = partObj ? partObj.partNo : "Unknown Part";

      const payload = {
        partNo: selectedPartId,
        partNoName,
        quantity: parseFloat(quantity),
        batchNo,
        location,
        status: "Available",
      };

      const res = await axios.post(`${server}/supervisor-admin/finished-goods`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Finished Goods stock updated");
        setSelectedPartId("");
        setQuantity("");
        setBatchNo("");
        setLocation("");
        fetchFinishedGoods();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add Finished Goods");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Finished Goods Inventory</h1>
            <p className="text-sm text-gray-500">View and update approved finished stocks, storage locations and batches</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Stock Records: {finishedGoodsList.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Goods Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Add Stock In Hand</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Part *</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedPartId}
                  onChange={(e) => setSelectedPartId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Part --</option>
                  {partNos.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.partNo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Quantity (pcs) *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter Quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Batch Number</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. BATCH-2026/02"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Storage Location</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Bin-A5, Rack-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2 rounded-lg shadow text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Finished Stock"}
              </button>
            </form>
          </div>

          {/* List of Finished Goods */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Finished Stocks List</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Part No</th>
                      <th className="py-3 px-4">Qty (pcs)</th>
                      <th className="py-3 px-4">Batch No</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Date Received</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {finishedGoodsList.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-400">
                          No finished goods records found.
                        </td>
                      </tr>
                    ) : (
                      finishedGoodsList.map((fg) => (
                        <tr key={fg._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4 font-semibold text-gray-900">{fg.partNoName}</td>
                          <td className="py-3 px-4 font-bold text-indigo-600">{fg.quantity} pcs</td>
                          <td className="py-3 px-4 font-mono text-gray-600">{fg.batchNo || "Manual Entry"}</td>
                          <td className="py-3 px-4">{fg.location || "-"}</td>
                          <td className="py-3 px-4">{new Date(fg.receivedDate || fg.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                fg.status === "Available"
                                  ? "bg-green-100 text-green-700"
                                  : fg.status === "Reserved"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {fg.status}
                            </span>
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
