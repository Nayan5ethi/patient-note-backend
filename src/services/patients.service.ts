import { Patient, CaseNote, Prisma } from '@prisma/client'
import { prisma } from 'utils/prisma/client'

export interface GetPatientsFilter {
  search?: string
  limit?: number
  offset?: number
}

export interface PatientWithNotes extends Patient {
  notes: CaseNote[]
  _count: {
    notes: number
  }
}

export const getPatients = async (filter: GetPatientsFilter = {}) => {
  const { search, limit = 10, offset = 0 } = filter

  const where: Prisma.PatientWhereInput = {}

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { nhs: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: limit,
      skip: offset,
    }),
    prisma.patient.count({ where }),
  ])

  return {
    patients,
    pagination: {
      total,
      limit,
      offset,
      totalPages: Math.ceil(total / limit),
      currentPage: Math.floor(offset / limit) + 1,
    },
  }
}

export const getPatientById = async (id: string): Promise<PatientWithNotes | null> => {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      notes: {
        include: {
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          file: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: { notes: true },
      },
    },
  })
}
