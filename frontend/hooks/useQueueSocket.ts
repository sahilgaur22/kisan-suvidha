"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useQueueStore } from "../store/queueStore";
import { QueueWebSocketClient } from "../lib/socket";

export function useQueueSocket(centerId: string | null) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { setCenterId, connectionStatus } = useQueueStore();

  useEffect(() => {
    if (!centerId || !accessToken) return;

    setCenterId(centerId);
    const client = new QueueWebSocketClient(centerId, accessToken);
    client.connect();

    return () => {
      client.disconnect();
    };
  }, [centerId, accessToken, setCenterId]);

  return { connectionStatus };
}
