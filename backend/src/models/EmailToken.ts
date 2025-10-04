import { createHash, randomBytes } from 'crypto';
import { type Document, type Model, model, Schema } from 'mongoose'

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('base64url');
}

export const Purpose = {
  Verify: 0,
  Reset: 1,
} as const

export interface EmailTokenSchemaInput {
  user: Schema.Types.ObjectId,
  purpose: (typeof Purpose)[keyof typeof Purpose]
  tokenHash: String,
  usedAt?: Date,
  expiresAt: Date
}

// Methods here
export interface EmailTokenSchemaDocument extends EmailTokenSchemaInput, Document {}

// Statics here
export interface EmailTokenSchemaModel extends Model<EmailTokenSchemaDocument> {
  issue(userId: string, purpose: (typeof Purpose)[keyof typeof Purpose]): Promise<{ doc: EmailTokenSchemaDocument; token: string }>,
  consume(purpose: (typeof Purpose)[keyof typeof Purpose], token: string): Promise<EmailTokenSchemaDocument>
}

//#region Schema

const EmailTokenSchema = new Schema<EmailTokenSchemaInput, EmailTokenSchemaModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    purpose: {
      type: Number,
      required: true,
      enum: Object.values(Purpose),
    },
    tokenHash: { type: String, required: true, unique: true },
    usedAt: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true,
    statics: {
      async issue(user: string, purpose: (typeof Purpose)[keyof typeof Purpose]) {
        const token = randomBytes(32).toString('base64url');
        const tokenHash = sha256(token)
        const ttl = purpose == Purpose.Verify? 60 : 30

        const doc = await this.create({
          user,
          purpose,
          tokenHash,
          expiresAt: new Date(Date.now() + ttl * 60_000),
        });
        return { doc, token };
      },
      async consume(purpose: (typeof Purpose)[keyof typeof Purpose], token: string) {
        const tokenHash = sha256(token);
        const now = new Date();
        
        const doc = await this.findOneAndUpdate(
          { purpose, tokenHash, usedAt: { $exists: false }, expiresAt: { $gt: now } },
          { $set: { usedAt: now } },
          { new: true }
        );  
        return doc; // null if not found/invalid/expired/already used
      }
    }
  }
)

EmailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL for cleanup

export const EmailToken = model<EmailTokenSchemaInput, EmailTokenSchemaModel>('EmailToken', EmailTokenSchema)