import { resumeFileName } from "./format";

/**
 * Opens the browser's print dialog for the page's print-only resume copy.
 * Browsers use document.title as the default PDF file name, so it is set to
 * "<Name>_Resume" for the duration of the dialog.
 */
export function printResume(fullName: string): void {
  const previousTitle = document.title;
  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    document.title = previousTitle;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  // Safety net for browsers that never fire afterprint.
  setTimeout(restore, 60_000);
  document.title = resumeFileName(fullName);
  window.print();
}
