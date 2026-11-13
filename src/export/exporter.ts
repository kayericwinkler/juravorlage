// Grenze zwischen Dokumentmodell und Dateiformat.
import type { DocumentModel } from "../document/model";

export interface ExportedFile {
  readonly blob: Blob;
  readonly fileName: string;
}

export interface Exporter {
  export(model: DocumentModel): Promise<ExportedFile>;
}
