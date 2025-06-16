# Step 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:stable-alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Optional: Use custom nginx config for single-page app support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects app to listen on $PORT
ENV PORT 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]