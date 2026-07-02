const modules = [
  {
    path: "/users",
    label: "Usuarios y roles",
    description: "Administración de usuarios, roles y permisos del sistema.",
    roles: ["Administrador"],
  },
  {
    path: "/guests",
    label: "Huéspedes",
    description: "Registro y consulta de huéspedes del Hostal La Torre.",
    roles: ["Administrador", "Recepcionista"],
  },
  {
    path: "/ocr-register",
    label: "Registro OCR",
    description: "Captura asistida por OCR para automatizar registros.",
    roles: ["Administrador", "Recepcionista"],
  },
  {
    path: "/services",
    label: "Servicios del hostal",
    description: "Administración de servicios ofrecidos a huéspedes.",
    roles: ["Administrador", "Recepcionista"],
  },
  {
    path: "/purchases",
    label: "Compras de insumos",
    description: "Control de compras operativas e insumos del hostal.",
    roles: ["Administrador"],
  },
  {
    path: "/sales",
    label: "Ventas",
    description: "Ventas de hospedaje y servicios complementarios.",
    roles: ["Administrador", "Recepcionista"],
  },
  {
    path: "/reports",
    label: "Reportes",
    description: "Reportes administrativos y consultas operativas.",
    roles: ["Administrador", "Consulta"],
  },
];

export function getModulesForRole(roleName) {
  return modules.filter((module) => module.roles.includes(roleName));
}

export default modules;
