# !/bin/bash
# Location to place backups.


export PATH="/usr/local/Cellar/postgresql/9.5.1/bin/psql:$PATH"

parent_path=$( cd "$(dirname "${BASH_SOURCE}")" ; pwd -P )

cd "$parent_path"


# echo $placeholder
echo 'Path update' >> ./backup/postgres-backup/placeholder.txt

backup_dir="./backup/postgres-backup/"
# #String to append to the name of the backup files
backup_date=`date +%d-%m-%Y`
# #Numbers of days you want to keep copie of your databases
number_of_days=30

# ==============EDIT THIS==========
databases=`/usr/local/bin/psql -l -t | cut -d'|' -f1 | sed -e 's/ //g' -e '/^$/d'`

# make new directory
mkdir $backup_dir$backup_date

for i in $databases; do
  if [ "$i" != "template0" ] && [ "$i" != "template1" ]; then
    echo Dumping $i to $backup_dir$backup_date/$i\_$backup_date
    # ================= EDIT THIS ===============
    /usr/local/bin/pg_dump -f $backup_dir$backup_date/$i\_$backup_date $i
  fi
done

# find $backup_dir -type f -prune -mtime +$number_of_days -exec rm -f {} \;


###################################################
# to setup on server
###################################################

# crontab -e
# * * * * * /absolute/path/to/backup/script.sh

