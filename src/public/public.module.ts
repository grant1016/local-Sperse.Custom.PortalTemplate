import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { PublicRoutingModule } from './public-routing.module';


@NgModule({
  declarations: [
      HomeComponent
  ],
  imports: [
      CommonModule,
      PublicRoutingModule
  ]
})
export class PublicModule { }
