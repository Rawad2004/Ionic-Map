import { Component, OnInit } from '@angular/core';

declare var google: any;

interface Marker {
  position: {
    lat: number;
    lng: number;
  };  
  title: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  constructor() {}
  map = null;
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer();

  origin = { lat: 0, lng: 0 };
  destination = { lat: 10.370852835417077, lng: -74.47804527428855 };

  ngOnInit(): void {
    this.loadMap();
    this.setCurrentLocationAsOrigin();
  }

  loadMap() {
    // create a new map by passing HTMLElement
    const mapEle: HTMLElement = document.getElementById('map')!;
    const indicatorsEle: HTMLElement = document.getElementById('indicators')!;
    // create map
    this.map = new google.maps.Map(mapEle, {
      center: this.origin,
      zoom: 12,
    });

    this.directionsDisplay.setMap(this.map);
    this.directionsDisplay.setPanel(indicatorsEle);

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      mapEle.classList.add('show-map');
      this.calculateRoute();
    });
  }

  private setCurrentLocationAsOrigin() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.calculateRoute(); // Llama a calculateRoute después de obtener la ubicación
        },
        (error) => {
          console.error('Error obteniendo la ubicación', error);
        }
      );
    } else {
      console.error('Geolocalización no es soportada por este navegador.');
    }
  }

  private calculateRoute() {
    this.directionsService.route(
      {
        origin: this.origin,
        destination: this.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response: any, status: string) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsDisplay.setDirections(response);

          // Obtener la distancia del primer tramo (leg) de la ruta
          const route = response.routes[0];
          const leg = route.legs[0];
          const distance = leg.distance.text;

          console.log(
            `La distancia desde el punto de origen hasta el punto final es: ${distance}`
          );
          // Puedes mostrar la distancia en el DOM si lo prefieres
          const distanceElement = document.getElementById('distance');
          if (distanceElement) {
            distanceElement.innerText = `Distancia: ${distance}`;
          }
        } else {
          console.error('Error al calcular la ruta:', status);
        }
      }
    );
  }
}
