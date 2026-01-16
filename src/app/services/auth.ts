/**
 * Auth Service (Servicio de Autenticación y Datos)
 * 
 * Descripción: Servicio central para la comunicación con el Backend PHP.
 * Maneja Login, Registro, Gestión de Citas, Médicos, Chatbot y Consultas.
 * Contiene todas las URLs de los endpoints y métodos HTTP.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly phpBaseUrl = environment.phpBaseUrl || '/api';

  constructor(private http: HttpClient) { }

  // --- SESIÓN ---
  setSession(id: number, rol: number, user: string, id_medico?: number) {
    const session = { id_usuario: id, id_rol: rol, usuario: user, id_medico: id_medico || null };
    sessionStorage.setItem('auth_session', JSON.stringify(session));
  }

  getSession() {
    const authSession = sessionStorage.getItem('auth_session');
    if (authSession) return JSON.parse(authSession);

    const patientSession = sessionStorage.getItem('patient_session');
    if (patientSession) {
      const p = JSON.parse(patientSession);
      return { id_usuario: p.id_paciente, nombres: p.nombres, ...p };
    }
    return { id_usuario: null, id_rol: null, usuario: null };
  }

  isLoggedIn(): boolean {
    return this.getSession().id_usuario !== null;
  }

  logoutSession() {
    sessionStorage.removeItem('auth_session');
    sessionStorage.removeItem('patient_session');
  }

  private buildUrl(path: string): string {
    return `${this.phpBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  // --- ENDPOINTS ---
  private loginUrl = this.buildUrl('/login.php');
  private loginPacienteUrl = this.buildUrl('/login_paciente.php');
  private registerUrl = this.buildUrl('/registro_paciente.php');
  private getDisponibilidadUrl = this.buildUrl('/obtener_disponibilidad.php');
  private insertCitaUrl = this.buildUrl('/agendar_cita.php');
  private getCitasMedicoUrl = this.buildUrl('/obtener_citas_medico.php');
  private updateCitaUrl = this.buildUrl('/actualizar_estado_cita.php');
  private updateCitaMedicoUrl = this.buildUrl('/actualizar_cita_medico.php');
  private updateCitaAdminUrl = this.buildUrl('/actualizar_cita_admin.php');
  private deleteCitaUrl = this.buildUrl('/eliminar_cita.php');

  // 🚨 PLUS: CHATBOT Y TELEMEDICINA
  private getChatbotRespuestaUrl = this.buildUrl('/obtener_respuesta_chatbot.php');
  private enviarConsultaTelemedicinaUrl = this.buildUrl('/enviar_consulta_telemedicina.php');
  private getConsultasPacienteUrl = this.buildUrl('/obtener_consultas_paciente.php');
  private getConsultasMedicoTelemedicinaUrl = this.buildUrl('/obtener_consultas_telemedicina_medico.php');
  private guardarValoracionBotUrl = this.buildUrl('/guardar_valoracion_bot.php');
  private getReporteChatbotUrl = this.buildUrl('/obtener_reporte_bot.php');

  // 🎓 NUEVO ENDPOINT PARA ENTRENAMIENTO y SISTEMA
  private entrenarBotUrl = this.buildUrl('/entrenar_bot.php');
  private getAllPacientesUrl = this.buildUrl('/obtener_todos_pacientes.php');
  private getAllCitasUrl = this.buildUrl('/obtener_todas_citas.php');
  private getAllDisponibilidadUrl = this.buildUrl('/obtener_toda_disponibilidad.php');
  private createDisponibilidadUrl = this.buildUrl('/crear_disponibilidad.php');
  private updateDisponibilidadUrl = this.buildUrl('/update_disponibilidad.php');
  private deleteDisponibilidadUrl = this.buildUrl('/eliminar_disponibilidad.php');
  private getAllUsuariosUrl = this.buildUrl('/obtener_todos_usuarios.php');
  private createUsuarioUrl = this.buildUrl('/crear_usuario.php');
  private updateUsuarioUrl = this.buildUrl('/actualizar_usuario.php');
  private deleteUsuarioUrl = this.buildUrl('/eliminar_usuario.php');
  private createMedicoUrl = this.buildUrl('/crear_medico.php');
  private updateMedicoUrl = this.buildUrl('/actualizar_medico.php');
  private deleteMedicoUrl = this.buildUrl('/eliminar_medico.php');
  private getHistorialPacienteUrl = this.buildUrl('/obtener_historial_paciente.php');
  private procesarHistorialDisponibilidadUrl = this.buildUrl('/procesar_historial_disponibilidad.php');
  private getMedicosConDisponibilidadFuturaUrl = this.buildUrl('/obtener_medicos_disponibles.php');
  private getCitasDashboardSummaryUrl = this.buildUrl('/obtener_resumen_citas.php');
  private updatePacienteUrl = this.buildUrl('/actualizar_paciente.php');
  private updateCitaPacienteUrl = this.buildUrl('/actualizar_cita_paciente.php');
  private getSystemStatsUrl = this.buildUrl('/obtener_estadisticas_sistema.php');
  private responderConsultaUrl = this.buildUrl('/responder_consulta.php');

  // =================================================================
  // --- MÉTODOS DE ACCIÓN ---
  // =================================================================

  login(credenciales: any): Observable<any> {
    return this.http.post(this.loginUrl, credenciales, this.httpOptions);
  }

  loginPaciente(cedula: string, correo: string): Observable<any> {
    return this.http.post(this.loginPacienteUrl, { cedula, correo }, this.httpOptions);
  }

  registerPatient(data: any): Observable<any> {
    return this.http.post(this.registerUrl, data, this.httpOptions);
  }

  agendarCita(citaData: any): Observable<any> {
    return this.http.post(this.insertCitaUrl, citaData, this.httpOptions);
  }

  getCitasPendientes(id_medico: number): Observable<any> {
    return this.http.post(this.getCitasMedicoUrl, { id_medico }, this.httpOptions);
  }

  updateCitaEstado(data: any): Observable<any> {
    return this.http.post(this.updateCitaUrl, data, this.httpOptions);
  }

  updateCitaMedico(data: any): Observable<any> {
    return this.http.post(this.updateCitaMedicoUrl, data, this.httpOptions);
  }

  updateCitaAdmin(citaData: any): Observable<any> {
    return this.http.post(this.updateCitaAdminUrl, citaData, this.httpOptions);
  }

  updateCitaPaciente(data: any): Observable<any> {
    return this.http.post(this.updateCitaPacienteUrl, data, this.httpOptions);
  }

  deleteCita(id_cita: number, motivo?: string): Observable<any> {
    return this.http.post(this.deleteCitaUrl, { id_cita, motivo }, this.httpOptions);
  }

  getAllPacientes(): Observable<any> {
    return this.http.get(this.getAllPacientesUrl);
  }

  getAllCitas(): Observable<any> {
    return this.http.get(this.getAllCitasUrl);
  }

  getAllDisponibilidad(): Observable<any> {
    return this.http.get(this.getAllDisponibilidadUrl);
  }

  createDisponibilidad(data: any): Observable<any> {
    return this.http.post(this.createDisponibilidadUrl, data, this.httpOptions);
  }

  updateDisponibilidad(data: any): Observable<any> {
    return this.http.post(this.updateDisponibilidadUrl, data, this.httpOptions);
  }

  deleteDisponibilidad(id: number): Observable<any> {
    return this.http.post(this.deleteDisponibilidadUrl, { id_disponibilidad: id }, this.httpOptions);
  }

  getAllUsuarios(): Observable<any> {
    return this.http.get(this.getAllUsuariosUrl);
  }

  createSistemaUser(data: any): Observable<any> {
    return this.http.post(this.createUsuarioUrl, data, this.httpOptions);
  }

  updateUsuario(data: any): Observable<any> {
    return this.http.post(this.updateUsuarioUrl, data, this.httpOptions);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.post(this.deleteUsuarioUrl, { id_usuario: id }, this.httpOptions);
  }

  createMedico(data: any): Observable<any> {
    return this.http.post(this.createMedicoUrl, data, this.httpOptions);
  }

  updateMedico(data: any): Observable<any> {
    return this.http.post(this.updateMedicoUrl, data, this.httpOptions);
  }

  deleteMedico(data: any): Observable<any> {
    return this.http.post(this.deleteMedicoUrl, { id_medico: data.id_medico || data }, this.httpOptions);
  }

  getHistorialPaciente(id_paciente: number): Observable<any> {
    return this.http.post(this.getHistorialPacienteUrl, { id_paciente }, this.httpOptions);
  }

  updatePaciente(data: any): Observable<any> {
    return this.http.post(this.updatePacienteUrl, data, this.httpOptions);
  }

  procesarHistorialDisponibilidad(): Observable<any> {
    return this.http.get(this.procesarHistorialDisponibilidadUrl);
  }

  getMedicosConDisponibilidadFutura(): Observable<any> {
    return this.http.get(this.getMedicosConDisponibilidadFuturaUrl);
  }

  getCitasDashboardSummary(): Observable<any> {
    return this.http.get(this.getCitasDashboardSummaryUrl);
  }

  getSystemStats(): Observable<any> {
    return this.http.get(this.getSystemStatsUrl);
  }

  // =================================================================
  // --- MÓDULO 4: PLUS CORREGIDO (HISTORIALES Y BOT) ---
  // =================================================================

  getChatbotRespuesta(mensaje: string, id_paciente: number): Observable<any> {
    return this.http.post(this.getChatbotRespuestaUrl, { mensaje, id_paciente }, this.httpOptions);
  }

  guardarValoracionBot(id_paciente: number, puntuacion: number): Observable<any> {
    return this.http.post(this.guardarValoracionBotUrl, { id_paciente, puntuacion }, this.httpOptions);
  }

  getReporteChatbot(): Observable<any> {
    return this.http.get(this.getReporteChatbotUrl);
  }

  /**
   * 🎓 NUEVO MÉTODO: Envía la pregunta fallida y la nueva respuesta al servidor
   */
  entrenarBot(pregunta: string, respuesta: string, id_historial?: number): Observable<any> {
    return this.http.post(this.entrenarBotUrl, { pregunta, respuesta, id_historial }, this.httpOptions);
  }

  enviarConsultaTelemedicina(id_paciente: number, id_medico: number, mensaje: string, tipo: string = 'chat'): Observable<any> {
    return this.http.post(this.enviarConsultaTelemedicinaUrl, { id_paciente, id_medico, mensaje, tipo }, this.httpOptions);
  }

  getConsultasPaciente(id_paciente: number): Observable<any> {
    return this.http.post(this.getConsultasPacienteUrl, { id_paciente }, this.httpOptions);
  }

  getConsultasParaMedico(id_medico: number): Observable<any> {
    return this.http.post(this.getConsultasMedicoTelemedicinaUrl, { id_medico }, this.httpOptions);
  }

  responderConsulta(id_mensaje: number, respuesta: string): Observable<any> {
    return this.http.post(this.responderConsultaUrl, { id_mensaje, respuesta }, this.httpOptions);
  }

  getMedicos(): Observable<any> {
    return this.http.get(this.buildUrl('/obtener_medicos.php'));
  }

  getDisponibilidadByMedico(id_medico: number): Observable<any> {
    return this.http.post(this.buildUrl('/obtener_disponibilidad_medico.php'), { id_medico }, this.httpOptions);
  }

  getDisponibilidad(fecha: string, id_medico: number): Observable<any> {
    return this.http.get(`${this.getDisponibilidadUrl}?fecha=${fecha}&id_medico=${id_medico}`);
  }
  // --- VALORACIÓN DE MÉDICOS ---
  private guardarValoracionMedicoUrl = this.buildUrl('/guardar_valoracion_medico.php');
  private getRankingMedicosUrl = this.buildUrl('/obtener_ranking_medicos.php');
  private getEstadisticasMedicoUrl = this.buildUrl('/obtener_estadisticas_medico.php');

  // ... (otros métodos)

  guardarValoracionMedico(data: any): Observable<any> {
    return this.http.post(this.guardarValoracionMedicoUrl, data, this.httpOptions);
  }

  getRankingMedicos(): Observable<any> {
    return this.http.get(this.getRankingMedicosUrl);
  }

  getEstadisticasMedico(id_medico: number): Observable<any> {
    return this.http.get(`${this.getEstadisticasMedicoUrl}?id_medico=${id_medico}`);
  }
}