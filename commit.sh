git add **/* -f
git config --global user.email "jessepfrancis@provisionasia.org"
description=`zenity --entry --title="Commit descripton"`
git commit -m "$description"
git push origin master
