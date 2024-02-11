import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type LinkHeader = {
  [key: string]: string;
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }

  getUser(githubUsername: string): Observable<any> {
    return this.httpClient.get(`https://api.github.com/users/${githubUsername}`);
  }

  getRepos(githubUsername: string, page: number, perPage: number): Observable<any> {
    return this.httpClient.get(`https://api.github.com/users/${githubUsername}/repos?page=${page}&per_page=${perPage}`, { observe: 'response' })
      .pipe(
        map(response => {
          const linkHeader = this.parseLinkHeader(response.headers.get('Link'));
          const lastPage = linkHeader['last'] ? this.getPageNumber(linkHeader['last']) : page;
          // Adjusted logic to correctly handle empty lists.
          const items = response.body as any[];
          const total_count = items.length > 0 ? (lastPage ? lastPage * perPage : perPage) : 0;
          return { items, total_count };
        })
      );
  }

  private parseLinkHeader(header: string | null): LinkHeader {
    if (header == null) return {};
    let parts = header.split(',');
    let links: LinkHeader = {};
    parts.forEach(p => {
      let section = p.split(';');
      let url = section[0].replace(/<(.*)>/, '$1').trim();
      let name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
    });

    return links;
  }

  private getPageNumber(url: string): number {
    const match = url.match(/\?page=(\d+)/);
    return match ? Number(match[1]) : 1;
  }
}
