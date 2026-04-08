import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Check,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { api } from "../api";
import type { Customer } from "../types";
import { useAuth } from "../context/AuthContext";
import type { AdminOutletContext } from "../layouts/AdminLayout";
import { Btn, Card, Input, Modal } from "../components/ui";

export function CustomersPage() {
  const { token } = useAuth();
  const { setError } = useOutletContext<AdminOutletContext>();
  const [items, setItems] = useState<Customer[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  async function refresh() {
    const d = await api<{ items: Customer[] }>("/api/customers", {}, token);
    setItems(d.items);
  }

  useEffect(() => {
    refresh().catch((e: unknown) =>
      setError(
        e instanceof Error ? e.message : "Failed to load customers",
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function resetCreateForm() {
    setName("");
    setEmail("");
    setPhone("");
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
        "/api/customers",
        { method: "POST", body: JSON.stringify({ name, email, phone }) },
        token,
      );
      resetCreateForm();
      setCreateOpen(false);
      await refresh();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to create customer",
      );
    }
  }

  async function del(id: string) {
    setError("");
    try {
      await api(`/api/customers/${id}`, { method: "DELETE" }, token);
      await refresh();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to delete customer",
      );
    }
  }

  function startEdit(c: Customer) {
    setEditing(c);
    setEditName(c.name || "");
    setEditEmail(c.email || "");
    setEditPhone(c.phone || "");
  }

  async function saveEdit() {
    if (!editing) return;
    setError("");
    try {
      await api(
        `/api/customers/${editing._id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: editName,
            email: editEmail,
            phone: editPhone,
          }),
        },
        token,
      );
      setEditing(null);
      await refresh();
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : "Failed to update customer",
      );
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create customer"
        icon={UserPlus}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 14,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
              gap: 10,
              alignItems: "end",
            }}
          >
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
            />
            <Input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="off"
            />
          </div>
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
        <Card title="Edit customer" icon={Pencil}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 2fr 1fr auto auto",
              gap: 10,
            }}
          >
            <Input
              placeholder="Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <Input
              placeholder="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
            <Input
              placeholder="Phone"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
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
        title={`Customers (${items.length})`}
        icon={Users}
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
          {items.map((c) => (
            <div
              key={c._id}
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
                  {c.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.734,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {[c.email, c.phone].filter(Boolean).join(" • ")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn
                  variant="secondary"
                  icon={Pencil}
                  onClick={() => startEdit(c)}
                  aria-label={`Edit ${c.name}`}
                  title="Edit"
                  style={{ padding: "8px 10px" }}
                />
                <Btn
                  variant="danger"
                  icon={Trash2}
                  onClick={() => del(c._id)}
                  aria-label={`Delete ${c.name}`}
                  title="Delete"
                  style={{ padding: "8px 10px" }}
                />
              </div>
            </div>
          ))}
          {items.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No customers yet.</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
