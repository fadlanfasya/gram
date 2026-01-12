import { Prisma } from '@prisma/client'

// Extended types using Prisma's utility types
export type AssetWithRelations = Prisma.AssetGetPayload<{
  include: {
    assetType: true
    createdBy: true
    relationships: {
      include: {
        targetAsset: {
          include: {
            assetType: true
          }
        }
      }
    }
    relationshipsTo: {
      include: {
        sourceAsset: {
          include: {
            assetType: true
          }
        }
      }
    }
  }
}>

export type TicketWithRelations = Prisma.TicketGetPayload<{
  include: {
    createdBy: true
    assignedTo: true
    asset: true
  }
}>

export interface AssetTypeField {
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'email' | 'url'
  label: string
  required?: boolean
  options?: string[]
  placeholder?: string
}
