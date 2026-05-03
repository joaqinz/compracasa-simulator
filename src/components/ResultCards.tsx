import type { ScenarioOutput, ScenarioInput, AffordabilityStatus } from "@/types/finance";
import { StatusBadge } from "./ui/StatusBadge";
import { Tooltip } from "./ui/Tooltip";
import { formatBoth, formatUF } from "@/lib/formatters";
import clsx from "clsx";

type Props = {
  output: ScenarioOutput;
  input: ScenarioInput;
  status: AffordabilityStatus;
};

type CardProps = {
  title: string;
  value: string;
  sub?: string;
  tooltipId?: string;
  highlight?: "positive" | "negative" | "neutral";
  children?: React.ReactNode;
};

function Card({ title, value, sub, tooltipId, highlight, children }: CardProps) {
  return (
    <div className={clsx(
      "rounded-xl border p-4 bg-white",
      highlight === "positive" ? "border-emerald-200" :
      highlight === "negative" ? "border-red-200" : "border-slate-200"
    )}>
      <p className="text-xs font-medium text-slate-500 flex items-center">
        {title}
        {tooltipId && <Tooltip termId={tooltipId} />}
      </p>
      <p className={clsx(
        "text-base font-bold mt-1",
        highlight === "positive" ? "text-emerald-700" :
        highlight === "negative" ? "text-red-700" : "text-slate-900"
      )}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      {children}
    </div>
  );
}

const constraintMessages: Record<string, string> = {
  income: "Tu pie alcanza para una propiedad mayor, pero tu ingreso no soporta el dividendo requerido.",
  savings: "Tu ingreso soporta una propiedad mayor, pero tus ahorros no cubren el pie requerido.",
  income_and_savings: "Tanto tu ingreso como tus ahorros están por debajo del requisito estimado.",
  bank_policy: "El escenario requiere un financiamiento superior al máximo del banco seleccionado.",
  none: "El escenario es alcanzable dentro de los parámetros seleccionados.",
};

export function ResultCards({ output, input, status }: Props) {
  const uf = input.ufValueCLP;

  const hasResult =
    output.realisticMaxPropertyUF != null ||
    output.fullMonthlyDividendUF != null ||
    output.requiredIncomeUF != null;

  if (!hasResult) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-500 text-sm">
        Ingresa tus datos para ver los resultados.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main affordability card */}
      {output.realisticMaxPropertyUF != null && (
        <Card
          title={input.mode === "target_property" ? "Propiedad objetivo" : "Propiedad máxima estimada"}
          value={formatBoth(output.realisticMaxPropertyUF ?? output.propertyPriceUF ?? 0, uf)}
          tooltipId="uf"
        >
          <div className="mt-2">
            <StatusBadge status={status} large />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        {output.fullMonthlyDividendUF != null && (
          <Card
            title="Dividendo mensual estimado"
            value={formatBoth(output.fullMonthlyDividendUF, uf)}
            sub="incluye seguros"
            tooltipId="dividendo"
          />
        )}

        {output.requiredIncomeUF != null && (
          <Card
            title="Ingreso requerido"
            value={formatBoth(output.requiredIncomeUF, uf)}
            tooltipId="carga-financiera"
            highlight={
              input.netMonthlyIncomeAmount != null
                ? (input.netMonthlyIncomeUnit === "CLP"
                    ? input.netMonthlyIncomeAmount / uf
                    : input.netMonthlyIncomeAmount) >= output.requiredIncomeUF
                  ? "positive"
                  : "negative"
                : undefined
            }
          />
        )}

        {output.downPaymentUF != null && (
          <Card
            title="Pie requerido"
            value={formatBoth(output.downPaymentUF, uf)}
            tooltipId="pie"
            highlight={
              input.savingsAmount != null
                ? (input.savingsUnit === "CLP"
                    ? input.savingsAmount / uf
                    : input.savingsAmount) >= output.downPaymentUF
                  ? "positive"
                  : "negative"
                : undefined
            }
          />
        )}

        {output.loanAmountUF != null && (
          <Card
            title="Monto del crédito"
            value={formatBoth(output.loanAmountUF, uf)}
            tooltipId="tasa"
          />
        )}
      </div>

      {/* Gap cards in target_property mode */}
      {input.mode === "target_property" && (
        <div className="grid grid-cols-2 gap-3">
          {output.incomeGapUF != null && output.incomeGapUF > 0 && (
            <Card
              title="Brecha de ingreso"
              value={`+${formatUF(output.incomeGapUF)} / mes`}
              highlight="negative"
              sub="ingreso adicional necesario"
            />
          )}
          {output.savingsGapUF != null && output.savingsGapUF > 0 && (
            <Card
              title="Brecha de ahorros"
              value={`+${formatBoth(output.savingsGapUF, uf)}`}
              highlight="negative"
              sub="ahorros adicionales necesarios"
            />
          )}
        </div>
      )}

      {/* Max by income/savings breakdown */}
      {(output.maxPropertyByIncomeUF != null || output.maxPropertyBySavingsUF != null) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-700 mb-2">Detalle de restricciones</p>
          <div className="flex flex-col gap-1">
            {output.maxPropertyByIncomeUF != null && (
              <div className="flex justify-between text-slate-600">
                <span>Máximo por ingreso:</span>
                <span className="font-semibold">{formatUF(output.maxPropertyByIncomeUF, 0)}</span>
              </div>
            )}
            {output.maxPropertyBySavingsUF != null && (
              <div className="flex justify-between text-slate-600">
                <span>Máximo por ahorros:</span>
                <span className="font-semibold">{formatUF(output.maxPropertyBySavingsUF, 0)}</span>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">{constraintMessages[output.bindingConstraint]}</p>
        </div>
      )}
    </div>
  );
}
