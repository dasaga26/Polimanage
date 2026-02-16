export const Footer = () => {
  const menuItems = [
    {
      title: "Servicios",
      links: [
        { text: "Pistas Deportivas", url: "/shop" },
        { text: "Clases", url: "/clases" },
        { text: "Clubes", url: "/#clubes" },
        { text: "Reservas", url: "/shop" },
      ],
    },
    {
      title: "Información",
      links: [
        { text: "Acerca de", url: "#" },
        { text: "Nuestro Equipo", url: "#" },
        { text: "Blog", url: "#" },
        { text: "Contacto", url: "#" },
      ],
    },
    {
      title: "Ayuda",
      links: [
        { text: "Soporte", url: "#" },
        { text: "Preguntas Frecuentes", url: "#" },
        { text: "Términos y Condiciones", url: "#" },
        { text: "Política de Privacidad", url: "#" },
      ],
    },
    {
      title: "Síguenos",
      links: [
        { text: "Twitter", url: "#" },
        { text: "Instagram", url: "#" },
        { text: "Facebook", url: "#" },
        { text: "LinkedIn", url: "#" },
      ],
    },
  ];

  const bottomLinks = [
    { text: "Términos y Condiciones", url: "#" },
    { text: "Política de Privacidad", url: "#" },
  ];

  return (
    <footer className="bg-slate-50 dark:bg-slate-900 py-16 border-t">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
          {/* Logo y tagline */}
          <div className="col-span-2 mb-8 lg:mb-0">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="PoliManage" 
                className="h-10 w-10 object-contain"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                PoliManage
              </span>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 max-w-xs">
              Sistema integral de gestión de pistas deportivas. Reserva, gestiona y disfruta.
            </p>
          </div>

          {/* Menu sections */}
          {menuItems.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                {section.links.map((link, linkIdx) => (
                  <li
                    key={linkIdx}
                    className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <a href={link.url}>{link.text}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col justify-between gap-4 border-t border-gray-200 dark:border-gray-800 pt-8 text-sm font-medium text-gray-600 dark:text-gray-400 md:flex-row md:items-center">
          <p>
            &copy; {new Date().getFullYear()} PoliManage. Todos los derechos reservados.
          </p>
          <ul className="flex gap-6">
            {bottomLinks.map((link, linkIdx) => (
              <li key={linkIdx} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <a href={link.url}>{link.text}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};
