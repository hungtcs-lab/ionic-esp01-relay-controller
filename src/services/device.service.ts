import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Device, DeviceListResponse, DeviceStatusResponse } from '../entities/device'

@Injectable()
export class DeviceService {

  constructor(private http: HttpClient) {

  }

  getDevices(): Promise<DeviceListResponse> {
    return this.http.get<DeviceListResponse>('http://remote.hungtcs.top/list').toPromise<DeviceListResponse>();
  }

  changeDeviceStatus(device: Device, status: string) {
    return this.http.get<DeviceStatusResponse>(`http://remote.hungtcs.top/turn/${ status }/${ device.macAddress }`).toPromise<DeviceStatusResponse>();
  }

  getDeviceStatus(device: Device) {
    return this.http.get<DeviceStatusResponse>(`http://remote.hungtcs.top/status/${ device.macAddress }`).toPromise<DeviceStatusResponse>();
  }

}
