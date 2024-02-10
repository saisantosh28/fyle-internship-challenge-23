import { Component } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  username: string = '';
  repoFilter: string = '';
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
  filteredRepositories: any[] = [];
  lastUsername: string = '';

  constructor(private apiService: ApiService) { }

  searchRepos() {
    if (!this.username.trim()) {
      return;
    }
    if (this.lastUsername !== this.username) {
      this.currentPage = 1;
      this.lastUsername = this.username;
    }
    console.log("loading");
    this.loading = true;

    let minimumLoadingTimeMet = false;
    setTimeout(() => {
      minimumLoadingTimeMet = true;
      if (!this.user && !this.userNotFound) { // Add any other conditions to ensure data is still not fetched
        this.loading = false;
      }
    }, 6000);
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
            this.filterRepos();
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

  filterRepos() {
    if (!this.repoFilter) {
      this.filteredRepositories = this.repositories;
    } else {
      this.filteredRepositories = this.repositories.filter(repo =>
        repo.name.toLowerCase().includes(this.repoFilter.toLowerCase())
      );
    }
  }

  updateItemsPerPage(value: number): void {
    this.itemsPerPage = value;
    this.currentPage = 1;
    this.searchRepos();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRepositories / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
