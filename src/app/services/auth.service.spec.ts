import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, UserInfo } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;

    const mockUserInfo: UserInfo = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: {
            name: 'USER'
        }
    };

    beforeEach(() => {
        localStorage.clear();

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuthService]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should confirm if user is logged in based on token', () => {
        expect(service.isLoggedIn()).toBe(false);

        localStorage.setItem('jwt-token', 'test-token');
        expect(service.isLoggedIn()).toBe(true);
    });

    it('should load user info if token is present', () => {
        localStorage.setItem('jwt-token', 'test-token');

        service.loadUserInfo().subscribe(userInfo => {
            expect(userInfo).toEqual(mockUserInfo);
        });

        const requests = httpMock.match('http://localhost:8080/auth/me');
        expect(requests.length).toBe(1);
        expect(requests[0].request.method).toBe('GET');
        expect(requests[0].request.headers.get('Authorization')).toBe('Bearer test-token');

        requests[0].flush(mockUserInfo);
    });
});
