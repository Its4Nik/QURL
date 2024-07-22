# <===========================================>
# Base image with dependencies
FROM python:latest AS base

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install -r requirements.txt

# <+++++++++++++++++++++++++++++++++++++++++++>
# Staging image for application code
FROM base AS staging

WORKDIR /data

VOLUME [ "/data" ]

COPY ./src ./

# <===========================================>
# Flask config:
ENV FLASK_APP="qurl.py"
ENV FLASK_RUN_PORT=4443
ENV FLASK_ENV=development
ENV FLASK_DEBUG=1

# <===========================================>
# JSON config
ENV JSONIFY_PRETTYPRINT_REGULAR=True
ENV JSON_AS_ASCII=False

# <===========================================>
# Logging
ENV LOG_LEVEL=DEBUG
ENV LOGGING_FORMAT='%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# <===========================================>
# File stuff
ENV MAX_CONTENT_LENGTH=16777216 
    # 16 MB in bytes

# <===========================================>
# Expose port
EXPOSE 4443

# <===========================================>
# Entrypoint
ENTRYPOINT [ "python", "-m", "flask", "run", "--host=0.0.0.0" ]
# <===========================================>
