import { AxiosResponse } from "axios";
import api from "../axios";
import { AuditTypes, FormattedAuditType } from "@/utils/types/AuditType";
import formattedDate from "@/utils/formattedDate";

interface AuditResponse {
  message?: string;
  audits?: AuditTypes[];
  status?: number;
}

// Function to format dates in audit objects
const formatAuditDates = (audit: AuditTypes): FormattedAuditType => {
  return {
    ...audit,
    created_at_formatted: formattedDate(new Date(audit.created_at)),
    updated_at_formatted: formattedDate(new Date(audit.updated_at)),
  };
};

const getAudits = async (
  model?: string
): Promise<{
  message?: string;
  audits: AuditTypes[];
  auditsFormatted: FormattedAuditType[];
}> => {
  try {
    const response: AxiosResponse<AuditResponse> = await api.get(
      "/audits/all",
      {
        params: model ? { model } : {},
      }
    );

    const auditsFormatted = response.data.audits
      ? response.data.audits.map(formatAuditDates)
      : [];

    return {
      message: response.data.message,
      audits: response.data.audits || [],
      auditsFormatted,
    };
  } catch (error) {
    throw new Error("Gagal mengambil data audit");
  }
};

const auditService = {
  getAudits,
};

export default auditService;
