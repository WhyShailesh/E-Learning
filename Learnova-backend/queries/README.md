This folder is reserved for reusable SQL query helpers.

Current implementation keeps SQL in controllers for clarity and fast iteration.
You can progressively move query logic here (for example `courseQueries.js`, `dashboardQueries.js`) without changing API contracts.
