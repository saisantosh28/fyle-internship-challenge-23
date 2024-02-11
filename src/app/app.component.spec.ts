import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { ApiService } from './services/api.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let apiService: ApiService;
  let mockApiService = {
    getUser: jasmine.createSpy('getUser').and.returnValue(of({ id: 1, login: 'user' })),
    getRepos: jasmine.createSpy('getRepos').and.returnValue(of({ total_count: 1, items: [] }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ],
      imports: [HttpClientTestingModule, FormsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    fixture.detectChanges(); // Trigger initial data binding
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should initialize with default values', () => {
    expect(component.username).toEqual('');
    expect(component.repoFilter).toEqual('');
    expect(component.repos).toEqual([]);
    expect(component.loading).toBeFalse();
    expect(component.user).toBeUndefined();
    expect(component.userNotFound).toBeFalse();
    expect(component.currentPage).toEqual(1);
    expect(component.pages).toEqual([]);
    expect(component.totalRepositories).toEqual(0);
    expect(component.totalPages).toEqual(0);
  });

  // Test API Interaction
  describe('API Interaction', () => {
    it('should call getRepos and update repos on success', fakeAsync(() => {
      const expectedRepos = [{ id: 1, name: 'repo' }];
      mockApiService.getRepos.and.returnValue(of({ total_count: 1, items: expectedRepos }));

      component.username = 'user';
      component.searchRepos();
      tick();
      fixture.detectChanges();

      expect(component.repositories.length).toEqual(1, 'should have one repo');
      expect(component.repositories).toEqual(expectedRepos, 'repositories should match the expected value');
    }));


    it('should filter repos based on repoFilter string', () => {
      component.repositories = [{ name: 'repo1' }, { name: 'test2' }, { name: 'repo3' }];
      component.repoFilter = 'repo';
      component.filterRepos();
      expect(component.filteredRepositories).toEqual([{ name: 'repo1' }, { name: 'repo3' }]);
    });

    it('should calculate pagination correctly', () => {
      component.totalRepositories = 50;
      component.calculateTotalPages();
      expect(component.totalPages).toEqual(5);
      expect(component.pages.length).toEqual(5);
    });

    it('should navigate to the next page correctly', () => {
      component.currentPage = 1;
      component.nextPage();
      expect(component.currentPage).toEqual(2);
    });
  });
});
