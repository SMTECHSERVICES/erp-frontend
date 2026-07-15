import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";
import toast from "react-hot-toast";

export default function Payment() {
  const role = useAuthStore((state) => state.role);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const [payments, setPayments] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [selectedSalesOrderId, setSelectedSalesOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Bank Transfer");
  const [referenceNo, setReferenceNo] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    fetchPayments();
    fetchSalesOrders();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${server}/supervisor-admin/payment`, { withCredentials: true });
      if (res.data?.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment history");
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

  const handleSalesOrderChange = (e) => {
    const orderId = e.target.value;
    setSelectedSalesOrderId(orderId);
    if (orderId) {
      const orderObj = salesOrders.find((o) => o._id === orderId);
      if (orderObj) {
        setCustomerName(orderObj.customerName || "");
        setTotalAmount(orderObj.totalAmount || "");
        // Pre-fill paid amount with total or empty
        setPaidAmount(orderObj.totalAmount || "");
      }
    } else {
      setCustomerName("");
      setTotalAmount("");
      setPaidAmount("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !totalAmount) {
      toast.error("Customer name and total amount are required");
      return;
    }

    try {
      setLoading(true);
      const orderObj = salesOrders.find((o) => o._id === selectedSalesOrderId);
      const orderNo = orderObj ? orderObj.orderNo : "Manual Entry";

      const payload = {
        salesOrder: selectedSalesOrderId || null,
        orderNo,
        customerName,
        totalAmount: parseFloat(totalAmount),
        paidAmount: parseFloat(paidAmount) || 0,
        paymentMode,
        referenceNo,
        remarks,
      };

      const res = await axios.post(`${server}/supervisor-admin/payment`, payload, {
        withCredentials: true,
      });

      if (res.data?.success) {
        toast.success("Payment transaction recorded successfully");
        setSelectedSalesOrderId("");
        setCustomerName("");
        setTotalAmount("");
        setPaidAmount("");
        setReferenceNo("");
        setRemarks("");
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to post payment");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, payload) => {
    try {
      const res = await axios.patch(
        `${server}/supervisor-admin/payment/${id}/status`,
        payload,
        { withCredentials: true }
      );
      if (res.data?.success) {
        toast.success("Payment records updated");
        fetchPayments();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment");
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Payment Accounts & Receipts</h1>
            <p className="text-sm text-gray-500">Log customer bank receipts, partial payments, and track receivables</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-white font-medium rounded-lg text-sm shadow">
            Receivables Logged: {payments.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Record Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Link Sales Order</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={selectedSalesOrderId}
                  onChange={handleSalesOrderChange}
                >
                  <option value="">-- Choose Sales Order (Optional) --</option>
                  {salesOrders.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.orderNo} - {o.customerName} (₹{o.totalAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Customer / Payer Name *</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Invoice Total *</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Amount Paid *</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Payment Mode</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Cash">Cash Receipt</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Reference / UTR / Cheque No</label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. UTR12234-AXIS"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
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
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 rounded-lg shadow text-sm transition-all disabled:opacity-50"
              >
                {loading ? "Recording..." : "Record Payment"}
              </button>
            </form>
          </div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Payment Inflow Journal</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs bg-white">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Sales Order</th>
                      <th className="py-3 px-4">Total Amt</th>
                      <th className="py-3 px-4">Paid (Ref)</th>
                      <th className="py-3 px-4">Balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Receipt Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-8 text-center text-gray-400">
                          No payments recorded yet.
                        </td>
                      </tr>
                    ) : (
                      payments.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50 text-gray-700 transition">
                          <td className="py-3 px-4">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-semibold text-gray-900">{p.customerName}</td>
                          <td className="py-3 px-4 font-mono">{p.orderNo}</td>
                          <td className="py-3 px-4 font-bold text-gray-700">₹{p.totalAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-green-600 font-bold">
                            ₹{p.paidAmount.toLocaleString()}
                            {p.referenceNo && <div className="text-[9px] text-gray-400 font-normal font-mono">{p.referenceNo} ({p.paymentMode})</div>}
                          </td>
                          <td className="py-3 px-4 font-bold text-red-500">₹{p.balanceAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium text-[9px] uppercase ${
                                p.status === "Paid"
                                  ? "bg-green-100 text-green-700 font-bold"
                                  : p.status === "Partial"
                                  ? "bg-yellow-105 text-yellow-700 font-bold"
                                  : "bg-red-100 text-red-700 font-bold"
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {p.status !== "Paid" && (
                              <button
                                onClick={() => {
                                  const updatePaid = prompt("Enter total cumulative paid amount:", p.paidAmount);
                                  if (updatePaid !== null) {
                                    handleUpdateStatus(p._id, { paidAmount: parseFloat(updatePaid) || 0 });
                                  }
                                }}
                                className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] hover:bg-emerald-700 font-semibold"
                              >
                                Record Inflow
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
