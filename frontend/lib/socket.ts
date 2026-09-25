import { useQueueStore, BookingToken } from "../store/queueStore";

export class QueueWebSocketClient {
  private centerId: string;
  private token?: string;
  private socket: WebSocket | null = null;
  private pingInterval: any = null;
  private reconnectTimeout: any = null;
  private isExplicitlyClosed = false;

  constructor(centerId: string, token?: string) {
    this.centerId = centerId;
    this.token = token;
  }

  public connect(): void {
    if (typeof window === "undefined") return;
    this.isExplicitlyClosed = false;

    useQueueStore.getState().setConnectionStatus("reconnecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host =
      process.env.NEXT_PUBLIC_WS_URL ||
      (window.location.hostname ? `${window.location.hostname}:8000` : "127.0.0.1:8000");

    const wsUrl = `${protocol}//${host}/api/v1/ws/queue/${this.centerId}${
      this.token ? `?token=${encodeURIComponent(this.token)}` : ""
    }`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        useQueueStore.getState().setConnectionStatus("connected");
        // Start heartbeat ping every 25 seconds
        this.pingInterval = setInterval(() => {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send("ping");
          }
        }, 25000);
      };

      this.socket.onmessage = (event) => {
        if (event.data === "pong") return;
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.token) {
            useQueueStore.getState().upsertToken(payload.token as BookingToken);
          } else if (payload && payload.id && payload.token_number) {
            useQueueStore.getState().upsertToken({
              id: payload.id,
              tokenNumber: payload.token_number,
              farmerName: payload.farmer_name || "Farmer",
              farmerPhone: payload.farmer_phone || "",
              cropName: payload.crop_name,
              cropVolumeQuintals: payload.crop_volume_quintals,
              actualWeightQuintals: payload.actual_weight_quintals,
              moistureContentPercent: payload.moisture_content_percent,
              adjustedWeightQuintals: payload.adjusted_weight_quintals,
              vehicleType: payload.vehicle_type,
              bookingDate: payload.booking_date,
              slotStartTime: payload.slot_start_time,
              slotEndTime: payload.slot_end_time,
              status: payload.status,
            });
          }
        } catch (e) {
          // Non-JSON message received
        }
      };

      this.socket.onclose = () => {
        this.cleanupPing();
        useQueueStore.getState().setConnectionStatus("disconnected");
        if (!this.isExplicitlyClosed) {
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, 3000);
        }
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch (e) {
      useQueueStore.getState().setConnectionStatus("disconnected");
    }
  }

  public disconnect(): void {
    this.isExplicitlyClosed = true;
    this.cleanupPing();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    useQueueStore.getState().setConnectionStatus("disconnected");
  }

  private cleanupPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}
