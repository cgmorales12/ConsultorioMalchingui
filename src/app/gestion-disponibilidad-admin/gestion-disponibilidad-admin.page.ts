import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { format } from 'date-fns';

@Component({
    selector: 'app-gestion-disponibilidad-admin',
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule],
    templateUrl: './gestion-disponibilidad-admin.page.html',
    styleUrls: ['./gestion-disponibilidad-admin.page.scss'],
})
export class GestionDisponibilidadAdminPage implements OnInit {

    accion: string = ''; // 'crear', 'modificar', 'eliminar'
    pageTitle: string = 'Gestión de Disponibilidad';

    // Datos
    listaMedicos: any[] = [];
    listaDisponibilidad: any[] = [];

    // Modelo Crear
    nuevaDisponibilidad: any = {
        id_medico: null,
        fecha_dia: '',
        hora_inicio: '',
        hora_fin: ''
    };

    // Modelo Editar
    dispEnEdicion: any = null;

    isLoading: boolean = false;
    isSaving: boolean = false;
    message: string | null = null;
    error: boolean = false;

    minDate: string = format(new Date(), 'yyyy-MM-dd');

    constructor(
        private authService: AuthService,
        private toastController: ToastController,
        private alertController: AlertController,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.accion = this.route.snapshot.paramMap.get('accion') || 'crear';
        this.setPageTitle();
        this.loadMedicos();

        if (this.accion === 'modificar' || this.accion === 'eliminar') {
            this.loadAllDisponibilidad();
        }
    }

    setPageTitle() {
        switch (this.accion) {
            case 'crear': this.pageTitle = 'Registrar Disponibilidad'; break;
            case 'modificar': this.pageTitle = 'Modificar Horarios'; break;
            case 'eliminar': this.pageTitle = 'Eliminar Horarios'; break;
            default: this.pageTitle = 'Gestión de Disponibilidad';
        }
    }

    loadMedicos() {
        this.authService.getMedicos().subscribe((res: any) => {
            if (res.status === 'success') {
                this.listaMedicos = res.data || [];
            }
        });
    }

    loadAllDisponibilidad() {
        this.isLoading = true;
        this.message = 'Cargando horarios...';

        this.authService.getAllDisponibilidad().subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.status === 'success') {
                    this.listaDisponibilidad = res.data || [];
                    this.message = this.listaDisponibilidad.length > 0 ? null : 'No hay horarios registrados.';
                } else {
                    this.message = res.message;
                    this.error = true;
                }
            },
            error: (err: any) => {
                this.isLoading = false;
                this.message = 'Error de conexión.';
                this.error = true;
            }
        });
    }

    // --- CREAR ---
    onCreate() {
        this.isSaving = true;
        this.message = 'Guardando...';

        this.authService.createDisponibilidad(this.nuevaDisponibilidad).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                if (res.status === 'success') {
                    this.presentToast('Horario creado exitosamente.', 'success');
                    this.nuevaDisponibilidad = { id_medico: null, fecha_dia: '', hora_inicio: '', hora_fin: '' };
                    this.router.navigate(['/sistema']);
                } else {
                    this.presentToast(res.message, 'danger');
                }
            },
            error: (err: any) => {
                this.isSaving = false;
                this.presentToast('Error al crear horario.', 'danger');
            }
        });
    }

    // --- EDITAR ---
    onEdit(disp: any) {
        this.dispEnEdicion = { ...disp }; // Copia simple
        // Asegurar formato fecha si viene completo
        if (this.dispEnEdicion.fecha_dia) {
            this.dispEnEdicion.fecha_dia = format(new Date(this.dispEnEdicion.fecha_dia), 'yyyy-MM-dd');
        }
    }

    onUpdate() {
        this.isSaving = true;
        this.authService.updateDisponibilidad(this.dispEnEdicion).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                if (res.status === 'success') {
                    this.presentToast('Horario actualizado.', 'success');
                    this.dispEnEdicion = null;
                    this.loadAllDisponibilidad();
                } else {
                    this.presentToast(res.message, 'danger');
                }
            },
            error: (err: any) => {
                this.isSaving = false;
                this.presentToast('Error al actualizar.', 'danger');
            }
        });
    }

    // --- ELIMINAR ---
    async onDelete(disp: any) {
        const alert = await this.alertController.create({
            header: 'Confirmar Eliminación',
            message: `¿Eliminar horario del Dr. ${disp.medico_nombres} ${disp.medico_apellidos} (${disp.fecha_dia} ${disp.hora_inicio})?`,
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    cssClass: 'danger',
                    handler: () => this.deleteDisponibilidad(disp.id_disponibilidad)
                }
            ]
        });
        await alert.present();
    }

    deleteDisponibilidad(id: number) {
        this.isSaving = true; // Mostrar spinner global o local
        this.authService.deleteDisponibilidad(id).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                if (res.status === 'success') {
                    this.presentToast('Horario eliminado.', 'success');
                    this.loadAllDisponibilidad();
                } else {
                    this.presentToast(res.message, 'danger');
                }
            },
            error: (err: any) => {
                this.isSaving = false;
                this.presentToast('Error al eliminar.', 'danger');
            }
        });
    }

    async presentToast(msg: string, color: string = 'primary') {
        const toast = await this.toastController.create({
            message: msg,
            duration: 3000,
            color: color,
            position: 'top'
        });
        toast.present();
    }

}
