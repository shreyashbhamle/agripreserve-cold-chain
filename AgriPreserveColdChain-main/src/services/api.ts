const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("agripreserve_token") ||
    sessionStorage.getItem("agripreserve_token")
  );
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `API request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export interface ShipmentRecord {
  id: string;
  product: string;
  quantity_kg: number;
  origin: string;
  destination: string;
  status: string;
  eta: string;
  temperature_c: number | null;
  humidity_pct: number | null;
  latitude: number | null;
  longitude: number | null;
  farmer: string;
  driver: string;
  receiver?: string;
  vehicle_number?: string;
  target_temp_min?: number;
  target_temp_max?: number;
  data_mode?: string;
  created_at?: string;
  updated_at?: string;
  origin_country?: string;
  destination_country?: string;
  transport_mode?: string;
  cargo_type?: string;
  container_no?: string;
  incoterm?: string;
  incoterm_named_place?: string;
  currency?: string;
  customs_status?: string;
  carrier_name?: string;
  gross_weight_kg?: number;
  net_weight_kg?: number;
  package_count?: number;
  packaging_type?: string;
  is_international?: number | boolean;
  batch_code?: string;
  order_id?: string;
  risk?: {
    risk_score: number;
    risk_level: string;
    primary_driver: string;
    excursion_count: number;
    spoilage_probability_pct: number;
  };
}

export interface AlertRecord {
  id: number;
  shipment_id: string;
  severity: "Critical" | "Warning" | "Info" | string;
  type: string;
  message: string;
  status: "Open" | "Acknowledged" | "Resolved" | string;
  acknowledged_by?: string | null;
  resolved_by?: string | null;
  resolution_note?: string | null;
  created_at: string;
}

export interface StorageFacilityRecord {
  id: string;
  name: string;
  location: string;
  temperature_c: number;
  humidity_pct: number;
  capacity_used_pct: number;
  capacity_total_tons?: number;
  power_status?: string;
  door_activity?: string;
  status: string;
  updated_at?: string;
}

export interface SensorDeviceRecord {
  device_id: string;
  shipment_id: string;
  device_type: string;
  firmware_version: string;
  battery_pct: number;
  signal_rssi_dbm: number;
  online_status: string;
  sampling_interval_sec: number;
  calibration_offset_c: number;
  data_mode: string;
  last_seen_at: string;
  product?: string;
  origin?: string;
  destination?: string;
  shipment_status?: string;
  temperature_c?: number;
  humidity_pct?: number;
}

export interface ProduceItemRecord {
  id: string;
  farmer_email: string;
  farmer_name: string;
  crop_name: string;
  variety: string;
  category: string;
  harvest_date: string;
  quantity_kg: number;
  available_kg: number;
  quality_grade: string;
  storage_temp_min_c: number;
  storage_temp_max_c: number;
  target_humidity_pct: number;
  expected_shelf_life_days: number;
  unit_price_inr: number;
  storage_location: string;
  status: string;
}

export interface InventoryItemRecord {
  id: string;
  owner_role: string;
  owner_name: string;
  shipment_id?: string | null;
  product: string;
  category: string;
  batch_code: string;
  quantity_kg: number;
  reorder_level_kg: number;
  storage_facility_id?: string | null;
  storage_zone: string;
  temperature_c: number;
  humidity_pct: number;
  quality_grade: string;
  harvest_date?: string;
  received_date: string;
  expiry_date: string;
  status: string;
  unit_cost_inr: number;
}

export interface QualityInspectionRecord {
  id: string;
  shipment_id: string;
  product: string;
  inspector_name: string;
  inspector_role: string;
  temperature_at_arrival_c: number;
  humidity_at_arrival_pct: number;
  temp_compliance_status: string;
  visual_freshness_score: number;
  color_rating: string;
  firmness_rating: string;
  bruising_pct: number;
  packaging_integrity: string;
  odor_check: string;
  decision: string;
  accepted_qty_kg: number;
  rejected_qty_kg: number;
  advisory_classifier_label?: string;
  advisory_confidence_pct?: number;
  notes?: string;
  image_data_url?: string | null;
  created_at: string;
}

export interface OrderSaleRecord {
  id: string;
  shipment_id: string;
  farmer_name: string;
  buyer_name: string;
  product: string;
  quantity_kg: number;
  agreed_price_per_kg_inr: number;
  market_benchmark_per_kg_inr: number;
  gross_amount_inr: number;
  logistics_cost_inr: number;
  net_payout_inr: number;
  payment_status: string;
  payment_method: string;
  invoice_number: string;
  due_date: string;
  paid_at?: string | null;
  data_mode: string;
  created_at: string;
}

export interface MarketPriceRecord {
  id: number;
  date: string;
  commodity: string;
  market: string;
  modal_price_inr_per_kg: number;
  min_price_inr_per_kg: number;
  max_price_inr_per_kg: number;
  arrival_tons: number;
  source_note: string;
}

export interface IncidentRecord {
  id: number;
  shipment_id: string;
  title: string;
  category: string;
  severity: string;
  notes: string;
  reported_by?: string;
  assigned_to?: string;
  status: string;
  resolution_summary?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface DeliveryProofRecord {
  id: string;
  shipment_id: string;
  driver_name: string;
  receiver_name: string;
  recipient_designation: string;
  received_quantity_kg: number;
  arrival_temperature_c: number;
  condition_notes: string;
  signature_text: string;
  photo_data_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  delivered_at: string;
}

export const agriApi = {
  health: () => apiRequest<{ status: string; timestamp: string }>("/api/health"),

  // Auth
  login: (payload: {
    email: string;
    password: string;
    role?: string;
    remember_me?: boolean;
  }) =>
    apiRequest<{
      token: string;
      expires_at: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: "admin" | "farmer" | "driver" | "receiver";
        phone?: string;
        organization?: string;
        region?: string;
        status?: string;
      };
      auth_mode: string;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  logout: () =>
    apiRequest<{ status: string }>("/api/auth/logout", { method: "POST" }),

  me: () => apiRequest<{ user: Record<string, unknown> }>("/api/auth/me"),

  updateProfile: (payload: {
    email?: string;
    name?: string;
    phone?: string;
    organization?: string;
    region?: string;
    current_password?: string;
    new_password?: string;
  }) =>
    apiRequest<{ status: string; user: Record<string, unknown> }>(
      "/api/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  // Dashboard Summary
  summary: () => apiRequest<Record<string, unknown>>("/api/dashboard/summary"),

  // Users (Admin)
  users: (params?: { role?: string; status?: string; q?: string }) => {
    const search = new URLSearchParams();
    if (params?.role) search.set("role", params.role);
    if (params?.status) search.set("status", params.status);
    if (params?.q) search.set("q", params.q);
    const qs = search.toString();
    return apiRequest<Array<Record<string, unknown>>>(
      `/api/users${qs ? `?${qs}` : ""}`,
    );
  },
  createUser: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateUser: (userId: string, payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(
      `/api/users/${encodeURIComponent(userId)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  deleteUser: (userId: string) =>
    apiRequest<Record<string, unknown>>(
      `/api/users/${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
      },
    ),

  // Shipments
  shipments: (q = "", status = "", farmer = "", driver = "") => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (status) search.set("status", status);
    if (farmer) search.set("farmer", farmer);
    if (driver) search.set("driver", driver);
    const qs = search.toString();
    return apiRequest<ShipmentRecord[]>(`/api/shipments${qs ? `?${qs}` : ""}`);
  },
  shipment: (id: string) =>
    apiRequest<Record<string, unknown>>(
      `/api/shipments/${encodeURIComponent(id)}`,
    ),
  createShipment: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/shipments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateShipmentStatus: (
    id: string,
    payload: {
      status: string;
      location?: string;
      notes?: string;
      actor_name?: string;
      actor_role?: string;
    },
  ) =>
    apiRequest<Record<string, unknown>>(
      `/api/shipments/${encodeURIComponent(id)}/status`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  // Sensors
  sensorDevices: () =>
    apiRequest<SensorDeviceRecord[]>("/api/sensors/devices"),
  sensorReadings: (shipmentId = "", limit = 100) => {
    const search = new URLSearchParams();
    if (shipmentId) search.set("shipment_id", shipmentId);
    search.set("limit", String(limit));
    return apiRequest<Array<Record<string, unknown>>>(
      `/api/sensors/readings?${search.toString()}`,
    );
  },
  shipmentSensors: (id: string) =>
    apiRequest<Array<Record<string, unknown>>>(
      `/api/shipments/${encodeURIComponent(id)}/sensors`,
    ),
  addSensorReading: (reading: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/sensors/readings", {
      method: "POST",
      body: JSON.stringify(reading),
    }),

  // Cold Storage
  storage: () => apiRequest<StorageFacilityRecord[]>("/api/storage"),
  createStorage: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/storage", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Alerts & Incidents
  alerts: (severity = "", status = "", shipmentId = "") => {
    const search = new URLSearchParams();
    if (severity) search.set("severity", severity);
    if (status) search.set("status", status);
    if (shipmentId) search.set("shipment_id", shipmentId);
    const qs = search.toString();
    return apiRequest<AlertRecord[]>(`/api/alerts${qs ? `?${qs}` : ""}`);
  },
  updateAlertStatus: (
    alertId: number,
    payload: { status: string; actor?: string; resolution_note?: string },
  ) =>
    apiRequest<AlertRecord>(`/api/alerts/${alertId}/status`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  incidents: (shipmentId = "") =>
    apiRequest<IncidentRecord[]>(
      `/api/incidents${shipmentId ? `?shipment_id=${encodeURIComponent(shipmentId)}` : ""}`,
    ),
  createIncident: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/incidents", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateIncident: (
    incidentId: number,
    payload: { status: string; action_taken?: string },
  ) => {
    const query = new URLSearchParams({ status: payload.status });
    if (payload.action_taken) query.set("action_taken", payload.action_taken);
    return apiRequest<Record<string, unknown>>(
      `/api/incidents/${incidentId}?${query.toString()}`,
      { method: "PUT" },
    );
  },

  // Produce Catalog (Farmer)
  produce: (q = "", category = "") => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (category) search.set("category", category);
    const qs = search.toString();
    return apiRequest<ProduceItemRecord[]>(`/api/produce${qs ? `?${qs}` : ""}`);
  },
  createProduce: (payload: Record<string, unknown>) =>
    apiRequest<ProduceItemRecord>("/api/produce", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateProduce: (id: string, payload: Record<string, unknown>) =>
    apiRequest<ProduceItemRecord>(`/api/produce/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Inventory
  inventory: (ownerRole = "", status = "", q = "") => {
    const search = new URLSearchParams();
    if (ownerRole) search.set("owner_role", ownerRole);
    if (status) search.set("status", status);
    if (q) search.set("q", q);
    const qs = search.toString();
    return apiRequest<{
      items: InventoryItemRecord[];
      movements: Array<Record<string, unknown>>;
    }>(`/api/inventory${qs ? `?${qs}` : ""}`);
  },
  adjustInventory: (
    itemId: string,
    payload: {
      delta_kg: number;
      movement_type: string;
      reason: string;
      actor_name?: string;
      actor_role?: string;
    },
  ) =>
    apiRequest<InventoryItemRecord>(
      `/api/inventory/${encodeURIComponent(itemId)}/adjust`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  // Quality Inspections
  qualityInspections: (shipmentId = "") =>
    apiRequest<QualityInspectionRecord[]>(
      `/api/quality-inspections${shipmentId ? `?shipment_id=${encodeURIComponent(shipmentId)}` : ""}`,
    ),
  createQualityInspection: (payload: Record<string, unknown>) =>
    apiRequest<{
      inspection: QualityInspectionRecord;
      evaluation: Record<string, unknown>;
    }>("/api/quality-inspections", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Delivery Proofs (Driver)
  deliveryProofs: (shipmentId = "") =>
    apiRequest<DeliveryProofRecord[]>(
      `/api/delivery-proofs${shipmentId ? `?shipment_id=${encodeURIComponent(shipmentId)}` : ""}`,
    ),
  createDeliveryProof: (payload: Record<string, unknown>) =>
    apiRequest<DeliveryProofRecord>("/api/delivery-proofs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Orders & Market Prices
  orders: (paymentStatus = "") =>
    apiRequest<OrderSaleRecord[]>(
      `/api/orders${paymentStatus ? `?payment_status=${encodeURIComponent(paymentStatus)}` : ""}`,
    ),
  updateOrderStatus: (
    orderId: string,
    payload: { payment_status: string; payment_method?: string },
  ) =>
    apiRequest<OrderSaleRecord>(
      `/api/orders/${encodeURIComponent(orderId)}/status`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
  marketPrices: (commodity = "", market = "") => {
    const search = new URLSearchParams();
    if (commodity) search.set("commodity", commodity);
    if (market) search.set("market", market);
    const qs = search.toString();
    return apiRequest<{
      data_mode: string;
      disclaimer: string;
      items: MarketPriceRecord[];
    }>(`/api/market-prices${qs ? `?${qs}` : ""}`);
  },

  // Data Sources, Notifications, Search, Settings
  dataSources: () =>
    apiRequest<{
      sources: Array<Record<string, unknown>>;
      audit_logs: Array<Record<string, unknown>>;
    }>("/api/data-sources"),
  notifications: (role = "all") =>
    apiRequest<{
      unread_count: number;
      items: Array<{
        id: number;
        user_role: string;
        title: string;
        message: string;
        category: string;
        link: string;
        is_read: number;
        created_at: string;
      }>;
    }>(`/api/notifications?role=${encodeURIComponent(role)}`),
  markNotificationRead: (id: number) =>
    apiRequest<{ status: string }>(`/api/notifications/${id}/read`, {
      method: "PUT",
    }),
  markAllNotificationsRead: (role = "all") =>
    apiRequest<{ status: string }>(
      `/api/notifications/read-all?role=${encodeURIComponent(role)}`,
      {
        method: "PUT",
      },
    ),
  search: (q: string) =>
    apiRequest<{
      query: string;
      shipments: Array<Record<string, unknown>>;
      produce: Array<Record<string, unknown>>;
      facilities: Array<Record<string, unknown>>;
      alerts: Array<Record<string, unknown>>;
      users: Array<Record<string, unknown>>;
    }>(`/api/search?q=${encodeURIComponent(q)}`),
  settings: () =>
    apiRequest<{
      settings: Record<string, string>;
      details: Array<Record<string, unknown>>;
    }>("/api/settings"),
  updateSettings: (settings: Record<string, string>, actor?: string) =>
    apiRequest<{ status: string; settings: Record<string, string> }>(
      "/api/settings",
      {
        method: "PUT",
        body: JSON.stringify({ settings, actor }),
      },
    ),

  // =========================================================================
  // INTERNATIONAL TRADE, CUSTOMS, INCOTERMS, ROUTES, DOCUMENTS & LANDED COST
  // =========================================================================
  logisticsReference: () =>
    apiRequest<{
      incoterms_2020: Record<string, Record<string, unknown>>;
      tariff_schedules: Record<string, Record<string, unknown>>;
      currency_rates_to_inr: Record<string, number>;
      commodity_inspection_templates: Record<string, Record<string, unknown>>;
      shipment_statuses: string[];
      document_types_catalog: string[];
    }>("/api/logistics/reference"),

  organizations: (orgType = "", country = "") => {
    const search = new URLSearchParams();
    if (orgType) search.set("org_type", orgType);
    if (country) search.set("country", country);
    const qs = search.toString();
    return apiRequest<Array<Record<string, unknown>>>(
      `/api/organizations${qs ? `?${qs}` : ""}`,
    );
  },
  createOrganization: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/organizations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  farms: (farmerEmail = "") =>
    apiRequest<Array<Record<string, unknown>>>(
      `/api/farms${farmerEmail ? `?farmer_email=${encodeURIComponent(farmerEmail)}` : ""}`,
    ),
  createFarm: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/farms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  fleet: (mode = "") =>
    apiRequest<Array<Record<string, unknown>>>(
      `/api/fleet${mode ? `?mode=${encodeURIComponent(mode)}` : ""}`,
    ),
  createFleetAsset: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/fleet", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  quotations: (status = "") =>
    apiRequest<Array<Record<string, unknown>>>(
      `/api/quotations${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    ),
  createQuotation: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/quotations", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateQuotationStatus: (quoteId: string, payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(
      `/api/quotations/${encodeURIComponent(quoteId)}/status`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  optimizeRoutes: (payload: {
    origin?: string;
    destination?: string;
    origin_country?: string;
    destination_country?: string;
    cargo_weight_kg?: number;
    requires_reefer?: boolean;
    target_temp_c?: number;
    shelf_life_days?: number;
    priority?: string;
  }) =>
    apiRequest<{
      corridor_type: string;
      corridor_label: string;
      routing_disclosure: string;
      recommended_Lowest_cost_id: string | null;
      recommended_fastest_feasible_id: string | null;
      recommended_best_balanced_id: string | null;
      alternatives: Array<Record<string, unknown>>;
    }>("/api/routes/optimize", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  shipmentLegs: (shipmentId: string) =>
    apiRequest<Array<Record<string, unknown>>>(
      `/api/shipments/${encodeURIComponent(shipmentId)}/legs`,
    ),
  addShipmentLeg: (shipmentId: string, payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(
      `/api/shipments/${encodeURIComponent(shipmentId)}/legs`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    ),

  customsDeclarations: (shipmentId = "") =>
    apiRequest<Array<Record<string, unknown>>>(
      `/api/customs${shipmentId ? `?shipment_id=${encodeURIComponent(shipmentId)}` : ""}`,
    ),
  customsForShipment: (shipmentId: string) =>
    apiRequest<{
      declaration: Record<string, unknown>;
      live_assessment: Record<string, unknown>;
    }>(`/api/customs/${encodeURIComponent(shipmentId)}`),
  calculateCustoms: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/customs/calculate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCustomsStatus: (
    declarationId: string,
    payload: Record<string, unknown>,
  ) =>
    apiRequest<Record<string, unknown>>(
      `/api/customs/${encodeURIComponent(declarationId)}/status`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  tradeDocuments: (shipmentId = "", status = "") => {
    const search = new URLSearchParams();
    if (shipmentId) search.set("shipment_id", shipmentId);
    if (status) search.set("status", status);
    const qs = search.toString();
    return apiRequest<Array<Record<string, unknown>>>(
      `/api/documents${qs ? `?${qs}` : ""}`,
    );
  },
  uploadTradeDocument: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/documents", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reviewTradeDocument: (docId: string, payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(
      `/api/documents/${encodeURIComponent(docId)}/review`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),

  landedCost: (shipmentId: string) =>
    apiRequest<Record<string, unknown>>(
      `/api/financials/landed-cost/${encodeURIComponent(shipmentId)}`,
    ),
  addCostItem: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/financials/cost-items", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  pickupVerifications: (shipmentId = "") =>
    apiRequest<Array<Record<string, unknown>>>(
      `/api/pickup-verifications${shipmentId ? `?shipment_id=${encodeURIComponent(shipmentId)}` : ""}`,
    ),
  createPickupVerification: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/pickup-verifications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  driverExpenses: (shipmentId = "") =>
    apiRequest<Array<Record<string, unknown>>>(
      `/api/driver-expenses${shipmentId ? `?shipment_id=${encodeURIComponent(shipmentId)}` : ""}`,
    ),
  createDriverExpense: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/driver-expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  reviewDriverExpense: (expenseId: string, status: string) =>
    apiRequest<Record<string, unknown>>(
      `/api/driver-expenses/${encodeURIComponent(expenseId)}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      },
    ),

  claims: (shipmentId = "", status = "") => {
    const search = new URLSearchParams();
    if (shipmentId) search.set("shipment_id", shipmentId);
    if (status) search.set("status", status);
    const qs = search.toString();
    return apiRequest<Array<Record<string, unknown>>>(
      `/api/claims${qs ? `?${qs}` : ""}`,
    );
  },
  createClaim: (payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/claims", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  resolveClaim: (claimId: string, payload: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>(
      `/api/claims/${encodeURIComponent(claimId)}/resolve`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
    ),
};

// AI/ML, RAG, agent workflow, demand forecast, risk ranking, map points, and demo sensor simulator
export const agriIntelligenceApi = {
  status: () => apiRequest<Record<string, unknown>>("/api/ai/status"),
  anomaly: (reading: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/ai/anomaly", {
      method: "POST",
      body: JSON.stringify(reading),
    }),
  mlPredict: (reading: Record<string, unknown>) =>
    apiRequest<Record<string, unknown>>("/api/ai/ml/predict", {
      method: "POST",
      body: JSON.stringify(reading),
    }),
  shipmentRisk: (shipmentId: string) =>
    apiRequest<Record<string, unknown>>(
      `/api/shipments/${encodeURIComponent(shipmentId)}/risk`,
    ),
  riskRanking: () =>
    apiRequest<{
      data_mode: string;
      methodology: string;
      items: Array<Record<string, unknown>>;
    }>("/api/ai/risk-ranking"),
  demandForecast: (commodity = "Tomatoes", horizonDays = 7) =>
    apiRequest<Record<string, unknown>>(
      `/api/ai/demand-forecast?commodity=${encodeURIComponent(commodity)}&horizon_days=${horizonDays}`,
    ),
  ragSearch: (q: string) =>
    apiRequest<Record<string, unknown>>(
      `/api/ai/rag/search?q=${encodeURIComponent(q)}`,
    ),
  copilot: (question: string, shipment_id?: string, role?: string) =>
    apiRequest<Record<string, unknown>>("/api/ai/copilot", {
      method: "POST",
      body: JSON.stringify({ question, shipment_id, role }),
    }),
  runAgent: (question: string, shipment_id: string, confirm_execution = false) =>
    apiRequest<Record<string, unknown>>("/api/ai/agent/run", {
      method: "POST",
      body: JSON.stringify({ question, shipment_id, confirm_execution }),
    }),
  confirmAgentAction: (payload: {
    shipment_id: string;
    action_title: string;
    confirmed_by: string;
    notes?: string;
  }) =>
    apiRequest<Record<string, unknown>>("/api/ai/agent/confirm-action", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  simulateSensors: (
    shipment_id: string,
    count = 3,
    scenario = "normal_drift",
  ) =>
    apiRequest<Record<string, unknown>>("/api/sensors/simulate", {
      method: "POST",
      body: JSON.stringify({ shipment_id, count, scenario }),
    }),
  mapShipments: () => apiRequest<Record<string, unknown>>("/api/maps/shipments"),
};

// Utility helper to export any array of objects as CSV download
export function downloadCsv(
  filename: string,
  rows: Array<Record<string, unknown>>,
) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((key) => {
          const val = row[key];
          const str =
            val === null || val === undefined
              ? ""
              : typeof val === "object"
                ? JSON.stringify(val)
                : String(val);
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ];
  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
