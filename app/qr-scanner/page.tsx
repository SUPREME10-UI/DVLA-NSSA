"use client";

export default function QrScannerPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500">
          NSS Personnel Check-in
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
          Scan your DVLA NSS QR tag
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Each NSS Personnel has a printed ID tag with their personal QR code. When
          they arrive at DVLA and connect to the office network, they scan that
          tag here to record their attendance. Admins do not scan codes—this
          page is for NSS Personnel only.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8">
            <div className="flex h-40 w-40 items-center justify-center rounded-md border border-slate-300 bg-white text-[11px] text-slate-400">
              CAMERA PREVIEW
            </div>
            <p className="max-w-xs text-[11px] text-center text-slate-500">
              In your final system, this area should show a live camera preview
              from the personnel&apos;s device. When the tag QR is in view, your
              frontend QR library will decode the token and send it to your
              backend. This page only provides the UI layout.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
            <p className="font-medium text-slate-800">What happens on scan</p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Browser decodes the QR into a secure token.</li>
              <li>
                Token is sent to your attendance API endpoint over{" "}
                <span className="font-semibold">HTTPS</span>.
              </li>
              <li>Backend checks the request IP against the whitelisted range.</li>
              <li>Backend validates and decrypts/verifies the token.</li>
              <li>
                If valid and not already scanned today, attendance is recorded
                with timestamp and device info.
              </li>
            </ol>

            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-[11px]">
              <p className="font-medium text-slate-800">Network restriction</p>
              <p className="mt-1">
                The API must reject any request where the source IP does not
                match your configured public IP or internal range (for example{" "}
                <code className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white">
                  192.168.1.0/24
                </code>
                ). If the scan comes from outside the company network, your
                backend should respond with something like:
                <span className="font-semibold">
                  {" "}
                  &quot;Access denied – Not on company network&quot;
                </span>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
