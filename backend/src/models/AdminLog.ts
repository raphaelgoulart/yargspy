import { type Document, type Model, model, Schema } from 'mongoose'

export const AdminAction = {
  // DO NOT REORDER THIS, just add new items to end if needed
  UserBan: 0,
  UserUnban: 1,
  SongAdd: 2,
  SongUpdate: 3,
  SongDelete: 4,
  ScoreDelete: 5,
  UserUpdate: 6,
} as const

export interface AdminLogSchemaInput {
  admin: Schema.Types.ObjectId
  action: (typeof AdminAction)[keyof typeof AdminAction]
  item: Schema.Types.ObjectId
  reason?: string
  createdAt: Date
}

// Methods here
export interface AdminLogSchemaDocument extends AdminLogSchemaInput, Document {}

// Statics here
export interface AdminLogSchemaModel extends Model<AdminLogSchemaDocument> {}

//#region Schema

const adminLogSchema = new Schema<AdminLogSchemaInput, AdminLogSchemaModel>({
  // regular metadata
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: Number,
    required: true,
    enum: Object.values(AdminAction),
  },
  item: { type: Schema.Types.ObjectId, required: true }, // ObjectID for any table
  reason: { type: String },
  createdAt: {
    type: Schema.Types.Date,
    default: Date.now,
  },
})

export const AdminLog = model<AdminLogSchemaInput, AdminLogSchemaModel>('AdminLog', adminLogSchema)
