const Footer = () => {
  return (
    <footer className="border-t border-border bg-foreground py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="text-lg font-bold text-background font-display">CBCells Bio Technology</p>
            <p className="mt-1 text-xs text-background/60 font-body">
              Péptidos liofilizados de grado investigación
            </p>
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
