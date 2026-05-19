import { useEffect, useState, useCallback } from "react";
import { getSDK } from "../../../sdk";
import { toCourier, toShippingMethod } from "../domain";
import type { Courier, ShippingMethod } from "../domain";

export function LogisticsPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCourierName, setNewCourierName] = useState("");
  const [newCourierCode, setNewCourierCode] = useState("");

  const [newMethodName, setNewMethodName] = useState("");
  const [newMethodCourierId, setNewMethodCourierId] = useState("");
  const [newMethodDescription, setNewMethodDescription] = useState("");

  const loadCouriers = useCallback(async () => {
    const sdk = getSDK();
    const objs = await sdk.thisPlugin.objects.list("courier");
    setCouriers(objs.map(toCourier));
  }, []);

  const loadMethods = useCallback(async () => {
    const sdk = getSDK();
    const objs = await sdk.thisPlugin.objects.list("shipping-method");
    setMethods(objs.map(toShippingMethod));
  }, []);

  useEffect(() => {
    Promise.all([loadCouriers(), loadMethods()])
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load data"))
      .finally(() => setLoading(false));
  }, [loadCouriers, loadMethods]);

  async function handleAddCourier() {
    if (!newCourierName.trim() || !newCourierCode.trim()) return;
    setError(null);
    try {
      const sdk = getSDK();
      const id = crypto.randomUUID();
      await sdk.thisPlugin.objects.save("courier", id, {
        name: newCourierName.trim(),
        code: newCourierCode.trim().toUpperCase(),
        enabled: true,
      });
      setNewCourierName("");
      setNewCourierCode("");
      await loadCouriers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add courier");
    }
  }

  async function handleToggleCourier(courier: Courier) {
    setError(null);
    try {
      const sdk = getSDK();
      await sdk.thisPlugin.objects.save("courier", courier.objectId, {
        name: courier.name,
        code: courier.code,
        enabled: !courier.enabled,
      });
      await loadCouriers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update courier");
    }
  }

  async function handleDeleteCourier(courierId: string) {
    setError(null);
    try {
      const sdk = getSDK();
      const relatedMethods = methods.filter((m) => m.courierId === courierId);
      for (const m of relatedMethods) {
        await sdk.thisPlugin.objects.delete("shipping-method", m.objectId);
      }
      await sdk.thisPlugin.objects.delete("courier", courierId);
      await Promise.all([loadCouriers(), loadMethods()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete courier");
    }
  }

  async function handleAddMethod() {
    if (!newMethodName.trim() || !newMethodCourierId) return;
    setError(null);
    try {
      const sdk = getSDK();
      const id = crypto.randomUUID();
      await sdk.thisPlugin.objects.save("shipping-method", id, {
        name: newMethodName.trim(),
        courierId: newMethodCourierId,
        description: newMethodDescription.trim(),
      });
      setNewMethodName("");
      setNewMethodDescription("");
      await loadMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add shipping method");
    }
  }

  async function handleDeleteMethod(methodId: string) {
    setError(null);
    try {
      const sdk = getSDK();
      await sdk.thisPlugin.objects.delete("shipping-method", methodId);
      await loadMethods();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete method");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="tc-plugin" style={{ padding: "1rem", maxWidth: 900 }}>
      <h1>Logistics</h1>
      {error && <p className="tc-error">{error}</p>}

      <section className="tc-section">
        <h2>Couriers</h2>
        <div className="tc-flex" style={{ marginBottom: "1rem" }}>
          <input
            className="tc-input"
            placeholder="Name (e.g. DHL)"
            value={newCourierName}
            onChange={(e) => setNewCourierName(e.target.value)}
          />
          <input
            className="tc-input"
            placeholder="Code (e.g. DHL)"
            value={newCourierCode}
            onChange={(e) => setNewCourierCode(e.target.value)}
            style={{ width: 120 }}
          />
          <button className="tc-primary-button" onClick={() => void handleAddCourier()}>
            Add
          </button>
        </div>

        {couriers.length === 0 ? (
          <p>No couriers yet. Add one above.</p>
        ) : (
          <table className="tc-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {couriers.map((c) => (
                <tr key={c.objectId}>
                  <td>{c.name}</td>
                  <td>{c.code}</td>
                  <td>
                    <span className={`tc-badge ${c.enabled ? "tc-badge--success" : "tc-badge--danger"}`}>
                      {c.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <span className="tc-flex">
                      <button className="tc-ghost-button" onClick={() => void handleToggleCourier(c)}>
                        {c.enabled ? "Disable" : "Enable"}
                      </button>
                      <button
                        className="tc-ghost-button tc-ghost-button--danger"
                        onClick={() => void handleDeleteCourier(c.objectId)}
                      >
                        Delete
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="tc-section">
        <h2>Delivery Methods</h2>
        {couriers.length === 0 ? (
          <p>Add couriers first to define delivery methods.</p>
        ) : (
          <>
            <div className="tc-flex" style={{ marginBottom: "1rem" }}>
              <select
                className="tc-select"
                value={newMethodCourierId}
                onChange={(e) => setNewMethodCourierId(e.target.value)}
              >
                <option value="">-- Courier --</option>
                {couriers.map((c) => (
                  <option key={c.objectId} value={c.objectId}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                className="tc-input"
                placeholder="Method name (e.g. Standard parcel)"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
              />
              <input
                className="tc-input"
                placeholder="Description (optional)"
                value={newMethodDescription}
                onChange={(e) => setNewMethodDescription(e.target.value)}
              />
              <button className="tc-primary-button" onClick={() => void handleAddMethod()}>
                Add
              </button>
            </div>

            {methods.length === 0 ? (
              <p>No delivery methods yet.</p>
            ) : (
              <table className="tc-table">
                <thead>
                  <tr>
                    <th>Courier</th>
                    <th>Method</th>
                    <th>Description</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {methods.map((m) => {
                    const courier = couriers.find((c) => c.objectId === m.courierId);
                    return (
                      <tr key={m.objectId}>
                        <td>{courier ? courier.name : m.courierId}</td>
                        <td>{m.name}</td>
                        <td>{m.description}</td>
                        <td>
                          <button
                            className="tc-ghost-button tc-ghost-button--danger"
                            onClick={() => void handleDeleteMethod(m.objectId)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>
    </div>
  );
}
