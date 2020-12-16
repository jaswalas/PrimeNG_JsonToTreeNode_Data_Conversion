import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { TreeDragDropComponent } from './tree-drag-drop/tree-drag-drop.component';
import {FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {RouterModule} from '@angular/router';

import { AppComponent }   from './app.component';
import {TreeModule} from 'primeng/tree';
import {ToastModule} from 'primeng/toast';
import {ButtonModule} from 'primeng/button';
import {DialogModule} from 'primeng/dialog';
import {ContextMenuModule} from 'primeng/contextmenu';
import { NodeService } from './node.service';
import { OverlayPanelModule } from 'primeng/overlaypanel';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TreeModule,
    ToastModule,
    ButtonModule,
    DialogModule,
    ContextMenuModule,
    HttpClientModule,
    FormsModule,
    OverlayPanelModule,
    RouterModule.forRoot([
      {path:'',component: AppComponent}

		])
  ],
  declarations: [ AppComponent,TreeDragDropComponent ],
  bootstrap:    [ AppComponent ],
  providers: [NodeService]
})

export class AppModule { }

