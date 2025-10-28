import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hotel } from '../interfaces/hotel.interface';

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private url = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getHoteles(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.url}/hoteles`);
  }

  //por id
  getHotel(id: number): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.url}/hoteles/${id}`);
  }

  createHotel(hotel: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(`${this.url}/hoteles/`, hotel);
  }

  updateHotel(id: number, hotel: Partial<Hotel>): Observable<Hotel> {
    return this.http.put<Hotel>(`${this.url}/hoteles/${id}/`, hotel);
  }

  deleteHotel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/hoteles/${id}/`);
  }
}
