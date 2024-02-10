import { Component } from '@angular/core';
import { ApiService } from './services/api.service';   // Make sure to import your ApiService

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  username: string = '';
  repos: any[] = [];
  loading: boolean = false;
  user?: any;
  userNotFound: boolean = false;
  currentPage: number = 1;

  constructor(private apiService: ApiService) { }

  searchRepos() {
    this.loading = true;
    this.userNotFound = false;

    this.apiService.getUser(this.username).subscribe(
      userData => {
        this.user = userData; // Store the user data in the user property
        this.apiService.getRepos(this.username, this.currentPage).subscribe(
          reposData => {
            this.repos = reposData;
            this.loading = false;
          },
          reposError => {
            this.repos = [];
            this.loading = false;
          }
        );
      },
      userError => {
        this.user = null;
        this.userNotFound = true;
        this.loading = false;
      }
    );
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchRepos();
    }
  }

  nextPage() {
    this.currentPage++;
    this.searchRepos();
  }
}
