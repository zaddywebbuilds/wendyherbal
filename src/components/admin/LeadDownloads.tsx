import { Smartphone, FileSpreadsheet, Info } from "lucide-react";

/**
 * Downloading the buyer list.
 *
 * Two formats, because they are for two different jobs. The .vcf goes into a
 * phone's contacts, which is the only way WhatsApp will show these people. The
 * .csv is for looking at the list on a computer.
 *
 * Two scopes, because consent is a line that has to be drawn before the
 * download rather than left as a column to remember to read. Everyone who
 * bought may be contacted about their own order; only those who ticked the
 * updates box may be sent offers.
 */

interface Props {
  total: number;
  consented: number;
  /** Buyers whose saved number cannot become a contact. */
  unreachable: number;
}

export function LeadDownloads({ total, consented, unreachable }: Props) {
  return (
    <section className="bg-white rounded-xl border border-[#E9E4D6] p-4 mb-5"
      style={{ fontFamily: "var(--font-body)" }}>
      <h2 className="text-[14px] font-semibold text-[#123D2B]">Download your buyer list</h2>
      <p className="text-[12px] text-[#6b7265] mt-1 leading-relaxed max-w-prose">
        Save the contacts on your phone and these buyers appear in WhatsApp, ready to message
        without typing a number. The spreadsheet is for looking through the list on a computer.
      </p>

      <div className="mt-3.5 space-y-2.5">
        <Row
          label="Everyone who bought"
          count={total}
          note="Fine for messages about their own order."
          scope="all"
        />
        <Row
          label="Only those who agreed to updates"
          count={consented}
          note="The ones you may send offers and new products to."
          scope="opted-in"
          tinted
        />
      </div>

      {unreachable > 0 && (
        <p className="mt-3 flex items-start gap-1.5 text-[11.5px] text-[#92400E] leading-relaxed">
          <Info size={13} className="mt-px shrink-0" />
          <span>
            {unreachable} {unreachable === 1 ? "buyer" : "buyers"} left out of the contacts file:
            the phone number saved at checkout is too short to call. They are still in the
            spreadsheet, so you can correct the number in the Google Sheet.
          </span>
        </p>
      )}
    </section>
  );
}

function Row({
  label, count, note, scope, tinted,
}: {
  label: string; count: number; note: string; scope: string; tinted?: boolean;
}) {
  const disabled = count === 0;
  const href = (format: string) =>
    `/api/admin/customers/export?format=${format}&scope=${scope}`;

  return (
    // Stacked on a phone, side by side from sm up. Without the stack the label
    // column is squeezed to a few characters wide by the button group.
    <div className={`flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-2.5 rounded-lg border p-3 ${
      tinted ? "border-[#CDE3D5] bg-[#F3F8F4]" : "border-[#EFE9DD] bg-[#FCFBF7]"
    }`}>
      <div className="min-w-0 sm:flex-1">
        <p className="text-[12.5px] font-medium text-[#252B23]">
          {label} <span className="text-[#6b7265] font-normal tabular-nums">({count})</span>
        </p>
        <p className="text-[11px] text-[#A8B99C] mt-0.5">{note}</p>
      </div>

      <div className="flex gap-2 shrink-0">
        {disabled ? (
          <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#EFE9DD] text-[11.5px] text-[#A8B99C]">
            Nobody yet
          </span>
        ) : (
          <>
            <a href={href("vcf")} download
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-9 px-3 bg-[#123D2B] text-white rounded-lg text-[11.5px] font-semibold hover:bg-[#175C3D] transition-colors">
              <Smartphone size={13} /> Phone contacts
            </a>
            <a href={href("csv")} download
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 h-9 px-3 bg-white border border-[#E9E4D6] rounded-lg text-[11.5px] font-medium text-[#252B23] hover:border-[#175C3D] transition-colors">
              <FileSpreadsheet size={13} /> Spreadsheet
            </a>
          </>
        )}
      </div>
    </div>
  );
}
