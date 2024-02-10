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
  pages: number[] = [];
  totalRepositories: number = 0;
  totalPages: number = 0;
  itemsPerPage = 10;
  repositories: any[] = [];

  constructor(private apiService: ApiService) { }

  searchRepos() {
    if (!this.username.trim()) {
      return; // Do nothing if the username is empty or whitespace
    }
    this.loading = true;
    this.userNotFound = false;

    this.apiService.getUser(this.username).subscribe(
      userData => {
        this.user = userData;
        this.apiService.getRepos(this.username, this.currentPage, this.itemsPerPage).subscribe(
          repoResponse => {
            this.totalRepositories = repoResponse.total_count;
            this.repositories = repoResponse.items;
            this.calculateTotalPages(); 
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

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRepositories / this.itemsPerPage);
    this.pages = Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.searchRepos();
  }

  goToLastPage() {
    this.totalPages = Math.ceil(this.totalRepositories / this.itemsPerPage);
    this.currentPage = this.totalPages;
    this.searchRepos();
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
