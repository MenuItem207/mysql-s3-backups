# To restore a backup:
1. Launch MySQL client in powershell
```
mysql -h host -P port_num -u user -p
```
2. Select database
```
USE database_name
```
3. Restore 
```
SOURCE C:Path\To\database.sql
```