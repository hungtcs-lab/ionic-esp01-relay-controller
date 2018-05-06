

export class Device {
  name?: string;
  ipAddress: string;
  macAddress: string;
  type: string;
  status?: boolean;
}

export class DeviceListResponse {
  status: number;
  data: Array<Device>;
}

export class DeviceStatusResponse {
  status: number;
  data: {
    status: number
  };
}
