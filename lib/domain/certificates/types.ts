export type CertificateRecord = {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  issuedAt: string;
  preTestScore: number;
  postTestScore: number;
  finalGrade: number;
};

export type CertificateSummary = {
  id: string;
  certificateNumber: string;
  trainingId: string;
  trainingTitle: string;
  issuedAt: string;
  preTestScore: number;
  postTestScore: number;
  finalGrade: number;
};

export type VerifiedCertificate = {
  certificateNumber: string;
  studentName: string;
  trainingTitle: string;
  issuedAt: string;
  preTestScore: number;
  postTestScore: number;
  finalGrade: number;
  isValid: true;
};

export type CertificatePdfData = {
  certificateNumber: string;
  studentName: string;
  trainingTitle: string;
  issuedAt: string;
  preTestScore: number;
  postTestScore: number;
  finalGrade: number;
};
