FROM node:20-alpine

WORKDIR /app

# کپی فایل‌های پکیج
COPY package*.json ./

# نصب پکیج‌ها
RUN npm install --legacy-peer-deps

# کپی تمام کدها
COPY . .

# باز کردن پورت
EXPOSE 3000

# اجرای سرور توسعه
CMD ["npm", "run", "dev"]