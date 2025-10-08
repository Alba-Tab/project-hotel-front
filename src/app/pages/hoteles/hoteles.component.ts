import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MaterialModule } from 'src/app/material.module';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';



// table 1
export interface productsData {
  id: number;
  // imagePath: string;
  uname: string;
  address: string;
  phone: string;
}

const PRODUCT_DATA: productsData[] = [
  {
    id: 1,
    // imagePath: 'assets/images/products/product-1.png',
    uname: 'hotel blabla',
    address: "calle viva",
    phone: '12345',
  },


];

@Component({
  selector: 'app-hoteles',
  imports: [
    MatTableModule,
    CommonModule,
    MatCardModule,
    MaterialModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './hoteles.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelesComponent {
  // table 1
  displayedColumns1: string[] = ['assigned', 'name', 'priority', 'budget'];
  dataSource1 = PRODUCT_DATA;
}
