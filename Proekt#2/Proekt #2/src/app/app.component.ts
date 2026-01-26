import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
      <button mat-icon-button (click)="drawer.toggle()" class="menu-button">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="app-title">SpendSmart</span>
    </mat-toolbar>

    <mat-drawer-container class="app-container" autosize>
      <mat-drawer #drawer mode="side" opened class="app-sidenav">
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link" (click)="drawer.mode === 'over' && drawer.close()">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/expenses" routerLinkActive="active-link" (click)="drawer.mode === 'over' && drawer.close()">
            <mat-icon matListItemIcon>receipt_long</mat-icon>
            <span matListItemTitle>Expenses</span>
          </a>
          <a mat-list-item routerLink="/settings" routerLinkActive="active-link" (click)="drawer.mode === 'over' && drawer.close()">
            <mat-icon matListItemIcon>settings</mat-icon>
            <span matListItemTitle>Settings</span>
          </a>
        </mat-nav-list>
      </mat-drawer>

      <mat-drawer-content class="app-content">
        <router-outlet />
      </mat-drawer-content>
    </mat-drawer-container>
  `,
  styles: [`
    .app-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
    }

    .app-title {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .menu-button {
      margin-right: 16px;
    }

    .app-container {
      margin-top: 64px;
      height: calc(100vh - 64px);
    }

    .app-sidenav {
      width: 250px;
      padding-top: 16px;
    }

    .app-content {
      padding: 24px;
      overflow-x: hidden;
    }

    .active-link {
      background-color: rgba(0, 0, 0, 0.04);
    }

    @media (max-width: 768px) {
      .app-sidenav {
        width: 200px;
      }
      
      .app-content {
        padding: 16px;
      }
    }
  `]
})
export class AppComponent {}
