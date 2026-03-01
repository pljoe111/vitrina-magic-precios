import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Alchem" className="h-10 w-10 invert" />
            <div>
              <p className="text-lg font-bold text-background font-display">ALCHEM</p>
              <p className="mt-0.5 text-xs text-background/60 font-body">
                Péptidos liofilizados de grado investigación
              </p>
            </div>
          </div>
          <p className="text-xs text-background/40 font-body">
            Solo para uso en investigación. No apto para consumo humano.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
