export function DisclaimerSection() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 leading-relaxed">
      <p className="font-semibold text-slate-700 mb-2">Disclaimer</p>
      <p>
        Este simulador es educativo y referencial. No representa una oferta formal de crédito, aprobación bancaria, ni asesoría financiera.
        La aprobación real depende de la política comercial de cada banco, evaluación de riesgo, verificación de ingresos, nivel de deuda,
        características de la propiedad, seguros, gastos operacionales y condiciones actuales del mercado.
      </p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-slate-400">
        <span>
          Tasas de referencia:{" "}
          <a
            href="https://servicios.cmfchile.cl/simuladorhipotecario/aplicacion?indice=101.2.1"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            CMF Simulador Hipotecario
          </a>
        </span>
        <span>
          Valor UF:{" "}
          <a
            href="https://www.sii.cl/valores_y_fechas/uf/uf2026.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-600"
          >
            SII
          </a>
        </span>
      </div>
    </div>
  );
}
