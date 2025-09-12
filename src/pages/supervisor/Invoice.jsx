import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { server } from "../../constants/api";
import { useAuthStore } from "../../store/useAuthStore";
import SupervisorLayout from "../../layout/SupervisorLayout";
import AdminLayout from "../../layout/AdminLayout";

export default function Invoice() {
  const role = useAuthStore((state) => state.role);
  const Layout = role === "SUPERVISOR" ? SupervisorLayout : AdminLayout;

  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      invoiceNo: "",
      invoiceDate: "",
      vendorCode: "",
      billTo: "",
      shipTo: "",
      items: [{ sNo: 1, hsn: "", unitPrice: "", qty: "", uom: "", amount: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [invoices, setInvoices] = useState([]);

  // 🔹 Fetch all invoices once
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await axios.get(`${server}/supervisor-admin/invoice`, {
          withCredentials: true,
        });
        setInvoices(res.data.file || []); // from getInvoice response
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };

    fetchInvoice();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setResult(null);

      const res = await axios.post(
        `${server}/supervisor-admin/invoice/pdf/generate`,
        data,
        { withCredentials: true }
      );
      setResult(res.data);

      // refresh invoice list
      const updatedInvoices = await axios.get(
        `${server}/supervisor-admin/invoice`,
        { withCredentials: true }
      );
      setInvoices(updatedInvoices.data.file || []);
    } catch (err) {
      console.error(err);
      alert("Error generating invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Invoice Generator</h1>

      {/* 🔹 Existing Invoices List */}
      {invoices.length > 0 && (
        <div className="mb-8 bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-3">📑 Previous Invoices</h2>
          <ul className="space-y-2">
            {invoices.map((inv) => (
              <li key={inv._id} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  ID: {inv._id} | {new Date(inv.createdAt).toLocaleString()}
                </span>
                <a
                  href={inv.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  View / Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-3xl"
      >
        {/* Invoice Header */}
        <div className="grid grid-cols-2 gap-4">
          <input
            {...register("invoiceNo")}
            placeholder="Invoice No"
            className="border p-2 rounded"
          />
          <input
            type="date"
            {...register("invoiceDate")}
            className="border p-2 rounded"
          />
          <input
            {...register("vendorCode")}
            placeholder="Vendor Code"
            className="border p-2 rounded"
          />
        </div>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <textarea
            {...register("billTo")}
            placeholder="Bill To"
            className="border p-2 rounded"
          />
          <textarea
            {...register("shipTo")}
            placeholder="Ship To"
            className="border p-2 rounded"
          />
        </div>

        {/* Items Table */}
        <h2 className="font-semibold mt-6 mb-2">Items</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">S.No</th>
              <th className="p-2 border">HSN</th>
              <th className="p-2 border">Unit Price</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">UOM</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id}>
                <td className="border p-1">
                  <input
                    {...register(`items.${index}.sNo`)}
                    defaultValue={index + 1}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-1">
                  <input
                    {...register(`items.${index}.hsn`)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-1">
                  <input
                    {...register(`items.${index}.unitPrice`)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-1">
                  <input
                    {...register(`items.${index}.qty`)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-1">
                  <input
                    {...register(`items.${index}.uom`)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-1">
                  <input
                    {...register(`items.${index}.amount`)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border p-1 text-center">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500"
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          type="button"
          className="mt-2 text-blue-600"
          onClick={() => append({ sNo: fields.length + 1 })}
        >
          ➕ Add Item
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Generating..." : "Generate Invoice"}
        </button>
      </form>

      {/* Result Section */}
      {result && (
        <div className="mt-6 bg-green-100 p-4 rounded-lg">
          <h2 className="font-semibold">✅ Invoice Generated!</h2>
          <p>Cloudinary URL:</p>
          <a
            href={result.dbRecord.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            View / Download PDF
          </a>
          <p className="mt-2 text-gray-600">
            Saved in MongoDB with ID: {result.dbRecord._id}
          </p>
        </div>
      )}
    </Layout>
  );
}
