npm init -y
  
npm install --save-dev nodemon
  
npm install express mysql2 bcryptjs express-session cors dotenv
  
mkdir config middleware routes controllers models utils
 
mysql -u root -p < config/schema.sql
mysql -u root -p
SHOW DATABASES;
