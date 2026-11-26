// MOLECULA: titulo + subtitulo + acciones (botones) de una pagina.
function EncabezadoPagina({ titulo, subtitulo, children }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h2 className="text-primary fw-bold mb-1">{titulo}</h2>
        {subtitulo && <p className="text-muted fw-semibold m-0">{subtitulo}</p>}
      </div>
      {children && <div className="d-flex gap-2">{children}</div>}
    </div>
  );
}

export default EncabezadoPagina;
