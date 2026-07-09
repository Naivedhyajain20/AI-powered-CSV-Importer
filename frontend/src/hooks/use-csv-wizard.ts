import { useState } from 'react';
import { uploadCSV, getMappings, runImport, getImportStatus } from '../services/api';
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
    if (!uploadId) return;
    setStep('IMPORTING');
    setLoading(true);
    setError(null);

    try {
      setLoadingStage('Preparing Prompt...');

      // Map the simplified key mappings
      const simplifiedMappings = headerMappings.map((m) => ({
        sourceHeader: m.sourceHeader,
        targetField: m.targetField,
      }));

      // Launch import on backend - no client-side parsing, reads from disk!
      const initResponse = (await runImport(uploadId, simplifiedMappings)) as {
        metadata?: { jobId?: string };
      };
      const jobId = initResponse.metadata?.jobId;

      if (!jobId) {
        throw new Error('No Job ID received from import service');
      }

      setLoadingStage('Extracting CRM Records (0%)...');

      // Start status polling
      let isDone = false;
      let statusError: string | null = null;
      let completedResult: DetailedImportResponse | null = null;

      while (!isDone) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const statusResponse = (await getImportStatus(jobId)) as {
          metadata?: {
            status?: string;
            progress?: { percentage?: number };
          };
          error?: { message?: string };
        };
        
        if (statusResponse.metadata?.status === 'COMPLETED') {
          completedResult = statusResponse as unknown as DetailedImportResponse;
          isDone = true;
        } else if (statusResponse.metadata?.status === 'FAILED') {
          statusError = statusResponse.error?.message || 'Background import failed';
          isDone = true;
        } else {
          // Update progress percentage
          const pct = statusResponse.metadata?.progress?.percentage ?? 0;
          setLoadingStage(`Extracting CRM Records (${pct}%)...`);
        }
      }

      if (statusError) {
        throw new Error(statusError);
      }

      if (completedResult) {
        setImportSummary(completedResult);
        setStep('SUMMARY');
      }
    } catch (err: unknown) {
      setError(maskError(err) || 'Import pipeline failed');
      setStep('MAPPING');
    } finally {
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
