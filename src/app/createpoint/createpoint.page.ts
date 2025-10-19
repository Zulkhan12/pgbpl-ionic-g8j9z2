import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit {
  map!: L.Map;

  name = '';
  coordinates = '';

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  constructor() {}

  ngOnInit() {
    setTimeout(() => {
      this.map = L.map('mapcreate').setView([-7.7956, 110.3695], 13);

      // OpenStreetMap
      const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });

      // Esri World Imagery
      const esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'ESRI',
        }
      );

      osm.addTo(this.map);

      // Layer control
      const baseMaps = {
        OpenStreetMap: osm,
        'Esri World Imagery': esri,
      };

      L.control.layers(baseMaps).addTo(this.map);

      const tooltip =
        'Drag the marker or move the map<br>to change the coordinates<br>of the location';

      const marker = L.marker([-7.7956, 110.3695], { draggable: true });
      marker.addTo(this.map);
      marker.bindPopup(tooltip);
      marker.openPopup();

      // Update coordinates when marker is moved
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        this.coordinates = `${position.lat}, ${position.lng}`;
      });

      // Update coordinates when map is clicked
      this.map.on('click', (e: any) => {
        marker.setLatLng(e.latlng);
        this.coordinates = `${e.latlng.lat}, ${e.latlng.lng}`;
      });
    }, 500);
  }

  async save() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.savePoint({
          name: this.name,
          coordinates: this.coordinates,
        });

        // Back to route maps
        this.navCtrl.navigateBack('/main/maps');
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
}
