import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
  map!: google.maps.Map;
  locations: any[] = [];
  markers: google.maps.Marker[] = [];

  constructor(
    private geolocation: Geolocation,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  ngAfterViewInit(): void {
    this.loadGoogleMaps();
  }

  loadGoogleMaps() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCgdCkA-BQX8pAMjAB0i7ILl7aaXKYBVfw&callback=initMap&libraries=places&map_ids=7b980009a8cb280e`;
    script.async = true;
    script.defer = true;
    (window as any).initMap = () => {
      this.initMap();
    };
    document.head.appendChild(script);
  }

  initMap() {
    const mapEle: HTMLElement = document.getElementById('map')!;
    this.map = new google.maps.Map(mapEle, {
      center: { lat: 10.3932, lng: -75.4832 }, // Coordenadas iniciales
      zoom: 12,
      mapId: '7b980009a8cb280e' // Usar el Map ID válido aquí
    });
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map');
    });
  }

  loadLocations() {
    this.locationService.getLocations().subscribe((data) => {
      this.locations = data.map((e) => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        };
      });
      this.locations.forEach((location, index) => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: this.map,
        });
        this.markers.push(marker);
      });
    });
  }

  addCurrentLocation() {
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        const location = {
          lat: resp.coords.latitude,
          lng: resp.coords.longitude,
          name: 'Ubicación Actual'
        };
        this.locationService.addLocation(location).then((docRef) => {
          const marker = new google.maps.Marker({
            position: location,
            map: this.map,
          });
          this.markers.push(marker);
          this.map.setCenter(location);
          this.findNearbyPlaces(location);
        });
      })
      .catch((error) => {
        console.log('Error getting location', error);
      });
  }

  findNearbyPlaces(location: { lat: number; lng: number }) {
    const service = new google.maps.places.PlacesService(this.map);
    const types = ['restaurant', 'cafe', 'bar']; // Tipos de POIs a buscar

    types.forEach((type) => {
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 500, // Radio en metros para buscar POIs
        type: type
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          results.forEach((place) => {
            if (place.geometry && place.geometry.location) {
              const placeLocation = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
                name: place.name
              };
              this.locationService.addLocation(placeLocation).then((docRef) => {
                const marker = new google.maps.Marker({
                  position: placeLocation,
                  map: this.map,
                });
                this.markers.push(marker);
              });
            }
          });
        }
      });
    });
  }

  deleteLocation(id: string, index: number) {
    // Eliminar el marcador del mapa y de la lista de marcadores
    this.markers[index].setMap(null);
    this.markers.splice(index, 1);

    // Eliminar la ubicación de la lista de ubicaciones
    this.locations = this.locations.filter(location => location.id !== id);

    // Eliminar la ubicación de Firebase Firestore
    this.locationService.deleteLocation(id).catch((error) => {
      console.error('Error eliminando la ubicación de Firestore:', error);
    });
  }

  deleteAllLocations() {
    this.locationService.deleteAllLocations().then(() => {
      this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];
      this.loadLocations();
    });
  }
}