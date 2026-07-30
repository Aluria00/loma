import { cn } from "@/lib/utils";
import {
  assetPct,
  formatPct,
  type CompanyPositionRow,
} from "@/lib/portfolio";

const MAX_LABELS = 5;
const LABEL_ABOVE_MIN_PCT = 9;
const LABEL_ROW_MIN = 34;
const BAR_HEIGHT = 12;

const SEGMENT_FILLS = [
  "var(--text)",
  "var(--muted-copy)",
  "var(--faint)",
  "color-mix(in srgb, var(--faint) 55%, var(--bg) 45%)",
  "var(--hairline)",
  "color-mix(in srgb, var(--hairline) 50%, var(--bg) 50%)",
] as const;

type Segment = {
  name: string;
  pct: number;
  colorIndex: number;
  detail?: string;
};

function segmentFill(index: number): string {
  return SEGMENT_FILLS[Math.min(index, SEGMENT_FILLS.length - 1)];
}

function buildSegments(
  rows: CompanyPositionRow[],
  totalFmv: number
): Segment[] {
  const active = rows
    .filter((r) => r.status === "active" && r.fmv > 0)
    .sort((a, b) => b.fmv - a.fmv);

  if (!active.length || !totalFmv) return [];

  const top = active.slice(0, MAX_LABELS);
  const rest = active.slice(MAX_LABELS);
  const restFmv = rest.reduce((s, r) => s + r.fmv, 0);

  const segments: Segment[] = top.map((row, i) => ({
    name: row.name,
    pct: assetPct(row.fmv, totalFmv),
    colorIndex: i,
  }));

  if (rest.length > 0) {
    segments.push({
      name: "Other",
      pct: assetPct(restFmv, totalFmv),
      colorIndex: segments.length,
      detail: rest.map((r) => r.name).join(", "),
    });
  }

  return segments;
}

function gridTemplateColumns(segments: Segment[]): string {
  return segments.map((s) => `${s.pct}fr`).join(" ");
}

function tooltipAlign(index: number, total: number) {
  if (index === 0) return "left-0";
  if (index === total - 1) return "right-0";
  return "left-1/2 -translate-x-1/2";
}

function SegmentTooltip({
  seg,
  index,
  total,
}: {
  seg: Segment;
  index: number;
  total: number;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-full z-50 mb-2 w-max max-w-[14rem] rounded-md bg-foreground px-2 py-1.5 text-background shadow-md",
        "opacity-0 transition-opacity duration-100 group-hover/seg:opacity-100",
        tooltipAlign(index, total)
      )}
    >
      <p className="text-xs font-medium leading-tight">{seg.name}</p>
      <p className="mt-0.5 text-[10px] tabular-nums text-background/75">
        {formatPct(seg.pct)}
      </p>
      {seg.detail ? (
        <p className="mt-1 text-[10px] leading-snug text-background/65">
          {seg.detail}
        </p>
      ) : null}
    </div>
  );
}

export function AllocationBar({
  rows,
  totalFmv,
}: {
  rows: CompanyPositionRow[];
  totalFmv: number;
}) {
  const segments = buildSegments(rows, totalFmv);
  if (!segments.length) return null;

  const columns = gridTemplateColumns(segments);
  const hasHoverSegments = segments.some((s) => s.pct < LABEL_ABOVE_MIN_PCT);
  const lastIndex = segments.length - 1;

  return (
    <div className="overflow-visible">
      <p className="mb-3 text-[10px] font-medium tracking-[0.08em] text-faint uppercase">
        Allocation by FMV
      </p>

      <div
        className="grid w-full overflow-visible"
        style={{
          gridTemplateColumns: columns,
          gridTemplateRows: `auto ${BAR_HEIGHT}px`,
        }}
      >
        {segments.map((seg, i) => {
          const showLabel = seg.pct >= LABEL_ABOVE_MIN_PCT;
          const divider = i > 0;

          return (
            <div
              key={`label-${seg.name}`}
              className={cn(
                "min-w-0 px-2 pb-2.5",
                divider && "border-l border-border"
              )}
              style={{
                gridColumn: i + 1,
                gridRow: 1,
                minHeight: LABEL_ROW_MIN,
              }}
            >
              {showLabel ? (
                <>
                  <p className="truncate text-xs font-medium leading-tight text-foreground">
                    {seg.name}
                  </p>
                  <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                    {formatPct(seg.pct)}
                  </p>
                </>
              ) : null}
            </div>
          );
        })}

        {segments.map((seg, i) => {
          const hover = seg.pct < LABEL_ABOVE_MIN_PCT;
          const divider = i > 0;
          const tooltipText = seg.detail
            ? `${seg.name} ${formatPct(seg.pct)} — ${seg.detail}`
            : `${seg.name} ${formatPct(seg.pct)}`;

          return (
            <div
              key={`bar-${seg.name}`}
              className={cn(
                "group/seg relative min-w-0 overflow-visible",
                divider && "border-l border-border",
                hover && "z-20 cursor-default"
              )}
              style={{
                gridColumn: i + 1,
                gridRow: 2,
              }}
              title={hover ? tooltipText : undefined}
            >
              {hover ? (
                <>
                  <div
                    className="absolute inset-x-0 bottom-0 z-10"
                    style={{ top: -LABEL_ROW_MIN }}
                    aria-hidden
                  />
                  <SegmentTooltip
                    seg={seg}
                    index={i}
                    total={segments.length}
                  />
                </>
              ) : null}
              <div
                className={cn(
                  "h-full w-full",
                  i === 0 && "rounded-l-sm",
                  i === lastIndex && "rounded-r-sm"
                )}
                style={{ backgroundColor: segmentFill(seg.colorIndex) }}
              />
            </div>
          );
        })}
      </div>

      {hasHoverSegments ? (
        <p className="mt-2 text-[10px] text-faint">
          Hover narrow segments for company names.
        </p>
      ) : null}
    </div>
  );
}
