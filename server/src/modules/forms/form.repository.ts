import { Types } from "mongoose";
import { Form } from "./form.model.js";
import type { IForm, FormStatus } from "./form.types.js";

interface FindFormsParams {
  page: number;
  limit: number;
  status?: FormStatus;
  search?: string;
}

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const formRepository = {
  create(data: Partial<IForm>) {
    return Form.create(data);
  },

  findById(id: string) {
    return Form.findById(id);
  },

  findPublishedById(id: string) {
    return Form.findOne({
      _id: id,
      status: "PUBLISHED",
      publishedSnapshot: { $exists: true },
    });
  },

  async findAll(createdBy: string, params: FindFormsParams) {
    const { page, limit, status, search } = params;

    const filter: Record<string, unknown> = {
      createdBy: new Types.ObjectId(createdBy),
    };

    if (status) {
      filter.status = status;
    }

    if (search?.trim()) {
      filter.name = {
        $regex: escapeRegex(search.trim()),
        $options: "i",
      };
    }

    const skip = (page - 1) * limit;

    const [forms, total] = await Promise.all([
      Form.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-publishedSnapshot")
        .lean(),

      Form.countDocuments(filter),
    ]);

    return {
      forms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  updateById(id: string, data: Partial<IForm>) {
    return Form.findByIdAndUpdate(
      id,
      { $set: data },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );
  },

  deleteById(id: string) {
    return Form.findByIdAndDelete(id);
  },
};
