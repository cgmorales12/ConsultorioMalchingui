/**
 * Sistema Page (Dashboard Administrativo)
 * 
 * Descripción: Panel de control principal para el Administrador.
 * Muestra estadísticas generales y accesos a gestión de médicos, citas, usuarios y reportes del bot.
 * 
 * Uso: Administradores del sistema.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-sistema',
  templateUrl: './sistema.page.html',
  styleUrls: ['./sistema.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
  ]
})
export class SistemaPage implements OnInit {

  isLoading: boolean = false;
  stats = {
    total_medicos: 0,
    total_citas: 0,
    medicos_disponibles_hoy: 0
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.loadSystemStats();
  }

  ionViewWillEnter() {
    // Si no hay sesión válida en memoria, fuera.
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // --- Consulta de Estadísticas (Semana 7: Web Service/Consulta) ---

  loadSystemStats() {
    this.isLoading = true;

    this.authService.getSystemStats().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success' && res.data) {
          this.stats = res.data;
        } else {
          this.presentToast('Error al cargar estadísticas.', 'warning');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error de conexión con el WS de stats:', err);
        this.presentToast('Error de conexión con el servidor.', 'danger');
      }
    });
  }

  // --- Funciones de Navegación Administrativa (Routers, Semana 6) ---

  // Navegación con parámetro 'accion' para sub-páginas de gestión

  goToGestionMedicos(accion: string) {
    this.router.navigate(['/gestion-medicos', { accion: accion }]);
  }

  goToGestionCitas(accion: string) {
    this.router.navigate(['/gestion-citas-admin', { accion: accion }]);
  }

  goToGestionDisponibilidad(accion: string) {
    this.router.navigate(['/gestion-disponibilidad-admin', { accion: accion }]);
  }

  goToGestionLogin(accion: string) {
    // Gestión de usuarios de sistema y médicos (login)
    this.router.navigate(['/gestion-login-usuarios', { accion: accion }]);
  }

  goToReportesBot() {
    this.router.navigate(['/reportes-bot']);
  }

  // --- Logout ---
  async logout() {
    this.authService.logoutSession();
    this.router.navigate(['/home'], { replaceUrl: true });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    toast.present();
    toast.present();
  }

  // --- Ranking de Médicos ---
  ranking: any[] = [];
  mostrarRanking: boolean = false;

  cargarRanking() {
    this.isLoading = true;
    this.authService.getRankingMedicos().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status === 'success') {
          this.ranking = res.data;
          this.mostrarRanking = true;
        } else {
          this.presentToast('No se pudo cargar el ranking', 'warning');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.presentToast('Error de servidor', 'danger');
      }
    });
  }

  cerrarRanking() {
    this.mostrarRanking = false;
  }
}
