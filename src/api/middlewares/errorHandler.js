export const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack);
  // No envíes el error a Meta, solo regístralo
  // Meta espera un 200, que ya deberíamos haber enviado.
  // Si el error es antes de eso, la ruta fallará.
  if (!res.headersSent) {
    res.sendStatus(500);
  }
};