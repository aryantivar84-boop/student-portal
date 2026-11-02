try:
    import pymysql
    pymysql.install_as_MySQLdb()

    # Bypass strict MariaDB version check in Django for XAMPP MariaDB (10.4.x)
    from django.db.backends.base.base import BaseDatabaseWrapper
    BaseDatabaseWrapper.check_database_version_supported = lambda self: None

    from django.db.backends.mysql.features import DatabaseFeatures
    DatabaseFeatures.can_return_columns_from_insert = property(lambda self: False)
except Exception:
    pass
