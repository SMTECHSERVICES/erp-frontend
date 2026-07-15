import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function SalesOrder() {
  const role = useAuthStore((state) => state.role);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [salesOrders, setSalesOrders] = useState([]);
  const [partNos, setPartNos] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [orderNo, setOrderNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerGSTIN, setCustomerGSTIN] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState([
    { partNo: "", partNoName: "", quantity: 1, unitPrice: 0, amount: 0 }
  ]);

  useEffect(() => {
    fetchSalesOrders();
    fetchPartNos();
  }, []);

  const fetchSalesOrders = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/sales-order`, { withCredentials: true });
      if (res.data?.success) {
        setSalesOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Sales Orders");
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
    if (!orderNo.trim() || !customerName.trim()) {
      toast.error("Order No and Customer Name are required");
      return;
    }
    if (items.some((it) => !it.partNo)) {
      toast.error("Please pick a part number for all line items");
      return;
    }

    try {
      setLoading(true);
      const totalAmount = calculateTotal();
      const payload = {
        orderNo,
        customerName,
        customerGSTIN,
        customerContact,
        customerAddress,
        expectedDeliveryDate,
        remarks,
        items,
        totalAmount,
      };

      const res = await axios.post(`${server}/supervisor-admin/sales-order`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Sales Order Created Successfully");
        setOrderNo("");
        setCustomerName("");
        setCustomerGSTIN("");
        setCustomerContact("");
        setCustomerAddress("");
        setExpectedDeliveryDate("");
        setRemarks("");
        setItems([{ partNo: "", partNoName: "", quantity: 1, unitPrice: 0, amount: 0 }]);
        fetchSalesOrders();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create Sales Order");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `${server}/supervisor-admin/sales-order/${id}/status`,
        { status },
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success(`Sales Order status updated to ${status}`);
        fetchSalesOrders();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update sales order status");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sales Orders</h1>
            <p className="text-sm text-gray-500">Record customer orders, plan delivery and track fulfillment statuses</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Active Orders: {salesOrders.filter((s) => s.status !== "Delivered" && s.status !== "Cancelled").length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Create Sales Order</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">SO Number *</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. SO-2026-0001"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name *</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. Acme Corporation"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Customer GSTIN</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. 07BBBBB1111B1Z1"
                  value={customerGSTIN}
                  onChange={(e) => setCustomerGSTIN(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full border px-2 py-1.5 rounded text-sm focus:outline-none"
                    value={customerContact}
                    onChange={(e) => setCustomerContact(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Due Date</label>
                  <input
                    type="date"
                    className="w-full border px-2 py-1.5 rounded text-sm focus:outline-none"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Address</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-700">Order Items</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border space-y-2 relative">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="absolute top-1 right-2 text-red-500 hover:text-red-750 text-sm font-bold"
                        >
                          &times;
                        </button>
                      )}
                      <div>
                        <select
                          className="w-full border px-2 py-1 rounded text-xs bg-white"
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
                        <input
                          type="number"
                          placeholder="Qty"
                          className="border px-2 py-1 rounded text-xs"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                          required
                        />
                        <input
                          type="number"
                          placeholder="Rate"
                          className="border px-2 py-1 rounded text-xs"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-2 rounded flex justify-between items-center text-blue-900">
                <span className="font-semibold text-xs">Total:</span>
                <span className="font-bold">₹{calculateTotal().toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-2 rounded-lg shadow text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Creating..." : "Submit Sales Order"}
              </button>
            </form>
          </div>

          {/* List of Orders */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">All Sales Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">SO No</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Items Ordered</th>
                      <th className="py-3 px-4">Total Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Fulfillment Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {salesOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-400">
                          No sales orders created yet.
                        </td>
                      </tr>
                    ) : (
                      salesOrders.map((so) => (
                        <tr key={so._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4 font-mono font-bold text-gray-800">{so.orderNo}</td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-900">{so.customerName}</div>
                            {so.customerGSTIN && <div className="text-[9px] text-gray-400">GST: {so.customerGSTIN}</div>}
                          </td>
                          <td className="py-3 px-4">{so.expectedDeliveryDate ? new Date(so.expectedDeliveryDate).toLocaleDateString() : "-"}</td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {so.items.map((it, idx) => (
                                <div key={idx} className="bg-gray-100 rounded px-1.5 py-0.5 inline-block mr-1 text-[10px]">
                                  {it.partNoName} : {it.quantity} pcs
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">₹{so.totalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                so.status === "Delivered"
                                  ? "bg-green-100 text-green-700"
                                  : so.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : so.status === "Dispatched"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {so.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {so.status !== "Delivered" && so.status !== "Cancelled" && (
                              <div className="flex flex-col gap-1 justify-center items-center">
                                <button
                                  onClick={() => handleUpdateStatus(so._id, "Confirmed")}
                                  className="bg-blue-500 text-white px-2 py-0.5 rounded text-[9px] hover:bg-blue-600 w-16"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(so._id, "Processing")}
                                  className="bg-purple-500 text-white px-2 py-0.5 rounded text-[9px] hover:bg-purple-600 w-16"
                                >
                                  Process
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(so._id, "Cancelled")}
                                  className="bg-red-500 text-white px-2 py-0.5 rounded text-[9px] hover:bg-red-600 w-16"
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
