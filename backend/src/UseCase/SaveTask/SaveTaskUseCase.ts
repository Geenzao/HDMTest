import { BadRequestException, Injectable } from '@nestjs/common';
import { Task } from '.prisma/client';
import { UseCase } from '../../index';
import SaveTaskDto from './SaveTaskDto';
import TaskRepository from '../../Repositories/TaskRepository';

@Injectable()
export default class SaveTaskUseCase implements UseCase<Promise<Task>, [dto: SaveTaskDto]> {
  constructor(private readonly taskRepository: TaskRepository) {}

  async handle(dto: SaveTaskDto) {
    try {
      if (dto.id) {
        const existingTask = await this.taskRepository.findById(dto.id);
        if (!existingTask) {
          throw new BadRequestException('Tâche non trouvée');
        }
      }

      const taskData = {
        id: dto.id || null,
        name: dto.name?.trim(),
        done: dto.done !== undefined ? dto.done : undefined,
      };

      return await this.taskRepository.save(taskData);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
