FROM dunglas/frankenphp:1-php8.4
RUN install-php-extensions pdo_pgsql pgsql intl zip opcache pcntl
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV SERVER_NAME=:80 \
    COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /app/backend
