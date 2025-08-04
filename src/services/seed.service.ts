import { prisma } from '../utils/prisma/client'
import bcrypt from 'bcryptjs'
import logger from '../utils/logger'

interface SeedDoctor {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface SeedPatient {
  firstName: string
  lastName: string
  nhs: string
  dateOfBirth: Date
}

const SEED_DOCTOR: SeedDoctor = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'doctor@example.com',
  password: 'password123',
}

const SEED_PATIENTS: SeedPatient[] = [
  {
    firstName: 'Alice',
    lastName: 'Johnson',
    nhs: 'NHS001',
    dateOfBirth: new Date('1985-03-15'),
  },
  {
    firstName: 'Bob',
    lastName: 'Williams',
    nhs: 'NHS002',
    dateOfBirth: new Date('1992-07-22'),
  },
  {
    firstName: 'Carol',
    lastName: 'Brown',
    nhs: 'NHS003',
    dateOfBirth: new Date('1978-11-08'),
  },
  {
    firstName: 'David',
    lastName: 'Miller',
    nhs: 'NHS004',
    dateOfBirth: new Date('1990-01-30'),
  },
  {
    firstName: 'Emma',
    lastName: 'Davis',
    nhs: 'NHS005',
    dateOfBirth: new Date('1987-09-12'),
  },
]

export class SeedService {
  static async clearData(): Promise<void> {
    logger.info('🗑️  Clearing existing data...')

    // Delete in correct order due to foreign key constraints
    await prisma.caseNote.deleteMany()
    await prisma.file.deleteMany()
    await prisma.patient.deleteMany()
    await prisma.doctor.deleteMany()

    logger.info('Data cleared successfully')
  }

  static async seedDoctor(): Promise<string> {
    logger.info('👨‍⚕️ Seeding doctor...')

    // Hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(SEED_DOCTOR.password, saltRounds)

    const doctor = await prisma.doctor.create({
      data: {
        firstName: SEED_DOCTOR.firstName,
        lastName: SEED_DOCTOR.lastName,
        email: SEED_DOCTOR.email,
        password: hashedPassword,
      },
    })

    logger.info(`Doctor created: ${doctor.firstName} ${doctor.lastName} (${doctor.email})`)
    return doctor.id
  }

  static async seedPatients(): Promise<string[]> {
    logger.info('🏥 Seeding patients...')

    const patientIds: string[] = []

    for (const patientData of SEED_PATIENTS) {
      const patient = await prisma.patient.create({
        data: patientData,
      })

      patientIds.push(patient.id)
      logger.info(`Patient created: ${patient.firstName} ${patient.lastName} (NHS: ${patient.nhs})`)
    }

    return patientIds
  }

  static async validateSeed(): Promise<void> {
    logger.info('🔍 Validating seeded data...')

    const doctorCount = await prisma.doctor.count()
    const patientCount = await prisma.patient.count()

    logger.info(`📊 Found ${doctorCount} doctor(s) and ${patientCount} patient(s)`)

    if (doctorCount === 1 && patientCount === 5) {
      logger.info('Seed validation successful!')
    } else {
      logger.info('❌ Seed validation failed!')
    }
  }

  static async seedAll(): Promise<void> {
    try {
      logger.info('🌱 Starting seed process...')

      await this.clearData()
      await this.seedDoctor()
      await this.seedPatients()
      await this.validateSeed()

      logger.info('🎉 Seeding completed successfully!')
    } catch (error) {
      logger.error('❌ Seeding failed:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }
}

// Export both class and instance for compatibility
export const seedService = {
  clearData: () => SeedService.clearData(),
  seedDoctor: () => SeedService.seedDoctor(),
  seedPatients: () => SeedService.seedPatients(),
  validateSeed: () => SeedService.validateSeed(),
  seedAll: () => SeedService.seedAll(),

  validateSeedData: async (): Promise<boolean> => {
    try {
      await SeedService.validateSeed()
      return true
    } catch (error) {
      logger.error('Seed validation failed:', error)
      return false
    }
  },

  seedDatabase: async ({ clearExisting }: { clearExisting: boolean }) => {
    if (clearExisting) {
      await SeedService.clearData()
    }

    const doctorId = await SeedService.seedDoctor()
    const patientIds = await SeedService.seedPatients()
    await SeedService.validateSeed()

    // Return format expected by the scripts
    return {
      doctor: { id: doctorId },
      patients: patientIds.map((id) => ({ id })),
    }
  },
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--clear')) {
    await SeedService.clearData()
  } else if (args.includes('--validate')) {
    await SeedService.validateSeed()
  } else {
    await SeedService.seedAll()
  }
}

if (require.main === module) {
  main().catch((error) => {
    logger.error('Seed script failed:', error)
    process.exit(1)
  })
}
