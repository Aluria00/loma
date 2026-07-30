"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  assetPct,
  formatDate,
  formatPct,
  formatShares,
  formatSignedPct,
  formatSignedUsd,
  formatUsd,
  gainPct,
  type CompanyPositionRow,
} from "@/lib/portfolio";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const HEADERS = [
  { label: "Company", align: "left" as const },
  { label: "Structure", align: "left" as const },
  { label: "Purchased", align: "left" as const },
  { label: "Shares", align: "right" as const },
  { label: "Cost", align: "right" as const },
  { label: "FMV", align: "right" as const },
  { label: "Wt.", align: "right" as const },
  { label: "Gain", align: "right" as const },
];

function GainCell({
  gain,
  cost,
  inactive,
  size = "sm",
}: {
  gain: number;
  cost: number;
  inactive: boolean;
  size?: "sm" | "xs";
}) {
  if (inactive) return <span className="text-faint">—</span>;

  const positive = gain >= 0;
  const pct = cost ? gainPct(gain, cost) : 0;
  const textSize = size === "xs" ? "text-xs" : "text-sm";

  return (
    <div className={cn("tabular-nums", textSize)}>
      <div className="text-foreground">{formatSignedUsd(gain)}</div>
      {cost > 0 ? (
        <div
          className={cn(
            "mt-0.5 text-[10px] leading-none",
            positive ? "text-brand-2" : "text-destructive"
          )}
        >
          {formatSignedPct(pct)}
        </div>
      ) : null}
    </div>
  );
}

export function PositionsTable({
  rows,
  totalFmv,
}: {
  rows: CompanyPositionRow[];
  totalFmv: number;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <Table className="min-w-[760px] text-xs">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border/80">
          {HEADERS.map((col) => (
            <TableHead
              key={col.label}
              className={cn(
                "h-8 px-2.5 text-[10px] font-medium tracking-[0.06em] text-faint uppercase",
                col.align === "right" && "text-right"
              )}
            >
              {col.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const inactive = row.status !== "active";
          const gain = row.fmv - row.costBasis;
          const weight = assetPct(row.fmv, totalFmv);
          const expandable = row.roundCount > 1;
          const isOpen = !!open[row.companyKey];

          return (
            <CompanyBlock
              key={row.companyKey}
              row={row}
              inactive={inactive}
              gain={gain}
              weight={weight}
              expandable={expandable}
              isOpen={isOpen}
              totalFmv={totalFmv}
              onToggle={() => toggle(row.companyKey)}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}

function CompanyBlock({
  row,
  inactive,
  gain,
  weight,
  expandable,
  isOpen,
  totalFmv,
  onToggle,
}: {
  row: CompanyPositionRow;
  inactive: boolean;
  gain: number;
  weight: number;
  expandable: boolean;
  isOpen: boolean;
  totalFmv: number;
  onToggle: () => void;
}) {
  const cellPy = "py-2 px-2.5";

  return (
    <>
      <TableRow
        className={cn(
          "border-border/60",
          expandable && "cursor-pointer",
          inactive && "opacity-50",
          isOpen && "bg-secondary/50"
        )}
        onClick={expandable ? onToggle : undefined}
        aria-expanded={expandable ? isOpen : undefined}
      >
        <TableCell className={cn(cellPy, "font-medium text-foreground")}>
          <span className="inline-flex items-center gap-1.5">
            {expandable ? (
              <ChevronRight
                className={cn(
                  "size-3 shrink-0 text-faint transition-transform duration-150",
                  isOpen && "rotate-90"
                )}
              />
            ) : (
              <span className="inline-block w-3 shrink-0" />
            )}
            <span className={cn(inactive && "text-faint")}>
              {row.name}
            </span>
            {inactive ? (
              <Badge
                variant="secondary"
                className="rounded px-1 py-0 text-[9px] font-normal leading-4 text-faint"
              >
                Closed
              </Badge>
            ) : null}
          </span>
        </TableCell>
        <TableCell className={cn(cellPy, "max-w-[9rem] text-muted-foreground")}>
          {expandable ? (
            <span className="text-muted-foreground">
              {row.roundCount} tranches
            </span>
          ) : (
            <span className="line-clamp-1">{row.investmentTypes[0]}</span>
          )}
        </TableCell>
        <TableCell className={cn(cellPy, "text-muted-foreground tabular-nums")}>
          {formatDate(row.firstPurchaseDate)}
        </TableCell>
        <TableCell className={cn(cellPy, "text-right tabular-nums text-muted-foreground")}>
          {formatShares(row.shares)}
        </TableCell>
        <TableCell className={cn(cellPy, "text-right tabular-nums text-muted-foreground")}>
          {formatUsd(row.costBasis)}
        </TableCell>
        <TableCell className={cn(cellPy, "text-right font-medium tabular-nums text-foreground")}>
          {formatUsd(row.fmv)}
        </TableCell>
        <TableCell className={cn(cellPy, "text-right text-faint tabular-nums")}>
          {inactive ? "—" : formatPct(weight)}
        </TableCell>
        <TableCell className={cn(cellPy, "text-right")}>
          <GainCell gain={gain} cost={row.costBasis} inactive={inactive} />
        </TableCell>
      </TableRow>

      {isOpen
        ? row.positions.map((pos) => {
            const posInactive = pos.status !== "active";
            const posCost = Number(pos.cost_basis || 0);
            const posFmv = Number(pos.fmv || 0);
            const posGain = posFmv - posCost;
            const posWeight = assetPct(posFmv, totalFmv);

            return (
              <TableRow
                key={pos.id}
                className={cn(
                  "border-border/40 bg-background/80",
                  posInactive && "opacity-50"
                )}
              >
                <TableCell className={cn(cellPy, "pl-8 text-[10px] text-faint")}>
                  Tranche
                </TableCell>
                <TableCell className={cn(cellPy, "max-w-[9rem] text-[10px] text-muted-foreground")}>
                  <span className="line-clamp-1">{pos.investment_type}</span>
                </TableCell>
                <TableCell className={cn(cellPy, "text-[10px] text-muted-foreground tabular-nums")}>
                  {formatDate(pos.purchase_date)}
                </TableCell>
                <TableCell className={cn(cellPy, "text-right text-[10px] tabular-nums text-muted-foreground")}>
                  {formatShares(pos.shares == null ? null : Number(pos.shares))}
                </TableCell>
                <TableCell className={cn(cellPy, "text-right text-[10px] tabular-nums text-muted-foreground")}>
                  {formatUsd(posCost)}
                </TableCell>
                <TableCell className={cn(cellPy, "text-right text-[10px] font-medium tabular-nums text-foreground")}>
                  {formatUsd(posFmv)}
                </TableCell>
                <TableCell className={cn(cellPy, "text-right text-[10px] text-faint tabular-nums")}>
                  {posInactive ? "—" : formatPct(posWeight)}
                </TableCell>
                <TableCell className={cn(cellPy, "text-right")}>
                  <GainCell
                    gain={posGain}
                    cost={posCost}
                    inactive={posInactive}
                    size="xs"
                  />
                </TableCell>
              </TableRow>
            );
          })
        : null}
    </>
  );
}
