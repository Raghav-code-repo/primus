1. Backup all PostgreSQL databases (recommended)
Step 1: Create a backup folder
Open PowerShell:
New-Item -ItemType Directory -Force -Path "D:\Olympiad-Backups"


Step 2: Export all PostgreSQL databases
Run this command:
docker exec olympiad-postgres pg_dumpall -U olympiad_user |
    Out-File -FilePath "D:\Olympiad-Backups\olympiad_all_databases.sql" -Encoding utf8


This creates:
D:\Olympiad-Backups\olympiad_all_databases.sql


Important: pg_dumpall requires appropriate permissions. If olympiad_user doesn't have sufficient privileges, use the PostgreSQL superuser (typically postgres):
docker exec olympiad-postgres pg_dumpall -U postgres |
    Out-File -FilePath "D:\Olympiad-Backups\olympiad_all_databases.sql" -Encoding utf8


2. Verify the backup file
Get-Item "D:\Olympiad-Backups\olympiad_all_databases.sql"


Check the file size:
(Get-Item "D:\Olympiad-Backups\olympiad_all_databases.sql").Length / 1MB


A large file is normal if your services have data.
3. Check all databases currently available
docker exec olympiad-postgres psql -U olympiad_user -d postgres -c "\l"


This should show databases such as:
- olympiad_identity
- olympiad_db
- student_db
- Other service databases
4. Backup individual databases (optional)
If you want separate SQL files for each microservice database:
docker exec olympiad-postgres pg_dump -U olympiad_user -d olympiad_identity |
    Out-File "D:\Olympiad-Backups\identity.sql" -Encoding utf8


For Student:
docker exec olympiad-postgres pg_dump -U olympiad_user -d student_db |
    Out-File "D:\Olympiad-Backups\student.sql" -Encoding utf8


Repeat for other databases.
5. Restore all databases later
Do not restore into your existing database instance without checking first. This backup contains database creation commands and roles.

For a fresh PostgreSQL container:
Get-Content "D:\Olympiad-Backups\olympiad_all_databases.sql" |
    docker exec -i olympiad-postgres psql -U postgres -d postgres


If the file is large, use a direct file-based restore approach rather than PowerShell Get-Content.