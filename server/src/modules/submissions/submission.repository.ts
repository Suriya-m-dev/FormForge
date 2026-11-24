import { Submission } from "./submission.model.js";
import type { ISubmission } from "./submission.types.js";

export const submissionRepository = {
  create(data: ISubmission) {
    return Submission.create(data);
  },

  findById(id: string) {
    return Submission.findById(id);
  },

  async findAll(
    formId: string,
    page: number,
    limit: number,
  ) {
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      Submission.find({ formId })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-formSnapshot")
        .lean(),

      Submission.countDocuments({ formId }),
    ]);

    return {
      submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  deleteById(id: string) {
    return Submission.findByIdAndDelete(id);
  },
};
