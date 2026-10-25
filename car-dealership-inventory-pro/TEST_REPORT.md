# Test Report

**Status: Not executed in this environment.** The backend test suite is provided under `backend/tests/` and is configured with Jest, Supertest, and `mongodb-memory-server`.

Run locally:

```bash
cd backend
npm install
npm test
npm run test:coverage
```
![alt text](<Screenshot (73).png>)
![alt text](<Screenshot (75).png>) 
![alt text](<Screenshot (76).png>)
![alt text](<Screenshot (71).png>)
![alt text](<Screenshot (68).png>)

Coverage areas in the starter suite:
- Customer registration and rejection of weak passwords
- Login failure for invalid credentials
- Authentication required for inventory
- Vehicle search and pagination
- Successful purchase and stock decrement
- Insufficient-stock conflict without negative inventory
- Admin-only create/restock permissions
