import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import DeleteTask from '../UseCase/DeleteTask/DeleteTask';
import GetAllTasksUseCase from '../UseCase/GetAllTasks/GetAllTasksUseCase';
import SaveTaskUseCase from '../UseCase/SaveTask/SaveTaskUseCase';
import SaveTaskDto from '../UseCase/SaveTask/SaveTaskDto';
import UseCaseFactory from '../UseCase/UseCaseFactory';

@Controller()
export default class TaskController {
  constructor(private readonly useCaseFactory: UseCaseFactory) {}

  @Get('/tasks')
  async getAll() {
    return (await this.useCaseFactory.create(GetAllTasksUseCase)).handle();
  }

  @Post('/tasks')
  async create(@Body() dto: SaveTaskDto) {
    // @todo YOU MUST FOLLOW THE SAME IMPLEMENTATION AS OTHER ENDPOINTS
    return (await this.useCaseFactory.create(SaveTaskUseCase)).handle(dto);
  }

  @Patch('/tasks/:id')
  async update(@Body() dto: SaveTaskDto) {
    // @todo YOU MUST FOLLOW THE SAME IMPLEMENTATION AS OTHER ENDPOINTS
    return (await this.useCaseFactory.create(SaveTaskUseCase)).handle(dto);
  }

  @Delete('/tasks/:id')
  async delete(@Param('id') id: string) {
    return (await this.useCaseFactory.create(DeleteTask)).handle(Number(id));
  }
}
