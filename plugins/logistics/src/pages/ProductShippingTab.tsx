import { useEffect, useState, useCallback } from "react";
import { getSDK } from "../../../sdk";
import { toCourier, toShippingMethod, toProductShippingData } from "../domain";
import type { Courier, ShippingMethod } from "../domain";

export function ProductShippingTab() {
  const sdk = getSDK();
  const productId = sdk.thisPlugin.productId ?? "";

  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [disabledMethods, setDisabledMethods] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [courierObjs, methodObjs, productData] = await Promise.all([
        sdk.thisPlugin.objects.list("courier"),
        sdk.thisPlugin.objects.list("shipping-method"),
        sdk.thisPlugin.getData(productId),
      ]);
      setCouriers(courierObjs.map(toCourier));
      setMethods(methodObjs.map(toShippingMethod));
      const parsed = toProductShippingData(productData as Record<string, unknown> | null);
      setDisabledMethods(new Set(parsed.disabledMethods));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [productId, sdk.thisPlugin]);

  useEffect(() => {
    void load();
  }, [load]);

  function toggleMethod(methodId: string) {
    setDisabledMethods((prev) => {
      const next = new Set(prev);
      if (next.has(methodId)) {
        next.delete(methodId);
      } else {
        next.add(methodId);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await sdk.thisPlugin.setData(productId, { disabledMethods: Array.from(disabledMethods) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  const enabledCouriers = couriers.filter((c) => c.enabled);

  return (
    <div className="tc-plugin" style={{ padding: "1rem", maxWidth: 700 }}>
      <h2>Shipping Methods</h2>
      <p style={{ marginBottom: "1rem", color: "#555" }}>
        Disable methods that are unavailable for this product (e.g. oversized, fragile).
      </p>
      {error && <p className="tc-error">{error}</p>}

      {enabledCouriers.length === 0 && (
        <p>No couriers configured. Add couriers in the Logistics section.</p>
      )}

      {enabledCouriers.map((courier) => {
        const courierMethods = methods.filter((m) => m.courierId === courier.objectId);
        if (courierMethods.length === 0) return null;

        return (
          <section key={courier.objectId} className="tc-section">
            <h3 style={{ marginBottom: "0.5rem" }}>{courier.name}</h3>
            <table className="tc-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Description</th>
                  <th align="right">Available</th>
                </tr>
              </thead>
              <tbody>
                {courierMethods.map((m) => {
                  const disabled = disabledMethods.has(m.objectId);
                  return (
                    <tr key={m.objectId}>
                      <td>{m.name}</td>
                      <td>{m.description}</td>
                      <td align="right">
                        <input
                          type="checkbox"
                          checked={!disabled}
                          onChange={() => toggleMethod(m.objectId)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        );
      })}

      {methods.length > 0 && (
        <button className="tc-primary-button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      )}
    </div>
  );
}
