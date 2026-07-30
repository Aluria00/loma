"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  assetPct,
  formatDate,
  formatPct,
  formatShares,
  formatUsd,
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
    <Table className="min-w-[760px]">
      <TableHeader>
        <TableRow className="hover:bg-transparent border-border/80">
          {[
            "Company",
            "Rounds",
            "First purchase",
            "Shares",
            "Cost",
            "FMV",
            "Weight",
            "Gain/Loss",
          ].map((label, i) => (
            <TableHead
              key={label}
              className={cn(
                "h-11 text-[11px] uppercase tracking-[0.06em] text-muted-foreground font-normal",
                i >= 3 && "text-right"
              )}
            >
              {label}
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
  return (
    <>
      <TableRow
        className={cn(
          "border-border/70",
          expandable && "cursor-pointer",
          inactive && "text-muted-foreground line-through",
          isOpen && "border-b-0 bg-muted/30"
        )}
        onClick={expandable ? onToggle : undefined}
        aria-expanded={expandable ? isOpen : undefined}
      >
        <TableCell className="font-medium text-foreground py-3.5">
          <span className="inline-flex items-center gap-2">
            {expandable ? (
              <ChevronRight
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-150",
                  isOpen && "rotate-90"
                )}
              />
            ) : (
              <span className="inline-block w-3.5" />
            )}
            {row.name}
          </span>
        </TableCell>
        <TableCell className="text-muted-foreground py-3.5">
          {expandable ? (
            <Badge
              variant="outline"
              className="rounded-md font-normal text-muted-foreground"
            >
              {row.roundCount} tranches
            </Badge>
          ) : (
            row.investmentTypes[0]
          )}
        </TableCell>
        <TableCell className="text-muted-foreground py-3.5">
          {formatDate(row.firstPurchaseDate)}
        </TableCell>
        <TableCell className="text-right tabular-nums py-3.5">
          {formatShares(row.shares)}
        </TableCell>
        <TableCell className="text-right tabular-nums py-3.5">
          {formatUsd(row.costBasis)}
        </TableCell>
        <TableCell className="text-right tabular-nums py-3.5">
          {formatUsd(row.fmv)}
        </TableCell>
        <TableCell className="text-right tabular-nums text-muted-foreground py-3.5">
          {inactive ? "—" : formatPct(weight)}
        </TableCell>
        <TableCell
          className={cn(
            "text-right tabular-nums py-3.5",
            !inactive && (gain >= 0 ? "text-brand" : "text-destructive")
          )}
        >
          {inactive ? "—" : formatUsd(gain)}
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
                  "border-border/50 bg-muted/20 hover:bg-muted/35",
                  posInactive && "text-muted-foreground line-through"
                )}
              >
                <TableCell className="pl-10 text-muted-foreground text-xs py-2.5">
                  Tranche
                </TableCell>
                <TableCell className="text-muted-foreground text-xs py-2.5">
                  {pos.investment_type}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs py-2.5">
                  {formatDate(pos.purchase_date)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-xs py-2.5">
                  {formatShares(pos.shares == null ? null : Number(pos.shares))}
                </TableCell>
                <TableCell className="text-right tabular-nums text-xs py-2.5">
                  {formatUsd(posCost)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-xs py-2.5">
                  {formatUsd(posFmv)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-xs text-muted-foreground py-2.5">
                  {posInactive ? "—" : formatPct(posWeight)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums text-xs py-2.5",
                    !posInactive &&
                      (posGain >= 0 ? "text-brand" : "text-destructive")
                  )}
                >
                  {posInactive ? "—" : formatUsd(posGain)}
                </TableCell>
              </TableRow>
            );
          })
        : null}
    </>
  );
}
