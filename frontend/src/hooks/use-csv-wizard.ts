import { useState } from 'react';
import Papa from 'papaparse';
import { uploadCSV, getMappings, runImport } from '../services/api';
import { CSVRecord, ColumnMappingResult, DetailedImportResponse } from '../types/import';

export type WizardStep = 'UPLOAD' | 'PREVIEW' | 'MAPPING' | 'IMPORTING' | 'SUMMARY';

export const useCsvWizard = () => {
  const [step, setStep] = useState<WizardStep>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<CSVRecord[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [metadata, setMetadata] = useState<{
    fileName: string;
    fileSize: number;
    detectedColumns: number;
  } | null>(null);
  const [headerMappings, setHeaderMappings] = useState<ColumnMappingResult[]>([]);
  const [importSummary, setImportSummary] = useState<DetailedImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');

  const reset = () => {
    setStep('UPLOAD');
    setFile(null);
    setUploadId('');
    setHeaders([]);
    setPreviewRows([]);
    setTotalRows(0);
    setMetadata(null);
    setHeaderMappings([]);
    setImportSummary(null);
    setError(null);
    setLoading(false);
    setLoadingStage('');
  };

  const maskError = (err: unknown): string => {
    const errMsg = err instanceof Error ? err.message : String(err);
    const low = errMsg.toLowerCase();
    if (
      low.includes('gemini') ||
      low.includes('generative') ||
      low.includes('api key') ||
      low.includes('quota') ||
      low.includes('429') ||
      low.includes('timeout')
    ) {
      return 'AI processing failed. Please verify the Gemini API configuration.';
    }
    return errMsg;
  };

  const handleUploadFile = async (selectedFile: File) => {
    setLoading(true);
    setError(null);
    setLoadingStage('Uploading CSV...');
    try {
      const res = await uploadCSV(selectedFile);
      setFile(selectedFile);
      setUploadId(res.uploadId);
      setHeaders(res.headers);
      setPreviewRows(res.preview);
      setTotalRows(res.totalRows);
      setMetadata({
        fileName: res.metadata.fileName,
        fileSize: res.metadata.fileSize,
        detectedColumns: res.metadata.detectedColumns,
      });
      setStep('PREVIEW');
    } catch (err: unknown) {
      setError(maskError(err) || 'Failed to upload CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveMappings = async () => {
    setLoading(true);
    setError(null);
    setLoadingStage('Preparing Prompt...');
    try {
      const res = await getMappings(uploadId, headers, previewRows.slice(0, 5));
      setHeaderMappings(res.headerMappings);
      setStep('MAPPING');
    } catch (err: unknown) {
      setError(maskError(err) || 'Failed to calculate mapping recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleStartImport = async () => {
    if (!file) return;
    setStep('IMPORTING');
    setLoading(true);
    setError(null);

    const updateStage = (stage: string, delay: number) => {
      return new Promise<void>((resolve) =>
        setTimeout(() => {
          setLoadingStage(stage);
          resolve();
        }, delay)
      );
    };

    try {
      setLoadingStage('Uploading CSV...');
      await updateStage('Preparing Prompt...', 600);
      await updateStage('Calling Gemini...', 1000);

      // Parse full records client-side using Papaparse
      Papa.parse<CSVRecord>(file, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: async (results) => {
          try {
            await updateStage('Extracting CRM Records...', 800);
            await updateStage('Validating CRM Schema...', 600);
            await updateStage('Generating Final JSON...', 600);

            // Map the simplified key mappings
            const simplifiedMappings = headerMappings.map((m) => ({
              sourceHeader: m.sourceHeader,
              targetField: m.targetField,
            }));

            await updateStage('Building Summary...', 800);

            const res = await runImport(uploadId, simplifiedMappings, results.data);
            setImportSummary(res);
            setStep('SUMMARY');
          } catch (err: unknown) {
            setError(maskError(err) || 'Import pipeline failed');
            setStep('MAPPING');
          } finally {
            setLoading(false);
          }
        },
        error: (parseError) => {
          setError(`Local file parsing failed: ${parseError.message}`);
          setStep('MAPPING');
          setLoading(false);
        },
      });
    } catch (err: unknown) {
      setError(maskError(err) || 'Import pipeline failed');
      setStep('MAPPING');
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    file,
    uploadId,
    headers,
    previewRows,
    totalRows,
    metadata,
    headerMappings,
    setHeaderMappings,
    importSummary,
    error,
    setError,
    loading,
    loadingStage,
    reset,
    handleUploadFile,
    handleRetrieveMappings,
    handleStartImport,
  };
};
