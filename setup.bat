@echo off
echo Setting up Student Project Management System...
echo.

echo Installing backend dependencies...
cd server
npm install
if errorlevel 1 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd ..\client
npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Make sure MongoDB is running on your system
echo 2. Update the .env files with your configuration
echo 3. Run 'npm run dev' in the server folder to start the backend
echo 4. Run 'npm start' in the client folder to start the frontend
echo.
echo Default admin user: Register with role "admin"
echo Default student user: Register with role "student"
echo.
pause
