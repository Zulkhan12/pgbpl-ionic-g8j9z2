import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';
import { AlertController, NavController } from '@ionic/angular';

const iconRetinaUrl = 'assets/icon/marker-icon-2x.png';
const iconUrl = 'assets/icon/marker-icon.png';
const shadowUrl = 'assets/icon/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false
})
export class MapsPage implements OnInit {
  private dataService = inject(DataService);
  map!: L.Map;

  constructor(private alertCtrl: AlertController, private navCtrl: NavController) { }

  ionViewDidEnter() {
    if (!this.map) {
      this.map = L.map('map').setView([-7.7956, 110.3695], 13);

      var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      });
      osm.addTo(this.map);

      this.map.on('popupopen', (e) => {
        const popup = e.popup;
        const deleteBtn = popup.getElement()?.querySelector('.delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (event: any) => {
            const pointId = event.currentTarget.dataset.pointId;
            this.confirmDelete(pointId, popup.getLatLng());
          });
        }
        const editBtn = popup.getElement()?.querySelector('.edit-btn');
        if (editBtn) {
          editBtn.addEventListener('click', (event: any) => {
            const pointId = event.currentTarget.dataset.pointId;
            this.editPoint(pointId);
          });
        }
      });
    }

    setTimeout(() => this.map.invalidateSize(), 500);
    this.loadPoints();
  }

  async loadPoints() {
    // Clear existing markers
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    const points: any = await this.dataService.getPoints();
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];
        const coordinates = point.coordinates.split(',').map((c: string) => parseFloat(c));
        const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.map);
        const popupContent = `
          <div class="custom-popup">
            <h5>${point.name}</h5>
            <div class="popup-buttons">
              <ion-button color="warning" class="edit-btn" data-point-id="${key}">
                <ion-icon name="create-outline"></ion-icon>
              </ion-button>
              <ion-button color="danger" class="delete-btn" data-point-id="${key}">
                <ion-icon name="trash-outline"></ion-icon>
              </ion-button>
            </div>
          </div>
        `;
        marker.bindPopup(popupContent);
      }
    }
  }

  async confirmDelete(pointId: string, latLng: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this point?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.deletePoint(pointId, latLng);
          }
        }
      ]
    });
    await alert.present();
  }

  deletePoint(pointId: string, latLng: any) {
    this.dataService.deletePoint(pointId).then(() => {
      this.map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          const marker = layer as L.Marker;
          if (marker.getLatLng().equals(latLng)) {
            marker.remove();
          }
        }
      });
    });
  }

  editPoint(pointId: string) {
    this.navCtrl.navigateForward(`/editpoint/${pointId}`);
  }

  ngOnInit() {
  }
}