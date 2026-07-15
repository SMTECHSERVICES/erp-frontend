import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function MachineProduction() {
  const role = useAuthStore((state) => state.role);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [productions, setProductions] = useState([]);
  const [productionOrders, setProductionOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states (Create Entry)
  const [selectedProductionId, setSelectedProductionId] = useState("");
  const [machineName, setMachineName] = useState("");
  const [operatorId, setOperatorId] = useState("");
  const [inputQty, setInputQty] = useState("");
  const [remarks, setRemarks] = useState("");

  // Modal / Update States
  const [selectedItem, setSelectedItem] = useState(null);
  const [outputQty, setOutputQty] = useState("");
  const [rejectedQty, setRejectedQty] = useState("");
  const [updateStatus, setUpdateStatus] = useState("Running");

  useEffect(() => {
    fetchMachineProductions();
    fetchProductionOrders();
    fetchEmployees();
  }, []);

  const fetchMachineProductions = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/machine-production`, { withCredentials: true });
      if (res.data?.success) {
        setProductions(res.data.productions);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch machine production records");
    }
  };

  const fetchProductionOrders = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/get-Productions`, { withCredentials: true });
      const list = res.data?.productionOrders || res.data?.productions || res.data || [];
      setProductionOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/employee?limit=100`, { withCredentials: true });
      if (res.data?.employees) {
        setEmployees(res.data.employees);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!machineName || !inputQty) {
      toast.error("Machine Name and Input Qty are required");
      return;
    }

    try {
      setLoading(true);

      const prodOrder = productionOrders.find((p) => p._id === selectedProductionId);
      const partNo = prodOrder?.partNo?._id || prodOrder?.partNo;
      const partNoName = prodOrder?.partNo?.partNo || prodOrder?.partNoName || "Unknown Part";

      const opObj = employees.find((e) => e._id === operatorId);
      const operatorName = opObj ? opObj.name : "Unknown Employee";

      const payload = {
        productionOrder: selectedProductionId || null,
        machineName,
        operator: operatorId || null,
        operatorName,
        partNo,
        partNoName,
        inputQty: parseFloat(inputQty),
        remarks,
      };

      const res = await axios.post(`${server}/supervisor-admin/machine-production`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Machine production track entry created");
        setMachineName("");
        setInputQty("");
        setRemarks("");
        setSelectedProductionId("");
        setOperatorId("");
        fetchMachineProductions();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to start machine production entry");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdate = (item) => {
    setSelectedItem(item);
    setOutputQty(item.outputQty || "");
    setRejectedQty(item.rejectedQty || "");
    setUpdateStatus(item.status);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setLoading(true);
      const res = await axios.patch(
        `${server}/supervisor-admin/machine-production/${selectedItem._id}`,
        {
          outputQty: parseFloat(outputQty) || 0,
          rejectedQty: parseFloat(rejectedQty) || 0,
          status: updateStatus,
        },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Machine production record updated successfully");
        setSelectedItem(null);
        fetchMachineProductions();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update machine production record");
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
            <h1 className="text-2xl font-bold text-gray-800">Machine Production</h1>
            <p className="text-sm text-gray-500">Monitor and update operator-wise machine performance and outputs</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-rose-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Active Runs: {productions.filter((p) => p.status === "Running").length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Start Entry Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Start Machine Run</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Production Order</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedProductionId}
                  onChange={(e) => setSelectedProductionId(e.target.value)}
                >
                  <option value="">-- Choose Production Order (Optional) --</option>
                  {productionOrders.map((p) => {
                    const dispName = p.partNo?.partNo || p.partNoName || `Order-${p._id.substr(-6)}`;
                    return (
                      <option key={p._id} value={p._id}>
                        {dispName} (Planned: {p.initialPlannedQty} pcs)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Machine Name / Code *</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. CNC Machine 1, Lathe Machine"
                  value={machineName}
                  onChange={(e) => setMachineName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Operator *</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  required
                >
                  <option value="">-- Select Operator --</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Input Qty *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Quantity of raw components loaded"
                  value={inputQty}
                  onChange={(e) => setInputQty(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  rows="2"
                  placeholder="Operator notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-medium py-2 rounded-lg shadow text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Production"}
              </button>
            </form>
          </div>

          {/* List of active/historical runs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Live Machine Production Tracks</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Machine</th>
                      <th className="py-3 px-4">Operator</th>
                      <th className="py-3 px-4">Part No</th>
                      <th className="py-3 px-4">Input</th>
                      <th className="py-3 px-4">Output / Rej</th>
                      <th className="py-3 px-4">Start Time</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productions.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-400">
                          No machine production records found.
                        </td>
                      </tr>
                    ) : (
                      productions.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4 font-semibold text-gray-900">{item.machineName}</td>
                          <td className="py-3 px-4">{item.operatorName}</td>
                          <td className="py-3 px-4">{item.partNoName || "N/A"}</td>
                          <td className="py-3 px-4 font-bold text-gray-800">{item.inputQty}</td>
                          <td className="py-3 px-4">
                            <span className="text-green-600 font-bold">{item.outputQty}</span> /{" "}
                            <span className="text-red-500 font-semibold">{item.rejectedQty}</span>
                          </td>
                          <td className="py-3 px-4">{new Date(item.startTime).toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                item.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "Stopped"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700 animate-pulse"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleOpenUpdate(item)}
                              className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] hover:bg-blue-700 transition-all font-medium"
                            >
                              Update Status
                            </button>
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

        {/* Update Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-bold text-gray-800">Update Run: {selectedItem.machineName}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-500 hover:text-gray-700 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Output Qty (Approved / Pass)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={outputQty}
                    onChange={(e) => setOutputQty(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Rejected Quantity</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Current State</label>
                  <select
                    className="w-full border px-3 py-1.5 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <option value="Running">Running</option>
                    <option value="Completed">Completed</option>
                    <option value="Stopped">Stopped</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItem(null)}
                    className="px-3 py-1.5 bg-gray-150 hover:bg-gray-200 text-gray-700 rounded text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition font-semibold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
