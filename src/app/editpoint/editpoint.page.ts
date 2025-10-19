import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController, IonicModule } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-editpoint',
  templateUrl: './editpoint.page.html',
  styleUrls: ['./editpoint.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class EditpointPage implements OnInit {
  map!: L.Map;
  marker!: L.Marker;

  pointId = '';
  name = '';
  coordinates = '';

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);

  constructor() {}

  ngOnInit() {
    this.pointId = this.route.snapshot.paramMap.get('id')!;
    if (this.pointId) {
      this.loadPointData();
    }
  }

  async loadPointData() {
    const pointSnapshot = await this.dataService.getPoint(this.pointId);
    const point = pointSnapshot.val();
    if (point) {
      this.name = point.name;
      this.coordinates = point.coordinates;
      this.initializeMap();
    }
  }

  initializeMap() {
    const coords = this.coordinates.split(',').map(c => parseFloat(c));
    const latLng = L.latLng(coords[0], coords[1]);

    setTimeout(() => {
      this.map = L.map('mapedit').setView(latLng, 13);

      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
      osm.addTo(this.map);

      this.marker = L.marker(latLng, { draggable: true }).addTo(this.map);

      this.marker.on('dragend', () => {
        const position = this.marker.getLatLng();
        this.coordinates = `${position.lat}, ${position.lng}`;
      });

      this.map.on('click', (e: any) => {
        this.marker.setLatLng(e.latlng);
        this.coordinates = `${e.latlng.lat}, ${e.latlng.lng}`;
      });
    }, 500);
  }

  async update() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.updatePoint(this.pointId, {
          name: this.name,
          coordinates: this.coordinates,
        });
        this.navCtrl.navigateBack('/main/maps');
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Update Failed',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
}