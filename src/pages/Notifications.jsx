// pages/Notifications.jsx — connecté à l'API Supabase via AppContext
import React from "react";
import { Bell, MessageSquare, Smartphone } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function formatDate(val) {
  if (!val) return "–";
  if (typeof val === "string") return new Date(val).toLocaleString("fr-FR");
  if (val?.toDate) return val.toDate().toLocaleString("fr-FR");
  return "–";
}

export default function Notifications() {
  const { notifications } = useAppContext();

  return (
    <div>
      <div className="toolbar">
        <span className="section-title">Notifications ({notifications.length})</span>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>Message</th><th>Date</th><th>Statut</th></tr></thead>
            <tbody>
              {notifications.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "#94a3b8", padding: 32 }}>Aucune notification</td></tr>
              )}
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      {(n.type || "").includes("SMS") ? <Smartphone size={15} color="#2563eb" /> : <MessageSquare size={15} color="#059669" />}
                      <span style={{ fontSize: ".82rem", fontWeight: 500 }}>{n.type}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#475569", fontSize: ".84rem" }}>
                    {n.message}
                  </td>
                  <td style={{ color: "#64748b", fontSize: ".82rem" }}>{formatDate(n.date_envoi)}</td>
                  <td><span className={`badge ${n.statut === "Envoyé" ? "green" : "gray"}`}>{n.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
