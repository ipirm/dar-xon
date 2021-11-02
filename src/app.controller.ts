import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiQuery, ApiTags } from "@nestjs/swagger";


@ApiTags("Default")
@Controller()
export class AppController {
  constructor(private app: AppService) {
  }


  @ApiQuery({
    name: "search",
    required: true,
    type: String,
    example: "Какой то интесный текст"
  })
  @Get("check-text")
  checkSentenceForError(
    @Query("search") search: string
  ): Promise<any> {
    return this.app.checkSentenceForError(search);
  }
}
