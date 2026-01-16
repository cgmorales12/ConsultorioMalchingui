-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-01-2026 a las 04:23:50
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `luz_y_vida_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chatbot_preguntas`
--

CREATE TABLE `chatbot_preguntas` (
  `id_pregunta` int(11) NOT NULL,
  `pregunta_clave` varchar(255) NOT NULL,
  `respuesta` text NOT NULL,
  `categoria` varchar(50) DEFAULT 'General'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `chatbot_preguntas`
--

INSERT INTO `chatbot_preguntas` (`id_pregunta`, `pregunta_clave`, `respuesta`, `categoria`) VALUES
(1, 'horarios', 'Atendemos de Lunes a Viernes de 08:00 AM a 17:00 PM. Los sábados de 09:00 AM a 12:00 PM.', 'General'),
(2, 'agendar', 'Para agendar una cita, ve a la sección \"Agendar Cita\", elige tu médico, selecciona la fecha disponible y confirma tus datos.', 'Citas'),
(3, 'requisitos', 'Para tu primera consulta, necesitas traer tu cédula de identidad y llegar 10 minutos antes.', 'Pacientes'),
(4, 'costo', 'El valor de la consulta general es de $30. Especialidades pueden variar.', 'Pagos'),
(5, 'especialidades', 'Contamos con Medicina General, Pediatría, Ginecología y Odontología.', 'General'),
(6, 'ubicación', 'Estamos ubicados en el Centro Médico Luz y Vida, Calle Principal y Av. Central.', 'General');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas`
--

CREATE TABLE `citas` (
  `id_cita` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `id_disponibilidad` int(11) DEFAULT NULL,
  `fecha_cita` date NOT NULL,
  `hora_cita` time NOT NULL,
  `motivo` text DEFAULT NULL,
  `id_estado` int(11) NOT NULL,
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `citas`
--

INSERT INTO `citas` (`id_cita`, `id_paciente`, `id_medico`, `id_disponibilidad`, `fecha_cita`, `hora_cita`, `motivo`, `id_estado`, `fecha_solicitud`) VALUES
(14, 1, 3, NULL, '2026-01-10', '11:00:00', 'dolor', 2, '2026-01-09 13:46:21'),
(19, 1, 3, NULL, '2026-01-10', '07:00:00', 'muela', 1, '2026-01-09 16:22:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `disponibilidad`
--

CREATE TABLE `disponibilidad` (
  `id_disponibilidad` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `fecha_dia` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `confirmada_por_medico` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estados_cita`
--

CREATE TABLE `estados_cita` (
  `id_estado` int(11) NOT NULL,
  `nombre_estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `estados_cita`
--

INSERT INTO `estados_cita` (`id_estado`, `nombre_estado`) VALUES
(2, 'Cita confirmada'),
(4, 'Cita modificada'),
(3, 'Cita rechazada'),
(1, 'Pendiente de aprobación');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_citas`
--

CREATE TABLE `historial_citas` (
  `id_historial` int(11) NOT NULL,
  `id_cita` int(11) NOT NULL,
  `id_usuario_accion` int(11) NOT NULL,
  `tipo_usuario` enum('medico','paciente') NOT NULL,
  `accion` enum('CREADA','MODIFICADA','CANCELADA') NOT NULL,
  `motivo` text DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `id_paciente` int(11) DEFAULT NULL,
  `id_medico` int(11) DEFAULT NULL,
  `fecha_cita` date DEFAULT NULL,
  `hora_cita` time DEFAULT NULL,
  `motivo_cita` text DEFAULT NULL,
  `motivo_accion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_citas`
--

INSERT INTO `historial_citas` (`id_historial`, `id_cita`, `id_usuario_accion`, `tipo_usuario`, `accion`, `motivo`, `fecha_registro`, `id_paciente`, `id_medico`, `fecha_cita`, `hora_cita`, `motivo_cita`, `motivo_accion`) VALUES
(7, 18, 3, 'medico', 'CANCELADA', NULL, '2026-01-09 10:59:59', 1, 3, '2026-01-10', '10:00:00', 'muela', 'ya no desea'),
(8, 19, 1, 'paciente', 'CREADA', NULL, '2026-01-09 11:22:51', 1, 3, '2026-01-10', '07:00:00', 'muela', 'Cita creada.'),
(9, 20, 1, 'paciente', 'CREADA', NULL, '2026-01-09 11:26:42', 1, 3, '2026-01-10', '08:30:00', 'nariz', 'Cita creada.'),
(10, 20, 3, 'medico', 'CANCELADA', NULL, '2026-01-09 11:28:17', 1, 3, '2026-01-10', '08:30:00', 'nariz', 'no desea'),
(11, 14, 1, 'paciente', 'MODIFICADA', NULL, '2026-01-09 12:17:32', 1, 3, '2026-01-10', '11:00:00', 'dolor', 'personal');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_disponibilidad`
--

CREATE TABLE `historial_disponibilidad` (
  `id_historial` int(11) NOT NULL,
  `id_disponibilidad_original` int(11) DEFAULT NULL,
  `id_medico` int(11) DEFAULT NULL,
  `fecha_dia` date DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `confirmada_por_medico` tinyint(4) DEFAULT NULL,
  `fecha_archivado` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_disponibilidad`
--

INSERT INTO `historial_disponibilidad` (`id_historial`, `id_disponibilidad_original`, `id_medico`, `fecha_dia`, `hora_inicio`, `hora_fin`, `confirmada_por_medico`, `fecha_archivado`) VALUES
(1, 2, 3, '2025-12-13', '07:00:00', '17:00:00', 1, '2026-01-09 17:04:17'),
(2, 4, 3, '2026-01-10', '07:00:00', '12:00:00', 1, '2026-01-14 22:18:07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicos`
--

CREATE TABLE `medicos` (
  `id_medico` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `especialidad` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `cedula_profesional` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `medicos`
--

INSERT INTO `medicos` (`id_medico`, `id_usuario`, `nombres`, `apellidos`, `especialidad`, `telefono`, `cedula_profesional`) VALUES
(1, 2, 'Juan', 'Perez', 'Medicina General', NULL, '0000000001'),
(3, 3, 'Mayra', 'Navarrete', 'Medicina General', '0987462952', '1716279995');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_telemedicina`
--

CREATE TABLE `mensajes_telemedicina` (
  `id_mensaje` int(11) NOT NULL,
  `id_paciente` int(11) NOT NULL,
  `id_medico` int(11) NOT NULL,
  `mensaje_paciente` text NOT NULL,
  `respuesta_medico` text DEFAULT NULL,
  `fecha_envio` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_respuesta` datetime DEFAULT NULL,
  `estado` enum('pendiente','respondido') DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensajes_telemedicina`
--

INSERT INTO `mensajes_telemedicina` (`id_mensaje`, `id_paciente`, `id_medico`, `mensaje_paciente`, `respuesta_medico`, `fecha_envio`, `fecha_respuesta`, `estado`) VALUES
(1, 1, 3, 'me tomo', 'tome una cita', '2026-01-10 02:30:53', '2026-01-09 21:39:18', 'respondido'),
(2, 1, 3, 'Tomado', NULL, '2026-01-10 02:50:05', NULL, 'pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id_paciente` int(11) NOT NULL,
  `cedula` varchar(10) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id_paciente`, `cedula`, `nombres`, `apellidos`, `fecha_nacimiento`, `telefono`, `email`, `direccion`, `fecha_registro`) VALUES
(1, '0910243229', 'Christian', 'Morales', '1981-08-12', '0969787085', 'cgmorales1280@gmail.com', 'Calderon', '2025-12-10 14:21:46'),
(2, '464564', 'dfgdf', 'dfgd', '2025-12-12', '3645', 'gfdgd', 'sdgfdfgd', '2025-12-10 14:31:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(2, 'Medico'),
(1, 'Sistema');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `clave` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `usuario`, `clave`, `id_rol`, `fecha_creacion`) VALUES
(1, 'admin', '123', 1, '2025-12-05 20:17:09'),
(2, 'dr_perez', 'medico123', 2, '2025-12-05 20:17:09'),
(3, 'mayra', '123', 2, '2025-12-10 17:03:42');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `chatbot_preguntas`
--
ALTER TABLE `chatbot_preguntas`
  ADD PRIMARY KEY (`id_pregunta`);

--
-- Indices de la tabla `citas`
--
ALTER TABLE `citas`
  ADD PRIMARY KEY (`id_cita`),
  ADD UNIQUE KEY `idx_cita_unica` (`id_medico`,`fecha_cita`,`hora_cita`),
  ADD KEY `id_paciente` (`id_paciente`),
  ADD KEY `id_estado` (`id_estado`),
  ADD KEY `id_disponibilidad` (`id_disponibilidad`);

--
-- Indices de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD PRIMARY KEY (`id_disponibilidad`),
  ADD UNIQUE KEY `idx_medico_fecha_hora` (`id_medico`,`fecha_dia`,`hora_inicio`);

--
-- Indices de la tabla `estados_cita`
--
ALTER TABLE `estados_cita`
  ADD PRIMARY KEY (`id_estado`),
  ADD UNIQUE KEY `nombre_estado` (`nombre_estado`);

--
-- Indices de la tabla `historial_citas`
--
ALTER TABLE `historial_citas`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `id_cita` (`id_cita`);

--
-- Indices de la tabla `historial_disponibilidad`
--
ALTER TABLE `historial_disponibilidad`
  ADD PRIMARY KEY (`id_historial`);

--
-- Indices de la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD PRIMARY KEY (`id_medico`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`),
  ADD UNIQUE KEY `cedula_profesional` (`cedula_profesional`);

--
-- Indices de la tabla `mensajes_telemedicina`
--
ALTER TABLE `mensajes_telemedicina`
  ADD PRIMARY KEY (`id_mensaje`),
  ADD KEY `id_medico` (`id_medico`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id_paciente`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `usuario` (`usuario`),
  ADD KEY `id_rol` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `chatbot_preguntas`
--
ALTER TABLE `chatbot_preguntas`
  MODIFY `id_pregunta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `citas`
--
ALTER TABLE `citas`
  MODIFY `id_cita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  MODIFY `id_disponibilidad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `estados_cita`
--
ALTER TABLE `estados_cita`
  MODIFY `id_estado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `historial_citas`
--
ALTER TABLE `historial_citas`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `historial_disponibilidad`
--
ALTER TABLE `historial_disponibilidad`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `medicos`
--
ALTER TABLE `medicos`
  MODIFY `id_medico` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `mensajes_telemedicina`
--
ALTER TABLE `mensajes_telemedicina`
  MODIFY `id_mensaje` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id_paciente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `citas`
--
ALTER TABLE `citas`
  ADD CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE,
  ADD CONSTRAINT `citas_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estados_cita` (`id_estado`) ON UPDATE CASCADE,
  ADD CONSTRAINT `citas_ibfk_4` FOREIGN KEY (`id_disponibilidad`) REFERENCES `disponibilidad` (`id_disponibilidad`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `disponibilidad`
--
ALTER TABLE `disponibilidad`
  ADD CONSTRAINT `disponibilidad_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `medicos`
--
ALTER TABLE `medicos`
  ADD CONSTRAINT `medicos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `mensajes_telemedicina`
--
ALTER TABLE `mensajes_telemedicina`
  ADD CONSTRAINT `mensajes_telemedicina_ibfk_1` FOREIGN KEY (`id_medico`) REFERENCES `medicos` (`id_medico`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
