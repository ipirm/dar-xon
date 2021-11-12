import { Injectable } from "@nestjs/common";
import { map } from "rxjs";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class AppService {
  constructor(
    private readonly httpService: HttpService
  ) {
  }

  async checkSentenceForError(search: string): Promise<any> {
    const searchText = encodeURI(search).toLowerCase();
    return this.httpService.get(`https://api.textgears.com/spelling?text=${searchText}&language=ru-RU&whitelist=&dictionary_id=&key=${process.env.TEXT_API_KEY}`)
      .pipe(
        map(response => response.data)
      );
  }

  async phoneReshreshh():Promise<any>{

  }
}
