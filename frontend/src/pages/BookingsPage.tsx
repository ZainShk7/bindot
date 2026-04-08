import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CalendarDays,
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../api";
import type { Booking, Customer, Vehicle } from "../types";
import { useAuth } from "../context/AuthContext";
import type { AdminOutletContext } from "../layouts/AdminLayout";
import { Btn, Card, Input, Modal, Select } from "../components/ui";

export function BookingsPage() {
  const { token } = useAuth();
  const { setError } = useOutletContext<AdminOutletContext>();
  const [items, setItems] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [availableOnly, setAvailableOnly] = useState(true);

  const [editing, setEditing] = useState<Booking | null>(null);
  const [editCustomerId, setEditCustomerId] = useState("");
  const [editVehicleId, setEditVehicleId] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  async function refreshAll() {
    const [b, c, vAll] = await Promise.all([
      api<{ items: Booking[] }>("/api/bookings", {}, token),
      api<{ items: Customer[] }>("/api/customers", {}, token),
      api<{ items: Vehicle[] }>("/api/vehicles", {}, token),
    ]);

    let v = vAll;
    if (availableOnly && startDate && endDate) {
      try {
        v = await api<{ items: Vehicle[] }>(
          `/api/vehicles/available?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
          {},
          token,
        );
      } catch {
        // If date filter errors, fall back to all vehicles.
      }
    }

    setItems(b.items);
    setCustomers(c.items);
    setVehicles(v.items || vAll.items);
  }

  useEffect(() => {
    refreshAll().catch((e: unknown) =>
      setError(e instanceof Error ? e.message : "Failed to load bookings"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, availableOnly]);

  useEffect(() => {
    if (!availableOnly) return;
    refreshAll().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, availableOnly]);

  function resetCreateForm() {
    setCustomerId("");
    setVehicleId("");
    setStartDate("");
    setEndDate("");
    setAvailableOnly(true);
  }

  function openCreateModal() {
    setError("");
    resetCreateForm();
    setCreateOpen(true);
  }

  async function create() {
    setError("");
    try {
      await api(
        "/api/bookings",
        {
          method: "POST",
          body: JSON.stringify({ customerId, vehicleId, startDate, endDate }),
        },
        token,
      );
      resetCreateForm();
      setCreateOpen(false);
      await refreshAll();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create booking");
    }
  }

  async function del(id: string) {
    setError("");
    try {
      await api(`/api/bookings/${id}`, { method: "DELETE" }, token);
      await refreshAll();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete booking");
    }
  }

  function startEdit(b: Booking) {
    setEditing(b);
    setEditCustomerId(b.customer?._id || "");
    setEditVehicleId(b.vehicle?._id || "");
    setEditStartDate(String(b.startDate).slice(0, 10));
    setEditEndDate(String(b.endDate).slice(0, 10));
  }

  async function saveEdit() {
    if (!editing) return;
    setError("");
    try {
      await api(
        `/api/bookings/${editing._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            customerId: editCustomerId,
            vehicleId: editVehicleId,
            startDate: editStartDate,
            endDate: editEndDate,
          }),
        },
        token,
      );
      setEditing(null);
      await refreshAll();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update booking");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create booking"
        icon={Plus}
        wide
      >
        <div style={{ display: "grid", gap: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
              gap: 10,
            }}
          >
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.make} {v.model} • {v.plateNumber}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <label
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13,
              opacity: 0.9,
            }}
          >
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
            />
            Available only (needs start and end dates)
          </label>
          {customers.length === 0 || vehicles.length === 0 ? (
            <div style={{ opacity: 0.75, fontSize: 13 }}>
              Create at least one customer and one vehicle first.
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Btn
              variant="secondary"
              icon={X}
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Btn>
            <Btn onClick={create} icon={Plus} style={{ padding: "10px 16px" }}>
              Add
            </Btn>
          </div>
        </div>
      </Modal>

      {editing ? (
        <Card title="Edit booking" icon={Pencil}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr auto auto",
              gap: 10,
            }}
          >
            <Select
              value={editCustomerId}
              onChange={(e) => setEditCustomerId(e.target.value)}
            >
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <Select
              value={editVehicleId}
              onChange={(e) => setEditVehicleId(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.make} {v.model} • {v.plateNumber}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
            />
            <Input
              type="date"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
            />
            <Btn onClick={saveEdit} icon={Check}>
              Save
            </Btn>
            <Btn
              variant="secondary"
              icon={X}
              onClick={() => setEditing(null)}
            >
              Cancel
            </Btn>
          </div>
        </Card>
      ) : null}

      <Card
        title={`Bookings (${items.length})`}
        icon={CalendarDays}
        actions={
          <Btn
            icon={Plus}
            onClick={openCreateModal}
            style={{ padding: "8px 14px" }}
          >
            Add
          </Btn>
        }
      >
        <div style={{ display: "grid", gap: 8 }}>
          {items.map((b) => (
            <div
              key={b._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: 10,
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--bg)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 800,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--text-h)",
                  }}
                >
                  {b.customer?.name} → {b.vehicle?.make} {b.vehicle?.model} (
                  {b.vehicle?.plateNumber})
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {String(b.startDate).slice(0, 10)} to{" "}
                  {String(b.endDate).slice(0, 10)} • $
                  {Number(b.totalAmount).toFixed(2)}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => startEdit(b)}
                  aria-label="Edit booking"
                  title="Edit"
                  style={{ padding: "8px 10px" }}
                />
                <Btn
                  variant="danger"
                  icon={Trash2}
                  onClick={() => del(b._id)}
                  aria-label="Delete booking"
                  title="Delete"
                  style={{ padding: "8px 10px" }}
                />
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No bookings yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
