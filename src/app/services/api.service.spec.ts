import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let apiService: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });

    apiService = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure that there are no outstanding requests after each test.
  });

  it('should be created', () => {
    expect(apiService).toBeTruthy();
  });

  it('getUser should retrieve user data successfully', () => {
    const mockUser = { login: 'user', id: 1 };
    apiService.getUser('user').subscribe(data => {
      expect(data).toEqual(mockUser);
    });

    const req = httpMock.expectOne('https://api.github.com/users/user');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('getRepos should retrieve repository data successfully', () => {
    const expectedItems = [{ id: 1, name: 'repo1' }, { id: 2, name: 'repo2' }];
    const mockResponse = {
      body: expectedItems,
      headers: {
        Link: '<https://api.github.com/users/user/repos?page=2&per_page=30>; rel="last"'
      }
    };
    apiService.getRepos('user', 1, 30).subscribe(data => {
      expect(data.items).toEqual(expectedItems, "The items should match the expected array.");
      expect(data.total_count).toBeGreaterThan(0, "The total_count should be correctly calculated.");
    });
    const req = httpMock.expectOne(`https://api.github.com/users/user/repos?page=1&per_page=30`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse.body, { headers: mockResponse.headers });
  });



  it('getRepos should handle empty repository list', () => {
    const mockResponse = { body: [], headers: {} };
    apiService.getRepos('user', 1, 30).subscribe(data => {
      expect(data.items).toEqual([], "The items array should be empty for an empty repository list.");
      expect(data.total_count).toBe(0, "The total_count should be 0 for an empty repository list.");
    });
    const req = httpMock.expectOne(`https://api.github.com/users/user/repos?page=1&per_page=30`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse.body, { headers: mockResponse.headers });
  });

  it('should handle HTTP errors for getUser', () => {
    const errorMessage = '404 Not Found';
    apiService.getUser('nonexistentuser').subscribe(
      () => fail('expected an error, not user data'),
      error => expect(error.status).toBe(404)
    );

    const req = httpMock.expectOne('https://api.github.com/users/nonexistentuser');
    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });

  it('should handle HTTP errors for getRepos', () => {
    const errorMessage = '404 Not Found';
    apiService.getRepos('nonexistentuser', 1, 30).subscribe(
      () => fail('expected an error, not repos'),
      error => expect(error.status).toBe(404)
    );

    const req = httpMock.expectOne('https://api.github.com/users/nonexistentuser/repos?page=1&per_page=30');
    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });

  // You can add more tests here to cover other scenarios or methods.
});
