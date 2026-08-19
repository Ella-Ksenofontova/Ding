FROM python:3.14-trixie

LABEL maintainer="ellaksenofontova@gmail.com"
ENV NODE_ENV = development

WORKDIR /app

USER root

RUN addgroup --system appgroup && adduser -ingroup appgroup --system appuser

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

USER appuser
EXPOSE 3000

ENTRYPOINT ["/app/entrypoint.sh"]

CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=8000", "--reload"]