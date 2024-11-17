import { Injectable } from '@nestjs/common';
import { PrismaService } from '../PrismaService';
import { Prisma } from '.prisma/client';

@Injectable()
export default class TaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.task.findMany();
  }

  async delete(id: number) {
    return this.prisma.task.delete({
      where: {
        id,
      },
    });
  }

  async save(data: Prisma.XOR<Prisma.TaskCreateInput, Prisma.TaskUncheckedCreateInput>) {
    if (!data.id) {
      return this.prisma.task.create({
        data: {
          name: data.name
        }
      });
    }
  
    return this.prisma.task.update({
      where: {
        id: data.id as number
      },
      data: {
        name: data.name
      }
    });
  }

  async findById(id: number) {
    return this.prisma.task.findUnique({
      where: {
        id,
      },
    });
  }
}
