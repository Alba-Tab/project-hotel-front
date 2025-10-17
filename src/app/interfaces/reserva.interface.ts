export interface CheckInOut {
  id?: number;
  reserva: number;
  fecha_checkin: string;
  hora_checkin: string;
  fecha_checkout?: string | null;
  hora_checkout?: string | null;
  observaciones?: string;
}

export interface Reserva {
  id: number;
  fecha_reserva: string;
  fecha_entrada: string;
  fecha_salida: string;
  nombre_huesped: string;
  nro_habitacion: string;
  nombre_hotel: string;
  total: number;
  estado: string;
  checkinout?: CheckInOut;
}
