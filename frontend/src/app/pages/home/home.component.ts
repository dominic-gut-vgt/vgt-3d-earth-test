import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import * as THREE from 'three';
import { EarthComponent } from './earth/earth.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,EarthComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.less'
})
export class HomeComponent {

}
