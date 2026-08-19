FROM node:24-alpine

LABEL maintainer="ellaksenofontova@gmail.com"
ENV NODE_ENV=development

RUN addgroup --system appgroup
RUN adduser -G appgroup --system appuser

WORKDIR /app
RUN chown appuser:appgroup /app

USER appuser

COPY --chown=appuser:appgroup package*.json ./

RUN npm install

COPY --chown=appuser:appgroup . .

EXPOSE 3000
CMD ["npm", "run", "dev"]