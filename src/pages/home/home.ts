import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { DeviceService } from '../../services/device.service';
import { Device } from '../../entities/device';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  devices: Array<Device> = new Array();

  constructor(
    private storage: Storage,
    private deviceService: DeviceService,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController) {

  }

  doRefresh(refresher) {
    this.getDeviceList().then(devices => {
      this.devices = devices || [];
      refresher.complete();
      this.toastController.create({
        message: '刷新成功',
        duration: 1000,
      }).present();
    }).catch(err => {
      console.error(err);
      refresher.complete();
      this.toastController.create({
        message: `获取设备列表失败`,
        duration: 5000,
      }).present();
    });
  }

  ngOnInit() {
    let loading = this.loadingController.create({
      content: '正在获取设备列表',
    });
    loading.present();
    this.getDeviceList().then(devices => {
      loading.dismiss();
      this.devices = devices || [];
    }).catch(err => {
      console.error(err);
      loading.dismiss();
      this.toastController.create({
        message: '获取设备列表失败',
        duration: 5000,
      }).present();
    });
  }

  changeDeviceStatus(device: any) {
    let loading = this.loadingController.create({
      content: '正在执行',
    });
    loading.present();
    this.deviceService.changeDeviceStatus(device, device.status ? 'on' : 'off').then(({ status }) => {
      if(status === 0) {
        loading.dismiss();
      } else {
        throw new Error(`bad status code ${ status }`);
      }
    }).catch(err => {
      loading.dismiss();
      this.toastController.create({
        message: '控制设备失败',
        duration: 3000,
      }).present();
    });
  }

  showRenameDialog(device: Device) {
    let dialog = this.alertController.create({
      title: '备注名称',
      message: `为${ device.ipAddress }设置备注名称`,
      inputs: [
        {
          name: 'name',
          value: device.name || '',
          placeholder: '备注名称'
        },
      ],
      buttons: [
        {
          text: '取消'
        },
        {
          text: '确认',
          handler: ({ name }) => {
            let loading = this.loadingController.create({
              content: '正在保存',
            });
            loading.present();
            this.storage.get(device.macAddress).then(data => {
              data || (data = {});
              data.name = name;
              return data;
            }).then(data => {
              return this.storage.set(device.macAddress, data);
            }).then(() => {
              device.name = name;
              loading.dismiss();
              this.toastController.create({
                message: '保存成功'
              }).present();
            }).catch(err => {
              console.error(err);
              loading.dismiss();
              this.toastController.create({
                message: '保存失败'
              }).present();
            });
          }
        },
      ]
    });
    dialog.present();
  }

  private getDeviceList(): Promise<Array<Device>> {
    return this.deviceService.getDevices().then(({ status, data }) => {
      if(status === 0) {
        return data;
      } else {
        throw new Error(`bad status code ${ status }`);
      }
    }).then(devices => {
      let promises = devices.map<Promise<Device>>(device => {
        return this.deviceService.getDeviceStatus(device).then(({ status, data }) => {
          if(status === 0) {
            device.status = (data.status === 0);
            return device;
          } else {
            throw new Error(`bad status code ${ status }`);
          }
        });
      });
      return Promise.all(promises);
    }).then(devices => {
      return Promise.all(devices.map<Promise<Device>>(device => {
        return this.storage.get(device.macAddress).then(data => {
          if(data) {
            device.name = data.name;
          }
          return device;
        });
      }));
    });
  }
}
