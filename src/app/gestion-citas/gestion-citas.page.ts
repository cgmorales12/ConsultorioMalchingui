import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonicModule, NavController, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
    selector: 'app-gestion-citas',
    templateUrl: './gestion-citas.page.html',
    styleUrls: ['./gestion-citas.page.scss'],
    standalone: true,
    imports: [IonicModule, CommonModule, FormsModule]
})
export class GestionCitasPage implements OnInit {

    gestionMode: string = '';
    title: string = 'Gestión de Citas';

    citas: any[] = [];
    pacientesPendientes: any[] = []; // Stores unique patients with pending appointments
    pacienteSeleccionado: any = null; // Stores selected patient ID or cedula
    isLoading: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private navCtrl: NavController,
        private authService: AuthService,
        private alertController: AlertController,
        private toastController: ToastController,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.gestionMode = params['gestion'] || '';
            this.setPageTitle();
            this.loadCitas();
        });
    }

    loadCitas() {
        this.isLoading = true;
        this.pacienteSeleccionado = null; // Reset selection on reload
        this.pacienteSeleccionado = null; // Reset selection on reload

        // 🚨 CORRECCIÓN: Usar datos de sesión real
        const session = this.authService.getSession();
        const id = session.id_medico || session.id_usuario;

        if (!id) {
            this.presentToast('Error de sesión', 'danger');
            this.isLoading = false;
            return;
        }

        this.authService.getCitasPendientes(id).subscribe({
            next: (res: any) => {
                this.isLoading = false;
                if (res.status === 'success') {
                    let todas = res.data || res.citas || [];
                    if (this.gestionMode === 'aprobacion') {
                        // Filter by status name since id_estado is missing in some responses
                        this.citas = todas.filter((c: any) =>
                        (c.id_estado == 1 ||
                            c.estado == 1 ||
                            c.nombre_estado === 'Pendiente de aprobación' ||
                            c.nombre_estado === 'Pendiente')
                        );
                        this.extractPacientesPendientes();

                        // Debugging logs
                        console.log('Citas filtradas:', this.citas);

                        if (this.citas.length === 0 && todas.length > 0) {
                            //
                        }
                    } else {
                        this.citas = todas;
                    }
                } else {
                    this.citas = [];
                    this.pacientesPendientes = [];
                }
            },
            error: (err) => {
                this.isLoading = false;
                console.error(err);
                this.presentToast('Error al cargar citas', 'danger');
            }
        });
    }

    extractPacientesPendientes() {
        const map = new Map();
        this.citas.forEach(c => {
            // Use cedula as fallback ID since id_paciente might be missing
            const idPac = c.id_paciente || c.paciente_cedula;
            // Ensure we have a valid identifier
            if (!idPac) return;

            const nombre = c.paciente_nombres || c.nombres || 'Paciente';
            const apellido = c.paciente_apellidos || c.apellidos || '';

            if (!map.has(idPac)) {
                map.set(idPac, {
                    id: idPac,
                    nombre: `${nombre} ${apellido}`.trim()
                });
            }
        });
        this.pacientesPendientes = Array.from(map.values());
    }

    // Edit Modal Properties
    isModalOpen: boolean = false;
    editCita: any = {};
    fechasDisponibles: any[] = [];
    horasDisponibles: any[] = [];
    motivoCambio: string = '';

    async confirmarAccion(cita: any) {
        if (this.gestionMode === 'aprobacion') {
            this.updateEstado(cita.id_cita, 2, 'Cita Aprobada');
        } else if (this.gestionMode === 'eliminacion') {
            const alert = await this.alertController.create({
                header: 'Confirmar Rechazo',
                message: '¿Por qué se rechaza esta cita?',
                inputs: [
                    {
                        name: 'motivo',
                        type: 'textarea',
                        placeholder: 'Motivo de rechazo (opcional)'
                    }
                ],
                buttons: [
                    { text: 'Cancelar', role: 'cancel' },
                    {
                        text: 'Rechazar',
                        handler: (data) => {
                            this.deleteCita(cita.id_cita, data.motivo);
                        }
                    }
                ]
            });
            await alert.present();
        } else if (this.gestionMode === 'modificacion') {
            this.openEditModal(cita);
        }
    }

    // --- MODIFY MODAL LOGIC ---

    openEditModal(cita: any) {
        this.editCita = { ...cita }; // Copy data
        // Ensure format consistency if needed. 
        // We need id_medico to fetch availability. 
        // Assuming current user is the medico as per logic.
        // Assuming current user is the medico as per logic.
        const session = this.authService.getSession();
        const idMedico = session.id_medico || session.id_usuario;

        if (idMedico) {
            this.editCita.id_medico = idMedico;
            this.loadFechasDisponibles();
            // Pre-load hours for the current date of the appointment
            this.checkAvailability();
        }
        this.isModalOpen = true;
    }

    closeEditModal() {
        this.isModalOpen = false;
        this.editCita = {};
        this.motivoCambio = '';
        this.fechasDisponibles = [];
        this.horasDisponibles = [];
    }

    loadFechasDisponibles() {
        if (!this.editCita.id_medico) return;
        this.authService.getDisponibilidadByMedico(this.editCita.id_medico).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    const days = res.data.map((d: any) => d.fecha_dia);
                    this.fechasDisponibles = [...new Set(days)].sort();
                }
            },
            error: (err) => console.error(err)
        });
    }

    onFechaChange() {
        this.editCita.hora_cita = ''; // Reset time when date changes
        this.checkAvailability();
    }

    checkAvailability() {
        if (!this.editCita.fecha_cita || !this.editCita.id_medico) return;
        this.authService.getDisponibilidad(this.editCita.fecha_cita, this.editCita.id_medico).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.horasDisponibles = res.data;
                } else {
                    // If keeping the same time is allowed even if supposedly 'taken' (by self), 
                    // handling that logic handles complexity. For now, strict check.
                    // But if editing, my own slot might show as taken? 
                    // Ideally backend filters self out. Assuming it returns valid free slots + self?
                    // Usually availability endpoints return FREE slots. 
                    // If I edit, I might need to see my CURRENT slot too.
                    // Simple fix: Add current slot to list if not present, OR just trust user changes.

                    // Adding current time if not in list (visual fix)
                    if (!this.horasDisponibles.includes(this.editCita.hora_cita) && this.editCita.hora_cita) {
                        // Only if date hasn't changed? No, if date changed, slot must be free.
                        // If date is same, my slot is "taken" by me.
                        // Let's just show what server returns for now.
                    }
                    if (res.data.length === 0) {
                        this.presentToast('No hay nuevos horarios disponibles para esta fecha.', 'warning');
                    }
                }
            },
            error: (err) => console.error(err)
        });
    }

    saveModification() {
        if (!this.editCita.fecha_cita || !this.editCita.hora_cita) {
            this.presentToast('Complete fecha y hora', 'warning');
            return;
        }

        if (!this.motivoCambio) {
            this.presentToast('Indique el motivo del cambio', 'warning');
            return;
        }

        // Prepare data for update with history
        const updateData = {
            id_cita: this.editCita.id_cita,
            id_medico: this.editCita.id_medico,
            id_estado: this.editCita.id_estado ?? this.editCita.estado, // Fallback if id_estado is missing
            fecha_cita: this.editCita.fecha_cita,
            hora_cita: this.editCita.hora_cita,
            descripcion_cita: this.editCita.motivo, // Update DB description if changed
            motivo_cambio: this.motivoCambio // Reason for history
        };

        // Debug log to check what is being sent
        console.log('Sending Update Data:', updateData);

        if (!updateData.id_estado) {
            this.presentToast('Error: Estado de la cita no identificado', 'warning');
            return;
        }

        this.authService.updateCitaMedico(updateData).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.presentToast('Cita modificada e historial registrado', 'success');
                    this.closeEditModal();
                    this.loadCitas(); // Refresh list
                } else {
                    this.presentToast(res.message || 'Error al modificar', 'danger');
                }
            },
            error: (err: any) => {
                console.error(err);
                this.presentToast('Error de conexión', 'danger');
            }
        });
    }

    updateEstado(idCita: number, nuevoEstado: number, mensaje: string) {
        this.authService.updateCitaEstado({ id_cita: idCita, id_estado: nuevoEstado }).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.presentToast(mensaje, 'success');
                    this.loadCitas();
                } else {
                    this.presentToast('Error al actualizar', 'danger');
                }
            },
            error: (err: any) => {
                this.presentToast('Error de conexión', 'danger');
            }
        });
    }

    deleteCita(idCita: number, motivo?: string) {
        const session = this.authService.getSession();
        const idMedico = session.id_medico || session.id_usuario;

        if (!idMedico) {
            this.presentToast('Error de sesión', 'danger');
            return;
        }

        const updateData = {
            id_cita: idCita,
            id_medico: idMedico,
            id_estado: 3, // CANCELADA
            motivo_cambio: motivo || 'Cancelada por el médico'
        };

        this.authService.updateCitaMedico(updateData).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.presentToast('Cita cancelada correctamente', 'success');
                    this.loadCitas();
                } else {
                    this.presentToast(res.message || 'Error al cancelar', 'danger');
                }
            },
            error: (err: any) => {
                this.presentToast('Error de conexión', 'danger');
            }
        });
    }

    setPageTitle() {
        switch (this.gestionMode) {
            case 'aprobacion':
                this.title = 'Confirmar Citas';
                break;
            case 'modificacion':
                this.title = 'Modificar Citas';
                break;
            case 'eliminacion':
                this.title = 'Rechazar Citas';
                break;
            default:
                this.title = 'Gestión de Citas';
        }
    }

    async presentToast(message: string, color: string) {
        const toast = await this.toastController.create({
            message,
            duration: 2000,
            color
        });
        toast.present();
    }

    goBack() {
        this.navCtrl.back();
    }

}
