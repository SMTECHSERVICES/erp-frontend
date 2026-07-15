import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function QualityInspection() {
  const role = useAuthStore((state) => state.role);
  const inspectorId = useAuthStore((state) => state.user?.id);
  const inspectorName = useAuthStore((state) => state.user?.name);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [inspections, setInspections] = useState([]);
  const [machineProductions, setMachineProductions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedMpId, setSelectedMpId] = useState("");
  const [inspectedQty, setInspectedQty] = useState("");
  const [passedQty, setPassedQty] = useState("");
  const [rejectedQty, setRejectedQty] = useState("");
  const [qcStatus, setQcStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [defectReasons, setDefectReasons] = useState([{ reason: "", quantity: 0 }]);

  useEffect(() => {
    fetchInspections();
    fetchMachineProductions();
  }, []);

  const fetchInspections = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/quality-inspection`, { withCredentials: true });
      if (res.data?.success) {
        setInspections(res.data.inspections);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Quality Inspections");
    }
  };

  const fetchMachineProductions = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/machine-production`, { withCredentials: true });
      if (res.data?.success) {
        setMachineProductions(res.data.productions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReason = () => {
    setDefectReasons([...defectReasons, { reason: "", quantity: 0 }]);
  };

  const handleRemoveReason = (index) => {
    setDefectReasons(defectReasons.filter((_, idx) => idx !== index));
  };

  const handleReasonChange = (index, field, value) => {
    const updated = [...defectReasons];
    updated[index][field] = value;
    setDefectReasons(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inspectedQty || !passedQty) {
      toast.error("Inspected Qty and Passed Qty are required");
      return;
    }

    try {
      setLoading(true);

      const mpRun = machineProductions.find((m) => m._id === selectedMpId);
      const productionOrder = mpRun?.productionOrder || null;
      const partNo = mpRun?.partNo || null;
      const partNoName = mpRun?.partNoName || "Unknown Part";

      const payload = {
        productionOrder,
        machineProduction: selectedMpId || null,
        partNo,
        partNoName,
        inspectedQty: parseFloat(inspectedQty),
        passedQty: parseFloat(passedQty),
        rejectedQty: parseFloat(rejectedQty) || 0,
        inspectedBy: inspectorId,
        inspectedByName: inspectorName || "QC officer",
        defectReasons: defectReasons.filter((r) => r.reason.trim() !== ""),
        status: qcStatus,
        remarks,
      };

      const res = await axios.post(`${server}/supervisor-admin/quality-inspection`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Quality Inspection Report Saved");
        setSelectedMpId("");
        setInspectedQty("");
        setPassedQty("");
        setRejectedQty("");
        setQcStatus("Pending");
        setRemarks("");
        setDefectReasons([{ reason: "", quantity: 0 }]);
        fetchInspections();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit QC Report");
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
            <h1 className="text-2xl font-bold text-gray-800">Quality Inspection (QC)</h1>
            <p className="text-sm text-gray-500">Record dimension checks, defect metrics and approve batches</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-amber-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Inspected Items: {inspections.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create QC Report Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Submit QC Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Machine Run *</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedMpId}
                  onChange={(e) => setSelectedMpId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Machine Run --</option>
                  {machineProductions.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.machineName} - {m.partNoName} ({m.outputQty} pcs out)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Inspected *</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border px-2 py-1.5 rounded text-xs focus:outline-none"
                    value={inspectedQty}
                    onChange={(e) => setInspectedQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Passed *</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border px-2 py-1.5 rounded text-xs focus:outline-none"
                    value={passedQty}
                    onChange={(e) => setPassedQty(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Rejected</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border px-2 py-1.5 rounded text-xs focus:outline-none"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">QC Decision / Status *</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={qcStatus}
                  onChange={(e) => setQcStatus(e.target.value)}
                  required
                >
                  <option value="Pending">Pending Decision</option>
                  <option value="Passed">Passed (OK)</option>
                  <option value="Failed">Failed (NG)</option>
                  <option value="Partial">Partial Approved</option>
                </select>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700">Defect Analysis</span>
                  <button
                    type="button"
                    onClick={handleAddReason}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + Add Reason
                  </button>
                </div>

                <div className="space-y-2 pr-1 max-h-40 overflow-y-auto">
                  {defectReasons.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="e.g. Scratch, Length issue"
                        className="w-1/2 border px-2 py-1 rounded text-xs focus:outline-none"
                        value={item.reason}
                        onChange={(e) => handleReasonChange(idx, "reason", e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        className="w-1/3 border px-2 py-1 rounded text-xs focus:outline-none"
                        value={item.quantity}
                        onChange={(e) => handleReasonChange(idx, "quantity", parseFloat(e.target.value) || 0)}
                      />
                      {defectReasons.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveReason(idx)}
                          className="text-red-500 font-bold"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">QC Remarks / Notes</label>
                <textarea
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  rows="2"
                  placeholder="Measurement observations..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-amber-600 hover:from-red-650 hover:to-amber-650 text-white font-medium py-2 rounded-lg shadow text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Submit QC Report"}
              </button>
            </form>
          </div>

          {/* QC Inspection Records List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">QC Inspection Log History</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Part No</th>
                      <th className="py-3 px-4">Inspected</th>
                      <th className="py-3 px-4">Passed</th>
                      <th className="py-3 px-4">Rejected</th>
                      <th className="py-3 px-4">Inspector</th>
                      <th className="py-3 px-4">Outcome</th>
                      <th className="py-3 px-4">Defects</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {inspections.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-400">
                          No quality inspection records logged.
                        </td>
                      </tr>
                    ) : (
                      inspections.map((qc) => (
                        <tr key={qc._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4">{new Date(qc.inspectionDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{qc.partNoName}</td>
                          <td className="py-3 px-4">{qc.inspectedQty} pcs</td>
                          <td className="py-3 px-4 text-green-600 font-bold">{qc.passedQty} pcs</td>
                          <td className="py-3 px-4 text-red-500 font-bold">{qc.rejectedQty || 0} pcs</td>
                          <td className="py-3 px-4 text-gray-500">{qc.inspectedByName || "QC Agent"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                qc.status === "Passed"
                                  ? "bg-green-100 text-green-700"
                                  : qc.status === "Failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {qc.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                            {qc.defectReasons?.map((d, id) => (
                              <span key={id} className="inline-block bg-orange-50 text-orange-700 rounded px-1.5 py-0.5 mr-1 mb-1 text-[10px]">
                                {d.reason}: {d.quantity}
                              </span>
                            )) || "None"}
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
