import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function MaterialIssue() {
  const role = useAuthStore((state) => state.role);
  const employeeId = useAuthStore((state) => state.user?.id);
  const employeeName = useAuthStore((state) => state.user?.name);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [issues, setIssues] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedProductionId, setSelectedProductionId] = useState("");
  const [issuedQuantity, setIssuedQuantity] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchIssues();
    fetchProductionOrders();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/material-issue`, { withCredentials: true });
      if (res.data?.success) {
        setIssues(res.data.issues);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch material issues");
    }
  };

  const fetchProductionOrders = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/get-Productions`, { withCredentials: true });
      // The API return format for productions usually is { success, productionOrders } or similar
      const list = res.data?.productionOrders || res.data?.productions || res.data || [];
      setProductionOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch Production Orders list");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProductionId) {
      toast.error("Production Order selection is required");
      return;
    }
    if (!issuedQuantity || issuedQuantity <= 0) {
      toast.error("Issued Quantity must be greater than zero");
      return;
    }

    try {
      setLoading(true);
      // Find selected production order to auto-populate partNo and names
      const prodOrder = productionOrders.find((p) => p._id === selectedProductionId);
      const partNo = prodOrder?.partNo?._id || prodOrder?.partNo;
      const partNoName = prodOrder?.partNo?.partNo || prodOrder?.partNoName || "Unknown Part";
      const rawMaterialType = prodOrder?.partNo?.rawMaterialType || "Pipe";

      const payload = {
        productionOrder: selectedProductionId,
        partNo,
        partNoName,
        rawMaterialType,
        issuedQuantity: parseFloat(issuedQuantity),
        issuedBy: employeeId,
        issuedByName: employeeName || "Supervisor",
        remarks,
      };

      const res = await axios.post(`${server}/supervisor-admin/material-issue`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Material issued successfully");
        setSelectedProductionId("");
        setIssuedQuantity("");
        setRemarks("");
        fetchIssues();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to issue material");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `${server}/supervisor-admin/material-issue/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Material issue status updated to ${status}`);
        fetchIssues();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Material Issue Logs</h1>
            <p className="text-sm text-gray-500">Track and manage raw material allocation to production orders</p>
          </div>
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Total Issues: {issues.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Issue Material to Production</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Production Order *</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedProductionId}
                  onChange={(e) => setSelectedProductionId(e.target.value)}
                  required
                >
                  <option value="">-- Select Production Order --</option>
                  {productionOrders.map((p) => {
                    const dispName = p.partNo?.partNo || p.partNoName || `Order-${p._id.substr(-6)}`;
                    return (
                      <option key={p._id} value={p._id}>
                        {dispName} (Planned: {p.initialPlannedQty} pcs) {p.reason ? `- Batch: ${p.reason}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Issued Quantity (Pcs/Weight) *</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter Issued Quantity"
                  value={issuedQuantity}
                  onChange={(e) => setIssuedQuantity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks / Note</label>
                <textarea
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Reason or notes..."
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-medium py-2 rounded-lg shadow text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Issuing..." : "Submit Material Issue"}
              </button>
            </form>
          </div>

          {/* Issues List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Material Issue History</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Production Order</th>
                      <th className="py-3 px-4">Part No</th>
                      <th className="py-3 px-4">Issued Qty</th>
                      <th className="py-3 px-4">Issued By</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {issues.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
                          No material issue logs found.
                        </td>
                      </tr>
                    ) : (
                      issues.map((iss) => (
                        <tr key={iss._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4">{new Date(iss.issuedDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-mono text-gray-600">
                            {iss.productionOrder ? `Order-${iss.productionOrder.substr(-6)}` : "Manual / Direct"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{iss.partNoName}</div>
                            <div className="text-[10px] text-gray-400">{iss.rawMaterialType}</div>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">{iss.issuedQuantity} pcs</td>
                          <td className="py-3 px-4 text-gray-500">{iss.issuedByName || "Supervisor"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                iss.status === "Consumed"
                                  ? "bg-green-100 text-green-700"
                                  : iss.status === "Returned"
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {iss.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {iss.status === "Issued" && (
                              <div className="flex justify-center gap-1.5">
                                <button
                                  onClick={() => handleUpdateStatus(iss._id, "Consumed")}
                                  className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-700"
                                >
                                  Consume
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(iss._id, "Returned")}
                                  className="bg-gray-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-gray-600"
                                >
                                  Return
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
