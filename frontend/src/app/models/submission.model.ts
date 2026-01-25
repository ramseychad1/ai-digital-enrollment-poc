export interface Submission {
  programId: string;
  formId: string;
  formType: string;
  formData: { [key: string]: any };
}

export interface SubmissionResponse {
  id: string;
  programId: string;
  formId: string;
  submissionStatus: string;
  submittedAt: string;
}
