import { Download } from "lucide-react";

export default function DownloadButton({ label = "Download report" }) {
  return (
    <button className="soft" onClick={() => window.print()}>
      <Download size={15} />
      {label}
    </button>
  );
}
