import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function Purchase() {
  const role = useAuthStore((state) => state.role);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [purchases, setPurchases] = useState([]);
  const [partNos, setPartNos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [supplierName, setSupplierName] = useState("");
  const [supplierGSTIN, setSupplierGSTIN] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState([
    { partNo: "", partNoName: "", quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  useEffect(() => {
    fetchPurchases();
    fetchPartNos();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/purchase`, { withCredentials: true });
      if (res.data?.success) {
        setPurchases(res.data.purchases);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch purchases");
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
      toast.error("Failed to load Parts list");
    }
  };

  const handleAddItem = () => {
    setItems([...items, { partNo: "", partNoName: "", quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === "partNo") {
      const partObj = partNos.find((p) => p._id === value);
      updated[index].partNo = value;
      updated[index].partNoName = partObj ? partObj.partNo : "";
    } else {
      updated[index][field] = value;
    }
    updated[index].amount = updated[index].quantity * updated[index].unitPrice;
    setItems(updated);
  };

  const calculateTotal = () => {
    return items.reduce((acc, curr) => acc + curr.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      toast.error("Supplier Name is required");
      return;
    }
    if (items.some((it) => !it.partNo)) {
      toast.error("Please select a Part Number for all items");
      return;
    }

    try {
      setLoading(true);
      const totalAmount = calculateTotal();
      const payload = {
        supplierName,
        supplierGSTIN,
        invoiceNo,
        remarks,
        items,
        totalAmount,
      };

      const res = await axios.post(`${server}/supervisor-admin/purchase`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Purchase order created successfully");
        setSupplierName("");
        setSupplierGSTIN("");
        setInvoiceNo("");
        setRemarks("");
        setItems([{ partNo: "", partNoName: "", quantity: 1, unitPrice: 0, amount: 0 }]);
        fetchPurchases();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create purchase order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `${server}/supervisor-admin/purchase/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Purchase status updated to ${status}`);
        fetchPurchases();
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
            <h1 className="text-2xl font-bold text-gray-800">Purchase Orders</h1>
            <p className="text-sm text-gray-500">Track and manage raw material purchases from suppliers</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Total Orders: {purchases.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Purchase Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Create Purchase Order</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier Name *</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter Supplier Name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier GSTIN</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. 07AAAAA1111A1Z1"
                  value={supplierGSTIN}
                  onChange={(e) => setSupplierGSTIN(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Supplier Invoice / Bill No</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Bill or Invoice Reference"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700">Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + Add Part
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border space-y-2 relative">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="absolute top-1 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
                        >
                          &times;
                        </button>
                      )}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Select Part</label>
                        <select
                          className="w-full border px-2 py-1.5 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={item.partNo}
                          onChange={(e) => handleItemChange(index, "partNo", e.target.value)}
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

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full border px-2 py-1 rounded text-xs focus:outline-none"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full border px-2 py-1 rounded text-xs focus:outline-none"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                            required
                          />
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-semibold text-gray-600">
                        Amount: ₹{item.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                <textarea
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Additional notes"
                  rows="2"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg flex justify-between items-center text-blue-900">
                <span className="font-semibold text-sm">Total Amount:</span>
                <span className="font-bold text-lg">₹{calculateTotal().toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-750 text-white font-medium py-2 rounded-lg shadow mt-2 text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Creating..." : "Submit Purchase Order"}
              </button>
            </form>
          </div>

          {/* Purchases List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">All Purchase Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">PO Date</th>
                      <th className="py-3 px-4">Supplier</th>
                      <th className="py-3 px-4">Invoice / Bill</th>
                      <th className="py-3 px-4">Items</th>
                      <th className="py-3 px-4">Total (₹)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
                          No purchase orders recorded yet.
                        </td>
                      </tr>
                    ) : (
                      purchases.map((po) => (
                        <tr key={po._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4">{new Date(po.purchaseDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{po.supplierName}</div>
                            {po.supplierGSTIN && <div className="text-[10px] text-gray-400">GST: {po.supplierGSTIN}</div>}
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-600">{po.invoiceNo || "-"}</td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {po.items.map((it, idx) => (
                                <div key={idx} className="bg-gray-100 rounded px-1.5 py-0.5 inline-block mr-1 mb-1 text-[10px]">
                                  {it.partNoName} ({it.quantity} qty)
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">₹{po.totalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                po.status === "Received"
                                  ? "bg-green-100 text-green-700"
                                  : po.status === "Partial"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {po.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {po.status !== "Received" && (
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => handleUpdateStatus(po._id, "Received")}
                                  className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] hover:bg-green-700"
                                >
                                  Mark Received
                                </button>
                                {po.status === "Pending" && (
                                  <button
                                    onClick={() => handleUpdateStatus(po._id, "Partial")}
                                    className="bg-yellow-500 text-white px-2 py-0.5 rounded text-[10px] hover:bg-yellow-600"
                                  >
                                    Partial
                                  </button>
                                )}
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
