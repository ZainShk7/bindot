import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  CarFront,
  Check,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../api";
import type { Vehicle } from "../types";
import { useAuth } from "../context/AuthContext";
import type { AdminOutletContext } from "../layouts/AdminLayout";
import { Btn, Card, Input, Modal } from "../components/ui";

export function VehiclesPage() {
  const { token } = useAuth();
  const { setError } = useOutletContext<AdminOutletContext>();
  const [items, setItems] = useState<Vehicle[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [editMake, setEditMake] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editPlateNumber, setEditPlateNumber] = useState("");
  const [editDailyRate, setEditDailyRate] = useState("0");
  const [editIsActive, setEditIsActive] = useState(true);

  async function refresh() {
    const d = await api<{ items: Vehicle[] }>("/api/vehicles", {}, token);
    setItems(d.items);
  }

  useEffect(() => {
    refresh().catch((e: unknown) =>
      setError(e instanceof Error ? e.message : "Failed to load vehicles"),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function resetCreateForm() {
    setMake("");
    setModel("");
    setPlateNumber("");
    setDailyRate("");
    setIsActive(true);
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
        "/api/vehicles",
        {
          method: "POST",
          body: JSON.stringify({
            make,
            model,
            plateNumber,
            dailyRate: Number(dailyRate),
            isActive,
          }),
        },
        token,
      );
      resetCreateForm();
      setCreateOpen(false);
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create vehicle");
    }
  }

  async function del(id: string) {
    setError("");
    try {
      await api(`/api/vehicles/${id}`, { method: "DELETE" }, token);
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete vehicle");
    }
  }

  function startEdit(v: Vehicle) {
    setEditing(v);
    setEditMake(v.make || "");
    setEditModel(v.model || "");
    setEditPlateNumber(v.plateNumber || "");
    setEditDailyRate(String(v.dailyRate ?? 0));
    setEditIsActive(Boolean(v.isActive ?? true));
  }

  async function saveEdit() {
    if (!editing) return;
    setError("");
    try {
      await api(
        `/api/vehicles/${editing._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            make: editMake,
            model: editModel,
            plateNumber: editPlateNumber,
            dailyRate: Number(editDailyRate),
            isActive: editIsActive,
          }),
        },
        token,
      );
      setEditing(null);
      await refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update vehicle");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create vehicle"
        icon={Plus}
        wide
      >
        <div style={{ display: "grid", gap: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
              gap: 10,
            }}
          >
            <Input
              placeholder="Make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              autoComplete="off"
            />
            <Input
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              autoComplete="off"
            />
            <Input
              placeholder="Plate number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              autoComplete="off"
            />
            <Input
              placeholder="Daily rate"
              value={dailyRate}
              onChange={(e) => setDailyRate(e.target.value)}
              autoComplete="off"
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
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>
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
        <Card title="Edit vehicle" icon={Pencil}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr auto auto",
              gap: 10,
            }}
          >
            <Input
              placeholder="Make"
              value={editMake}
              onChange={(e) => setEditMake(e.target.value)}
            />
            <Input
              placeholder="Model"
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
            />
            <Input
              placeholder="Plate number"
              value={editPlateNumber}
              onChange={(e) => setEditPlateNumber(e.target.value)}
            />
            <Input
              placeholder="Daily rate"
              value={editDailyRate}
              onChange={(e) => setEditDailyRate(e.target.value)}
            />
            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontSize: 12,
                opacity: 0.85,
              }}
            >
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
              />
              Active
            </label>
            <div
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
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
          </div>
        </Card>
      ) : null}

      <Card
        title={`Vehicles (${items.length})`}
        icon={CarFront}
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
          {items.map((v) => (
            <div
              key={v._id}
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
                  {v.make} {v.model} • {v.plateNumber}
                </div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  ${Number(v.dailyRate).toFixed(2)} / day{" "}
                  {v.isActive === false ? "• inactive" : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => startEdit(v)}
                  aria-label={`Edit ${v.make} ${v.model}`}
                  title="Edit"
                  style={{ padding: "8px 10px" }}
                />
                <Btn
                  variant="danger"
                  icon={Trash2}
                  onClick={() => del(v._id)}
                  aria-label={`Delete ${v.plateNumber}`}
                  title="Delete"
                  style={{ padding: "8px 10px" }}
                />
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No vehicles yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
