import { Controller, Inject } from '@nestjs/common';
import { ResponseService } from '../middlewares/response';

@Controller()
export class BaseController {
  // "Inject"（属性注入）用于将依赖服务注入到类中，这样可以在类内通过该属性访问服务实例。
  // 子类无需在构造函数中传递依赖
  @Inject(ResponseService) // 👈 告诉 NestJS：这个属性需要注入 ResponseService
  protected readonly responseService: ResponseService;

  constructor() {}
}
