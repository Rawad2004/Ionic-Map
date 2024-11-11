import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private firestore: AngularFirestore) {}

  addLocation(location: any) {
    return this.firestore.collection('locations').add(location);
  }

  getLocations(): Observable<any[]> {
    return this.firestore.collection('locations').snapshotChanges();
  }

  deleteLocation(id: string) {
    return this.firestore.collection('locations').doc(id).delete();
  }

  async deleteAllLocations() {
    const snapshot = await this.firestore.collection('locations').get().toPromise();
    if (snapshot) {
      const batch = this.firestore.firestore.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      return batch.commit();
    } else {
      console.error('No se pudo obtener el snapshot de la colección.');
    }
  }
}