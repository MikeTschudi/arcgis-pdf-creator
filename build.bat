rem Builds the repository

call node --version
call npm --version

call npm install

call tsc -p ./tsconfig.json

call copy data\*.* dist\
call copy node_modules\jspdf\dist\jspdf.umd.min.js dist\jspdf.js

call rmdir/q/s coverage 2>nul
call npm run test

