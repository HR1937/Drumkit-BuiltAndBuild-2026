// Optional renderers are isolated so analytics success is never coupled to artifact libraries.
export function renderPdf(snapshot) { throw Object.assign(new Error("PDF_RENDERER_DEPENDENCY_UNAVAILABLE"), { code: "UNAVAILABLE", snapshot }); }
export function renderDocx(snapshot) { throw Object.assign(new Error("DOCX_RENDERER_DEPENDENCY_UNAVAILABLE"), { code: "UNAVAILABLE", snapshot }); }
